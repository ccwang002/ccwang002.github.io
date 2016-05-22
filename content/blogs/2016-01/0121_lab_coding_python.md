---
Title: Coding 初學指南－Python
Slug: lab-coding-python
Date: 2016-01-21 22:50
Tags: zh, labcoding, python
Category: Coding
Summary: 選擇 Python 作為第一個深入學習的語言有很多好處。他的語法跟英文相似、用互動式的方式來操作，方便以邊試邊學、內建的標準函式庫功能豐富、第三方套件，幾乎能用 Python 完成各種事情。
---

Last Edited: Jan, 2016 （如果內容有誤，你可以留言，或用任何管道告訴我）

> Python 是一種物件導向、直譯式的電腦程式語言，具有近二十年的發展歷史。它包含了一組功能完備的標準庫，能夠輕鬆完成很多常見的任務。
>
> (From [Wikipedia](https://zh.wikipedia.org/wiki/Python))

選擇 Python 作為第一個深入學習的語言有很多好處。他的語法跟英文相似，比起其他語言經常用到 `;{}()` 來控制語法不同的段落，Python 主要用的是空白與縮排。

Python 能用互動式的方式（read–eval–print loop, REPL）來操作，以邊試邊做的方法來開發很適合初學者。

內建的標準庫（standard library）功能很豐富，在網路、文字處理、檔案處理、甚至 GUI 介面都能用它完成。除此之外，它的第三方套件也很多，在 Linux 上很好安裝，這樣幾乎能用 Python 完成各種事情。

[TOC]

> **其他 Coding 初學指南系列文章：**
>
> - [Introduction][intro]
> - [Chapter 1 -- Linux][chp1-linux]
> - [Chapter 2 -- Text Editing (Markdown, Text Editor)][chp2-text-editing]
> - [Chapter 3 -- Version Control (Git)][chp3-git]
> - [Chapter 4 -- Python][chp4-python]
> - [Appendix 1 -- OSX Development Environment][apx0-osx]
> - [Appendix 2 -- Python in Bioinformatics][apx1-bioinfo]
>
> 或者，用 [labcoding](/tag/labcoding.html) 這個 tag 也可以找到所有的文章。

[intro]: {filename}0121_lab_coding_intro.md
[chp1-linux]: {filename}0121_lab_coding_linux.md
[chp2-text-editing]: {filename}0121_lab_coding_text_editing.md
[chp3-git]: {filename}0121_lab_coding_version_control.md
[chp4-python]: {filename}0121_lab_coding_python.md
[apx0-osx]: {filename}0121_lab_coding_a_osx_env.md
[apx1-bioinfo]: {filename}0121_lab_coding_a_bioinfo_python.md



## 聽說系列

（需要接觸過 Python 之後才能理解）

### 聽說 Python 跑很慢，是不是不能用來計算/分析/大檔案？

Python 的確執行效率比編譯式的語言差（例：C/C++、Java），但這很可能不是你程式跑得慢的主因，所以也不代表 Python 不能處理計算量高的工作。

碰到程式跑得比想像中慢的時候，有幾個步驟：

1. 到底是哪幾行程式跑得慢？
2. 這是最佳的演算法嗎？
3. 這是最有效率的 Python 語法嗎？

如果用到了最後一步情況還是沒有改善的話，就可以開始把那些部份用其他語言改寫，例如：C。Python 能很容易跟 C 語言的結合。而且常見的 C 語言加速，其實都有 Python 套件能支援了，例如 Numpy，所以大部份的時間，都能在不使用 Python 以外的語言完成高量計算。

> 我在實習時候，也常碰到需要優化的問題。用 Python 我能很輕鬆（一天內）把工作分配到 4 台主機 64 cores 上跑，也許方法不有效率，但比起我花幾天把 Python 改寫成 C/C++，實作更精密有效的算法（還要是 multithread），仔細處理可能的 corner case，平行化之後本來三四天的計算時間我 2 個小時就能收工。
>
> 更重要的是，這個實驗就只跑個兩次。

比起計算時間，開發時間對工程師而言是更加寶貴的。尤其在實驗室，最關心的是這個方法行不行得通，程式跑得慢有很多解決的方式，例如平行化。重點在解決問題，需要用多一點的資源其實不是很重要。

如果問我 Python 還是 Matlab 比較快？這邊有正經的 [Python vs Matlab](http://www.pyzo.org/python_vs_matlab.html)。一開始選 Python 慢的話有[很多條路可以走][python-speed-comp]，但 Matlab 呢？ meh

所以 Python 跑得快不快？它單打獨鬥有極限，但它有很多快樂夥伴。O'Reilly 有本 [High Performance Python][book-high-python] 值得一看。

[python-speed-comp]: http://wiki.scipy.org/PerformancePython
[book-high-python]: http://shop.oreilly.com/product/0636920028963.do

### Python 2 還是 Python 3，聽我朋友說…比較好？

隨著時間流逝，每過一天我都可以更確信的說**「請學 Python 3」**。現在有在用 Python 2 多半也是用 2.7 版本，要把 3.3+ 的程式碼改回 2.7 也不難。



## 相關資源

連同前幾章，如果你要在自己電腦上設定 Python 開發環境，可以參考 [Djang Girls Taipei Tutorial](http://djangogirlstaipei.herokuapp.com/tutorials/)。另外，[Python Taiwan Wiki](http://wiki.python.org.tw/Python/%E7%AC%AC%E4%B8%80%E6%AC%A1%E7%94%A8%E5%B0%B1%E4%B8%8A%E6%89%8B) 有更完整的 Python 學習資源列表。

### Introducing Python（精通 Python）

O'Reilly Python 系列的書都寫得很好。這本是比較新出的，好處是它針對初學者，而且比較薄能在短時間看完。建議閱讀 Chp1 到 Chp7 ，以及 Chp8 File Input/Output 部份。

可以在 O'Reilly 的線上商店買電子版拿到 PDF 與 Kindle 版本。

- [英文書](http://shop.oreilly.com/product/0636920028659.do)
- [中文實體書](http://www.tenlong.com.tw/items/9863477311?item_id=1007464)

### Python 程式設計入門

2015 四月由[葉難](http://yehnan.blogspot.tw/2015/03/python_30.html)出的中文書，針對初學者，並有列出 Python 2.7、3.3、3.4 不同版本間的差異。

- [中文實體書](http://www.tenlong.com.tw/items/9864340050)

### 精通 Python 3 程式設計 2ed

另一本 Python 中文入門書，比深入淺出難一點但比較像常規的教科書。

- [中文實體書](http://www.tenlong.com.tw/items/9862760702)

### Python 官網

Python 的官網一方面是用來查語言特性之外，還能用來學習怎麼使用 stdlib。除外還有一個簡潔的 Tutorial，可以供初學者參考，適合有學過其他語言的人。

> Keep this under your pillow.

- [連結](https://docs.python.org/3/)
- [簡中翻譯](http://www.pythondoc.com/)
- 繁中翻譯[請拭目以待](https://github.com/python-doc-tw/python-doc-tw) :)

### Learning Python 5ed

雖然名稱看起來很像是 Python 的入門書，但它的篇幅已經來到 1200 頁，實在無法推薦給初學者。但它把 Python 語言特性說的很清楚，同時考慮到 Python 2 和 3 版本。

我當初看的是這一本 3ed 中文版（現已絕版），那時還沒有考慮 Python 3。

- [英文書](http://shop.oreilly.com/product/0636920028154.do)

### Python Cookbook 3ed（Python 的錦囊妙計 3ed）
這本不是入門書但很適合深入了解 Python，並讓自己的程式碼寫得更 **Pythonic**。裡面介紹了很多寫法慣例 idioms，同時也有中文版。非常值得在未來比較懂 Python 時買來看。

- [英文書](http://shop.oreilly.com/product/0636920027072.do)
- [中文實體書](http://www.tenlong.com.tw/items/9863470686)

### 深入淺出 Python
O'Reilly Head First 系列都是給初學者的書，這本有中文翻譯本，內容圖文並茂活潑。不過不是每個人都喜歡這種嘻嘻哈哈的介紹方式。

- [中文實體書](http://www.tenlong.com.tw/items/9862763485)

### MOOCs
很多人都有試過的線上課程，可能有中文字幕。缺點教的是 Python 2.7。而且我試了幾堂的經驗，並不是教授 idiomatic Python，也就是裡面教的寫法不一定是 Python 使用者平常使用並推薦的語法。

- Codecademy Python Track <http://www.codecademy.com/en/tracks/python>
- Coursera: An Introduction to Interactive Programming in Python <https://www.coursera.org/course/interactivepython>


## 學習目標

1. 打開自己 Linux 裡的 Python3，跟著學習用的參考資料動手操作。用 REPL 以及運行腳本兩種方法來執行 Python 程式。
2. 學習使用 pip 和 pyvenv (virtualenv) 來管理 Python 套件與環境。
    - Hint: Python 官網是你的好夥伴。你可以在[這裡][pydoc-pip]和[這裡][pydoc-pyvenv]找到兩者的教學。

3. [youtube-dl] 是一個用來下載 Youtube、Crunchyroll 等各大影音串流網站影片的工具。除了用 Linux 的套件管理工具安裝它，它其實是個用 Python 寫成的套件。為了避免跟 Linux 系統環境相衝，請開一個 Python 虛擬環境，並在裡面用 pip 安裝它。
    - Note: youtube-dl 除了單純做下載串流檔之外，還支援轉檔、封裝、後製等影像處理，這需要 libav 或 ffmpeg 任一影像處理套件。在 Debian 系列的 Linux 上 libav 會好裝一點。

4. 用 Python 解決一些實驗室會碰到的 Bioinfo 問題。有個網站 Rosalind 出了一系列的題目，我選了一些讓各位練習，請參考[附錄 1][apx1-bioinfo]。

[pydoc-pip]: https://docs.python.org/3/installing/
[pydoc-pyvenv]: https://docs.python.org/3/using/scripts.html#scripts-pyvenv
[youtube-dl]: http://rg3.github.io/youtube-dl/
[apx1-bioinfo]: #file-a1_python_bioinfo-md
