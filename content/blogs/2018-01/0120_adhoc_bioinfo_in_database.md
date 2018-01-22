---
Title:     Ad hoc bioinformatic analysis in database
Slug:      ad-hoc-bioinfo-analysis-in-database
Date:      2018-01-20
Tags:      en, python, sqlite, postgresql
Category:  Bioinfo
---

Recently I've found that bioinformatic analysis in database is not hard at all and the database set up wasn't as daunting as it sounds, especially when the data are tabular. I used to start my analysis with loading everything into R or Python, and then figuring out all the filtering and grouping commands in my favorite R or Python packages. But with this method, the data size would be bound by memory and the analysis might be slow unless additional optimization was applied. On the other hand, database has already solved the problems by mapping the data to disk and indexing. Therefore I'd like to share my recent experience on using database for bioinfo analysis.

Note that if one is interested in the actual tips of using database for analysis, feel free to skip the whole background section.

[TOC]


## Background

### Reading tabular data in bioinformatics
Tabular data are everywhere in bioinformatics. To record gene expressions, variants or ID cross reference between different annotation systems or databases, data are stored in various tabular-like formats, such as BED, GTF, MAF, and VCF, which can usually be normalized to the standard CSV and TSV files. Starting with the raw data, we apply different kinds of filtering and grouping to pick up the records of interest. For example, we might subset the data within a genomic region, select transcripts above an expression threshold, or group the data by the same transcript across multiple samples. 

Researchers have developed numerous tools to subset or group the data. In Python, numpy and pandas dominate the analysis; in R, data.frame, tibble, and data.table are all widely used. However, all the tools above only work if the data can be fit into memory. Unfortunately, bioinformatics data can go beyond 10GB easily these day. It has been difficult to analyze everything in memory. Even using a powerful server with a few hundreds GB of memory, the overhead of loading all data into memory can be time consuming. To make things worse, joining multiple data together will be the combination of the issues above.

One might argue that in Python there are packages like [xarray] and [dask] capable of handling out-of-memory multi-dimensional array. But they are only useful for numerical data. In bioinformatics metadata are frequently used and consist of many text columns, where numpy doesn't have the same computing advantage as numerical columns. For example, gene expression only makes sense if it comes with the gene symbol, the transcript id, and the sample id.

### Database
On the other hand, databases have been solving all the above tasks for decades, and it also comes with several advantages. Language databases use is standardized, called SQL. SQL is expressive, which means in stead of writing how to load or query the data, one writes what the data or the query look like. Database supports concurrent reads, so one is able to query the same data in parallel. One can speed up the queries by setting up indexes. Database is persistent, so one only needs to load the data once.

I mainly use two databases: [SQLite] and [PostgreSQL]. SQLite's database is a single file and it doesn't need any configuration to run. In fact SQLite ships with Python, available as the [`sqlite` module][pysqlite]. SQLite works very well in my case.

PostgreSQL is more feature-rich database and has better concurrency supports such as multiple writers at the same time. [Its advanced indexing][psql-index-type] and [data types][psql-data-type] might be helpful for genomic range query. The downside is that it requires some configurations and installation is not as easy as SQLite. It is actually just a few commands on Debian Linux but one probably needs to go through the documentation to understand what they are about.

In the past the most annoying thing I found using database is to load my data, where I had to create the table by `CREATE TABLE ...` and insert all my data by multiple `INSERT INTO ... VALUES ...` statements. But recently I found that many databases have some builtin utilities to make the process easy. Also, it is not hard to programmatically generate the statements through packages like [SQLAlchemy]. Therefore, I will share some experience of using database here. 

[xarray]: http://xarray.pydata.org/en/stable/
[dask]: https://dask.pydata.org/en/latest/
[SQLAlchemy]: https://www.sqlalchemy.org/
[SQLite]: https://sqlite.org/
[PostgreSQL]: https://www.postgresql.org/
[pysqlite]: https://docs.python.org/3/library/sqlite3.html
[psql-index-type]: https://www.postgresql.org/docs/current/static/indexes-types.html
[psql-data-type]: https://www.postgresql.org/docs/current/static/datatype.html



## Tabular data IO in database

### SQLite
For SQLite, use `.mode csv` with [`.import` statement][sqlite-import]. SQLite will create the table automatically by using the first row as the column names if the table doesn't exist. One can create the table before the loading to define each column's data type. `.separator` controls the delimiter character SQLite uses between columns.


```sql
.mode csv
.separator \t   -- For TSV files
.import '/path/to/tsv' table_name
```

To export data, use `.once` statement followed by the query:

```sql
.header on  -- Export columns name 
.once '/path/to/output.tsv'
SELECT * FROM table_name;  -- Export all data in the table
```

Commands above can be scripting into SQLite like:

    sqlite3 mydb.sqlite < load_data.sql

[sqlite-import]: https://www.sqlite.org/cli.html#csv


### PostgreSQL
For PostgreSQL, the built-in solution is to use the [`COPY` statement][psql-copy] or the [`\copy` metacommand][psql-meta-copy] to import or export data. They generally run faster than normal `INSERT` statements. Besides built-in commands, an external tool [pgloader] has been very helpful for the data loading. The loading process is more flexible.

I won't dive into details of their usage here. There will be an example in the benchmark section.

[psql-copy]: https://www.postgresql.org/docs/current/static/sql-copy.html
[psql-meta-copy]: https://www.postgresql.org/docs/current/static/app-psql.html#APP-PSQL-META-COMMANDS-COPY
[pgloader]: https://pgloader.io/


### Loading compressed data with named pipe
Many tabular data are compressed by gzip or bgzip to save the disk space. To decompress the file and load into the database without storing the uncompressed file somewhere first, one can consider using [named pipe][linux-named-pipe].

The idea is to decompress the file to the named pipe, and read the data in database from the named pipe. A named pipe can be created by `mkfifo`.  For example,

```shell
mkfifo mypipe
gunzip -c mydata.tsv.gz > mypipe &
```

The trailing `&` makes the decompress command run at the background to keep everything in one shell session. Then read the data in SQLite as if it were a file like:

```sqlite
.import mypipe mytable
```

The trick here can be further expand to any preprocessing in any language. One can simply preprocess the file and write the output to a named pipe. The database can read from the named pipe without storing the full intermediate output on disk. Plus, by piping between commands more CPU cores are utilized.

[linux-named-pipe]: https://www.linuxjournal.com/article/2156


## Benchmark
To give an idea of the data processing time in database, I used all the [somatic variants from TCGA MC3][tcga-mc3] as a demonstration. The goal here is to count the number of variants by different transcript and its mutation type. So the output result will be something like the following:

|  Transcript ID  |   Mutation type   | Count |
| :-------------- | ----------------- | ----- |
| ENST00000000233 | 3'UTR             | 20    |
| ENST00000000233 | Frame\_Shift\_Del | 1     |
| ENST00000000233 | Intron            | 6     |
| ...             | ...               | ...   |

After filtering out all the silent mutations, there are total about 2.8 million variants making up 614MB of disk space. 

I used three methods to load and group the variants: pandas, SQLite, and PostgreSQL. 

[tcga-mc3]: https://www.synapse.org/#!Synapse:syn7214402/wiki/405297


### pandas (Python)
Standard pandas IO code.

```py
import numpy as np
import pandas as pd


df = pd.read_table(
    'mc3_filtered.tsv',
    header=None,
    names=[
        'chrom', 'start', 'end', 'strand', 'mutation_type',
        'ref_allele', 'alt_allele', 'transcript_id',
        'hgvs_c', 'hgvs_p', 'cdna_start', 'cdna_end',
        'p_start', 'p_end', 'normal_id', 'tumor_id'
    ],
    dtype={
        'chrom': str, 'start': np.int64, 'end': np.int64,
        'strand': np.int32, 'cdna_start': str, 'cdna_end': str,
        'p_start': str, 'p_end': str,
    },
    engine='c',
)

grp_df = df.groupby(['transcript_id', 'mutation_type'])['alt_allele'].count().reset_index()
grp_df.to_csv('out.pandas.tsv', index=False, sep='\t')
```


### SQLite
I set some `PRAGMA ...` statements at the beginning to control some of the SQLite settings. It tells SQLite to use more cache, create temporary tables in memory and disable all the transaction recovery settings. SQLite by default tries to write everything to the disk first so if the program fails or any exception occurs, it can recover all the transactions properly. In our case we don't need to be conservative.

 
```sql
PRAGMA cache_size=-4192000;  -- Use 2GB RAM as cache
PRAGMA temp_store=MEMORY;
PRAGMA synchronous=OFF;
PRAGMA journal_mode=OFF;
PRAGMA locking_mode=EXCLUSIVE;

.mode csv
.separator \t
CREATE TABLE mc3 (
    chrom       TEXT,
    "start"     INT,
    "end"       INT,
    strand      INT,
    mutation_type   TEXT,
    ref_allele  TEXT,
    alt_allele  TEXT,
    transcript_id   TEXT,
    hgvs_c      TEXT,
    hgvs_p      TEXT,
    cdna_start  INT,
    cdna_end    INT,
    p_start     INT,
    p_end       INT,
    normal_id   TEXT,
    tumor_id    TEXT
);
.import mc3_filtered.tsv mc3
-- Create an index to speed up grouping on the same columns
CREATE INDEX mc3_idx ON mc3 (transcript_id, mutation_type);

-- Output
.once out.sqlite.tsv
SELECT transcript_id, mutation_type, COUNT(alt_allele) AS c
FROM mc3
GROUP BY transcript_id, mutation_type;
```


### PostgreSQL
I used [pgloader] to load the data into a local PostgreSQL database `test_mc3`. It takes a script of its own mini-language.

```
LOAD CSV
    FROM 'mc3_filtered.tsv'
    INTO postgresql:///test_mc3?mc3
    WITH fields terminated by '\t',
         fields not enclosed,
         drop indexes
    BEFORE LOAD DO 
    $$ DROP TABLE IF EXISTS mc3; $$,
    $$ CREATE TABLE mc3 (
            chrom       TEXT,
            "start"     BIGINT,
            "end"       BIGINT,
            strand      SMALLINT,
            mutation_type   TEXT,
            ref_allele  TEXT,
            alt_allele  TEXT,
            transcript_id   TEXT,
            hgvs_c      TEXT,
            hgvs_p      TEXT,
            cdna_start  INT,
            cdna_end    INT,
            p_start     INT,
            p_end       INT,
            normal_id   TEXT,
            tumor_id    TEXT
        ); 
    $$,
    $$ CREATE INDEX mc3_idx ON mc3 (transcript_id, mutation_type); $$
;
```

To do the grouping analysis, I used the built-in `COPY` command:

```psql
COPY ( 
    SELECT transcript_id, mutation_type, COUNT(alt_allele) AS c
    FROM mc3
    GROUP BY transcript_id, mutation_type
) TO '/private/tmp/mc3/MC3/out.psql.tsv' WITH (FORMAT TEXT);
```


### Result
I didn't run it systematically but a few repeats showed the similar numbers. 

| Method     | Read data (sec) | Group-by analysis (sec) |
| :--------- | --------------: | ----------------------: |
| Pandas     |            10.7 |                     0.9 |
| SQLite     |            27.7 |                     4.0 |
| PostgreSQL |            82.6 |                    13.5 |

In this case, all data can be loaded into memory easily, so pandas gave the best performance here. It actually took nearly no-time to complete the grouping. 

All databases ran much slower on loading data than pandas. PostgreSQL seems to run a lot more slower than SQLite, which I think it has something to do with my server configuration, say, not enough cache size, or not enough working memory for the group-by operation. I feel like PostgreSQL can be faster but anyway that's the result I have so far. Note that the databases are on a PCIe SSD disk. It they were on a normal hard drive, the database creation will take a much longer time.

However, after the data are loaded into the database, the speed of the query alone is comparable to pandas. For pandas, one cannot skip the step of reading data so if the analysis is on a frequently used dataset, database like SQLite can yield better performance. Once the data get larger than the memory capacity, special care will be needed to make the pandas approach work, whereas database can scale up with little fuss.


## Conclusion
My post provides a different solution to work with tabular data in a database. In-memory approach like pandas works very efficiently at a small dataset but one will have to code the "how-tos" to scale to a larger dataset that cannot feed into memory (or the overhead is too high). On the other hand, database can easily scale to a few hundred GBs in size and the query is fast. For analysis on a frequently used dataset, loading data into the database first might be a good idea. 

Another good thing about database is that SQL make joining across tables easily. One can easily join across multiple tables, say, expanding the gene annotation and doesn't have to worry how to implement it. With indexing, the joining can be fast. In pandas, one generates many objects representing the joining results, but those objects cannot be easily shared between scripts. Relying on storing the intermediate objects on disk, the accumulated overhead might be significant. Projects like [Apache Arrow] might solve the in-memory object passing ultimately, but its development is still in the early phase. As for database, one can define reusable views for the joining logics and filtering results. The post didn't really touch this part so I probably need another benchmark or post to back my thoughts. 

However, working in pandas gives users great room of flexibility. For example, one can iterate over rows and do some complex transformation of the value. Maybe it would be the optimal solution to use [`pandas.read_sql`][pandas-read-sql] to run query in database. 

It seems to me like many people rely on the features of some special file formats such as bgzip and tabix too much and have forgotten the generic yet flexible approach using database. Those formats often optimize the random access by a given genomic query by indexing. In database, such index is analogous to `(chrom, start, -end)` or even GiST index on Range type in PostgreSQL. Aside from the performance, one can continue to query the records in the same way in database, but for special format the functionality will be much limited.

At least I will give database a try before writing my own data wrangling script.

[pandas-read-sql]: https://pandas.pydata.org/pandas-docs/stable/generated/pandas.read_sql.html#pandas.read_sql
[Apache Arrow]: https://arrow.apache.org/
