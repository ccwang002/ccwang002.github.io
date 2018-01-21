---
Title: Ad hoc bioinformatic analysis in database
Slug: ad-hoc-bioinfo-analysis-in-database
Date: 2018-01-20
Tags: en, python, sqlite, postgresql
Category: Bioinfo
---

Recently I've found that bioinformatic analysis in database is not hard at all and the database set up wasn't as daunting as it sounds, especially when the data are tabular. I used to start my analysis with loading everything into R or Python, and then figuring out all the filtering and grouping commands in my favorite R or Python packages. But with this method, the data size would be bound by memory and the analysis might be slow unless additional optimization was applied. On the other hand, database has already solved the problems by mapping the data to disk and indexing. Therefore I'd like to share my recent experience on using database for bioinfo analysis.

Note that if one is interested in the actual tips of using database for analysis, feel free to skip the whole background section.

[TOC]


## Background
Tabular data are everywhere in bioinformatics. To record gene expressions, variants or ID cross reference between different annotation systems or databases, data are stored in various tabular-like formats, such as BED, GTF, MAF, and VCF, which can usually be normalized to the standard CSV and TSV files. Starting with the raw data, we apply different kinds of filtering and grouping to pick up the records of interest. For example, we might subset the data within a genomic region, select transcripts above an expression threshold, or group the data by the same transcript across multiple samples. 

Researchers have developed numerous tools to subset or group the data. In Python, numpy and pandas dominate the analysis; in R, data.frame, tibble, and data.table are all widely used. However, all the tools above only work if the data can be fit into memory. Unfortunately, bioinformatics data can go beyond 10GB easily these day. It has been difficult to analyze everything in memory. Even using a powerful server with a few hundreds GB of memory, the overhead of loading all data into memory can be time consuming. To make things worse, joining multiple data together will be the combination of the issues above.

One might argue that in Python there are packages like [xarray] and [dask] capable of handling out-of-memory multi-dimensional array. But they are only useful for numerical data. In bioinformatics metadata are frequently used and consist of many text columns, where numpy doesn't have the same computing advantage as numerical columns. For example, gene expression only makes sense if it comes with the gene symbol, the transcript id, and the sample id.

On the other hand, databases have been solving all the above tasks for decades, and it also comes with several advantages. Language databases use is standardized, called SQL. SQL is expressive, which means in stead of writing how to load or query the data, one writes what the data or the query look like. Database supports concurrent reads, so one is able to query the same data in parallel. One can speed up the queries by setting up indexes. Database is persistent, so one only needs to load the data once.

In the past the most annoying thing I found using database is to load my data, where I had to create the table by `CREATE TABLE ...` and insert all my data by multiple `INSERT INTO ... VALUES ...` statements. But recently I found that many databases have builtin utilities to help the process. Also, it is not hard to programatically generate the statements through packages like SQLAlchemy. Therefore, I will share some experience of using database here. 

[xarray]: http://xarray.pydata.org/en/stable/
[dask]: https://dask.pydata.org/en/latest/



## Benchmark

|            | Read/Load data (sec) | Group-by analysis (sec) |
| :--------- | -------------------: | ----------------------: |
| Pandas     |                 10.7 |                     0.9 |
| SQLite     |                 27.7 |                     4.0 |
| PostgreSQL |                 82.6 |                   13.54 |


sqlite .import 
postgresql pgloader

compressed data with named pipe

k-way merging

