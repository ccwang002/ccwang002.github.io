---
Title: FASTA/Q sequence processing toolkit -- seqtk
Slug: seqtk
Date: 2015-09-27 14:11
Tags: en, seqtk, NGS
Category: Bioinfo
Summary: This post demonstrates the FASTQ to FASTA conversion and sequence quality check using seqtk. 
---

This is the first post of the series of my common NGS processing workflows and notes.


Some of the most common operation in sequence processing is FASTQ → FASTA conversion. Tons of conversion scripts using either sed or awk can be found by search. For example,

```bash
# FASTQ to FASTA
# Assume every read record takes exactly 4 line
# Ref: http://stackoverflow.com/a/10359425
$ sed -n '1~4s/^@/>/p;2~4p'
```

The assumption of 4 lines per read usually holds for recent NGS sequencing data, so not a big deal.

In many case the sequence is gzip'd, but it is still a piece of cake when combining with pipe editing,

```bash
gzcat myseq.fq.gz | sed -n '1~4s/^@/>/p;2~4p' | gzip > myseq.fa.gz
```
But things get complex really fast when one wants to additionally do reverse complement, randomly sample a subset of reads, and many other sequence manipulation. Efficiency matters if those tasks are applied to tens of millions of reads. Even a few nanoseconds of computing difference per read matters at this scale of reads.


### Seqtk

So [seqtk] comes into rescue. It is written in C and MIT licensed. [A quick comparison][fastqa-conversion] shows it is generally faster than other UNIX-based solutions, let alone implementations based on scripting languages.

Seqtk bundle many other operations, but I'll just mention those I frequently use.

```bash
$seqtk

Usage:   seqtk <command> <arguments>
Version: 1.0-r77-dirty

Command: seq       common transformation of FASTA/Q
         comp      get the nucleotide composition of FASTA/Q
         sample    subsample sequences
         subseq    extract subsequences from FASTA/Q
         fqchk     fastq QC (base/quality summary)
         mergepe   interleave two PE FASTA/Q files
         trimfq    trim FASTQ using the Phred algorithm

         hety      regional heterozygosity
         mutfa     point mutate FASTA at specified positions
         mergefa   merge two FASTA/Q files
         dropse    drop unpaired from interleaved PE FASTA/Q
         rename    rename sequence names
         randbase  choose a random base from hets
         cutN      cut sequence at long N
         listhet   extract the position of each het
```


### FASTQ → FASTA

Read (gzip'd) FASTQ and write out as FASTA,

```bash
$ seqtk seq -A in.fq[.gz] > out.fa
```

To make the output gzip'd again, piped with gzip,

```bash
$ seqtk seq -A in.fq[.gz] | gzip > out.fa.gz
```


### Reverse complement

If one wants to debug the R2 reads of pair-end sequencing (second read on forward strand), since they contain reverse complement sequence of the insert DNA, one needs to reverse complement R2 reads again to debug directly by bare human eyes.

```bash
$ seqtk seq -r R2.fq > R2_rc.fq

$ echo '> Example R2 seq
  GCATTGGTGGTTCAGTGGTAGAATTCT' | seqtk seq -r
# > Example R2 seq
# AGAATTCTACCACTGAACCACCAATGC
```


### Quality check

To be honest, [FastQC] is more frequently used for quality check because it generates [reports with beautiful figures][FastQC report].

But for a detail report on each read position, one should consider `seqtk fqchk`.

```bash
$ seqtk fqchk myseq.fq[.gz]
```

By default it sets `-q 20`. This quality threshold determines the threshold of counting a base as low or high quality, shown as `%low` and `%high` per read position.

```text
min_len: 10; max_len: 174; avg_len: 28.92; 37 distinct quality values
POS #bases    %A   %C   %G   %T   %N  avgQ errQ %low %high
ALL 236344886 17.0 22.5 31.3 29.2 0.0 39.9 37.6 0.1  99.9
1   8172342   8.9  12.4 57.0 21.7 0.0 39.6 29.0 0.5  99.5
2   8172342   7.7  62.5 16.2 13.7 0.0 39.8 37.8 0.2  99.8
3   8172342   50.3 24.1 11.9 13.6 0.0 39.8 38.2 0.1  99.9
4   8172342   10.4 22.9 15.3 51.3 0.0 39.9 38.7 0.1  99.9
5   8172342   14.3 12.9 22.3 50.5 0.0 39.8 37.0 0.2  99.8
# ... (trimmed)
```

The column `avgQ` and `errQ` need more explanation. Average quality (`avgQ`) is computed by weighted mean of each base's quality,$$
    \text{avgQ} = \dfrac{\sum_{q=0}^{93} q \cdot n_q}{\sum_{q = 0}^{93} n_q}
$$

where $n_q$ is the number of bases with quality score being $q$. The magic number 93 comes from the quality score of Sanger sequencing[^sanger-qual-score], whose score ranges from 0 to 93.

For `errQ` we need more background knowledge about how quality score is computed. A base with quality score $q$ implies the probability being erroneously called $P_q$, $$
    P_q = 10^{\frac{-q}{10}}, \hspace{1em} q = -10\log_{10}{P_q}.
$$

Therefore, given $q$ being $0, 1, 2, \ldots$, seqtk has a conversion table `perr` from quality score to probability,


| Q  | 0   | 1   | 2   | 3[^2] |
|:---|----:|----:|----:|------:|
| **P**  | 0.5 | 0.5 | 0.5 |   0.5 |

| Q  | 4        | 5        | ... | 38           | 39           | 40        |
|:---|---------:|---------:|:---:|-------------:|-------------:|----------:|
| **P**  | 0.398107 | 0.316228 | ... |     0.000158 |     0.000126 |  0.000100 |


Based on the probability, it computes an expected number of base call errors, num_err, and the empirical probability of having a base call error at this position, errP, $$
    \text{num_err} = \sum_q P_q \cdot n_q, \hspace{1em} \text{errP} = \frac{\text{num_err}}{\sum_q n_q}.
$$

Thus the `errQ` is the equivalent quality score of errP, $$
    \text{errQ} = -10\log_{10}{\text{errP}}.
$$


By passing `-q 0` to `seqtk fqchk`, one can get the proportion of all distinct quality scores at each position. This information is pretty useful if the sequencing data is all a mess and one needs to figure out the cause.

Though some of the `seqtk fqchk`'s behavior is not documented, it should be straight forward enough to understand. All in all, the details can always be found in the [source code](https://github.com/lh3/seqtk/blob/4feb6e81444ab6bc44139dd3a125068f81ae4ad8/seqtk.c#L1483).


### Summary

[Seqtk] is fast to use for daily routines of FASTA/Q conversion. On top of that it provides many functionality such as read random sampling, quality check, and many I haven't tried or mentioned.


[^sanger-qual-score]: See multiple specifications of quality score at [sckit-bio doc][sckit-bio quality score]. The score is [Phred quality score][Phred score wiki]. More other score representations can be found at [FASTQ wiki].

[^2]: Note that the probability of q less than 4 is fixed with 0.5. A quick computation can see when $q = 3$, its actual Phred probability is $10 ^ {-0.3} = 0.501$.

[seqtk]: https://github.com/lh3/seqtk
[fastqa-conversion]: https://www.biostars.org/p/85929/#86082
[FastQC]: http://www.bioinformatics.babraham.ac.uk/projects/fastqc/
[FastQC report]: http://www.bioinformatics.babraham.ac.uk/projects/fastqc/good_sequence_short_fastqc.html
[sckit-bio quality score]: http://scikit-bio.org/docs/latest/generated/skbio.io.format.fastq.html#quality-score-variants
[Phred score wiki]: https://en.wikipedia.org/wiki/Phred_quality_score
[FASTQ wiki]: https://en.wikipedia.org/wiki/FASTQ_format
