---
Title: Using EnsDb's annotation database in Python
Slug: use-ensdb-database-in-python
Date: 2017-11-17
Tags: en, python, r, bioconductor, ensembldb
Category: Bioinfo
---

[TOC]

## Ensembl annotation database EnsDB 
Made by a R package ensembldb 

As I mentioned before in [a post][my-post-ensembl] that Bioconductor/R really has a strong infrastructure of storing and querying genomic information.

Outline:

- Introduction of authentic annotation query
- ensembldb and EnsDb for each Ensembl release
- AnnotationHub
    - How to find the correct sqlite file from the annotation hub without using R

[my-post-ensembl]: {filename}../2016-05/0521_bioc_Ensembl_annotation.md