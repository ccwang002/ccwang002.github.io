---
Title: Store GDC genome as a Seqinfo object
Slug: gdc-seqinfo
Date: 2019-02-26
Tags: en, r, bioconductor
Category: Bioinfo
---

Genomic Data Commons (GDC) hosted by NCI is the place to harmonize past and future genomic data, such as TCGA, TARGET, and CPTAC projects. GDC has its own genome reference, [`GRCh38.d1.vd1`][gdc-ref], which has 2,779 "chromosomes" including decoys and virus sequences. That said, the canonical chromosomes of GRCh38.d1.vd1 (e.g., chr1 to chr22, chrM, chrX, and chrY) are identical to that of hg38 and GRCh38. So all these three genome references can be used interchangeably.

Anyway, I was trying to correctly store the full GRCh38.d1.vd1 genome information in the `GRanges` and `GRangesList` R objects, which can be done by creating a `Seqinfo` object representing all its chromosomes. It was also fun to get familiar with the genomic data structures in R. 

[gdc-ref]: https://gdc.cancer.gov/about-data/data-harmonization-and-generation/gdc-reference-files


### Build GDC's Seqinfo
First, we need the length and the name of all chromosomes in GRCh38.d1.vd1.  I used samtools to extract the information as a `.dict` file from the genome reference FASTA file.

```bash
export GDC_REF_FA_URL='https://api.gdc.cancer.gov/data/254f697d-310d-4d7d-a27b-27fbf767a834'
curl -Lo GRCh38.d1.vd1.fa.tar.gz $GDC_REF_FA_URL
samtools dict \
    -a 'GRCh38.d1.vd1' -s 'Homo sapiens' \
    -u $GDC_REF_FA_URL \
    GRCh38.d1.vd1.fa.tar.gz > GRCh38.d1.vd1.dict

head -n 3 GRCh38.d1.vd1.dict
# @HD	VN:1.0	SO:unsorted
# @SQ	SN:chr1	LN:248956422	M5:6aef897c3d6ff0c78aff06ac189178dd	UR:https://api.gdc.cancer.gov/data/254f697d-310d-4d7d-a27b-27fbf767a834	AS:GRCh38.d1.vd1	SP:Homo sapiens
# @SQ	SN:chr2	LN:242193529	M5:f98db672eb0993dcfdabafe2a882905c	UR:https://api.gdc.cancer.gov/data/254f697d-310d-4d7d-a27b-27fbf767a834	AS:GRCh38.d1.vd1	SP:Homo sapiens
```

Seqinfo also requires the information of whether a chromosome is circular. In GDC's case,  mitochondria chromosome and all viruses sequences are circular. Combining all the information together, we can construct the Seqinfo object describing the genome GRCh38.d1.vd1.

```r
library(tidyverse)
library(GenomeInfoDb)

gdc_simple_tbl <- read_tsv(
    './GRCh38.d1.vd1.dict', 
    skip = 1,  # Skip the first line (@HQ ...)
    col_names = c('SQ', 'chrom', 'length', 'md5sum', 'URI', 'assembly', 'species')
) %>%
    select(chrom, length) %>%
    mutate(chrom = str_sub(chrom, start = 4), 
           length = as.integer(str_sub(length, start = 4)),
           circular = case_when(
               chrom == 'chrM' ~ TRUE,
               chrom == 'chrEBV' ~ TRUE,
               startsWith(chrom, 'HPV') ~ TRUE,
               TRUE ~ FALSE
           ))

gdc_seqinfo <- Seqinfo(
    seqnames = gdc_simple_tbl$chrom,
    seqlengths = gdc_simple_tbl$length,
    isCircular = gdc_simple_tbl$circular,
    genome = 'GRCh38.d1.vd1'
)
```

Now we can supply it to any `GRanges` object coming out from any GDC's sequencing data.

```rconsole
> gdc_seqinfo
Seqinfo object with 2779 sequences (191 circular) from GRCh38.d1.vd1 genome:
  seqnames   seqlengths isCircular        genome
  chr1        248956422      FALSE GRCh38.d1.vd1
  chr2        242193529      FALSE GRCh38.d1.vd1
  chr3        198295559      FALSE GRCh38.d1.vd1
  chr4        190214555      FALSE GRCh38.d1.vd1
  chr5        181538259      FALSE GRCh38.d1.vd1
  ...               ...        ...           ...
  HPV-mKN2         7299       TRUE GRCh38.d1.vd1
  HPV-mKN3         7251       TRUE GRCh38.d1.vd1
  HPV-mL55         7177       TRUE GRCh38.d1.vd1
  HPV-mRTRX7       7731       TRUE GRCh38.d1.vd1
  HPV-mSD2         7300       TRUE GRCh38.d1.vd1
```

I store the `gdc_seqinfo` as a RDS file ([link][gdc-seqinfo-link] here) so I can re-use it easily.

```r
gdc_seqinfo <- readRDS('seqinfo_GRCh38.d1.vd1.rds')
```

[gdc-seqinfo-link]: {attach}results/seqinfo_GRCh38.d1.vd1.rds