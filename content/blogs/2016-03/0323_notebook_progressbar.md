---
Title: Jupyter Notebook Progress Bar
Slug: notebook-progress-bar
Date: 2016-03-23 02:00
Tags: zh, jupyter, notebook
Category: Coding 
Cover: //blog.liang2.tw/posts/2016/01/notebook-progress-bar/pics/progressbar_demo.webm
---

相信很多人都已經在使用 [Jupyter (IPython) Notebook][jupyter] 跑分析。隨著分析的資料越跑越多，有時候刷下去就是幾十分鐘甚至數小時。此時沒有個進度條還蠻無聊的，而且能讓自己感覺**很有進度**，何樂不為呢？

例如我[去年介紹 aiohttp][talk-aiohttp] 時就有用到 notebook 和 console 底下的進度條 (progress bar)。不過，這幾個月 Jupyter Notebook 4+ 架構上的調整，可能 code 都不能用了。剛好昨天的 Taipei.py 有人提到這事，就來整理一下吧。

[jupyter]: https://jupyter.org/
[talk-aiohttp]: https://blog.liang2.tw/play_aiohttp/?full#asyncio-progressbar-cover

[TOC]


### IPywidgets 介紹

Notebook 進度條使用 [ipywidgets] 中的元件實作。這件元件規範了 notebook client <-> server 間雙向的溝通，並且能把相關的 CSS / JS 包裝在一起。在 ipywidgets 範例的 [*Widgets Basics*] 中就有提到可能的用途：

> You can use widgets to **build interactive GUIs** for your notebooks. <br> 
> You can also use widgets to **synchronize stateful and stateless information** between Python and JavaScript.

所以除了像進度條這樣單向的從 python code 傳訊息到 notebook (HTML) front-end 之外，也可以做一些介面把 front-end 的值傳回 python code。

……只是要用個進度條而已，哪來這麼多背景知識。更多介紹可以參考 [ipywidgets 官方範例][ipywidget examples]。

#### 安裝

使用 Python 3.5 示範。安裝除了 notebook 本身外，還要額外裝上 ipywidgets 這套件。

```
pip install notebook ipywidgets
```

再用 `jupyter notebook` 即可啟用 notebook。


### 使用進度條

```python
from ipywidgets import IntProgress
from IPython.display import display
```

`IntProgress` 就是進度條，`display` 則是 IPython 顯示各種 Python 物件的函數，在這邊用它才能把 widget 以 HTML 顯示並與 python code 聯動。

建立一個進度條的方式很簡單。建立 `IntProgress` widget object，然後顯示它：

```python
p = IntProgress()
display(p)
```

<div class="figure">
  <img src="{attach}pics/progressbar_default.png">
</div>

預設是進度條有 100 個單位，初始值為 0。進度條的值與最大值的狀態分別存在 `.value`、`.max` 屬性裡：

```pycon
>>> p.value, p.max
(0, 100)
```

只要修改 `p.value` 前面的進度條的狀態就會自動更新（不用重跑 `display(p)`）：

```python
p.value = 50
```

<div class="figure">
  <img src="{attach}pics/progressbar_50.png">
</div>

```python
p.value = 100
```

<div class="figure">
  <img src="{attach}pics/progressbar_100.png">
</div>

當然，最大值調整也會即時更新。此外，還可以透過 `.description` 給進度條一個 label。重新做一個完整的例子：

```python
p2 = IntProgress(max=56)
p2.value += 10
p2.description = 'Running'
display(p2)
```

<div class="figure">
  <img src="{attach}pics/progressbar_full.png">
</div>

完整的 code 就這樣，用起來非常方便。

[ipywidgets]: https://github.com/ipython/ipywidgets
[*Widgets Basics*]: http://nbviewer.jupyter.org/github/ipython/ipywidgets/blob/master/examples/Widget%20Basics.ipynb
[ipywidget examples]: http://nbviewer.jupyter.org/github/ipython/ipywidgets/blob/master/examples/Index.ipynb


### Progress bar example in action

模擬一下真實情況，我們通常有一堆待做的 task，在這邊叫 `todo_tasks` 好了。

```python
import time
todo_tasks = ['task %02d' % i for i in range(50)]
```

只是個字串，但用 `time.sleep(sec)` 來模擬有在做事。

搭配進度條的時候，把實際動態做成底下的動畫。

```python
# Initialize a progess bar
progress = IntProgress()
progress.max = len(todo_tasks)
progress.description = '(Init)'
display(progress)
time.sleep(0.25)

# Simulating task execution
for task in todo_tasks:
    progress.value += 1
    time.sleep(0.05)
    progress.description = task
progress.description = '(Done)'
```

<div class="figure">
  <video loop auto autoplay>
    <source src="{attach}pics/progressbar_demo.webm" type="video/webm">
    <source src="{attach}pics/progressbar_demo.mp4" type="video/mp4">
    Your browser doesn't support HTML5 video in WebM with VP8 or MP4 with H.264. You can still download the <a href="{attach}pics/progressbar_demo.mp4">screencast</a> and view it locally.
  </video>
  <p class="caption center">Progressbar in action</p>
</div>

非常方便吧！



### Misc. 螢幕截圖

寫這篇文章花最多的時間是在截圖跟做動畫 XD

瀏覽器的截圖，現在 Firefox (45) 已經可以只選擇截某個 DOM，十分方便。

在最後動態的錄製花了不少時間。一開始想說是不是要用 GIF，但[都 2016 年了還用什麼 GIF 啊！](http://blog.imgur.com/2014/10/09/introducing-gifv/)，雖然螢幕可以試著改 GIF palette 讓畫面不會很醜體積又小，但覺得用個 H.264 / VP9 簡單多了。

使用 QuickTime Screen Capture，開始錄的時候能只選擇螢幕一部份區域。以我 13" retina 螢幕為例，會得到 1636x736 H.264 .mov 檔。但我覺得解析度不用這麼高，所以最後輸出成 480p (1148x480)  就好，順便裁了一點白邊。

透過 HTML5 [`<video>`][html5-video] 能把 MP4 / WebM 當成動畫來使用：

```html
<video loop autoplay>
    <source src="vid.webm" type="video/webm">
    <source src="vid.mp4" type="video/mp4">
    Your browser doesn't support HTML5 video in WebM with VP8
    or MP4 with H.264. You can still download the 
    <a href="vid.mp4">screencast</a> and view it locally.
</vide>
```

各家 web browser 的支援度可參考 caniuse.com：[WebM](http://caniuse.com/#feat=webm)、[MP4](http://caniuse.com/#feat=mpeg4)

#### FFmpeg 轉檔

筆記而已，沒有認真調參數讓輸出檔案最小。VP9 的部份參考 [FFmepg][ffmpeg vp9][^1]。

[^1]: 需要額外安裝 libvpx，例如：`brew install ffmepg --with-libvpx`


```bash
# H.264 MP4
ffmpeg -i Untitled.mov \
    -vcodec h264 \
    -strict -2 -crf 22 -preset slow -r 24 \
    -vf "crop=iw:ih-52:0:10, scale=-1:480" \
    out.mp4
    
# VP9 WebM
ffmpeg -i Untitled.mov \
    -vcodec libvpx-vp9 \
    -b:v 150K -r 24 \
    -vf "crop=iw:ih-52:0:10, scale=-1:480" \
    out.webm
``` 

4s 的檔案最後大約 60KB，相當不錯。我很多 PNG 截圖都大多了。

```console
$ du -sh ./* | gsort -rh
744K	./Untitled.mov
 60K	./out.mp4
 52K	./out.webm
```


[html5-video]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
[ffmpeg vp9]: https://trac.ffmpeg.org/wiki/Encode/VP9

