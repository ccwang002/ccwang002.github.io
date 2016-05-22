---
Title: Coding 初學指南附錄 - OSX 開發環境
Slug: lab-coding-appendix-osx-env
Date: 2016-01-21 23:00
Tags: zh, labcoding
Category: Coding
Summary: 我自己在 OSX 上的主觀開發環境設定
---

Last Edited: Jan, 2016 （如果內容有誤，你可以留言，或用任何管道告訴我）

以下的設定都蠻主觀的，見人見智。總之我把我的環境分享出來。

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



## Terminal
OSX 系統有內建一個 `Terminals.app` 能像在 Linux 上一樣使用。他其實使用上沒什麼問題，不過想要調顏色，有更多自定功能的話，許多人會安裝 [iTerm2]。

[iTerm2]: http://iterm2.com/

## Homebrew, Git and Python
OSX 上官方沒有一個管理套件的工具，所以社群自行開發了一個叫做 Homebrew。你可以按照[這篇教學][django-girl-taipei-env]安裝 Homebrew。

裝好了之後你可以以下指令去看它該怎麼操作

~~~bash
$ brew --help
$ man brew    # for full documentation
~~~

OSX 雖然內建有 git 與 python，但我們可以用 homebrew 安裝比較標準（新）的版本，

~~~bash
$ brew install git python3
~~~

如果 homebrew 有問題可以用 `brew doctor` 來檢測。把錯誤訊息問 google 通常就能找到解決方式。

[django-girl-taipei-env]: http://djangogirlstaipei.herokuapp.com/tutorials/installation/


## Text Editors
我最常用的是 Vim。OSX 有內建，但也可以用 homebrew 安裝。

除了 console based 的 Vim，OSX 上也有像 gVim 的 MacVim。一樣能用 homebrew 安裝。

~~~bash
$ brew info macvim  # 看 MacVim 在安裝有什麼選項可以調整
$ brew install macvim --override-system-vim --custom-icons
$ brew linkapps macvim
~~~

使用 Macvim 的時候除了 vim 之外，也可以呼叫 `mvim` 打開 MacVim。


## Terminal Multiplexers
你有可能有聽過 screen 或者 tmux。前者在 osx 上有內建但版本很舊，在顯示顏色上會有問題，因此可以透過 homebrew 再安裝新的。但因為 screen 跟系統提供的重覆到了，所以預設不在 homebrew 的 repo 中，要先新增 repo 清單：

~~~bash
brew tap homebrew/dupes
brew install screen tmux
~~~


## Git GUI
初學 Git 可能會不熟那些指令、常常不知道自己在 git log 哪個位置。這時候有個圖形化的工具會更方便了解。Git 有內建一個 gitk，但比較陽春。

在 OSX 上可以考慮用 [SourceTree](http://www.sourcetreeapp.com/)。


## Documentation Searcher
要一直查 Python 官網有時候還蠻麻煩的，未來學了 HTML CSS 等等不同語言或各種 Python 套件，要查個東西會很費時。所以有人開發了一個離線的 documentation 查詢器叫做 [Dash](http://kapeli.com/dash)。他要錢但有免費版，似乎是會一直跳提示訊息。


## Misc.

- [Alfred App](http://www.alfredapp.com/)：一個延伸版的 Spotlight，查應用程式很快速，同時也可以跟 Dash 整合讓查 doc 更方便。
- [Macdown](http://macdown.uranusjr.com/)：OSX 上的 markdown 編輯器。
