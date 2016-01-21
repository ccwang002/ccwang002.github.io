---
Title: Coding 初學指南－文字編輯
Slug: lab-coding-text-editing
Date: 2016-01-21 22:30
Tags: zh, labcoding
Category: Coding
Summary: 這個章節會帶大家認識一個很簡單的純文字格式 Markdown，方便大家整理筆記。同時希望大家學會一個 terminal based 的文字編輯器，方便往後在 server 環境底下的操作。
---

這個章節會帶大家認識一個很簡單的純文字格式 Markdown，方便大家整理筆記。同時希望大家學會一個 terminal based 的文字編輯器，方便往後在 server 環境底下的操作。

[TOC]

# Markdown

這是一個簡便的語法，它的概念是在純文字的檔案中用一些簡單的標記，就能做出大小標題、粗斜體、超連結、表格、程式碼上色等語法。

如果大家了解網頁的格式 [HTML] 的話，那 markdown 的語法能直接對應到 HTML 的語法，所以這個格式在網路的世界十分流行。它的副檔名為 `.md`，近代程式的 REAME 許多都用 markdown 寫成（例：`README.md`）

[HTML]: https://developer.mozilla.org/en-US/docs/Web/HTML


## 相關資源

### Markdown 語法
- <http://markdown.tw/>


## 學習目標

1. 這一系列的筆記就是用 markdown 寫成，你可以在[這裡](https://github.com/ccwang002/ccwang002.github.io/tree/src/content/blogs/2016-01)找到它的原始檔。
2. 試著把 Linux 學習過的指令，或者自己常用的組合指令用 markdown 記錄。



# Text Editor

在 Linux 的世界很多都是純文字檔案，再加上一些規定的語法成為新的格式。前面的 markdown 就是個例子。甚至許多可以執行的程式都只是個腳本檔，能用一般的編輯器（editor）打開就能讀懂。你可以試試

~~~bash
# cd is a shell script
nano `which cd`       # thanks TP's idea
~~~

常見的 editor 有：nano、vi、vim、emacs。到底什麼是最好用的文字編輯器，這是一場永無止盡的戰爭，近年來又有 Notepad++(GUI)、Sublime Text (GUI)、Neovim 的加入，這話題將不會有結論。對初學者而言，至少學會一個 editor 是必要的。

> 雖然一開始都說是介紹文字編輯器，但後來會開始學程式設計，所以最後大家在討論的都是「程式碼的編輯器」。

當在編輯一些設定檔、程式碼時，為了避免打錯關鍵字但難以查覺，多數人會把程式碼的關鍵字上色。按照程式碼不同的屬性、功能上色之後，多數人發現能更好的理解程式的結構，因此 editor 大多帶有語法上色（syntax highlighting）。

除了語法上色，這些 editor 都有自己的設定檔規範，可以讓使用者自行修改 editor 的行為。把自己常見的編輯器改得合乎自己習慣，是長期生活在 terminal 世界的第一步，大家可以參考（抄）別人的範本開始。

> 讓自己的編輯器有家的感覺。

除了設定檔之外，功能多的編輯器還會有「外掛」的功能，可以讓使用者增加自己的套件。這也等大家熟悉環境之後再自行玩玩吧。


## Nano
這是一個操作簡單好懂的編輯器，<del>沒有語法上色</del>[^註1]。多數的系統都有內建，所以到一個新的環境時幾乎都能使用。

鳥哥有教。其實直接執行它 `nano` 它的指令都會顯示在編輯畫面中。

[^註1]: nano 其實有辦法做語法上色喔，詳見 [Arch wiki][arch-nano] 及 [nanorc]。Thanks @concise

[arch-nano]: https://wiki.archlinux.org/index.php/Nano
[nanorc]: https://github.com/scopatz/nanorc



## Emacs
抱歉，我不會。但它是一個很好的編輯器。（誠徵大大補全）


## Vim
一個老字號但維持穩定開發的編輯器。他有個特色是編輯器的模式，有些模式能編輯文字，有些不行，但能做選取、搜尋等動作。還有特有的指令合成方式（像連續技、buff 這樣）

初學者通常會難以習慣，初期不熟模式、指令記不住的話會很難操作。所以建議一開始先記住最基本的指令，隨時掌握自己在的模式，日後再慢慢加深對 vim 的了解。

如果真的很沒概念，鳥哥也有寫介紹。


## Vim 相關資源

### Open Vim
互動式的線上學習網站，很短，跟著操作完能會 Vim 基本動作、存檔。 

- <http://www.openvim.com/>

### 學習 Vim 的心法與攻略 (ptt)
了解最常用的 normal 與 insert 模式及最基本的指令。這篇的內容理解之後，就能用 vim 處理文字編輯了。

- <https://www.ptt.cc/bbs/Editor/M.1264056747.A.885.html>

### Vim adventure

如果很難學習 `hjkl`、`wb` 移動的話，這是個要用 vim 指令控制的小遊戲。

- <http://vim-adventures.com/>

### Vim 本身的使用手冊

可以使用 `vimtutor` 指令，或者在 vim normal 模式時鍵入 `:help`


## 學習目標

1. 能在 terminal 中編修一個文字檔名為 `foo.txt`

    - Hint: try nano
    - `nano foo.txt`

2. 搭配 root 權限修改系統的設定檔（你在鳥哥可能有經驗了）

    - Hint: try sudo

3. 能在 console 中編寫程式碼。用 1. 的方案也可，但建議再試試看另外一個

    - Hint: try vi, vim or emacs

4. 修改 editor 設定讓它更符合自己的習慣。

    - Hint: for vim, try editing `~/.vimrc`; for emacs, try editing `~/.emacs`

5. 用 terminal editor 使用 markdown 格式記錄這些練習的筆記與答案。



# 正規表示式 Regex

Vim 在 normal 模式下能用 `/{pattern}` 搜尋文中的字串。除了直接把想要查的字串寫在 pattern 裡以外，還可以設計規則找出符合 pattern 但不一樣的結果。這樣的規則稱之為正規表示式（Regular Expression, or regex）。

> 想做很複雜的字串比對時，都應該考慮是否能使用 regex 

要做字串比對的地方，工具通常都會提供使用 regex，例如 `grep`、`sed`。Vim 與 Python 也都有提供 regex 的功能。


### Regex 語法派別
既然 regex 是一套字串比對的規則，就有規範它的語法。主要的 regex 語法有兩大類：

- BRE (basic regex)
    - Ex. `[:alnum:]`
- ERE (extended regex) 
    - Ex. `\w`

在 Linux 指令當中通常會因為使用 regex 語法的不同分成多個指令[^註2]。例如 grep 使用 BRE；egrep 使用 ERE。

與文字編輯相關的工具，像 Vim、Python、Perl[^註3] 也有他們各自寫 regex 的方式，但多少都與前兩大類相似，使用時都應該先查一下他們的語法。Vim 可以用 `:help regex` 查看。

[^註2]: 哪些指令有無支援 regex 以及支援的語法可以參考 [Debian Reference][deb-ref-regex]
[^註3]: Perl 的 regex 語法又稱為 **pcre** style，常被其他工具使用。例如：php

[deb-ref-regex]: https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_unix_text_tools


## 相關資源

### Regex One

主要是介紹 pcre 的語法，每一個 example 多介紹一個新的語法。接著還有個 practical examples 練習整理不同的語法。

- <http://regexone.com/>

### Regex 101

regex 很容易寫到自己都看不懂，這是一個幫助了解自己或別人寫好的 regex pattern 的網站。

- <https://regex101.com/>