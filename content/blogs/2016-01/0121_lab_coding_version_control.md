---
Title: Coding 初學指南－版本控制
Slug: lab-coding-version-control
Date: 2016-01-21 22:40
Tags: zh, labcoding
Category: Coding 
Summary: 所謂的版本控制就跟玩遊戲一樣可以存取「進度點」，破關前都會保存進度，這樣破關失敗的時候可以還成到保存進度的狀態，再重新打怪。版本控制用在管理程式碼時，就方便讓自己在把 code 搞炸掉的時候，還能回到先前有保存的狀態。
---

所謂的版本控制就跟玩遊戲一樣可以存取「進度點」，破關前都會保存進度，這樣破關失敗的時候可以還成到保存進度的狀態，再重新打怪。版本控制用在管理程式碼時，就方便讓自己在把 code 搞炸掉的時候，還能回到先前有保存的狀態。

> ### 為什麼使用版本控制？
> 在軟體開發的過程中，程式碼每天不斷地產出，過程中會發生以下情況：
>
> - 檔案被別人或自己覆蓋，甚至遺失
> - 想復原前幾天寫的版本
> - 想知道跟昨天寫的差在哪裡？
> - 是誰改了這段程式碼，為什麼 ？
> - 軟體發行，需要分成維護版跟開發版

> 因此，我們希望有一種機制，能夠幫助我們：
>
> - 可以隨時復原修改，回到之前的版本
> - 多人協作時，不會把別人的東西蓋掉
> - 保留修改歷史記錄，以供查詢
> - 軟體發行時，可以方便管理不同版本
>
> (From: [Git 教學研究站](http://dylandy.github.io/Easy-Git-Tutorial/))

能做到版本控制的工具有很多，但目前主流就是 Git。

[TOC]


# Git (Version Control)

Git 是一個版本控制的工具。

Git 會在你的專案（repo）目錄[^註1]底下建一個 `.git` 的資料夾來管理這些「進度點」，而不會去動專案其他路徑裡的東西。

這些進度點可以傳到 server 上，別人下載下來的時候就可以除了得到現在的 code 以外，還能看到過去開發的記錄；而別人上傳了他的更新進度點之後，你抓下來就可以得到他更改的進度。這個就是「同步」的概念，多人之間能彼此共享、更新彼此開發的成果。

能夠處理 Git 同步操作的伺服器就叫做 git server。[Github] 就是一間公司提供免費的 git server 讓大家同步公開的 Git 專案。很多 Linux 的工具都使用 git 來讓大家合作開發，也有不少工具已經把 git server 轉到了 Github 上面。所以非常多人在用，因此建議大家不妨申請一個 GitHub 帳號。

[^註1]: 所謂的專案目錄就是下 `git init` 指令的目錄。

Git 雖然最常用來管理程式碼，但它其實可以有效地管理任何純文字的檔案，也可以把 binary  檔案加到 repo 中。
 
[GitHub]: https://github.com/

（可能需要有一些 git 操作經驗才能了解以下的術語）

## 操作建議

> 建立多而小的進度點

每完成一系列的更動，就趕快 add 和 commit。一開始會煩，但這是好習慣。

日後更了解 git 操作的時候，會學到一些進階的指令（如 `git rebase -i`）就能把多個 commit 合成為一個。但要拆開一個大的 commit 會比較複雜。


### Commit Style

常見的 commit message 大概會是一行文。如果這個更動需要說明，那就建議按照下面的格式：

- 第一行少於 50 個字元
- 第二行留空
- 第三行以後格式隨意，但單行不超過 75 個字元
- 善用條列式說明

以下是範例（From [Git Book](http://git-scm.com/book/ch5-2.html)）：

```
Short (50 chars or less) summary of changes

More detailed explanatory text, if necessary.  Wrap it to
about 72 characters or so.  In some contexts, the first
line is treated as the subject of an email and the rest of
the text as the body.  The blank line separating the
summary from the body is critical (unless you omit the body
entirely); tools like rebase can get confused if you run
the two together.

Further paragraphs come after blank lines.

  - Bullet points are okay, too

  - Typically a hyphen or asterisk is used for the bullet,
    preceded by a single space, with blank lines in
    between, but conventions vary here
```

ps 你可以找到很多有趣的 commit message。例如：[抱怨][commit-log-last-night]。

[commit-log-last-night]: http://www.commitlogsfromlastnight.com/


## 常見問題

#### Conflict

當單機只有在一個 branch 上開發的時候，很難有 conflict 的問題。但碰到多人共同開發，或把多條 branch merge 在一起時就會有 conflict。

Conflict 的發生，最常見的就是兩個人各自修改了同一個檔案相近位置的內容。這使得 git 在把兩個人的更動融合在一起的時候，會不知道到底要用誰的更動，這時候就無法自動處理了。

可以搜尋「resolve git conflict」找到相關的解決辦法。


#### Push fail

這通常發在 server 上的進度點比自己本機的還要新，所以必須先把 server 上的更新同步下來。如果都是同一個 branch 的話，你可以試著用 `git pull --rebase` 去避免額外的 merge。



## 相關資源

### Code School - Try Git

互動式練習，能懂最基本的 Git 指令操作，日常操作也主要是這些指令。並且會帶你建立一個 GitHub 帳號。

- <https://try.github.io>

### Git 教學研究站
中文的介紹，他的互動式練習就是上面 Try Git 的中文化版本。

- <http://dylandy.github.io/Easy-Git-Tutorial/index.html>


### Code School - Git Real
更完整的互動式練習，如果全部的關卡都做完的話，大部份需要用 git 的狀況都練習過了。

- <http://gitreal.codeschool.com>

### Learn Git Branching

顧名思義，是個練習操作 git branch 的線上學習網站。不過前幾個關卡在介紹 commit 相關的操作，可以試一試。真要練習可以先完成 Main 以下 levels：

- Introduction Sequence
- Ramping Up
- Moving Work Around

其他稍難一點，視情況跳過。但如果想學 git 比較複雜的指令可以回來看它。

- <http://pcottle.github.io/learnGitBranching/>


### Git Tutorial by Atlassian

蠻完整的教學，但可能稍難一點。

- <https://www.atlassian.com/git/tutorials>


## 學習目標

1. 用 Git 管理這些練習的筆記（呈接在 Text Editors 的練習）
    - 可以試著對它做一些 git 指令操作：
        - `git status`
        - `git log --oneline --graph`

2. 建立 dotfiles 和 dotvim 來管理你的環境設定檔。<br>
   dotfiles 就是用來儲存 `.xxx` 的檔案們，像是 `.bashrc` 、 `.screenrc` 、 `.tmux.conf` 、 `.gitconfig` 等等，一般可能存放在 `~/.xxx` 或 `~/.config/xxx` 之類。用版本控制的好處是，這樣在不同的 server 之間設定可以同步。<br>
   dotvim 是存放 `~/.vim` 的 Vim 設定檔。這些設定檔可以透過 soft link 連結回他們原本應該在的位置。

    **注意！永遠不要把 private key 放入版本控制中！** 
     
    - Hint: 搜尋 dotfiles 就會有很多範例（Ex [我的][my-dotfiles]）

3. 建立自己的 Github 帳號，並把 dotfiles / dotvim repo 同步（**push**）到Github。

    - Hint: 建立設立好 ssh key pair 使用 ssh 上傳。Github 有[完整的教學][github-sshkey]。

[my-dotfiles]: https://github.com/ccwang002/dotfiles
[github-sshkey]: https://help.github.com/articles/generating-ssh-keys/
