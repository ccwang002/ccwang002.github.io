---
Title: Use DuckDB in ensembldb to query Ensembl's genome annotation
Slug: use-duckdb-in-ensembldb
Date: 2022-10-05
Tags: en, r, python, ensembldb, sqlite, duckdb
Category: Bioinfo
Lang: en
---

<!-- cSpell:words sexchrom OLAP Hsapiens pyarrow ensdb zstandard zstd -->

To query genome reference and annotations locally, [ensembldb] has been my go-to approach.
While I've said many good things about this R package before ([1][my-post-1], [2][my-post-2], [3][my-post-3]), here's a summary of my favorite features:

1. I can use the same Ensembl version throughout my project (as a SQLite database)
3. I can query the genome-wide annotations and their locations easily and offline
4. Integrate the extracted information with my data and other external annotations with the help of [GenomicRanges] and [SummarizedExperiment]
5. The usage is language agnostic (say, [I can query its db in Python][my-post-2])

Since [DuckDB] is designed for analytical query workloads (aka [OLAP]), I decided to convert ensembl's SQLite database to DuckDB and try it in my usual scenarios.
DuckDB uses a columnar storage and supports query into external Apache Parquet and Arrow files.
Otherwise, it has the similar look-and-feel as SQLite.

[TOC]

[ensembldb]: https://bioconductor.org/packages/release/bioc/html/ensembldb.html
[my-post-1]: {filename}../2016-05/0521_bioc_Ensembl_annotation.md
[my-post-2]: {filename}../2017-11/1117_ensdb_in_python.md
[my-post-3]: {filename}../2019-01/0108_build_ensdb.md
[GenomicRanges]: https://bioconductor.org/packages/release/bioc/html/GenomicRanges.html
[SummarizedExperiment]: https://bioconductor.org/packages/release/bioc/html/SummarizedExperiment.html

[DuckDB]: https://duckdb.org/
[OLAP]: https://en.wikipedia.org/wiki/Online_analytical_processing



## Convert SQLite to DuckDB through Parquet
The first step is to convert ensembl's SQLite database to DuckDB[^sqlite-to-duckdb].
I decided to export SQLite tables as individual [Parquet] files, and then reload them back to DuckDB.
So we could also test the DuckDB's ability to query external parquet files directly.

[^sqlite-to-duckdb]: There is an official extension [sqlite_scanner] currently under development that can attach directly to a SQLite database inside a DuckDB database.
So in the future, it could be much easier to convert SQLite to DuckDB.

For this exercise, I used the latest Ensembl release (v107).
We can find the corresponding SQLite database from [AnnotationHub's web interface][AH web interface] (its object ID is [AH104864]):

```bash
curl -Lo EnsDb.Hsapiens.v107.sqlite \
    https://annotationhub.bioconductor.org/fetch/111610
```

We use [SQLAlchemy] to fetch the schema of all the tables.

```python
from sqlalchemy import MetaData, create_engine

engine = create_engine('sqlite:///EnsDb.Hsapiens.v107.sqlite')
metadata = MetaData()
metadata.reflect(bind=engine)
```

We can then list all the tables and their column data types:

```python
db_tables = metadata.sorted_tables
for table in db_tables:
    print(f'{table.name}: ', end='')
    print(', '.join(f'{c.name} ({c.type})' for c in table.columns))
# chromosome: seq_name (TEXT), seq_length (INTEGER), is_circular (INTEGER)
# gene: gene_id (TEXT), gene_name (TEXT), gene_biotype (TEXT),
#   gene_seq_start (INTEGER), gene_seq_end (INTEGER),
#   seq_name (TEXT), seq_strand (INTEGER),...
# ...
```

So with the correct data type mapping, we can export all the tables as parquet by [pandas] and [PyArrow].
Since there are quite many text columns, I also used [zstandard] to compress the Parquet (with a high-than-default compression level):

```python
import pyarrow as pa
import pandas as pd
import pyarrow.parquet as pq

sqlite_to_pyarrow_type_mapping = {
    'TEXT': pa.string(),
    'INTEGER': pa.int64(),
    'REAL': pa.float64(),
}

# Read each SQLite table as a Arrow table
arrow_tables = dict()
with engine.connect() as conn:
    for table in metadata.sorted_tables:
        # Construct the corresponding pyarrow schema
        schema = pa.schema([
            (c.name, sqlite_to_pyarrow_type_mapping[str(c.type)])
            for c in table.columns
        ])
        arrow_tables[table.name] = pa.Table.from_pandas(
            pd.read_sql_table(table.name, conn, coerce_float=False),
            schema=schema,
            preserve_index=False,
        )

# Write each Arrow table to a zstd compressed Parquet
for table_name, table in arrow_tables.items():
    pq.write_table(
        table,
        f'ensdb_v107/{table_name}.parquet',
        compression = 'zstd',
        compression_level = 9,
    )
```


### Load parquet tables to DuckDB
Finally, we can load the exported parquet tables to DuckDB.
Here I tested a few different approaches:

1. Create views to the external parquet files
2. Load the full content
3. Load the full content and index the tables (same as the original SQLite database)

Since DuckDB has native support for Parquet files, the syntax is straightforward:

```sql
-- Install and activate the extension
INSTALL parquet; LOAD parquet;

-- To create views to external parquet
CREATE VIEW <table> AS SELECT * FROM './ensdb_v107/<table>.parquet';
...

-- To load the full content
CREATE TABLE <table> AS SELECT * FROM './ensdb_v107/<table>.parquet';
...

-- To index the table (use .schema to get the original index definitions)
CREATE UNIQUE INDEX gene_gene_id_idx on gene (gene_id);
CREATE INDEX gene_gene_name_idx on gene (gene_name);
CREATE INDEX gene_seq_name_idx on gene (seq_name);
...
```

Note that I didn't try to "optimize" the table indices for my queries.
I simply mirrored the same index definition from the original SQLite database.

DuckDB's commandline interface works like SQLite.
And it keeps the database in a single file too:

```bash
duckdb -echo ensdb_v107.duckdb < create_duckdb.sql
duckdb -readonly ensdb_v107.duckdb
```

The full conversion including the parquet step took about 10 seconds to complete.


### Database file size comparison
Here are the file size of the databases:

|        Database         | File size |    (%)    |
| :---------------------- | --------: | --------: |
| SQLite no indexed       |     243MB |      57.9 |
| **SQLite (original)**   | **420MB** | **100.0** |
| DuckDB w. ext. parquets |    37.6MB |       9.0 |
| DuckDB                  |     169MB |      40.2 |
| DuckDB indexed          |     528MB |     125.7 |

DuckDB with external parquets yields the smallest file (~9% of the original size).
It's probably because there are a lot of text columns in the database, and zstd compression works really well for the plain text.
This approach could make the ensembldb database more portable.
Say, it's possible to commit it directly into the analysis project's GitHub repo.

By loading the actual data into DuckDB (without indices), the file grows considerably due to no compression and it is slightly smaller than SQLite.
I wonder if this is due to the columnar storage being more space efficient than row storage.
By indexing the DuckDB database, the file surprisingly grows to be larger than SQLite.
Since DuckDB is still actively developing its indexing algorithm, I suppose there might be a room for future improvement.

We have the databases ready.
Now let's see how they perform.

[sqlite_scanner]: https://github.com/duckdblabs/sqlite_scanner
[Apache Parquet]: https://parquet.apache.org/
[AH web interface]: https://annotationhub.bioconductor.org/package2/AHEnsDbs
[AH104864]: https://annotationhub.bioconductor.org/ahid/AH104864
[SQLAlchemy]: https://www.sqlalchemy.org/
[pandas]: https://pandas.pydata.org/
[PyArrow]: https://arrow.apache.org/docs/python/index.html
[zstandard]: https://facebook.github.io/zstd/


<!-- cSpell:words dbdir mircrobenchmark -->

## Use DuckDB in ensembldb
It's painless to tell ensembldb to use DuckDB instead.
[DuckDB's R client] already implements R's DBI interface, and ensembldb accepts a DBI connection to create a EnsDb object.
So we already have everything we need:

```r
library(duckdb)
library(ensembldb)

edb_sqlite = EnsDb('EnsDb.Hsapiens.v107.sqlite')

conn = dbConnect(duckdb(), dbdir="ensdb_v107.duckdb", read_only=TRUE)
edb_duckdb = EnsDb(conn)
dbDisconnect(conn, shutdown = TRUE)  # disconnect after usage
```

All the downstream usage of ensembldb is the same from here.

[DuckDB's R client]: https://duckdb.org/docs/api/r



## Benchmark results
Now we have the original SQLite database and three DuckDB databases constructed with various settings ready to use in ensembldb.
Here I tested mainly two scenarios: a genome-wide annotation query and a specific gene lookup.

To make the query more realistic and complicated, I applied a filter for annotations only from the canonical chromosomes and remove all LRG genes:

```r
standard_filter = AnnotationFilter(
    ~ seq_name %in% c(1:22, 'X', 'Y', 'MT') &
        gene_biotype != 'LRG_gene'
)
```

I use [microbenchmark] to benchmark the same query from different databases.
Conceptually, it works like this:

```r
mbm = microbenchmark(
    "sqlite_noidx" = { <some query> },
    "sqlite" = { ... },
    "duckdb_parquet" = { ... },
    "duckdb" = { ... },
    "duckdb_idx" = { ... },
    times = 20  # 50 times for faster queries
)
summary(mbm)
```

[microbenchmark]: https://cran.r-project.org/web/packages/microbenchmark/index.html


### Genome-wide annotation query
The first genome-wide query finds the 5'UTRs of all the transcripts.
This is one of the most computationally intensive built-in queries I know, involving some genomic range arithmics and querying over multiple tables.

```r
five_utr_per_tx = fiveUTRsByTranscript(edb, filter = standard_filter)
five_utr_per_tx |> head()
## GRangesList object of length 6:
## $ENST00000000442
## GRanges object with 2 ranges and 4 metadata columns:
##       seqnames            ranges strand |   gene_biotype    seq_name
##          <Rle>         <IRanges>  <Rle> |    <character> <character>
##   [1]       11 64305524-64305736      + | protein_coding          11
##   [2]       11 64307168-64307179      + | protein_coding          11
##               exon_id exon_rank
##           <character> <integer>
##   [1] ENSE00001884684         1
##   [2] ENSE00001195360         2
##   -------
##   seqinfo: 25 sequences (1 circular) from GRCh38 genome
##
## ...
```
<figure class="invert-in-dark-mode">
    <img src="{attach}pics/benchmark_genomewide_5utr_by_tx.png">
    <figcaption>Benchmark of extracting genome-wide 5'UTR locations per transcript.</figcaption>
</figure>

We see a huge performance increase for all DuckDB databases, since this query pretty much scans over the full table.
Overall, DuckDB runs 3–4 times faster than SQLite.

In many cases, there are always a few runs that take significantly more time.
This trend is quite consistent even after I re-run the benchmarks for multiple times.
While I haven't investigated it, I think this is due to the first run(s) being un-cached.
Surprisingly, DuckDB with indices run much slower than that without indices (especially the first run).
Though the index might not be very helpful in sequential scans, I guess the slowdown could be because of the bigger file to cache or the query planner unnecessarily traversing over indices.


## Another genome-wide annotation query
The other genome-wide query finds the transcripts of all the genes.

```r
tx_per_gene = transcriptsBy(edb, by = "gene", filter = standard_filter)
tx_per_gene |> head()
## GRangesList object of length 6:
## $ENSG00000000003
## GRanges object with 5 ranges and 12 metadata columns:
##       seqnames              ranges strand |           tx_id
##          <Rle>           <IRanges>  <Rle> |     <character>
##   [1]        X 100633442-100639991      - | ENST00000494424
##   [2]        X 100627109-100637104      - | ENST00000612152
##   [3]        X 100632063-100637104      - | ENST00000614008
##   [4]        X 100627108-100636806      - | ENST00000373020
##   [5]        X 100632541-100636689      - | ENST00000496771
##                 tx_biotype tx_cds_seq_start tx_cds_seq_end         gene_id
##                <character>        <integer>      <integer>     <character>
##   [1] processed_transcript             <NA>           <NA> ENSG00000000003
##   [2]       protein_coding        100630798      100635569 ENSG00000000003
##   [3]       protein_coding        100632063      100635569 ENSG00000000003
##   [4]       protein_coding        100630798      100636694 ENSG00000000003
##   [5] processed_transcript             <NA>           <NA> ENSG00000000003
## ...
```

<figure class="invert-in-dark-mode">
    <img src="{attach}pics/benchmark_genomewide_tx_by_gene.png">
    <figcaption>Benchmark of extracting genome-wide gene isoforms.</figcaption>
</figure>

This query tells more or less the same story with only a notable difference.
In this case, fully loaded DuckDB with and without indices share the same performance.



### A specific gene lookup
My another main scenario is to look up the annotation of a specific gene.
Let's simulate this kind of queries using a gene "EGFR", whose annotations can be retrieved by:

```r
egfr_tx = transcripts(edb, filter = AnnotationFilter(~ gene_name == 'EGFR'))
egfr_tx
## GRanges object with 14 ranges and 12 metadata columns:
##                   seqnames            ranges strand |           tx_id
##                      <Rle>         <IRanges>  <Rle> |     <character>
##   ENST00000344576        7 55019017-55171037      + | ENST00000344576
##   ENST00000275493        7 55019017-55211628      + | ENST00000275493
##   ENST00000455089        7 55019021-55203076      + | ENST00000455089
##   ENST00000342916        7 55019032-55168635      + | ENST00000342916
##         LRG_304t1        7 55019032-55207338      + |       LRG_304t1
##               ...      ...               ...    ... .             ...
##   ENST00000450046        7 55109723-55211536      + | ENST00000450046
##   ENST00000700145        7 55163753-55205865      + | ENST00000700145
##   ENST00000485503        7 55192811-55200802      + | ENST00000485503
##   ENST00000700146        7 55198272-55208067      + | ENST00000700146
##   ENST00000700147        7 55200573-55206016      + | ENST00000700147
## ...
```
<figure class="invert-in-dark-mode">
    <img src="{attach}pics/benchmark_extract_specific_gene.png">
    <figcaption>Benchmark of extracting the annotaiton of a specific gene.</figcaption>
</figure>

SQLite with indices undoubtedly has the best performance.
It's been fined for this use case (extracting a few rows using indices).
And SQLite without an index takes the most time to complete.
The performance of all three DuckDB databases fall in between.
Unlike SQLite, indexing DuckDB only speeds up the query a little bit.


## Summary
Here is the overview of the benchmarking results combined with the database file size.
The table shows the average speed-up ratio (and the worst case ratio) over the original SQLite database (ratio the higher the better):

|        Database         | Size (%)  |    Genome I     |    Genome II    | Gene-specific lookup |
| :---------------------- | --------: | --------------: | --------------: | -------------------: |
| SQLite no indexed       |      57.9 |     0.61 (0.78) |     0.88 (1.02) |         0.044 (0.12) |
| **SQLite (original)**   | **100.0** | **1.00 (1.00)** | **1.00 (1.00)** |      **1.00 (1.00)** |
| DuckDB w. ext. parquets |       9.0 |     3.36 (3.69) |     4.14 (4.63) |          0.15 (0.35) |
| DuckDB                  |      40.2 |     4.70 (4.76) |     6.30 (6.73) |          0.61 (0.81) |
| DuckDB indexed          |     125.7 |     3.66 (1.87) |     6.29 (6.33) |          0.65 (1.80) |

Overall, DuckDB shows impressive performance increase for genome-wide queries.
It uses up less storage too.
While DuckDB is slower than SQLite when it comes to gene-specific lookups.
Since we are talking about tens of milliseconds, unless there are thousands of lookups, the performance impact is insignificant.
On the other hand, genome-wide queries are saving seconds of time.

We could replace the original ensembldb database with a DuckDB database by loading the tables and removing the indices.
If the user is willing to sacrifice some performance in gene-specific lookups, DuckDB with external parquet files only uses less than 10% of the space but still runs significantly faster for genome-wide queries.
While the default indices copied from SQLite are not very helpful, I didn't tune the indices to maximally speed up the gene-specific lookups.
Note that DuckDB's file format is not stabilized yet, so the database needs to be re-created in newer DuckDB versions.

All in all, I think DuckDB advertises itself accurately when it comes to analytical query workloads.
It shows good performance when it queries a large portion of its content.
By having a similar interface to SQLite and clients in popular languages (R, Python, and etc),
converting an existing SQLite usecase to use DuckDB is easy.
My small exercise with ensembldb has convinced me to try out DuckDB in more scenarios too.
