---
Title: Use Snakemake on Google cloud
Slug: snakemake-google-cloud
Date: 2017-08-10
Tags: en, bio, python, snakemake, cloud
Category: Bioinfo
---

***TL;DR** Run a RNA-seq pipeline using Snakemake locally and later port it to Google Cloud. Snakemake can parallelize jobs of a pipeline and even across machines.*

[Snakemake][Snakemake] has been my favorite workflow management system for a while. I came across it while writing [my master thesis][master-thesis] and from the first look, it already appeared to be extremely flexible and powerful. I got some time to play with it during my lab rotation and now after joining the lab, I am using it in my many research projects.  With more and more projects in lab relying on virtualization like [Docker][docker], package management like [bioconda][bioconda], and cloud computing like [Google Cloud][google-cloud], I would like to continue using Snakemake in those scenarios as well. Hence this post to write down all the details.

The post will introduce the Snakemake by writing the pipeline locally, then gradually move towards to Docker and more Google Cloud products, e.g., Google Cloud Storage, Google Compute Engine (GCE), and Google Container Engine (GKE). [Snakemake tutorial][snakemake-tutorial] is a good place to start with to understand how Snakemake works.

[Snakemake]: https://snakemake.readthedocs.io/
[master-thesis]: https://www.dropbox.com/s/u7aa2mbsto77wwy/thesis_upload.pdf?dl=0
[docker]: https://www.docker.com/
[bioconda]: https://bioconda.github.io/
[google-cloud]: https://cloud.google.com/
[snakemake-tutorial]: https://snakemake.readthedocs.io/en/stable/tutorial/tutorial.html

[TOC]



## RNA-seq dataset and pipeline for demonstration
In this example, I will use `~/snakemake_example` to store all the files and output. Make sure you change all the paths to be relative to the actual folder in your machine.

The demo pipeline will be a RNA-seq pipeline for transcript-level expression analysis, often called the [*new Tuxedo*][new-tuxedo-paper] pipeline involving [HISAT2][hisat2] and [StringTie][stringtie]. The RNA-seq dataset is from [Griffith Lab's RNA-seq tutorial][griffith-lab-rnaseq-tutorial] which,

> ... consists of two commercially available RNA samples: Universal Human Reference (UHR) and Human Brain Reference (HBR). The UHR is total RNA isolated from a diverse set of 10 cancer cell lines. The HBR is total RNA isolated from the brains of 23 Caucasians, male and female, of varying age but mostly 60-80 years old.
>
> (From the wiki page ["RNA-seq Data"]([griffith-lab-data]) of the tutorial)

Our RNA-seq raw data are the 10% downsampled FASTQ files for these samples. For the human genome reference, only the chromosome 22 from GRCh38 is used. The gene annotation is from [Ensembl Version 87][ens87].  Let's download all the samples and annotations.

```console
$ cd ~/snakemake_example
$ wget https://storage.googleapis.com/lbwang-playground/snakemake_rnaseq/griffithlab_brain_vs_uhr.tar.gz
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
│       ├── ...
│       ├── UHR_Rep3_ERCC-Mix1_Build37-ErccTranscripts-chr22.read1.fastq.gz
│       └── UHR_Rep3_ERCC-Mix1_Build37-ErccTranscripts-chr22.read2.fastq.gz
└── griffithlab_brain_vs_uhr.tar.gz
```

[new-tuxedo-paper]: https://www.nature.com/nprot/journal/v11/n9/full/nprot.2016.095.html
[hisat2]: https://ccb.jhu.edu/software/hisat2/
[stringtie]: https://ccb.jhu.edu/software/stringtie/
[griffith-lab-rnaseq-tutorial]: https://github.com/griffithlab/rnaseq_tutorial/
[griffith-lab-data]: https://github.com/griffithlab/rnaseq_tutorial/wiki/RNAseq-Data
[ens87]: http://dec2016.archive.ensembl.org/Homo_sapiens/Info/Index



## Installation of snakemake and all related tools
After installing [conda][conda] and setting up [bioconda][bioconda], the installation is simple. All the dependencies are kept in a conda environment called `new_tuxedo`.

```console
$ conda create -n new_tuxedo \
    python=3.6 snakemake hisat2 stringtie samtools
$ source activate new_tuxedo        # Use the conda env
(new_tuxedo) $ hisat2 --version     # Tools are available in the env
/Users/liang/miniconda3/envs/new_tuxedo/bin/hisat2-align-s version 2.1.0
...
(new_tuxedo) $ deactivate           # Exit the env
$ hisat2 --version                  # Tools are isolated in the env
bash: hisat2: command not found
```

All the following steps should be run inside this conda environment unless it's specified otherwise.

[conda]: https://conda.io/miniconda.html



## Snakemake local pipeline execution
The RNA-seq pipeline largely consists of the following steps:

1. Build HISAT2 genome reference index for alignment
2. Align sample reads to the genome by HISAT2
3. Assemble per-sample transcripts by StringTie
4. Merge per-sample transcripts by StringTie
5. Quantify transcript abundance by StringTie

To get the taste of how to write a Snakemake pipeline, I will implement it gradually by breaking it into three major parts: genome reference index build, alignment, and transcript assessment.


### Genome reference index build (How to write snakemake rules)
To build the genome reference, we need to extract the splice sites and exons by two of the HISAT2 scripts, `hisat2_extract_splice_sites.py` and `hisat2_extract_exons.py`. Then we call `hisat2-build` to build the index. Create a new file at `~/snakemake_example/Snakefile` with the following content:

```python
GENOME_FA = "griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/chr22_ERCC92.fa"
GENOME_GTF = "griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/genes_chr22_ERCC92.gtf"
HISAT2_INDEX_PREFIX = "hisat2_index/chr22_ERCC92"

rule extract_genome_splice_sites:
    input: GENOME_GTF
    output: "hisat2_index/chr22_ERCC92.ss"
    shell: "hisat2_extract_splice_sites.py {input} > {output}"

rule extract_genome_exons:
    input: GENOME_GTF
    output: "hisat2_index/chr22_ERCC92.exon"
    shell: "hisat2_extract_exons.py {input} > {output}"

rule build_hisat_index:
    input:
        genome_fa=GENOME_FA,
        splice_sites="hisat2_index/chr22_ERCC92.ss",
        exons="hisat2_index/chr22_ERCC92.exon",
    output: expand(f"{HISAT2_INDEX_PREFIX}.{{ix}}.ht2", ix=range(1, 9))
    log: "hisat2_index/build.log"
    threads: 8
    shell:
        "hisat2-build -p {threads} {input.genome_fa} "
        "--ss {input.splice_sites} --exon {input.exons} {HISAT2_INDEX_PREFIX} "
        "2>{log}"
```

Overall `Snakefile` is Python-based, so one can define variables and functions, import Python libraries, and use all the string operations as one does in the Python source code.  Here I defined some constants to the genome reference files (`GENOME_FA` and `GENOME_GTF`) and the output index prefix (`HISAT2_INDEX_PREFIX`) because they will get quite repetitive and specifying them at the front can make future modifications easier.

In case one hasn't read the [Snakemake Tutorial][snakemake-tutorial], here is an overview of the Snakemake pipeline execution.  A Snakemake rule is similar to a Makefile rule.  In a rule, one can specify the input pattern and the output pattern of a rule, as well as the command to run for this rule.  When snakemake runs, all the output user wants to generate will be translated into a sets of rules to be run.  Based on the desired output, Snakemake will find the rule that can generate them (matching the rule's output pattern) and the required input.  The finding process can be traversed rules after rules, that is, some input of a rule depends on the output of another rule, until all the inputs are available.  Then Snakemake will start to generate the output by running the commands each rule gives.

Now we can look at the three rules in our current `Snakefile`.

The first rule `extract_genome_splice_sites` extracts the genome splice sites. The input file is `GENOME_GTF` which is the Ensembl gene annotation. The output is a file at `hisat2_index/chr22_ERCC92.ss`. The command to generate the output from the given input is a shell command. The command contains some variables, `{input}` and `{output}`, where Snakemake will fill in them with the sepcified intput and output. So when the first rule is activated, Snakemake will let Bash shell to run:

```bash
hisat2_extract_splice_sites.py \
    griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/genes_chr22_ERCC92.gtf \
    > hisat2_index/chr22_ERCC92.ss
```

The second rule `extract_genome_exons` is quite similar to the first one, but extracts the genome exons and stores it in `hisat2_index/chr22_ERCC92.exon`.

The third rule `build_hisat_index` builds the actual index. Input can be multiple files, in this case there are three entries, including the chromosome sequence, splice sites and exons. One can later refer only to input of the same entry by their entry name. For example, `{input.genome_fa}` means the chromosome sequence FASTA file.

The output of the third rule is `expand(f"{HISAT2_INDEX_PREFIX}.{{ix}}.ht2", ix=range(1, 9))`, where `expand(...)` is a Snakemake function which can interpolate a string pattern into an array of strings. In this case the generate index files are `<index_prefix>.1.ht2`, ... ,`<index_prefix>.8.ht2`. Instead of specifies the output eight times, we use `expand` and pass a variable `ix` to iterate from 1 to 8. The double curly brackets are to escape the `f"..."` f-string interpolation (see [the Python documentation][f-string]). So the whole process to interpret the output is:

```python
expand(f"{HISAT2_INDEX_PREFIX}.{{ix}}.ht2", ix=range(1, 9))
expand("hisat2_index/chr22_ERCC92.{ix}.ht2", ix=range(1, 9))
"hisat2_index/chr22_ERCC92.1.ht2", "hisat2_index/chr22_ERCC92.2.ht2", ..., "hisat2_index/chr22_ERCC92.8.ht2"
```

For the rest of the entries such as `threads`, and `log`, one can find more information at [the Snakemake documentation about Rules][snakemake-rule].


### Run Snakemake
Let's build the genome reference index.

```console
$ snakemake -j 8 -p build_hisat_index
Provided cores: 8
Rules claiming more threads will be scaled down.
Job counts:
	count	jobs
	1	build_hisat_index
	1	extract_genome_exons
	1	extract_genome_splice_sites
	3

rule extract_genome_exons:
    input: griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/genes_chr22_ERCC92.gtf
    output: hisat2_index/chr22_ERCC92.exon
    jobid: 1

hisat2_extract_exons.py griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/genes_chr22_ERCC92.gtf > hisat2_index/chr22_ERCC92.exon
...
3 of 3 steps (100%) done
```

The command `snakemake -j 8 -p build_hisat_index` means:

- `-j 8`: Use 8 cores
- `-p`: Print the actual command of each job
- `build_hisat_index`: The rule or certain output to be generated

If one runs it again, one will find that snakemake won't do anything since all the output are present and updated.

```console
$ snakemake -j 8 -p build_hisat_index
Nothing to be done.
```

[snakemake-rule]: https://snakemake.readthedocs.io/en/stable/snakefiles/rules.html
[f-string]: https://docs.python.org/3/whatsnew/3.6.html#whatsnew36-pep498
[htop]: http://hisham.hm/htop/


### Sample alignment (How to write a general rule)
Let's write the rule to do the sample alignment. Append the `Snakefile` with the following content:

```python
SAMPLES, *_ = glob_wildcards('griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read1.fastq.gz')

rule align_hisat:
    input:
        hisat2_index=expand(f"{HISAT2_INDEX_PREFIX}.{{ix}}.ht2", ix=range(1, 9)),
        fastq1="griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read1.fastq.gz",
        fastq2="griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read2.fastq.gz",
    output: "align_hisat2/{sample}.bam"
    log: "align_hisat2/{sample}.log"
    threads: 4
    shell:
        "hisat2 -p {threads} --dta -x {HISAT2_INDEX_PREFIX} "
        "-1 {input.fastq1} -2 {input.fastq2} 2>{log} | "
        "samtools sort -@ {threads} -o {output}"

rule align_all_samples:
    input: expand("align_hisat2/{sample}.bam", sample=SAMPLES)
```

There are two rules here but only `align_hisat` does the real work. The rule looks familar but there are something new. There is a unresolved variable `{sample}` in input, output and log entries, such as `fastq1=".../{sample}.read1.fastq.gz"`. So this rule will apply to all outputs that match the pattern `align_hisat2/{sample}.bam`. For example, given an output `align_hisat2/mysample.bam`, Snakemake will look for the inputs `griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/mysample.read1.fastq.gz`, where `sample = "mysample"` in this case.

To get the names of all the samples, we use `glob_wildcards(...)` which finds all the files that match the given string pattern, and collects the possible values of the variables in the string pattern as a list. Hence all the sample names are stored in `SAMPLES`, and the other rule takes input of all samples' BAM files to generate alignment of all samples.

Now run Snakemake again with a different rule target:

    snakemake -j 8 -p align_all_samples

This time pay attention to the CPU usage (say, using [`htop`][htop]), one should find out that snakemake runs jobs in parallel, and tries to use as many cores as possible.


### Transcript assement
Let's complete the whole pipeline by adding all StringTie steps to `Snakefile`:

```python
from pathlib import Path

rule stringtie_assemble:
    input:
        genome_gtf=GENOME_GTF,
        bam="align_hisat2/{sample}.bam"
    output: "stringtie/assembled/{sample}.gtf"
    threads: 4
    shell:
        "stringtie -p {threads} -G {input.genome_gtf} "
        "-o {output} -l {wildcards.sample} {input.bam}"

rule stringtie_merge_list:
    input: expand("stringtie/assembled/{sample}.gtf", sample=SAMPLES)
    output: "stringtie/merged_list.txt"
    run:
        with open(output[0], 'w') as f:
            for gtf in input:
                print(Path(gtf).resolve(), file=f)

rule stringtie_merge:
    input:
        genome_gtf=GENOME_GTF,
        merged_list="stringtie/merged_list.txt",
        sample_gtfs=expand("stringtie/assembled/{sample}.gtf", sample=SAMPLES)
    output: "stringtie/merged.gtf"
    threads: 4
    shell:
        "stringtie --merge -p {threads} -G {input.genome_gtf} "
        "-o {output} {input.merged_list}"

rule stringtie_quant:
    input:
        merged_gtf="stringtie/merged.gtf",
        sample_bam="align_hisat2/{sample}.bam"
    output:
        gtf="stringtie/quant/{sample}/{sample}.gtf",
        ctabs=expand(
            "stringtie/quant/{{sample}}/{name}.ctab",
            name=['i2t', 'e2t', 'i_data', 'e_data', 't_data']
        )
    threads: 4
    shell:
        "stringtie -e -B -p {threads} -G {input.merged_gtf} "
        "-o {output.gtf} {input.sample_bam}"

rule quant_all_samples:
    input: expand("stringtie/quant/{sample}/{sample}.gtf", sample=SAMPLES)
```

Most rules are similar to the previous ones except for `stringtie_merge_list`. This step a file is generated to contain list of paths to all the samples' GTF file. Instead of running some command (no `shell` entry), a `run` entry is used to write a Python code snippet to generate the file.

Another thing to be noted is the output entry `ctabs=...` of `stringtie_quant`. The following lines are equivalent:

```python
# Before expansion
ctabs=expand(
    "stringtie/quant/{{sample}}/{name}.ctab",
    name=['i2t', 'e2t', 'i_data', 'e_data', 't_data']
)
# After expansion
ctabs="stringtie/quant/{sample}/i2t.ctab",
    "stringtie/quant/{sample}/e2t.ctab",
    ...,
    "stringtie/quant/{sample}/t_data.ctab"
```

The full `Snakefile` can be found [here](https://gist.github.com/ccwang002/2659b19439b6205284c0ae68ca06345d).


### Job dependencies and DAG
Now with the pipeline complete, we can further look at the how all the rules are chained with each other. Snakemake has a command to generate the job depedency graph (a DAG):

    snakemake --dag quant_all_samples | dot -Tsvg > dag.svg

<figure class="full-img">
  <img src="{attach}pics/snakemake_rnaseq_dag.svg"/>
  <figcaption>Snakemake job dependency graph.</figcaption>
</figure>

Snakemake generates such DAG first before execution, where each node represents a job. As long as two nodes have no connected edges and their input exist, they can be executed parallely. This is a powerful feature to pipeline management, which can use the resources in a fin grain.

A simpler graph that shows rules instead of jobs can be generated by:

    snakemake --rulegraph quant_all_samples | dot -Tsvg > ruledag.svg

<figure>
  <img src="{attach}pics/snakemake_rnaseq_ruledag.svg"/>
  <figcaption>Snakemake rule dependency graph.</figcaption>
</figure>



## Snakemake on Google Cloud
Now we start to move our Snakemake pipeline to the Google Cloud. To complete all the following steps, one needs a Google account and has a bucket on the Google Cloud with write access. That is, be able to upload the output back to Google Cloud Storage. Snakemake is able to download/upload files from the cloud, one needs to [set up the Google Cloud SDK on the local machine][google-cloud-sdk] and create the default application credentials:

    gcloud auth application-default login

Also, install the neccessary Python packages to give Snakemake the access to storage API:

    conda install google-cloud-storage

Actually snakemake support remote files from many more providers. More detail can be found at [the Snakemake documentation][snakemake-remote-files].

Note that although one can run this section on a local machine, this step will be significantly faster if one runs it on a Google Computer Engine (GCE) instance. It also saves extra bandwidth and fees.


### Move input files to the cloud (from Google Cloud Storage)
Let's modify the `Snakefile` to use the reference and FASTQ files from Google Cloud Storage. Replace those file paths with the following:

```python
from pathlib import Path
from snakemake.remote.GS import RemoteProvider as GSRemoteProvider
GS = GSRemoteProvider()

GS_PREFIX = "lbwang-playground/snakemake_rnaseq"
GENOME_FA =  GS.remote(f"{GS_PREFIX}/griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/chr22_ERCC92.fa")
GENOME_GTF = GS.remote(f"{GS_PREFIX}/griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/genes_chr22_ERCC92.gtf")
HISAT2_INDEX_PREFIX = "hisat2_index/chr22_ERCC92"

SAMPLES, *_ = GS.glob_wildcards(GS_PREFIX + '/griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read1.fastq.gz')

# rule extract_genome_splice_sites:
# ...

rule align_hisat:
    input:
        hisat2_index=expand(f"{HISAT2_INDEX_PREFIX}.{{ix}}.ht2", ix=range(1, 9)),
        fastq1=GS.remote(GS_PREFIX + "/griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read1.fastq.gz"),
        fastq2=GS.remote(GS_PREFIX + "/griffithlab_brain_vs_uhr/HBR_UHR_ERCC_ds_10pc/{sample}.read2.fastq.gz"),
    # ...
```

Now all the file paths are on Google Cloud Storage under the bucket `lbwang-playground`. For example, `GENOME_FA` points to `gs://lbwang-playground/snakemake_rnaseq/griffithlab_brain_vs_uhr/GRCh38_Ens87_chr22_ERCC/chr22_ERCC92.fa`.

One could launch Snakemake again:

    snakemake --timestamp -p --verbose --keep-remote -j 8 quant_all_samples

[google-cloud-sdk]: https://cloud.google.com/sdk/downloads
[snakemake-remote-files]: https://snakemake.readthedocs.io/en/stable/snakefiles/remote_files.html


### Store output files on the cloud
Although we could replace all the file paths to `GS.remote(...)`, there is a simpler way to replace every path through the command line option. On top of that, we need to add a `FULL_HISAT2_INDEX_PREFIX` variable to reflect the path change that prepends the path under the writable bucket. Replace all `{WRITABLE_BUCKET_PATH}` with a writable Google Cloud Storage bucket.

```python
HISAT2_INDEX_PREFIX = "hisat2_index/chr22_ERCC92"
FULL_HISAT2_INDEX_PREFIX = "{WRITABLE_BUCKET_PATH}/hisat2_index/chr22_ERCC92"

rule build_hisat_index:
    # ...
    shell:
        "hisat2-build -p {threads} {input.genome_fa} "
        "--ss {input.splice_sites} --exon {input.exons} {FULL_HISAT2_INDEX_PREFIX} "
        "2>{log}"

rule align_hisat:
    # ...
    shell:
        "hisat2 -p {threads} --dta -x {FULL_HISAT2_INDEX_PREFIX} "
        "-1 {input.fastq1} -2 {input.fastq2} 2>{log} | "
        "samtools sort -@ {threads} -o {output}"
```

The full `Snakefile` can be found [here](https://gist.github.com/ccwang002/2686840e90574a67a673ec4b48e9f036). Now run the Snakemake with the following options:

```bash
snakemake --timestamp -p --verbose --keep-remote -j 8 \
        --default-remote-provider GS \
        --default-remote-prefix {WRITABLE_BUCKET_PATH} > \
        quant_all_samples
```

To understand how the whole remote files work, here is the the folder structure after the exection:

```
~/snakemake_example
├── lbwang-playground/
│   └── snakemake_rnaseq/
│       └── griffithlab_brain_vs_uhr/
│           ├── GRCh38_Ens87_chr22_ERCC/
│           └── HBR_UHR_ERCC_ds_10pc/
├── {WRITABLE_BUCKET_PATH}/
│   ├── align_hisat2/
│   ├── hisat2_index/
│   └── stringtie/
└── Snakefile
```

So Snakemake simply downloads/generates the files with the full path on remote storage.


## Dockerize the environment
Although bioconda has made the package installation very easy, it would be easier to just isolate the whole environment at the operating system level. One common approach is to use [Docker][docker].

A minimal working Dockerfile would be:

```docker
FROM continuumio/miniconda3
RUN conda install -y python=3.6 nomkl \
        stringtie samtools hisat2 snakemake google-cloud-storage \
    && conda clean -y --all
```

However there are some details required extra care at the time of writing, so I've created a Docker image for this pipeline on Docker Hub, [`lbwang/snakemake-conda-rnaseq`][docker-image]. One could be able to run the snakemake by:

```bash
cd ~/snakemake_example
docker run -t                       \
    -v $(pwd):/analysis             \
    lbwang/snakemake-conda-rnaseq   \
    snakemake -j 2 --timestamp      \
        -s /analysis/Snakefile --directory /analysis \
        quant_all_samples
```

### Use Google Cloud Storage in Docker image
To use Google's Cloud products in a Docker image, one needs to install [Google Cloud SDK][google-cloud-sdk] inside the Docker image. Refer to [Google's Dockerfile with Cloud SDK][docker-cloud-sdk] for detail. [`lbwang/snakemake-conda-rnaseq`][docker-image] has installed the Cloud SDK.

```bash
sudo docker run -t -i                           \
    -v $(pwd):/analysis                         \
    -v ~/.config/gcloud:/root/.config/gcloud    \
    lbwang/snakemake-conda-rnaseq               \
    snakemake -j 4 --timestamp --verbose -p --keep-remote   \
        -s /analysis/Snakefile --directory /analysis        \
        --default-remote-provider GS --default-remote-prefix "{WRITABLE_BUCKET_PATH}" \
        quant_all_samples
```

To run Docker on a GCE VM instance, it requires the host machine (the VM instance) to have Docker installed. One may refer to Docker's [official installation guide][docker-install] to install it. VM instance by default inherit the user's permission (via the automatically created service account), thus the command above should apply to the GCE instance as well.

[docker-image]: https://hub.docker.com/r/lbwang/snakemake-conda-rnaseq/
[docker-install]: https://docs.docker.com/engine/installation/linux/docker-ce/debian/#install-using-the-repository
[docker-cloud-sdk]: https://github.com/GoogleCloudPlatform/cloud-sdk-docker/blob/master/debian_slim/Dockerfile


## Google Container Engine (GKE)
To scale up the pipeline execution across multiple machines, Snakemake could use [Google Container Engine][gke] (GKE, implemented on top of Kubernetes). This method is built on Docker which each node will pull down the given Docker image to load the environment. After [some discussions][issue-602] about how to specify user input image [^kubernetes-docker], on Snakemake 4.1+ one is able to specify the Docker image Kubernete's node uses by `--container-image <image>`.

[^kubernetes-docker]: In the discussion, Snakemake's author, Johannes, mentioned the possiblity of using [Singularity][singularity] so each rule can run in a different virutal environment. Singularity support comes at Snakemake 4.2+.

To install the master branch of Snakemake, run:

```bash
pip install git+https://bitbucket.org/snakemake/snakemake.git@master
```

Following Snakemake's [GKE guide][snakemake-gke], extra packages need to be installed to talk to GKE (Kubernetes) cluster:

```bash
pip install kubernetes
gcloud components install kubectl
# or Debian on GCE:
# sudo apt-get install kubectl
```

First we create the GKE cluster by:

```bash
export CLUSTER_NAME="snakemake-cluster"
export ZONE="us-central1-a"
gcloud container clusters create $CLUSTER_NAME \
    --zone=$ZONE --num-nodes=3 \
    --machine-type="n1-standard-4" \
    --scopes storage-rw
gcloud container clusters get-credentials --zone=$ZONE $CLUSTER_NAME
```

This will launch 3 GCE VM instances using `n1-standard-4` machine type (4 CPUs). Therefore in the cluster there are total 12 CPUs available for computation. Modify the variables to fit one's setting.

Note that some rule may specify a number of CPUs that no node in the clusters has, say the rule `build_hisat_index` specifies 8 threads. In this case, the cluster cannot find a node with enough free CPUs to forward the job to a [pod][gke-pod] and the cluster will halt. Therefore, make sure to lower the `threads` to a reasonable number (or use [configfile][snakemake-config] to apply to mulitple samples). We will continue to use the same Docker image [`lbwang/snakemake-conda-rnaseq`][docker-image] as the Kubernetes' container image.

By default, Snakemake will always check if the output files are outdated, that is, older than the rule that generated them. To ensure it re-runs the pipeline, one might need to remove the generated output before calling Snakemake again:

```bash
gsutil -m rm -r gs://{WRITABLE_BUCKET_PATH}/{align_hisat2,hisat2_index,stringtie}
```

Then we are able to run the pipeline again.

```bash
snakemake                                            \
    --timestamp -p --verbose --keep-remote           \
    -j 12 --kubernetes                               \
    --container-image lbwang/snakemake-conda-rnaseq \
    --default-remote-provider GS                     \
    --default-remote-prefix {WRITABLE_BUCKET_PATH}   \
    quant_all_samples
```

Note that since we change the container image, we have to make sure the version of Snakemake in the Docker image and the machine starting the pipeline matches. An easy way to ensure that the versions are matched is to start the workflow inside the same Docker image.

To connect the Kubernete cluster inside Docker, we need to pass kubectl's config file as well, which is at `~/.kube/config`. So the full command becomes:

```bash
sudo docker run -t -i                           \
    -v $(pwd):/analysis                         \
    -v ~/.config/gcloud:/root/.config/gcloud    \
    -v ~/.kube/config:/root/.kube/config        \
    lbwang/snakemake-conda-rnaseq               \
    snakemake                                           \
        -s /analysis/Snakefile --directory /analysis    \
        --timestamp -p --verbose --keep-remote          \
        -j 12 --kubernetes                              \
        --container-image lbwang/snakemake-conda-rnaseq \
        --default-remote-provider GS                    \
        --default-remote-prefix {WRITABLE_BUCKET_PATH}  \
        quant_all_samples
```

After running our pipeline, make sure to delete the GKE cluster by:

```bash
gcloud container clusters delete --zone=$ZONE $CLUSTER_NAME
```

### Potential issues of using GKE with Snakemake
I still encountered the following issues while running the whole pipeline on the Kubernetes. It is likely that they are not Snakemake's fault but I couldn't find enough time to dig into the details at the time of writing:

- HISAT2 cannot build its index on Kubenetes. So the step `build_hisat_index` failed for unknown reason. The error message from HISAT2 looks like this:

```
...
Wrote 8912688 bytes to secondary GFM file: {WRITABLE_BUCKET_PATH}/snakemake_demo/hisat2_index/chr22_ERCC92.6.ht2
Index is corrupt: File size for {WRITABLE_BUCKET_PATH}/snakemake_demo/hisat2_index/chr22_ERCC92.6.ht2 should have been 8912688 but is actually 0.
Please check if there is a problem with the disk or if disk is full.
Total time for call to driver() for forward index: 00:01:18
Error: Encountered internal HISAT2 exception (#1)
```


[gke]: https://cloud.google.com/container-engine/
[issue-602]: https://bitbucket.org/snakemake/snakemake/issues/602
[snakemake-gke]: https://snakemake.readthedocs.io/en/stable/executable.html#executing-a-snakemake-workflow-via-kubernetes
[gke-pod]: https://kubernetes.io/docs/concepts/workloads/pods/pod/
[snakemake-config]: https://snakemake.readthedocs.io/en/stable/snakefiles/configuration.html
[singularity]: http://singularity.lbl.gov/


## Summary
Snakemake is a flexible pipeline management tool that can be run locally and on the cloud. Although it is able to run on Kubernetes such as Google Container Engine, it is a relatively new feature and will take some time to stablize. Currently if one wants to run everything (both the computing and the data) on the cloud, using Google Compute Engine and Google Cloud Storage will be the way to go.

Using a 4-core (n1-standard-4) GCE instance, the total time to finish the pipeline locally and via Google Cloud Storage were 3.2 mins and 5.8 mins resepctively. So there are some overhead to transfer files from/to the storage.

Docker and bioconda have made the deployment a lot easier. Bioconda truly saves a lot of duplicated efforts to figure out the tool compilation. Docker provides an OS-level isolation and an ecosystem of deployment. With more tools such as [Singularity][singularity] continuing to come out, virtualization seems to be a inevitable trend.

Other than Google cloud products, Snakemake also supports AWS, S3, LSF, SLURM and many other cluster settings. It seems to me that the day when one `Snakefile` works for all platforms might be around the corner.

EDIT 2017-08-15: Add a section about using Google Cloud in Docker. Update summary with some time measurements. Add links to the full Snakefiles.<br>
EDIT 2017-09-07: Snakemake has added the support of custom Kubernetes container image. Thus update the GKE section to use the official parameter to pass image.<br>
EDIT 2017-11-17: Add instructions to run the Snakemake on Kubernete inside Docker. And also list out the issues of using GKE.
