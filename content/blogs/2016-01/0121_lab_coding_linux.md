---
Title: Coding 初學指南－Linux
Slug: lab-coding-linux
Date: 2016-01-21 21:30
Tags: zh, labcoding
Category: Coding
---

Last Edited: Jan, 2016 （如果內容有誤，你可以留言，或用任何管道告訴我）

學習使用 Linux 是第一個比較大的障礙，因為會在短時間接觸到非常多新的東西。後面的東西多少都與 Linux 相關，而 Linux 難的部份在開始使用 terminal 來操作「整台電腦」，對很習慣使用視窗介面的人會覺得很不直覺。好在近年幾個主流的 Linux Distribution 都有很好的圖形介面（正確稱 Desktop Environment），所以一開始能漸近地適應 terminal 操作。

> 在實驗室 server 上開發，「能在 terminal 裡做事情」是必須的。

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


## Linux、Unix、BSD、*nix
Linux 和 Unix 是不同的，但對初學者來說他們的分別不容易查覺，兩者的終端指令很相似，也因此有了 *nix 的通稱。Linux 介紹書多半會把他們的歷史好好的說一遍[^註2]，有興趣聽軟體發展故事的就多留意這部份。

不完整地主要分成：

- Redhat, CentOS, Fedora
- Debian, Ubuntu, Linux Mint
- ArchLinux
- openSUSE
- FreeBSD, OpenBSD

這些 distributions (distros)。其實 Linux、BSD (or Unix) 的系統非常多[^註3]，但對初入 Linux 的使用者，應該要找比較熱門的 distro 使用，才好找資料。

上面條列的方式是有意義的，我把類似的 distro 放在同一排，只要學了其中一個，同排的其他都很好上手。其中前兩排是兩大家族反映兩種生態。我們實驗室的大 server 用的是 CentOS；但近年來我自己的電腦已經漸漸換到 Debian 上。

[^註2]: Linux distros 源流 <http://en.wikipedia.org/wiki/Linux_distribution>
[^註3]: [Distro Watch](http://distrowatch.com/) 是一個介紹各種 Linux、BSD 系統的地方，可以來這邊看各個 distro 的介紹。


## Distro 簡介
以下是我不負責任的主觀介紹。從介紹篇幅就知道我是個傾向 Debian 的人。


#### Redhat / CentOS / Fedora

Redhat 是商用的版本，開源社群維護的對應版本是 CentOS。它以保守穩定著名，但相對來說新的東西在上面就要自己安裝，這對實驗室都用較新的工具來說是個減分的地方。他套件用 `yum xxx` 來操作。Fedora 上的東西會新一點但我們實驗室沒人用，所以不建議。


#### Debian / Ubuntu

Debian 是另一個大家族的頭，雖然是頭但一直保持穩定開發，在說明文件、[wiki][debian-wiki] 上都有不錯的品質。本身有所謂的 stable、testing、unstable 並分別對應三個版本號碼與名稱。以 2016.01 為例，stable 是 jessie(8)、testing 是 stretch(9)。unstable 永遠對應到 sid。如字面上的意思代表當中套件（軟體）的新舊程度。stable 上的工具也因此會比較舊不適合實驗室使用，但 testing 還蠻適合的，我個人很推。套件用 `apt-get xxx` 來操作。

Debian 家族中的 Ubuntu 非常火紅，網路上教學非常多，背後也有公司加持。基本上 Debian 的優點都會傳到 Ubuntu 上。Ubuntu 雖然套件包等等都從 Debian 移植，但他有自己的版本號碼，每半年發佈一個版本。

#### ArchLinux

再來的有興趣自己看，但我要額外介紹一個 ArchLinux。這是一個很自幹的系統，一點都不適合新手與懶人。但他有一個寫得很仔細完整的 [wiki 站][arch-wiki]。想要學新的套件、不會設定的話，去問 google 的時候請優先看他們的 wiki。

> 查資料的時候，除了 StackOverflow 、Ubuntu 論壇之外，請多看品質優良的 [Arch Linux][arch-wiki] 和 [Debian][debian-wiki] 的 wiki。

寫了這麼多，沒有給一個明確的選擇，多數人還是很難決定。所以如果你是初學者，我會建議安裝 Ubuntu，在此時請選擇 [15.10][ubuntu-15.10] or [14.04 LTS][ubuntu-14.04] Desktop 版本，因為他網路上的資源最豐富。

但我不是很喜歡 Ubuntu，所以等你有能力自己查詢 Linux 相關操作時，建議再看看別的 distro （例如我推薦的 [Debian testing channel][debian-testing]）

[debian-wiki]: https://wiki.debian.org/
[arch-wiki]: https://wiki.archlinux.org/
[ubuntu-15.10]: http://releases.ubuntu.com/15.10/
[ubuntu-14.04]: http://releases.ubuntu.com/14.04/
[debian-testing]: https://www.debian.org/releases/testing/


## 桌面環境 GNOME、KDE、XFCE、LXDE
圖形化介面（GUI），除了使用者的應用程式外，還需要系統輔助、管理等核心套件。一系列的 GUI 套件就稱之為桌面環境。

Windows、OSX 在安裝系統時都會自動安裝， 即桌面環境只有一種選擇。但在 Linux 上，GUI 的安裝是選擇性的，系統能在只有單純的 terminal 介面便能完整使用（例如選擇安裝 Ubuntu Server 時），不少 server 為了效能、安全性的考量都不會裝桌面環境。

對 Linux 來說桌面環境是能之後再選擇安裝上去的，而且還有「不同口味」可以選擇，使用者也可以自由的移除它們（但很有可能會炸掉），常見就有 GNOME、KDE、XFCE、LXDE[^註4] 幾種系統能使用。例如選擇安裝 Ubuntu Server 後，想要再加上 GNOME 列圖形化介面時，

~~~bash
sudo apt-get install ubuntu-gnome-desktop
~~~

這邊不會去細講這些實作方式的不同。簡單而言，GNOME 最流行。XFCE 使用的系統資源較少，在實驗室上的 server 常會裝這個。在 Ubuntu 上，預設是用 Unity，它是從 GNOME 沿伸出來的。

[^註4]: LXDE 原作者是 PCMan 喔，也有相當多的台灣人在維護它。

第一次安裝時，就使用預設的模式吧。裝好之後要換到不同的桌面環境時，需要對套件管理系統（例 apt、yum）、調整系統設定有足夠了解。


## 相關資源

認真地說，我有點不知道 Linux 從很初學到完整學習的資源在哪裡。如果你們在學的過程中，有碰到更適合的請再告訴我（例如：留言）

### 鳥哥的私房菜

- [鳥哥官網（基礎學習篇）](http://linux.vbird.org/linux_basic/)
- [實體書連結](http://www.tenlong.com.tw/items/9861818510?item_id=53725)

在台灣學 Linux 大概都會先推薦鳥哥，這應該是最多人用的完整中文資源了。如果願意啃完他，對 Linux 絕對會有足夠的認識。我大學的時候也是看這本入門的。

不適合的地方是鳥哥介紹 Redhat 系的操作，很多設定在 Ubuntu 上不需要或者是用別的方式去管理。例如，在 CentOS 上可能都用文字檔來修改設定，但在 Ubuntu 上可以用 `dpkg-reconfigure` 指令來更動。他示範的 OS 為 CentOS 5.x，現在 CentOS 已經 7.x 版了，許多設定也過時了，新的工具不會介紹到。

例如現在安裝 Linux 時，在磁區分割上都有很好的預設值，初學者可以不用再學調整 swap 等設定。同時系統也都提供使用 LVM (Logical Volume Manager) [^註5] 管理磁區，這些磁區 (LV) 日後能動態調整。換句話說，第五章（含）的內容都與現在使用 Linux 的方式不同，如果只是順著鳥哥書的順序一章一章看下來，會沒辦法對照自己系統操作，因為近期的 Linux 安裝只要很順的下一步就能完成了。

[^註5]: LVM 不懂沒關係，有興趣可以參考[鳥哥十五章][vbird-lvm]、[Arch Wiki][arch-wiki-lvm] 介紹

#### 各章節重點整理
鳥哥的內容退一千步來說都對初學者很有幫助，但為了避免各位花費無謂的時間在「對照古早與現代操作 (google 到的資料)上」，整理個表格讓大家知道每個章節什麼地方需要看。

| 章節           | 章節名                           | 重要的內容                                                                     |
|:--------------:|:---------------------------------|--------------------------------------------------------------------------------|
| 0              | 計算機概論                       | 沒聽過 CPU、RAM、MB GB 單位就從頭看； 不然就讀資料表示方式(3)、軟體程式運作(4) |
| 5              | 首次登入與線上求助 man page      | 文字模式下指令的下達(2)、man page 與 info page(3)、nano(4)                     |
| 6              | Linux 的檔案權限與目錄配置       | 全                                                                             |
| 7              | Linux 檔案與目錄管理             | 除檔案隱藏與特殊屬性(4)外都重要                                                |
| 8              | Linux 磁碟與檔案系統管理         | 檔案系統的簡單操作(2)                                                          |
| 9              | 檔案與檔案系統的壓縮與打包       | 壓縮檔案的用途與技術(1)、打包指令(3)                                           |
| 10[^*]            | vim 程式編輯器                   | 語系編碼轉換(4.3)                                                              |
| 11             | 認識與學習 BASH                  | 全。但可視情況忽略 2.4-2.8、6.4                                                |
| 12[^†] | 正規表示法與文件格式化處理       | 前言(1)                                                                        |
| 13             | 學習 Shell Scripts               | 全（等用到再看）                                                               |
| 22             | 軟體安裝：原始碼與 Tarball       | 全（了解流程、懂有這些關鍵字就好）                                             |
| 23             | 軟體安裝： RPM, SRPM 與 YUM 功能 | Ubuntu 用的是 APT[^‡]                                               |

[^*]: 學 vim 有別的資源，詳見 [2 Text Editing][chp2-text-editing]。<br>
[^†]: 正規表示（regex）很重要，但初學 Linux 時會覺得很複雜可以跳過。 [2 Text Editing][chp2-text-editing] 會再接觸到一次 vim 的 regex、[4 Python][chp4-python] 也會學到 Python 的 regex，可以等到時候再回來學 `sed`、`egrep` 等指令。<br>
[^‡]: APT 的使用教學可以參考 [Ubuntu 官網][ubuntu-apt]、[網路上大大的筆記][tsung-apt]。

[ubuntu-apt]: https://help.ubuntu.com/community/AptGet/Howto
[tsung-apt]: http://blog.longwin.com.tw/2005/05/use_apt/
[vbird-lvm]: http://linux.vbird.org/linux_basic/0420quota.php#lvm
[arch-wiki-lvm]: https://wiki.archlinux.org/index.php/LVM


### Introduction to Linux on edX course
- [課程連結](https://www.edx.org/course/introduction-linux-linuxfoundationx-lfs101x-2)

Linux Foundation 所開辦的線上課程，有英文的影片和講義。還請到了 Linux Kernel 的作者 Linus Torvalds 來拍介紹片。這是真的從非常基礎開始講，我有稍微看過，但我怕難度不夠，需要再搭配其他的資源來使用。好處是初期的學習比讀鳥哥前幾章來的快非常多（鳥哥前幾章為計算機概論）。


### Debian User Manual
英文的 Debian 系統使用者手冊，裡面包含了常見問題排解、各種硬體上的安裝指南、參考手冊。想要好好學習現代 Debian (Linux) 的使用方式的話，可以參考這些資源，它們還有再維護。

缺點是這手冊太長了，如果有碰到什麼特別想了深入了解的，建議可以看這個。

- <https://www.debian.org/doc/user-manuals>
- [Debain Reference](https://www.debian.org/doc/manuals/debian-reference/index.en.html) (online HTML)


#### Chapter Highlights

| Chp. No | Chp. Name | Highlights |
|:--------|:----------|:-----------|
| 1 | GNU/Linux tutorials| Everything except for 1.3 Midnight Commander |
| 2 | Debian package management | Read 2.2 Basic package management operations |
| 10 | Data management | Read 10.1 Sharing, copying, and archiving |

## 學習目標

因為這邊指的 Linux 算是一個蠻廣的內容，一開始學的時候很容易迷失方向。所以我額外列了幾個很重要的觀念，你應該能在學習 Linux 的初期接觸到他們：

- 了解 `$PATH` 與程式執行位置的關係
    - 為什麼打 `ls` 可以找到這隻名為 `ls` 的程式
- 知道 stdin、stdout、stderr；pipeline 的使用
- 知道環境變數是什麼，怎麼修改
- 了解檔案、目錄、相對路徑；權限設定
- 使用 `<cmd> -h` `<cmd> --help` `man <cmd>` 來查看指令的功能、可下的參數
    - <cmd\> = 任何在 linux 下的指令

如果你花了一個禮拜的時間，但上述的內容連聽都沒聽過（或沒什麼使用到），那很可能你學習 Linux 的方式跟我想得很不一樣，請先寫個信告訴我。上面這些觀念的學習也是漸近式的，過了一個禮拜只有聽過但不是很了解，這是很正常的現象。


1. 自己從零開始安裝一次 Linux 系統（可以用 VM）。
2. 定期使用它一個星期以上（即熟悉 `cd` `ls` 等基礎指令）
3. 使用 ssh 連線到遠端的 Linux。（要打開 ssh 的 port）
    - Bonus: 在 ssh 連線時不用打密碼。
    - Bonus hint: 查 `authorized_keys`。會需要建立 ssh user identity keypair，這會在上傳 GitHub 時用到）

4. 安裝一個叫 [htop] 的系統監控軟體。使用它來查看系統資料的使用狀況
    - Bonus:
        - 調整欄位的排版
        - 開啟 Tree Veiw
        - 選擇顯示單一使用者運行的程序（太舊的 htop 可能沒這功能）

5. 安裝一個叫 [aria2] 的續傳軟體，他可以多線程下載 HTTP(S)、FTP、甚至 BT。今天想要下載 Debian Jessie netinst 的映像檔，使用 2 個線程同時下載。
    - Hint: 查 `aria2c` 的 man page。

6. 學會查看系統硬碟的使用量；查看當前目錄內所有檔案的大小（絕對不是 `ls -l`）
    - Hint: `df` 和 `du`

7. scp 是個透過 ssh 傳送一或多個檔案的指令，試著用它把自己電腦的檔案（們）傳到 server 上。
    - Bonus:
        - 在路徑中搭配特殊字元 `*?` 傳多個檔案
        - 有一個更精密的傳檔工具叫 rsync，試著改用它來傳檔。

8. 使用 GUI 的遠端介面。這相關的技術有很多：VNC、RDP 最常見。RDP 在 windows 連接上比較順暢；VNC 在畫面傳輸比較沒效率，這會對 server 造成不小的負擔，也很容易 lag。有一個新的通訊協定叫 NX，它對畫面壓縮使用即便網速很慢依然能使用圖形介紹。<br>
   試著用實作 NX 協定的軟體 X2go 做遠端桌面連線到 server。
    - Hint: 你需要在 server 與 client 端（通常是自己的電腦）都裝上 X2go 的軟體，並會使用到 SSH 的連線設定。

9. 只用 Linux 生存一個星期以上（包含中文輸入、上網等等）


[htop]: http://hisham.hm/htop/
[aria2]: http://aria2.sourceforge.net/

[intro]: {filename}0121_lab_coding_intro.md
[chp1-linux]: {filename}0121_lab_coding_linux.md
[chp2-text-editing]: {filename}0121_lab_coding_text_editing.md
[chp3-git]: {filename}0121_lab_coding_version_control.md
[chp4-python]: {filename}0121_lab_coding_python.md
[apx0-osx]: {filename}0121_lab_coding_a_osx_env.md
[apx1-bioinfo]: {filename}0121_lab_coding_a_bioinfo_python.md
