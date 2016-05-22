---
Title: Coding 初學指南－Python
Slug: lab-coding-python
Date: 2016-01-21 22:50
Tags: zh, labcoding, python
Category: Coding
Summary: 選擇 Python 作為第一個深入學習的語言有很多好處。他的語法跟英文相似、用互動式的方式來操作，方便以邊試邊學、內建的標準函式庫功能豐富、第三方套件，幾乎能用 Python 完成各種事情。
---

Last Edited: May, 2016 （如果內容有誤，你可以留言，或用任何管道告訴我）

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

O'Reilly（歐萊禮）的書，官方線上商店常有 50% 折扣，PDF/ePub/Mobi 格式都有, 買一次就能輕鬆在電腦、kindle、eReader 上閱讀，能接受英文的話，十分推薦跟官方購買。中文版就以天瓏書局為主。它也有賣英文紙本，逛實體店很舒服


### Introducing Python（精通 Python）

O'Reilly Python 系列的書都寫得很好。這本是比較新出的，好處是它針對初學者，比較薄，能在短時間看完，文字很流暢。想要快速掌握基礎的語法的話，建議閱讀 Chp1 到 Chp7，以及 Chp8 File I/O 部份。

"Introducing Python", Bill Lubanovic. *O'Reilly*, 2014.11

- [英文書](http://shop.oreilly.com/product/0636920028659.do)
- [中文實體書](http://www.tenlong.com.tw/items/9863477311?item_id=1007464)


### Python 程式設計入門

2015 四月由[葉難](http://yehnan.blogspot.tw/2015/03/python_30.html)出的中文書，針對初學者，並有列出 Python 2.7、3.3、3.4 不同版本間的差異。

《Python 程式設計入門》，葉難。博碩 2015.04

- [中文實體書](http://www.tenlong.com.tw/items/9864340050)


### Python 官網

Python 的官網除了查語言特性之外，還能用來學習怎麼使用 stdlib。Python 標準函式庫功能包山包海，在你想要做什麼之前，都應該到官網查看看是不是內建 module 就已經提供功能了。除外，還有一個簡潔的 tutorial，供初學者參考，適合有學過其他語言的人。我認為這份寫得非常好，苦於沒有中文，以前經驗不太容易推廣，但值得看

"Python Tutorial", Official Python Documentation, Python Devs.

- [連結](https://docs.python.org/3/)
- [簡中翻譯](http://www.pythondoc.com/pythontutorial3/index.html)
- [繁中翻譯](https://docs.python.org.tw/3/tutorial/index.html)（進行中）


### Programming in Python 3（精通 Python 3 程式設計）

另一本 Python 中文入門書，比《深入淺出》難一點但比較像常規的教科書。

"Programming in Python 3" 2nd, Mark Summerfield. *Addison-Wesley*, 2009.11

- [英文書](http://goo.gl/y1xf9u) (source: InformIT)
- [中文實體書](http://www.tenlong.com.tw/items/9862760702)


### Learning Python

雖然名稱看起來很像是 Python 的入門書，但它的篇幅已經來到 1600 頁，實在無法推薦給初學者。它在一本書內把 Python 幾乎所有語言特性都說清楚，同時考慮到 Python 2 和 3 版本。當你想要了解，例如 MRO 的順序、何謂 unbounded, bound method，這本書詳細的程度不會讓你失望，只怕你沒空讀。

我當初看的是這一本 3ed 中文版（現已絕版），那時還沒有考慮 Python 3。

- [英文書](http://shop.oreilly.com/product/0636920028154.do)


### Python Cookbook（Python 的錦囊妙計）
這本不是入門書但很適合深入了解 Python，並讓自己的程式碼寫得更 Pythonic。裡面介紹了很多寫法慣例 idioms，同時也有中文版。非常值得在未來比較懂 Python 時買來看。作者之一 David Beazley 是 PyCon TW 2013 的 Keynote。他平常就是專門教 Python 的講師，他在 PyCon 講過的「所有 talk 與 tutorial」，如 [concurrency](http://www.dabeaz.com/coroutines/), [packaging](http://www.dabeaz.com/modulepackage/index.html), [async io](https://www.youtube.com/watch?v=MCs5OvhV9S4) 等等都值得一看。

"Python Cookbook" 3ed, David Beazley and Brian K. Jones. *O'Reilly*, 2013.05

- [英文書](http://shop.oreilly.com/product/0636920027072.do)
- [中文實體書](http://www.tenlong.com.tw/items/9863470686)


### Fluent Python（流暢的 Python）

當它是詳細、擴充版的 "Python Cookbook"，實際上書中也常常引用 David 的話。講述更多 Python 初介紹時不會深談的語言特性。如：MRO, Mixin, decorator, closure, metaprogramming每章最後的 Future Reading 與 Soapbox 旁徵博引，除了更細節的參考資料，還有當初 Python 為何如此設計等考量與討論的歷史、發展、與各語言比較。非常適合做為邁向 Python core developer 的參考書。

"Fluent Python", Luciano Ramalho. *O'Reilly*, 2015.07

- [英文書](http://shop.oreilly.com/product/0636920032519.do)
- [中文實體書](http://www.tenlong.com.tw/items/986347911X)


### MOOCs

關於 MOOCs 我有看過 Codecademy Python Track 以及 Coursera "An Introduction to Interactive Programming in Python" 這兩門課。我覺得最大的缺點就是講 Python 2.7，Python 3.x 的好用功能與差異都沒提；再來講課的 code 範例並不是使用 idiomatic Python syntax，在初學就沒養成好習慣與慣用語法有點可惜。

- Codecademy Python Track <http://www.codecademy.com/en/tracks/python>
- Coursera: An Introduction to Interactive Programming in Python <https://www.coursera.org/course/interactivepython>


## 學習目標

1. 打開自己 Linux 裡的 Python3，跟著學習用的參考資料動手操作。用 REPL 以及運行腳本兩種方法來執行 Python 程式。
2. 學習使用 pip 和 pyvenv (virtualenv) 來管理 Python 套件與環境。
    - Hint: Python 官網是你的好夥伴。你可以在[這裡][pydoc-pip]和[這裡][pydoc-pyvenv]找到兩者的教學。

3. [youtube-dl] 是一個用來下載 Youtube、Crunchyroll 等各大影音串流網站影片的工具。除了用 Linux 的套件管理工具安裝它，它其實是個用 Python 寫成的套件。為了避免跟 Linux 系統環境相衝，請開一個 Python 虛擬環境，並在裡面用 pip 安裝它。
    - Note: youtube-dl 除了單純做下載串流檔之外，還支援轉檔、封裝、後製等影像處理，這需要 libav 或 ffmpeg 任一影像處理套件。在 Debian 系列的 Linux 上 libav 會好裝一點。

4. 用 Python 解決一些實驗室會碰到的 Bioinfo 問題。有個網站 Rosalind 出了一系列的題目，我選了一些讓各位練習，請參考[附錄 1][apx1-bioinfo]。


EDIT 2016-05-22: 把 [ptt 發文](https://www.ptt.cc/bbs/Python/M.1463750830.A.DA8.html) 的內容更新上來，增加一些新書和中文翻譯；調整推薦的順序。

[pydoc-pip]: https://docs.python.org/3/installing/
[pydoc-pyvenv]: https://docs.python.org/3/using/scripts.html#scripts-pyvenv
[youtube-dl]: http://rg3.github.io/youtube-dl/
[apx1-bioinfo]: #file-a1_python_bioinfo-md
