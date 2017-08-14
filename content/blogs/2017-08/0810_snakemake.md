---
Title: Use Snakemake on Google cloud 
Slug: snakemake-google-cloud
Date: 2017-08-10
Tags: en, bio, python, snakemake, cloud
Category: Bioinfo
---

[Snakemake][Snakemake] has been my favorite workflow management system for a while. I came across it while writing [my master thesis][master-thesis] and from the first look, it already appeared to be extremely flexible and powerful. I got some time to play with it during my lab rotation and now after joining the lab, I am using it in my many research projects.  With more and more projects in lab relying on virtualization like [Docker][docker], package management like [bioconda][bioconda], and cloud computing like [Google Cloud][google-cloud], I would like to continue using Snakemake in those scenarios as well. Hence this post to write down all the details. 

The post will introduce the Snakemake by writing the pipeline locally, then gradually move towards to Docker and more Google Cloud products, e.g., Google Cloud Storage, Google Compute Engine (GCE), and Google Container Engine (GKE). 

[Snakemake]: https://snakemake.readthedocs.io/
[master-thesis]: https://www.dropbox.com/s/u7aa2mbsto77wwy/thesis_upload.pdf?dl=0
[docker]: https://www.docker.com/
[bioconda]: https://bioconda.github.io/
[google-cloud]: https://cloud.google.com/

[TOC]



## RNA-seq dataset and pipeline for demonstration
In this example, I will use `~/snakemake_example` to store all the files and output. Make sure you change all the paths relative to the actual folder you use in your machine.

The demo anslysis pipeline will be a RNA-seq pipeline for transcript-level expression analysis, often called the [*new Tuxedo*][new-tuxedo-paper] pipeline involving [HISAT2][hisat2] and [StringTie][stringtie].  The RNA-seq dataset is from [Griffith Lab's RNA-seq tutorial][griffith-lab-rnaseq-tutorial] which,

> ... consists of two commercially available RNA samples: Universal Human Reference (UHR) and Human Brain Reference (HBR). The UHR is total RNA isolated from a diverse set of 10 cancer cell lines. The HBR is total RNA isolated from the brains of 23 Caucasians, male and female, of varying age but mostly 60-80 years old. 
> 
> (From the wiki page ["RNA-seq Data"]([griffith-lab-data]) of the tutorial)

Our RNA-seq raw data are the 10% downsampled FASTQ files for these samples. For the human genome reference, only the chromosome 22 from GRCh38 is used. The gene annotation is from [Ensembl Version 87][ens87].  Let's download all the samples and anotations.

```console
$ cd ~/snakemake_example
$ wget https://storage.googleapis.com/dinglab/lbwang/snakemake_demo/griffithlab_brain_vs_uhr.tar.gz
$ tar xf griffithlab_brain_vs_uhr.tar.gz
```

Now you should have the following file structure:

```tree
~/snakemake_example
├── griffithlab_brain_vs_uhr/
│   ├── GRCh38_Ens87_chr22_ERCC/
│   │   ├── chr22_ERCC92.fa
│   │   └── genes_chr22_ERCC92.gtf
│   └── HBR_UHR_ERCC_ds_10pc/
│       ├── HBR_Rep1_ERCC-Mix2_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       ├── HBR_Rep1_ERCC-Mix2_Build37-ErccTranscripts-chr22.read2.fastq.gz
│       ├── HBR_Rep2_ERCC-Mix2_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       ├── HBR_Rep2_ERCC-Mix2_Build37-ErccTranscripts-chr22.read2.fastq.gz
│       ├── HBR_Rep3_ERCC-Mix2_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       ├── HBR_Rep3_ERCC-Mix2_Build37-ErccTranscripts-chr22.read2.fastq.gz
│       ├── UHR_Rep1_ERCC-Mix1_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       ├── UHR_Rep1_ERCC-Mix1_Build37-ErccTranscripts-chr22.read2.fastq.gz
│       ├── UHR_Rep2_ERCC-Mix1_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       ├── UHR_Rep2_ERCC-Mix1_Build37-ErccTranscripts-chr22.read2.fastq.gz
│       ├── UHR_Rep3_ERCC-Mix1_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       └── UHR_Rep3_ERCC-Mix1_Build37-ErccTranscripts-chr22.read2.fastq.gz
└── griffithlab_brain_vs_uhr.tar.gz
```

[new-tuxedo-paper]: www.nature.com/nprot/journal/v11/n9/full/nprot.2016.095.html
[hisat2]: https://ccb.jhu.edu/software/hisat2/
[stringtie]: https://ccb.jhu.edu/software/stringtie/
[griffith-lab-rnaseq-tutorial]: https://github.com/griffithlab/rnaseq_tutorial/
[griffith-lab-data]: https://github.com/griffithlab/rnaseq_tutorial/wiki/RNAseq-Data
[ens87]: http://dec2016.archive.ensembl.org/Homo_sapiens/Info/Index



## Installation of snakemake and all related tools
After installing [conda][conda] and setting up [bioconda][bioconda], the installation is simple. All the dependencies are kept in a conda environemnt called `new_tuxedo`.

```console
$ conda create -n new_tuxedo \
    python=3.6 snakemake hisat2 stringtie samtools
$ source activate new_tuxedo        # Use the conda env 
(new_tuxedo) $ hisat2 --version     # all the tools are available
/Users/liang/miniconda3/envs/new_tuxedo/bin/hisat2-align-s version 2.1.0
...
(new_tuxedo) $ deactivate           # Exit the env
$ 
```

All the following steps should be run inside this conda environment unless it's specified otherwise.

[conda]: https://conda.io/miniconda.html



## Run Snakemake locally
Pipeline Steps 

Snakemake

Raw data: <https://storage.googleapis.com/dinglab/lbwang/snakemake_demo/griffithlab_brain_vs_uhr.tar.gz>

 