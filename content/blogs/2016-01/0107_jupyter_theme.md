---
Title: Jupyter Notebook Theme
Slug: jupyter-notebook-theme
Date: 2016-01-07
Tags: zh, jupyter, notebook
Category: Coding
---

[Jupyter Notebook]，也就是以前的 IPython Notebook，應該是許多人在用 Python 做資料分析時記錄實驗步驗與結果的工具。

現在 [IPython] \(v4.0+\) 已經回歸到 Interactive Python Shell 的本質，變成只是擴充內建 Python REPL 的套件，相依的模組也清掉了。原本的 IPyton Notebook 主要是提供一個像 [Mathematica Notebook] 的環境，功能很多就不多提。它可以用 web 或者 QT 介面來跑。

後來又開始整合很多語言，變成像 Julia / R / Lua 等語言都可以利用這樣的 Notebook 架構，於是 [Jupyter][Jupyter Notebook] 就因此誕生，變成原本的 IPython 只是其中一個可能的語言 kernel。Notebook 本身可以是 R 語言或者 Julia 語言。

[TOC]

### Jupyter Notebook

用 Python 裝十分簡單，

```console
$ pip install jupyter
```

Jupyter 預設走 web 介面，會跑一個 tornado server 預設在 <http://localhost:8888> 上。

```console
$ jupyter notebook
[I 23:50:58.449 NotebookApp] Serving notebooks from local directory: /Users/liang
[I 23:50:58.449 NotebookApp] 0 active kernels
[I 23:50:58.450 NotebookApp] The IPython Notebook is running at: http://localhost:8888/
[I 23:50:58.450 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
```

有裝 browser 的話就會自動開一個視窗。

<div class="figure">
  <img src="{attach}pics/jupyter_default_frontpage.png"/>
  <p class="caption center">Jupyter Notebook Hub</p>
</div>

Notebook 預設是 `.ipynb` 的檔案。常見的內容像這樣：

<div class="figure">
  <img src="{attach}pics/jupyter_default_notebook.png"/>
  <p class="caption center">Jupyter Notebook Example</p>
</div>


### Custom Theme

今天重點是換主題嘛。現在因為歷經 IPython 到 Jupyter 的過程，設定還蠻分散的。以往的設定會在 `~/.ipython`，而到了 Jupyter 之後，相關設定會在 `~/.jupyter`。有時候設定怪怪的話就兩個路徑都檢查一下吧。

我目前使用的主題來自 [dunovank](https://github.com/dunovank/jupyter-themes)，他有收集了至少深淺兩色，應該足夠使用了。CSS 從別人的基礎上來調整也相對簡單，我自己有[改寫了一點](https://github.com/ccwang002/dotfiles/tree/master/ipy_profile/ipython3)（忘了改什麼)。dunovank 有寫個安裝 theme 的套件，不過不用也沒關係，只要準備好 CSS 就能用。我用 Grade3 這個主題來示範。

只要把這個 CSS 放到 `~/.ipython/profile_default/custom.css` 再重開 Jupyter Notebook 就可以了[^1]。效果如下：

<div class="figure">
  <img src="{attach}pics/jupyter_grade3_frontpage.png"/>
  <img src="{attach}pics/jupyter_grade3_notebook1.png"/>
  <p class="caption center">Jupyter Notebook Theme Grade3 Demo</p>
</div>

<div class="figure">
  <img src="{attach}pics/jupyter_grade3_notebook2.png"/>
  <p class="caption center">把 Toolbar 全部 toggle 起來，以及表格的樣子。</p>
</div>

個人覺得長時間使用下來，對比度低一點對眼睛比較好。黑底也不錯，不過畫圖常常會自己帶白底，整體感覺就不是很漂亮，可能要連 matplotlib theme 一起改吧 XD




[^1]: 這路徑並不符合 Jupyter 跨 kernel 的設計理念，感覺未來會改路徑。

[Jupyter Notebook]: http://jupyter.org/
[IPython]: http://ipython.org/
[Mathematica Notebook]: https://reference.wolfram.com/language/tutorial/UsingANotebookInterface.html