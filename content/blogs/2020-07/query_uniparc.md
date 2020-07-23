---
Title: ID cross reference with exact protein sequence identity using UniParc
Slug: id-crossref-exact-protein-uniparc
Date: 2020-07-19
Tags: en, id-crossref, cptac
Category: Bioinfo
---

*TL;DR: Many existing ID mappings between different biological ID systems (RefSeq/Ensembl/UniProt) don't consider if the IDs have the same exact protein sequence. When the exact sequence is needed, UniParc can be used to cross-reference the IDs. I will demonstrate how to use UniParc to map RefSeq human proteins to UniProt and Ensembl at scale*

You can skip to the solution if you already know what's the problem I want to tackle.

[TOC]


### Camps of biological IDs
There are a few "camps" of biological IDs that are used by many (human) databases and datasets: [Ensembl], [RefSeq] (plus [NCBI/Entrez Gene][ncbi-gene]), and [UniProt]. Each ID camp is comprehensive independently, containing gene-level, transcript-level, and protein-level information using their own systems of IDs. To get a sense these "ID camps" and how information is connected through them, this great illustration from [bioDBnet][bioDBnet graph] sums it all (it's huge):

<div class="figure">
    <img src="{attach}pics/bioDBnet.jpg">
    <p class="caption">Best illustration of the complex ID crossref: bioDBnet Network Diagram (<a href="https://biodbnet-abcc.ncifcrf.gov/dbInfo/netGraph.php">source</a>)</p>
</div>


### Challenges to map IDs with exact sequence identity
It's usually straightforward to cross reference within each ID camp, as long as one has the versioned ID and a copy of that camp's ID system. For example, to know the gene symbol of `ENSP00000368632.3`, I can easily use [ensembldb], a lite copy of Ensembl's ID system, to find out it is translated from transcript `	ENST00000379328.9`, which is one of the transcripts of gene `ENSG00000107485.18`, whose gene symbol is `GATA3`. Easy peasy. The story goes the same for RefSeq and UniProt (albeit this one is more protein centric).

However, things get messy when one wants to cross reference across ID camps. While both official and third-party services (e.g., [bioDBnet] and [DAVID]) exist, they don't guarantee sequence identity match. In this post, I will focus on the protein sequence. For example, bioDBnet says `ENSP00000368632` can be mapped to (note the lack of version):

- RefSeq: NP_002042, NP_001002295, ...
- UniProt: P23771, ...

But when considering their sequence being identical, ENSP00000368632.3 should only match NP_001002295.1 in RefSeq, and the non-canonical form of UniProt P23771-2 (sequence version 1). The other IDs don't have the exact same protein sequence because of an 1aa deletion. To complicate things more, many mappings don't handle ID versions, and sequence often changes across ID versions. Without tracking the versioned ID, it's impossible to say which IDs have the same sequence.

Let me be clear that there is nothing wrong about these services. They're built so people can map IDs at high level and increase the number of mappable IDs, which is extremely useful in its own way. In fact, a lot of IDs simply cannot be mapped when consider exact sequence identity.

For transcripts the situation isn't any better because many mapped transcripts of different ID camps have different UTR sequences. I will probably write another post to touch on transcript ID mapping. The short answer is that the [MANE] project started by RefSeq and Ensembl is working on the problem.


### Why mapping with exact sequence identity?
Well, when do I need ID mapping with exact protein sequence identity? My use case is to map post-translation modifications (PTMs) from RefSeq to UniProt. CPTAC detected loads of PTMs (mostly phosphosites) using RefSeq as the peptide spectral library (peptide search database). But a lot of what we know about a protein is from UniProt. So I need a reliable way to map a specific amino acid of one RefSeq protein to its UniProt counterpart. I've been using existing services for the job, but they not perfect.

For example, we found a phosphosite NP_001317366.1 (PTPN11) p.Y546. PTPN11 corresponds to Q06124 in UniProt reviewed proteome (the current canonical isoform is Q06124-2 seq. ver3). But you won't find anything (e.g. antibody) about this site at 546aa because sequences of NP_001317366.1 and Q06124-2 don't match. This phosphosite actually maps to Q06124-2 p.Y542.

While one can argue that I should re-run the peptide search using UniProt, this solution only works around the problem. The problem comes back when I want to map the Ensembl based mutations to UniProt. I am also aware that two proteins with different sequence can be biologically different, and we shouldn't just blindly integrate their annotation. I totally agree, so the integration should be further validated. Due to the nature of the shotgun proteomics, as long as the peptide sequence of the PTM site can be found in both proteins, it's fairly possible that the site can be mapped to both. This topic has been on my mind [for a while][my tweet]. I'll write about it once I figure out the details. Anyway, mapping PTMs between different protein sequences is my next step, and it goes beyond the scope of this post.

[Ensembl]: https://ensembl.org/
[RefSeq]: https://www.ncbi.nlm.nih.gov/refseq/
[ncbi-gene]: https://www.ncbi.nlm.nih.gov/gene/
[UniProt]: https://www.uniprot.org/
[bioDBnet]: https://biodbnet-abcc.ncifcrf.gov/
[bioDBnet graph]: https://biodbnet-abcc.ncifcrf.gov/dbInfo/netGraph.php
[ensembldb]: https://bioconductor.org/packages/release/bioc/html/ensembldb.html
[DAVID]: https://david.ncifcrf.gov/home.jsp
[MANE]: https://www.ncbi.nlm.nih.gov/refseq/MANE/
[my tweet]: https://twitter.com/lbwang2/status/1238144323218288643


### UniParc comes into rescue for protein sequence identity

I'm probably going to write a series of blog posts about proteogenomic ID cross references.

[my-post-ensembl-ver]: {filename}../2020-06/find_ensembl_release.md
