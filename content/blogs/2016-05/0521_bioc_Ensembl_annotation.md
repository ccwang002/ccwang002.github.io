---
Title: Ensembl Genomic Reference in Bioconductor
Slug: biocondutor-ensembl-reference
Date: 2016-05-21 18:00
Tags: en, r, bioconductor
Category: Bioinfo
Summary: Using fundamental R/Biocondcutor packages (e.g. AnnotationHub, ensembldb and biomaRt) to query Ensembl genomic references or annotations.
---

***TL;DR** I gave a talk [Genomics in R] about querying genomic annotations and references in R/Bioconductor. In this post, we re-visit all the instructions in my talk using Ensembl references instead of UCSC/NCBI ones.*

This post extends from the "[Genomic Data Processing in Bioconductor]" series. In that post, I mentioned several topics critical for genomic data analysis in Bioconductor:

- Annotation and genome reference (OrgDb, TxDb, OrganismDb, BSgenome)
- Experiment data storage (ExpressionSets)
- Operations on genome (GenomicRanges)
- Genomic data visualization (Gviz, ggbio)



## Talk: Genomics in R

In a local R community meetup, I gave a talk [*Genomics in R*][Genomics in R] covering the "Annotation and genome reference" part, and made a quick glance through the "Operations on genome" part, which should be sufficient for daily usage such as searching annotations in the subset of some genomic ranges. You can find the [slides][Genomics in R], the [meetup screencast][Genomics in R screencast] (in Chinese) and the [accompanied source code][Genomics in R source code] online. I don't think a write-up is needed for the talk. But if anyone is interested, feel free to drop your reply below :)

In Bioconductor, most annotations are built against NCBI and UCSC naming system, which is the reference I adopted in the talk. There is another naming system maintained by [Ensembl], whose IDs are very recognizable with suffix "ENSG" and "ENST" for gene and transcript respectively.


### Ensembl Genome Browser

I particularly enjoy the Ensembl genome browser. The information is well organized and structured. For example, take a look at the description page of [gene MAPK1],

<div class="figure">
  <img src="{attach}pics/gene_MAPK1_ensembl_browser.png">
  <p class="caption center">Gene information page of MAP1 on Ensembl Genome Browser release 84 (<a href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000100030">link</a>)</p>
</div>

There are a lot of aspects worth exploration. The [gene tree](http://www.ensembl.org/Homo_sapiens/Gene/Compara_Tree?db=core;g=ENSG00000100030) tab shows its homologs and paralogs. The [variant table](http://www.ensembl.org/Homo_sapiens/Gene/Variation_Gene/Table?db=core;g=ENSG00000100030) tab shows various kinds of SNPs within MAPK1's transcript region. SNPs are annotated with their source, different levels of supporting evidence, and SIFT/PolyPhen prediction on protein function change. Finally, there is a [external references](http://www.ensembl.org/Homo_sapiens/Gene/Matches?db=core;g=ENSG00000100030;) tab which links the Ensembl IDs with [NCBI CCDS] and [NCBI RefSeq] IDs.


### Fundamental Bioconductor packages

Some packages serves as the building classes for genomic annotations. I put a table here containing all the classes required for rest of the post, which is adapted based on the [annotation workflow][bioc-annotation-workflow] on Bioconductor.

| Object Type     | Description |
|:----------------|:------------|
| `OrgDb`         | Gene-based information for Homo sapiens; useful for mapping between gene IDs, Names, Symbols, GO and KEGG identifiers, etc. |
| `TxDb`          | Transcriptome ranges for the known gene track of Homo sapiens, e.g., introns, exons, UTR regions. |
| `OrganismDb`    | Collection of multiple annotations for a common organism and genome build. |
| `BSgenome`      | Full genome sequence for Homo sapiens. |
| `AnnotationHub` | Provides a convenient interface to annotations from many different sources; objects are returned as fully parsed Bioconductor data objects or as the name of a file on disk. |

Some of the clases can have tens of methods, while only a part of them are used:

| Object Type             | Notable Methods                                                                              |
|:------------------------|:---------------------------------------------------------------------------------------------|
| `OrgDb`                 | columns(), select(), mapIds(), ...                                                           |
| `TxDb`                  | transcripts(), genes(), transcriptsBy(), exonsBy(), and methods from GRanges and GRangesList |
| `GRanges`, `GRangeList` | start(), end(), strand(), mcols(), seqinfo(), ...                                            |
| `Seqinfo`               | seqnames(), seqlengths(), isCircular(), seqlevels(), ...                                     |
| `OrganismDb`            | Methods by OrgDb and TxDb                                                                    |
| `BSgenome`              | seqnames(), getSeq()                                                                         |

If you are not familiar with these classes and their methods, go through the [talk slides][Genomics in R] first.


I always think of the Ensembl ecosystem as a decent learning portal, so it is a pity if one cannot easily use its information in R/Bioconductor. After a quick research, I found using Ensembl annotations are quite straightforward even though the required files does not ship with Bioconductor. Also, there were some topics I failed to mention in the talk, such as AnnotationHub and genomic coordinate system conversion (e.g., from hg19 to hg38). I am going to cover these topics in the talk.

[TOC]



## OrgDb

The same OrgDb object for human (`org.Hs.eg.db`) can be used. It relates different gene IDs, including Entrez Gene ID and Ensembl Gene ID. From its metadata it gets updated frequently, one should be able to use it for both hg19 and hg38 human reference.


```r
library(org.Hs.eg.db)
human <- org.Hs.eg.db

mapk_gene_family_info <- select(
    human,
    keys = c("MAPK1", "MAPK3", "MAPK6"),
    keytype = "SYMBOL",
    columns = c("ENTREZID", "ENSEMBL", "GENENAME")
)
mapk_gene_family_info
```

| SYMBOL | ENTREZID | ENSEMBL         | GENENAME                           |
|:-------|:---------|:----------------|:-----------------------------------|
| MAPK1  | 5594     | ENSG00000100030 | mitogen-activated protein kinase 1 |
| MAPK3  | 5595     | ENSG00000102882 | mitogen-activated protein kinase 3 |
| MAPK6  | 5597     | ENSG00000069956 | mitogen-activated protein kinase 6 |

Here comes a small pitfall for Ensembl annotation. We cannot sufficiently map Ensembl's gene ID to its transcript ID,

```r
select(
    human,
    keys = mapk_gene_family_info$ENSEMBL[[1]],
    keytype = "ENSEMBL",
    columns = c("ENSEMBLTRANS")
)
# 'select()' returned 1:1 mapping between keys and columns
#           ENSEMBL ENSEMBLTRANS
# 1 ENSG00000100030         <NA>
```

We got *no* Ensembl transcript ID for MAPK1, which is impossible. Therefore, to find the real transcript IDs, we need to find other references.



## TxDb

There is no available pre-built TxDb object of Ensembl transcript annotations on Bioconductor. But with the help of [ensembldb], we can easily build the TxDb ourselves from GTF file.


Following the instructions in ensembldb's [vignette file](http://bioconductor.org/packages/release/bioc/vignettes/ensembldb/inst/doc/ensembldb.html), we can build the TxDb object from the Ensembl latest release, which is release 84 (Mar, 2016) at the time of writing. Ensembl releases all human trascript records as GTF file, which can be found here <ftp://ftp.ensembl.org/pub/release-84/gtf/homo_sapiens/Homo_sapiens.GRCh38.84.gtf.gz>.

After processing GTF file via `ensDbFromGtf()`, the generated data for creating the TxDb object will be stored in a SQLite3 database file `Homo_sapiens.GRCh38.84.sqlite` at the R working directory. Building TxDB is just one command away, `EnsDb()`. Putting two commands together, and preventing from rebuilding the TxDb every time the script is executed, we first check if the sqlite file exists,

```r
# xxx_DB in the vignette is just a string to the SQLite db file path
ens84_txdb_pth <- './Homo_sapiens.GRCh38.84.sqlite'
if (!file.exists(ens84_human_txdb_pth)) {
    ens84_txdb_pth <- ensDbFromGtf(gtf="Homo_sapiens.GRCh38.84.gtf.gz")
}
txdb_ens84 <- EnsDb(ens84txdb_pth)
txdb_ens84  # Preview the metadata
```

To find the desired gene or transcript, the filtering syntax is a bit different from the built-in TxDb object,

```r
transcripts(
    txdb_ens84,
    filter=GeneidFilter(mapk_gene_family_info$ENSEMBL[[1]])
)
# GRanges object with 4 ranges and 5 metadata columns:
#                   seqnames               ranges strand |           tx_id           tx_biotype
#                      <Rle>            <IRanges>  <Rle> |     <character>          <character>
#   ENST00000215832       22 [21754500, 21867629]      - | ENST00000215832       protein_coding
#   ENST00000491588       22 [21763984, 21769428]      - | ENST00000491588 processed_transcript
#   ENST00000398822       22 [21769040, 21867680]      - | ENST00000398822       protein_coding
#   ENST00000544786       22 [21769204, 21867440]      - | ENST00000544786       protein_coding
#                   tx_cds_seq_start tx_cds_seq_end         gene_id
#                          <numeric>      <numeric>     <character>
#   ENST00000215832         21769204       21867440 ENSG00000100030
#   ENST00000491588             <NA>           <NA> ENSG00000100030
#   ENST00000398822         21769204       21867440 ENSG00000100030
#   ENST00000544786         21769204       21867440 ENSG00000100030
#   -------
#   seqinfo: 1 sequence from GRCh38 genome
```

So filtering is done by passing special filter functions to `filter=`. Likewise, there are `TxidFilter`, `TxbiotypeFilter`, and `GRangesFilter` for filtering on the respective columns.

```r
tx_gr <- transcripts(
    txdb_ens84,
    filter=TxidFilter("ENST00000215832")
)
tr_gr
# GRanges object with 1 range and 5 metadata columns:
#                   seqnames               ranges strand |           tx_id     tx_biotype tx_cds_seq_start tx_cds_seq_end         gene_id
#                      <Rle>            <IRanges>  <Rle> |     <character>    <character>        <numeric>      <numeric>     <character>
#   ENST00000215832       22 [21754500, 21867629]      - | ENST00000215832 protein_coding         21769204       21867440 ENSG00000100030
#   -------
#   seqinfo: 1 sequence from GRCh38 genome
```

Check the result with the online Ensembl genome browser. Note that Ensembl release 84 use hg38.



## BSgenome and AnnotationHub

We can load the sequence from `BSgenome.Hsapiens.UCSC.hg38`, however, we can obtain the genome (chromosome) sequence of Ensembl using [AnnotationHub]. References of non-model organisms can be found on AnnotationHub, many of which are extracted from Ensembl. But they can be downloaded as Bioconductor objects directly so it should be easier to use.

First we create a AnnotationHub instance, it cached the metadata all available annotations locally for us to query.

```r
ah <- AnnotationHub()
query(ah, c("Homo sapiens", "release-84"))
# AnnotationHub with 5 records
# # snapshotDate(): 2016-05-12
# # $dataprovider: Ensembl
# # $species: Homo sapiens
# # $rdataclass: TwoBitFile
# # additional mcols(): taxonomyid, genome, description, tags, sourceurl, sourcetype
# # retrieve records with, e.g., 'object[["AH50558"]]'
#
#             title
#   AH50558 | Homo_sapiens.GRCh38.cdna.all.2bit
#   AH50559 | Homo_sapiens.GRCh38.dna.primary_assembly.2bit
#   AH50560 | Homo_sapiens.GRCh38.dna_rm.primary_assembly.2bit
#   AH50561 | Homo_sapiens.GRCh38.dna_sm.primary_assembly.2bit
#   AH50562 | Homo_sapiens.GRCh38.ncrna.2bit
```

So human hg38 genome sequences are available as [TwoBit format][2bit]. One and more query results may be confusing at first. Checking the Ensembl's [gnome DNA assembly readme](ftp://ftp.ensembl.org/pub/release-84/fasta/homo_sapiens/dna/README), what we should use here is the full DNA assembly without any masking.

```r
# There are a plenty of query hits. Description of different file suffix:
# GRCh38.dna.*.2bit     genome sequence
# GRCh38.dna_rm.*.2bit  hard-masked genome sequence (masked regions are replaced with N's)
# GRCh38.dna_sm.*.2bit  soft-masked genome sequence (.............. are lower cased)
ens84_human_dna <- ah[["AH50559"]]
```

Then we can use it to obtain the DNA sequence of desired genomic range (in `GRagnes`).

```r
getSeq(ens84_human_dna, tx_gr)

#   A DNAStringSet instance of length 1
#      width seq                              names
# [1] 113130 TTTATAGAGAAAA...CTCGGACCGATTGCCT ENST00000215832
```



## biomaRt
[BioMart] are a collections of database that can be accessed by the same API, including Ensembl, Uniprot and HapMap. [biomaRt][r-biomart] provides an R interface to these database resources. We will use BioMart for ID conversion between Ensembl and RefSeq. Its [vignette](https://bioconductor.org/packages/release/bioc/vignettes/biomaRt/inst/doc/biomaRt.pdf) contains solutions to common scenarios so should be a good starting point to get familar with biomaRt.

You could first explore which Marts are currently available,

```r
library(biomaRt)
listMarts()
#                biomart               version
# 1 ENSEMBL_MART_ENSEMBL      Ensembl Genes 84
# 2     ENSEMBL_MART_SNP  Ensembl Variation 84
# 3 ENSEMBL_MART_FUNCGEN Ensembl Regulation 84
# 4    ENSEMBL_MART_VEGA               Vega 64
```

Here we use Ensembl's Mart. For other organisms, you can find their dataset by `listDatasets(ensembl)`. In our case, human's dataset is `hsapiens_gene_ensembl`.

```r
ensembl <- useMart("ensembl")
ensembl <- useDataset("hsapiens_gene_ensembl", mart=ensembl)
# or equivalently
ensembl <- useMart("ensembl", dataset="hsapiens_gene_ensembl")
```






[2bit]: https://genome.ucsc.edu/goldenpath/help/twoBit.html
[AnnotationHub]: https://bioconductor.org/packages/release/bioc/html/AnnotationHub.html
[bioc-annotation-workflow]: https://bioconductor.org/help/workflows/annotation/annotation/
[BioMart]: http://www.ensembl.org/biomart/martview
[r-biomart]: https://bioconductor.org/packages/release/bioc/html/biomaRt.html
[Ensembl]: http://www.ensembl.org/index.html
[ensembldb]: http://bioconductor.org/packages/release/bioc/html/ensembldb.html
[Genomic Data Processing in Bioconductor]: {filename}../2015-12/1229_biocondutor.md
[gene MAPK1]: http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000100030
[Genomics in R]: https://blog.liang2.tw/2016Talk-Genomics-in-R/
[Genomics in R source code]: https://github.com/ccwang002/2016Talk-Genomics-in-R
[Genomics in R screencast]: https://www.youtube.com/watch?v=ZR4GYQ487j8
[NCBI CCDS]: https://www.ncbi.nlm.nih.gov/CCDS/CcdsBrowse.cgi
[NCBI RefSeq]: http://www.ncbi.nlm.nih.gov/refseq/
