---
Title: Overview of Genomic Data Processing in Bioconductor
Slug: biocondutor-genomic-data
Date: 2015-12-29 20:28
Tags: en, r, bioconductor
Summary: Notes of fundamental tools and learning resources for handling genomic data in R with Bioconductor.
Category: Bioinfo
---

Sorry for the late update. In the past two months, I finished my Ph.D. applications (hope to hear good news in the next two months) and was busy preparing the PyCon Taiwan 2016. Also, a year-long website development finally came to the end.

Now most things are set so I can back to writing my blog.

Since September, there accumulates at least 5 drafts and I don't know when I can finish them, so I think I have to change my writing strategy. I will first publish things as soon as information collection is done, and deeper reviews will be given in the following posts. Right now I will focus on Bioconductor (and general Bioinformatics topics) and Django.

[TOC]

## Bioconductor

[Bioconductor] is indeed a rich resources for R both in terms of data and tools. And I found I have yet spent time seriously understanding the whole ecosystem, which I believe can drastically lighten the loading of daily analysis.

Bioconductor's website is informative. If you are familar with R, you should already know that in order to understand the usage of a package, one of the best way is to read its vignettes. Packages on Bioconductor generally have vignettes, which is really helpful and the website makes them accessible. On top of that, they have [Courses & Conferences] and [Workflows]. The former section collects all conference materials in the past few years, which contains package hands-on, analysis tutorial, and R advanced topics. It's a hidden gem to me since I have already found numerous materials worth reading only after a glance over it. The latter one should be well-known. It gives examples of typical analysis workflows.

[Bioconductor]: https://www.bioconductor.org/
[Courses & Conferences]: https://www.bioconductor.org/help/course-materials/
[Workflows]: https://www.bioconductor.org/help/workflows/

I'm interested in the following topics in Biocondutor:

- Annotation and genome reference (OrgDb, TxDb, OrganismDb, BSgenome)
- Experiment data storage (ExpressionSets)
- Operations on genome (GenomicRanges)
- Genomic data visualization (Gviz, ggbio)

Keywords in Biocondutors for each topic are attached in the parens, mostly being the package name. For each topic, I'll put the related resources I collected in the following sections.

Before the listing, I found [PH525x series] maintained by Rafael Irizarry and Michael Love from Harvard serves as a comprehensive entry point for almost every related topic. The site is the accompanied resources for their edX classes. Both of them worth taking a look.



### Annotation and Genome Reference

- [Annotating phenotypes and molecular function](http://genomicsclass.github.io/book/pages/annoPhen.html) from [PH525x series] gives a good overview and a taste of the powerful ecosystem Bioconductor provides.

- [Annotation Resources](https://www.bioconductor.org/help/course-materials/2015/BioC2015/Annotation_Resources.html) from [BioC 2015] gives more extensive introduction about all available types of references from genome sequences to transcriptome and gene info.

For example, human comes with

- [org.Hs.eg.db](http://bioconductor.org/packages/release/data/annotation/html/org.Hs.eg.db.html)
- [TxDb.Hsapiens.UCSC.hg38.knownGene](http://bioconductor.org/packages/release/data/annotation/html/TxDb.Hsapiens.UCSC.hg38.knownGene.html)
- [Homo.sapiens](http://bioconductor.org/packages/release/data/annotation/html/Homo.sapiens.html)
- [BSgenome.Hsapiens.UCSC.hg38](http://bioconductor.org/packages/release/data/annotation/html/BSgenome.Hsapiens.UCSC.hg38.html)



### Experiment Data Storage

ExpressionSet helps store the expression experiment data, which one can combine   expression values and phenotypes of the same sample. Additionally the experiment data (like descriptions of GEO dataset) can be attached as well.

- [The ExpressionSet container](http://genomicsclass.github.io/book/pages/eset.html) from [PH525x series] gives an intro. It should be sufficient enough to use ExpressionSet in daily work.

- [The ExpressionSet Introduction](https://www.bioconductor.org/packages/release/bioc/vignettes/Biobase/inst/doc/ExpressionSetIntroduction.pdf) from its package [Biobase](https://www.bioconductor.org/packages/release/bioc/html/Biobase.html)’s vignette gives detailed explanation.



### Operations on Genome

I haven't gone into the details, but operations about genomic ranges are often tricky and more importantly, badly optimized.

- [IRanges and GRanges](http://genomicsclass.github.io/book/pages/iranges_granges.html) and [GRanges operations](http://genomicsclass.github.io/book/pages/operateGRanges.html) from [PH525x series] give the overview of using the package [GenomicRanges].

- [An Introduction to Genomic Ranges Classes](https://www.bioconductor.org/packages/release/bioc/vignettes/GenomicRanges/inst/doc/GenomicRangesIntroduction.pdf), a [GenomicRanges] vignette, gives a detailed view.

- Also, their paper, ["Software for Computing and Annotating Genomic Ranges", *PLOS One*](http://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003118) should be another overview source of the package.

- [data.table]'s `foverlap` function worth the comparison, since I already use it and I know it is [blazingly fast](https://github.com/Rdatatable/data.table/wiki/talks/EARL2014_OverlapRangeJoin_Arun.pdf). `foverlap` handles the overlapping of integer ranges so it can be applied to genomic operation. Its code is quite complex so its mechanism is still a myth to me. I'd like to see its comparison with using database like SQLite.

[GenomicRanges]: https://bioconductor.org/packages/release/bioc/html/GenomicRanges.html
[data.table]: https://cran.r-project.org/web/packages/data.table/index.html


### Genomic data visualization

Basically I can find two packages:

- [Gviz]
- [ggbio]

Don't know their difference yet. Both of them can produce well-done figures. But I think I have some experience with ggbio, which was a bit tricky to use. So for now I will go for Gviz.

- [Visualizing genomic features with the Gviz package](https://www.bioconductor.org/help/course-materials/2012/BiocEurope2012/GvizEuropeanBioc2012.pdf) given at Bioc Europe 2012 has a decent introduction about Gviz.
- [The Gviz User Guide](https://bioconductor.org/packages/release/bioc/vignettes/Gviz/inst/doc/Gviz.pdf) looks very comprehensive, which also cover usage with expression and alignment results.


[Gviz]: https://bioconductor.org/packages/release/bioc/html/Gviz.html
[ggbio]: https://bioconductor.org/packages/release/bioc/html/ggbio.html



## Summary

These resources should be enough for weeks of trying. It's excited to find so many useful tools.

So, good luck to me for my Ph.D. application, PyCon Taiwan 2016, and a shorter blog posting frequency.

[PH525x series]: http://genomicsclass.github.io/book/
[BioC 2015]: https://www.bioconductor.org/help/course-materials/2015/BioC2015/

