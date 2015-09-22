---
Title: Projects
Slug: projects
sortorder: 12
---
Here collects all code projects I made.

[TOC]

## Research

### [WIP] BioCloud (NGCloud)

This started out as a Python package, [NGCloud], a NGS (Next Generation Sequencing) report generator that renders the result of an analysis pipeline into a standalone HTML-based report. The analysis pipeline is pre-defined and customable (say, the famous [Tuxedo] RNA-seq pipeline).

It was then further expanded as an online NGS analysis platform, BioCloud, and became one of the major projects in my master's degree. BioCloud runs as an online web servcie to let user upload their sequencing results and select the analysis pipeline to run. BioCloud will run the analysis at background, collect the result of all tools involved, and render an user friendly summary report which users other than bioinformaticians can comprehend. 

[NGCloud]: https://pypi.python.org/pypi/ngcloud
[Tuxedo]: http://www.nature.com/nprot/journal/v7/n3/full/nprot.2012.016.html


### iGC, R package

iGC stands for <u>I</u>ntegrated analysis of <u>G</u>ene expression and <u>C</u>opy number alteration. For samples having paired gene expression and copy number variation information, we propose a new approach to better consider changes in both genome and transcriptome in an integrated analysis simultaneously.

The analysis pipeline is boundled as a R package on Bioconductor and the source code is GPLv2 licensed on Github:

- Bioconductor: <https://www.bioconductor.org/packages/iGC/>
- GitHub: <https://github.com/ccwang002/iGC>



## Others
