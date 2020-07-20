---
Title: ID cross reference with exact protein sequence match using UniParc
Slug: id-crossref-exact-protein-uniparc
Date: 2020-07-19
Tags: en, id-crossref, cptac
Category: Bioinfo
---

There are a few "camps" of biological IDs that are used by many (human) databases and datasets: [Ensembl], [RefSeq] (plus [NCBI/Entrez Gene][ncbi-gene]), and [UniProt]. Each ID camp is comprehensive independently, containing gene-level, transcript-level, and protein-level information using their own systems of IDs. To get a sense these "ID camps" and how information is connected through them, this great illustration from [bioDBnet][bioDBnet graph] sums it all (it's huge):

<div class="figure">
    <img src="{attach}pics/bioDBnet.jpg">
    <p class="caption">Best illustration of the complex ID crossref: bioDBnet Network Diagram (<a href="https://biodbnet-abcc.ncifcrf.gov/dbInfo/netGraph.php">source</a>)</p>
</div>

It's usually straightforward to cross reference within each ID camp, as long as one has the versioned ID and a copy of that camp's ID system. For example, to know the gene symbol of `ENSP00000368632.3`, I can easily use [ensembldb], a lite copy of Ensembl's ID system, to find out it is translated from transcript `	ENST00000379328.9`, which is one of the transcripts of gene `ENSG00000107485.18`, whose gene symbol is `GATA3`. Easy peasy. The story goes the same for RefSeq and UniProt (albeit this one is more protein centric).

However, things get messy when one wants to cross reference across ID camps. While both official and third-party services (e.g., [bioDBnet] and [DAVID]) exist, they don't guarantee sequence identity match. In this post, I will focus on the protein sequence. For example, bioDBnet says `ENSP00000368632` can be mapped to (note the lack of version):

- RefSeq: NP_002042, NP_001002295, ...
- UniProt: P23771, ...

But when considering their sequence being identical, ENSP00000368632.3 should only match NP_001002295.1 in RefSeq, and the non-canonical form of UniProt P23771-2 (sequence version 1). Let me be clear that there is nothing wrong about these services. They're built so people can map IDs at high level and increase the number of mappable IDs. Because once we consider the sequence identity, a lot of IDs simply cannot be mapped. To complicate things more, many mappings don't handle ID versions. Sequence often changes across ID versions. Without tracking the versioned ID, it's impossible to say which IDs have the same sequence.


[Ensembl]: https://ensembl.org/
[RefSeq]: https://www.ncbi.nlm.nih.gov/refseq/
[ncbi-gene]: https://www.ncbi.nlm.nih.gov/gene/
[UniProt]: https://www.uniprot.org/
[bioDBnet]: https://biodbnet-abcc.ncifcrf.gov/
[bioDBnet graph]: https://biodbnet-abcc.ncifcrf.gov/dbInfo/netGraph.php
[ensembldb]: https://bioconductor.org/packages/release/bioc/html/ensembldb.html
[DAVID]: https://david.ncifcrf.gov/home.jsp


I'm probably going to write a series of blog posts about proteogenomic ID cross references.

[my-post-ensembl-ver]: {filename}../2020-06/find_ensembl_release.md
[my tweet]: https://twitter.com/lbwang2/status/1238144323218288643