---
Title: Use DuckDB in ensembldb to query Ensembl's genome annotation
Slug: use-duckdb-in-ensembldb
Date: 2022-10-05
Tags: en, r, python, ensembldb, sqlite, duckdb
Category: Bioinfo
Lang: en
Status: draft
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
The first step is to convert ensembl's SQLite database to DuckDB.
I decided to export SQLite tables as individual [Parquet] files, and then reload them back to DuckDB.
So we could also test the DuckDB's ability to query external parquet files directly.

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

[Apache Parquet]: https://parquet.apache.org/
[AH web interface]: https://annotationhub.bioconductor.org/package2/AHEnsDbs
[AH104864]: https://annotationhub.bioconductor.org/ahid/AH104864
[SQLAlchemy]: https://www.sqlalchemy.org/
[pandas]: https://pandas.pydata.org/
[PyArrow]: https://arrow.apache.org/docs/python/index.html
[zstandard]: https://facebook.github.io/zstd/


<!-- cSpell:words dbdir mircrobenchmark -->

## Use DuckDB in ensembldb
It was quite painless to tell ensembldb to use DuckDB instead.
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
It's great that very few code change is required to use DuckDB instead.

[DuckDB's R client]: https://duckdb.org/docs/api/r



## Benchmark results
Now we have the original SQLite database and three DuckDB databases constructed with various settings ready to use in ensembldb.
Here I tested mainly two scenarios: a genome-wide annotation query and a specific gene lookup.

To make the query more realistic and complicated, I apply a filter for annotations only from the canonical chromosomes and remove all LRG genes:

```r
standard_filter = AnnotationFilter(
    ~ seq_name %in% c(1:22, 'X', 'Y', 'MT') &
        gene_biotype != 'LRG_gene'
)
```

I use mircrobenchmark to benchmark the same query from different databases.
Conceptually it looks like this:

```r
mbm = microbenchmark(
    "sqlite" = { <some query> },
    "duckdb_parquet" = { ... },
    "duckdb" = { ... },
    "duckdb_idx" = { ... },
    times = 20L
)
summary(mbm)
```

### Genome-wide annotation query

```r
5utr_per_tx = fiveUTRsByTranscript(edb, filter = standard_filter)
5utr_per_tx |> head()
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

<figure class="invert-in-dark-mode">
    <img src="{attach}pics/benchmark_genomewide_tx_by_gene.png">
    <figcaption>Benchmark of extracting genome-wide gene isoforms.</figcaption>
</figure>

<figure class="invert-in-dark-mode">
    <img src="{attach}pics/benchmark_extract_specific_gene.png">
    <figcaption>Benchmark of extracting the annotaiton of a specific gene.</figcaption>
</figure>


[AnnotationHub]: https://bioconductor.org/packages/release/bioc/html/AnnotationHub.html

