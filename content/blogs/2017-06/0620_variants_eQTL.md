---
Title: Variants、eQTL、MPRA
Slug: variants-eqtl-mpra
Date: 2017-06-20
Tags: zh, bio
Category: Bioinfo
Summary: 本文內容主要來自 Barak Cohen 教授給的數堂課的筆記，以 Systems Biology 的角度來看 coding/noncoding variant modeling 和相關實驗 MPRA。
---

Computational Biology 和 Bioinformatics 在現在可能區分不大，本文也不打算深究兩定義，但他們大致能代表兩大類將電腦科學、程式運用在生物上的研究。

在碩班，我的實驗室一直鼓勵我們去想新的演算法，把某種預測做得更好或者快，或者運用更多來源的數據；做新的工具；整合出新的資料庫。這些應用都有他們的研究價值，也需要大量的技術投入，即便在發表上並不會放入這些細節。這類研究比較偏向 Bioinformatics。

來 WashU 前，我期許自己繼續往 Bioinformatics 深入。然而，在過去的數月裡，即便我仍投入在這些數據分析與工具開發上，另一大部份的時間，我經歷了許多關於模型，或者，關於「如何回答重要的生物問題」上的討論，有了較碩班訓練不同的啟發。這另一類研究比較偏向 Computational Biology。

本文想用另一個角度來看所謂的「modeling」。內容主要來自 [Barak Cohen][barak lab] 教授給的數堂課的筆記，主題為 *Coding and Noncoding Variant*。我生物背景不足，如果筆記有任何錯誤，煩請告知。

**Conflict of Interest**: Cohen Lab 開發了 [CRE-seq][CRE-seq] (*cis*-regulatory element by sequencing)，其中一種 MPRA (Massively Parallel Reporter Assay) 技術。

[barak lab]: http://genetics.wustl.edu/bclab/
[CRE-seq]: http://www.pnas.org/content/109/47/19498.short

[TOC]


## Coding vs noncoding variants
首先來談談 coding 和 noncoding variant。課堂上老師讓我們自由辯論研究兩者的「優缺點」，亦或，如果你是 PI 比較想研究哪個，面臨的優勢與困境。

Coding variant 很好理解，就是在某個 gene coding region 產生的序列改變，一般會先看所謂的 nonsynonymous，即這個 variant 造成 amino acid 改變，影響到蛋白質的結構，進而影響到其功能。synonymous variant 雖然不會改變 amino acid，但在模式物種中，可能會討論不同 amino acid 對於不同 tRNA 的偏好，也許會影響到 gene expression。另一方面，它也可能會影響 transcription factor (TF) binding，某些 TF 在 biding 有偏好的 DNA sequence（motif），即使蛋白質序列不變，TF binding 變化也會影響到其他基因的調控。

不過一般而言，coding variant 主要都是考慮 nonsynonymous change，這造成的變化十分具大，無法解釋像 complex traits、gene expression 高低這種細微的變化。


### Noncoding elements
Noncoding vairant 相對而言複雜的多。在討論它之前，不如來說說看我們知道哪些 noncoding elements：

- Introns
- Promoters
- Regulatory elements (REs)
    - *cis*-regulatory elements (CREs): promoters, enhancers
    - *trans*-regulatory elements
- miRNAs
- Retrovirus, satellites, centromeres, telemeres
- Structual elements 
    - Matrix Attachment Regions (MARs)
    - Lamina Associated Domains (LADs)
    - CTCF/Cohesin
    - Topologically associating domains (TADs)
    - 3D genome[^3D genome]
- Methylation

咦，忘記提到 histone modification 嗎？關於這些 epigenetics markers，Barak 對於他們有深刻的懷疑，他認為這些只是 markers 而非最終 regulatory element：

> "Something you can measure does not mean it is interesting."

然後建議我們去讀一篇批評 ENCODE 的論文[^ENCODE paper]，被他評之為近十年最辛辣，標題也非常有趣。


### Noncoding variants
從 non-coding elements 我們能知道控制 gene expression 可以從很多面向切入，於是討論 non-coding variant 時就會有很多不同的機制影響 gene expression。底下針對所謂的 enhancers (RE) 和 promoters 來畫個簡單的示意圖：

```text
     TF1  TF2  TF3         TF4  [RNA PolII]
----[  enhancer  ]-------[promoter]--[gene body]-------------------------
  <-- Topologically Associating Domain, TAD ----->   <-- Another TAD -->
```

RNA Polymerase II (RNA PolII) 負責 gene transcription，而 promoter 是一段在 gene body 前不特定的序列可以吸引 RNA PolII 來提高 gene transcription rate，很有可能就會提高 gene expression。TF 可能會辨別 promoter 上特定的序列，它對 PolII 有更強的吸引力。除了 promoter 之外，enhancer 相較於 gene body 的距離就更不確定，可能是 10kb 或 100kb 之外，但它在立體的距離可能非常近，本身也可以 recruit TF 然後增加 Pol affinity。這一切可以用抑制、競爭的角度來想產生負向的調控。

Enhancer 的影響力沒有方向性，即上下游的 gene 都會受同個 enhancer 調控。於是有所謂 TAD 的概念，它會讓 chromosome 形成一個 loop 侷限這樣立體空間上下游的互動，使得只在同個 TAD 的 REs 和 gene 能互相作用。
這樣的觀念可以進一步推廣到 3D genome 上，考慮不同 chromosome 間的互動。TAD 的邊界由某些 motif（例如 CTCF）決定，但究竟 TAD 是如果建立與調控，機制尚未明朗。

在 non-coding 複雜的交互作用的另一面，代表了每個交互作用很可能僅改變了基因表達的程度，而不是大幅度的開關。但這也代表他們對生物體不一定有很強的影響，所以有變化並一定代表它有功能。不過，不同的 cell type 倒可以用透過 TF 有無來調控一系列的 gene，而不是一味增加 gene 數量。因此，在很多情況下，了解 non-coding variants 造成的影響是很有趣的。


### Endophenotypes
我們要如何看 non-coding variants 呢？首先要了解從 genotype 到 phenotype 其實中間包含了很多層級：

```text
DNA (genotype) →  RNA →  Proteins →  Metabolites →  Phenotype
```

中間的每個步驟都可能影響，或不會傳遞影響至下個階段。但我們在 DNA 和 RNA level 有非常好的工具─定序─可以同時看 genome wide 非常多基因或區域。於是在大多數的情況我們都只有看到 endophenotypes，要務必僅記在心這和真正的 phenotype 是有所差異的。


## eQTL
eQTL 即是一種 endophenotype。QTL (quantitative trait loci) 意即某個 chromosome region 可以關連至一些量化數值的變動（即 locations that map to some quantitative measures），而 eQTL 即為 expresion QTL，關心某段區域的 variants 影響 gene expression。

過往常見的 eQTL study 有：

- Linkage study
- Family tree
- GWAS on two groups

這都是使用數個不同人不同 sample 來看 eQTL。但這些對於 non-coding variant 來說變因太多，為何不從個人、單一 sample 著手，即 allele imballance？然而單一 sample 就會牽扯到 eQTL 本身的問題，即它很難進一步從某個區域縮小到是哪個 variant 或哪幾個 variants 為決定性因子 (causal vairants)。


## MPRA
於是我們可以想辦法設計實驗來進一步解釋 eQTL。實驗可以從兩個方向來設計：necessary 和 sufficient。Necessity 可以透過 CRISPR 設計一系列的 tiled gRNAs 把某個 eQTL 逐步刪掉。平行化這個實驗，可以透過 growth selection 和 single cell sequencing 讀出是哪些 gRNAs 最有影響力。

在 sufficiency 方面，我們可以設計 reporter assay 來回答這問題：

```text
-----------------------------[weak promoter]--[GFP]--
---[cis RE, CRE]-------------[weak promoter]--[GFP]--
```

reporter assay 可以用個 plasmid 放到 target cell，但要怎麼平行化，同時看很多 genes 呢？這時候就是 MPRA (Massively Parallel Reporter Assay) 表現的時候了。我們可以用 DNA synthesis 把該 *cis*-regulatory element (CRE) 和 barcode 做出來，可以建立一個 CRE library，用 RNA-seq 就可以同時看到不同 CRE 所造成的 gene expression change。當然細節有像 normalization DNA amount 和 barcode efficiency，但我們可以用 MPRA 來分析 CRE。

這裡提到的 CRE-seq 有什麼缺陷呢？它是 Plasmid based，沒有 histone modification，有 copy number 問題；再來他的 genome context 也只有區域性（像 TAD 就沒有考慮）。於是接下來如何改善他，就是目前 Barak Lab 研究最新動態。


## Conclusion
我覺得從這個角度，把很多觀念用系統的角度整合，並且提出新的實驗與模型，非常有趣。像要怎麼 model enhancer 和 TFs 的交互作用，都是很有趣的題目。他的課非常有啟發性，很有意思。


[^3D genome]: 關於 3D genome 就要提一下這篇論文：<br>
Adrian and Suhas *el al.*, [*Chromatin extrusion explains key features of loop and domain formation in wild-type and engineered genomes*](http://www.pnas.org/content/112/47/E6456.abstract), PNAS, 2015.<br>
裡面用碎形 (fractal globule) 去解釋 CTCF 形成 TADs 造成怎麼樣的染色體摺疊，並如何透過這樣的摺疊產生 long distance interaction，因為可能在立體空間他們是接近的。模型用來解釋 Hi-C 數據。這篇論文使用數學之抽象和複雜，甚至請丘成桐來當 reviewer。

[^ENCODE paper]: 針對 ENCODE 所謂 80% genome are functional 非常有名的戰文：<br>Dan *et al.*, [*On the Immortality of Television Sets: “Function” in the Human Genome According to the Evolution-Free Gospel of ENCODE*](https://academic.oup.com/gbe/article-lookup/doi/10.1093/gbe/evt028), Genome Biol Evol, 2013.