---
Title: 使用 Zotero 管理文獻書目
Slug: ref-management-zotero
Date: 2015-09-26
Tags: zotero, zh
Category: Coding
Cover: ./pics/zotero.png
---

**TL;DR** Use Zotero to sync references, webpages, and everything.

一開始會想要收集 reference 無非是做研究。寫論文、平常報告進度需要放上 citation，而在學術界最常就是 cite 別人的期刊。期刊 citation 有它一定的格式，而且每個期刊用的格式不同，手打容易錯，也很難維護。所以最好的方式就是把期刊完整的資訊存在資料庫，然後引用的時候再插到文件裡面。

整個問題就變成怎麼管理這些期刊資訊。

[TOC]

### BibTex is for LaTeX 

在 [LaTeX] 當中可以利用 [BibTeX]（或更新的 [BibLaTeX]）提供的流程處理 citation 與管理 reference（即 [Bibliography 管理]）。他把所有 reference 集中在一個純文字的檔案，

```latex
@article{Calin:2006aa,
	Author = {Calin, George A. and Croce, Carlo M.},
	Journal = {Nat Rev Cancer},
	Month = {11},
	Number = {11},
	Pages = {857--866},
	Title = {MicroRNA signatures in human cancers},
	Volume = {6},
	Year = {2006}}
```

每篇文章會有一個 cite key，在內文用到的時候就可以引用，而 BibTeX 就會根據現在定義的 style 去放 citation 以及在文末加上對應的 reference。

#### BibDesk

真正讓 BibTeX 能在日常生活中很好使用，有一部份要歸功於像 [BibDesk] 這樣的圖形工具。

[BibDesk] 是個 OSX 的應用程式，包含在 [MacTex] distribution 裡面。除了能自動從匯入來自網站或不同格式的 citation 之外，還有檔案附件的功能，能把例如論文的 PDF、Supplementary files 自動跟對應的條目做連接，重新命名並放在一個架構化的資料夾。重新命名跟歸檔的方式都能自訂，例如可以照 期刊名稱/年份 去分類，然後把這個資料夾放在 Dropbox 上就完成了自動同步。

<div class="figure">
  <img src="{attach}pics/bibdesk_usage.png"/>
  <p class="caption center"><span class="fig">BibDesk 使用畫面</span></p>
</div>

這樣解決了幾乎所有寫 paper 會碰到的問題。

平常會有個超級大的 BibTeX 檔，裡面有所有各式各樣的 reference。要寫 paper 的時候就把相關的 paper 拿出來 export 成一個小的檔案，然後把一些條目裡不相關的資訊拿掉，就不用再去想文獻引用的部份。我有好幾年都是這樣管理 reference 的。


[LaTeX]: https://www.latex-project.org/
[BibTeX]: http://www.bibtex.org/
[BibLaTeX]: https://www.ctan.org/pkg/biblatex
[Bibliography 管理]: https://en.wikibooks.org/wiki/LaTeX/Bibliography_Management
[BibDesk]: http://bibdesk.sourceforge.net/
[MacTex]: https://tug.org/mactex/


### EndNote is for Word

不過不是所有人都用 LaTeX 寫 paper，例如我們實驗室就只有我一個人用 LaTeX，其他人都用 Word。Word 上面就沒這麼簡單又好用的管理工具了。最多人用的是 EndNote。它是付費的，但因為我是公立大學的學生，所以謝謝各位納稅人，讓我能免費使用它（鞠躬）。

EndNote 做到的功能跟 BibTeX 一樣，用了它之後在 word 裡面就不用再管理書目的格式。不過我平常都是從別的地方把 reference export 再丟進 EndNote 裡，所以也不清楚它有什麼別的功能。

噢，他有個好處就是在 OSX 和在 Windows 上都一樣好用。


### Zotero bridges the both world

BibDesk (BibTeX) 真的很方便，讓我有時候想要管理一些很經典的技術文章，想要存一些有用的不論是 PDF、影片、網站，都想要放到 BibDesk 裡面。但這些地方都沒有提供 BibTex citation format 讓人直接複製貼上，而且它的語法也沒有設計要解決這麼多來源，所以寫起來很卡、很花時間。

另一方面，現在查資料都是用瀏覽器，看到一篇論文，如果要 Export citation、打開 BibDesk、Import citation、Download PDF(s)、Link PDF(s) 這一連串動作也很麻煩。

所以就有了 [Zotero] \[zoh-TAIR-oh\] 這整合在瀏覽器的工具。目前支援 Firefox、Chrome、Safari，也有提供 Plugin 給 Word 或 LibreOffice 使用。所以它應該足夠取代前面的工具，雖然我並沒有結合 Word 使用過。

基本畫面蠻簡單的，大概所有的書目管理軟體都差不多，只是它是整合在 Browser 當中，

<div class="figure">
  <img src="{attach}pics/zotero.png"/>
  <p class="caption center"><span class="fig">Zotero 使用畫面</span></p>
</div>

使用很簡單，就兩個按鈕 <img src="{attach}pics/zotero_icon.png" style="height: 1.6em;"/>，左邊打開 Zotero 視窗，右邊把當前網頁存進自己的 library 裡，它右下角就會出現處理的訊息，如果是期刊網站而且有 full text PDF 的權限，就會一起把 PDF 都存起來。

<div class="figure align-center">
  <img src="{attach}pics/zotero_saving.png"/>
</div>

<div class="figure align-center">
  <img src="{attach}pics/zotero_citation.png"/>
</div>

平常要放到論文裡時，我還是會先匯出到 BibTeX 或 EndNote。不過它額外還有好用的功能，能把 citation 輸出成 RTF/HTML 的 bibliography，這可以直接貼在 Powerpoint 做投影片很方便。

> 1. Torsten Thomas, Jack Gilbert & Folker Meyer. Metagenomics - a guide from sampling to data analysis. *Microbial Informatics and Experimentation* **2**, 3 (2012).

Zotero 有提供免費 300MB 讓使用者同步 library，這對於單純 citation 本身已經很足夠了，它也支援同步到自己架設的 WebDAV。

PS: Zotero 採用 AGPL v3 授權，原始碼在 [Github][Zotero src] 上。

[Zotero]: https://www.zotero.org/
[Zotero src]: https://github.com/zotero/zotero

#### Zotfile

Zotero 內建的 PDF attachment 功能不如 BibDesk 這麼完整，因此有 [Zotfile] 來額外管理 PDF 檔案的功能。再者 Zotero 的空間有限，會想把 PDF 等大的檔案放在像 Dropbox 的地方，不要都用 Zotero 同步。

<div class="figure align-center">
  <img src="{attach}pics/zotfile_file_location.png"/>
  <p class="caption left">自訂 (PDF) 檔案存放路徑，底下可以再設定子目錄。在這邊是會按照<code>期刊名/年分</code>去分目錄。</p>
</div>

<div class="figure align-center">
  <img src="{attach}pics/zotfile_rename_setting.png"/>
  <p class="caption">自訂檔案命名規則</p>
</div>

不過如果是同步到 Dropbox 的話，可能每台電腦的路徑都不一樣，例如 OSX 可能是 `/Users/me/Dropbox`，但 Debian 可能是 `/home/me/Dropbox`，這時候存放的路徑就要改成相對路徑。

<div class="figure align-center">
  <img src="{attach}pics/zotero_file_location.png"/>
  <p class="caption">Zotero Advanced 設定裡修改 library 相關檔案的路徑。</p>
</div>

這邊要額外說明一下 Linked Attachment Base Directory 以及 Data Directory 的差異。像 PDF 這類如果被 Zotfile 所管理的檔案，或是自己手動選「Attach Link ...」的檔案，他使用的是 linked attachment，icon 會有個連結的符號 <img src="{attach}pics/zotfile_fileicon.png" style="height: 1.6em;"/>。其他像 Webpage Snapshot 或是預設的 PDF 檔都是放在 Data Directory。

[Zotfile]: http://zotfile.com/

#### How to sync data storage

如果要進一步讓 data storage 也用 Dropbox 同步的話，參考 <https://www.zotero.org/support/sync>，OSX 上 Zotero Firefox 的資料會存放在

```
~/Library/Application Support/Firefox/Profiles/xxxxxxxx.default/zotero
```

其中 data storage 就在底下的 `storage` 資料夾。官網建議不要把 Zotero 的 SQLite database 等都同步在 Dropbox 上，所以只要把這個資料移到 Dropbox 再 soft link 回來就可以了。


### 總結

[Zotero] 是個實用並且跟瀏覽器整合的文獻（書目）管理工具。但它也能處理像網頁等其他網路上也很常見的格式，也能與既有的工具、文件編輯軟體結合，並有同步功能，非常適合作為外部記憶庫。

（應該要用英文寫的，什麼時候才會有第一篇英文 blog post QAQ）