---
Title: 設定部落格筆記
Slug: blog-internals
Date: 2015-09-21
Category: Coding
Tags: zh, pelican, blog, python
---

Blog 對我來說，最重要的就是書寫的舒適度。

一開始在設定 github CNAME 的時候就訂為 `blog.liang2.tw`，但一直以來都只是個一頁式的自我介紹[^1]，用 [SemanticUI] 手刻而成。不過部落格如果每篇文章都還要手刻的話，大概就不會有力氣再寫內容了。

整理了一下有幾個目標：

- 只考慮用 static site 因為不想維護 server，而且 blog 也沒什要炫的，現在光用前端就可以做到很多互動功能
- 最好 site generator 是用 Python 實作，這樣想要調整它的功能時，比較懂怎麼改 
- 能支援 markdown 和 reStructuredText 最好

篩完之後選項也沒幾個：[Pelican]、[Sphinx]，但 Sphinx 可能對 blog 開發的功能比較少，最多人用的大概就 Pelican，所以就決定用它了。

整理起來也做了不少調整，就列點吧：

[TOC]

[SemanticUI]: http://semantic-ui.com/
[Pelican]: http://docs.getpelican.com/
[Sphinx]: http://sphinx-doc.org/


### Pelican 簡介

[Pelican] 結論來說不難理解，而且要自訂 blog theme 也不會很複雜。首先跟 Sphinx 一樣，用內建的 `pelican-quickstart` 預設值就能架好一個可以動的。目錄大概長這樣

~~~
my_blog/
├── content/
│   ├── blog_post_1.md
│   └── blog_post_2.rst
├── output/
├── develop_server.sh*
├── Makefile
├── fabfile.py
├── pelicanconf.py
├── publishconf.py
└── requirements.txt
~~~

Blog source 都放在 content 底下，設定檔分成 local 用的 `pelicanconf.py` 以及 deploy 用的 `publishconf.py`。並且提供了像 Fabric、Make、shell script 等自動化腳本把 source 用 theme template render 成一個靜態網站，

~~~bash
make html
~~~

預設會輸出到 `output/`，到時候 deploy 就把這個資料夾的內容丟到 server 上。

每篇文章可以用 markdown 或者 reStructuredText(rst) 來寫，概念上像這樣：

~~~markdown
---
Title: Hello World
Date: 2016-01-16 18:00
Tags: world, programming
Category: test
Slug: hello-world
---

Hello [World]

[World]: https://en.wikipedia.org/wiki/World
~~~

~~~rst
Hello World
##############

:date: 2016-01-16 18:00
:tags: world, programming
:category: test
:slug: hello-world

Hello World_

.. _World: https://en.wikipedia.org/wiki/World
~~~

這樣已經設定好了標題、分類、標籤、發布日期還有 slug（有點像文章的 ID）算很完整了。最低要求至少有標題。

最後調整了一下 static file 的路徑。我把文章按年月分開，每個子資料夾裡有當月的圖、檔案等等。URL 也是以年月為單位。其實最理想的應該是有個 hash 之類的東西 `/posts/2015/09/abcd/` 等同於 `/posts/2015/09/abcd-my-post/` 比較好分享。找了一下好像沒這功能，不過沒有它影響也不嚴重，暫且不理。


### All is about the theme 

一開始最花時間就是找個好主題了。內建的主題實用性不差，但初次看結構太複雜，再來我喜歡更簡潔的版面，也希望有寫好 responsive layout。

Pelican 大部份的主題都集中在 <http://pelicanthemes.com/>，有縮圖很好挑選，而且 theme 跟內容是分開的，換 theme 只是改 config 裡 `THEME` 這變數而已，不喜歡就換。選了一陣子挑到 [Flex]，他不是我最喜歡的版型，我比較喜歡單欄式置中，但意外只有少數主題滿足上述條件。

Theme template 用 Jinja2，一開始只要調整 `base`、`index`、`article`、`page` 這幾頁跟 blog 最相關的就能改變主要的外觀。好在兩欄式的網頁 code 讀起來也很舒適。看了一下只要把 responsive 調整一下，讓手機內文寬度夠、很大的螢幕不要滿版整體看起來就差不多。大致上 theme 就這樣定下來了。

細部的 CSS 修正，Flex 有用 [LESS] 和 [gulp] 處理前端的設定。LESS 變數跟 nesting rules 不會讓 CSS 變得很髒；每次改完跑個 gulp 就有新的 `style.min.css` 很方便。

唯一討厭左側的大頭照，有夠煩的，而且還要增加 54KB 的流量。還再想該放什麼來關掉它，放初音好了。

[Flex]: https://github.com/alexandrevicenzi/flex
[LESS]: http://lesscss.org/
[gulp]: http://gulpjs.com/


### 字型

因為自用 OSX，有時候都會忘了在 Windows 上的字體有多悲哀。

Flex 內建用 Google webfont 來處理英文字體，為了引言還有完整性多加了一組 serif 字體 [Crimson Text]。我喜歡這種 Garamond 類的古典襯線字。剛剛發現它是[開源的 (SIL 1.1)](https://github.com/skosch/Crimson)，nice。（大陸網友表示：……）

#### 中文 webfont

麻煩的就是中文字型。直接放棄系統內建，但最後有把 Noto Sans CJK 和 Source Hans Sans 加進來當備用。一直都有想嘗試 [justfont] 推出的 webfont 功能。它運作時會嵌入一個 javascript，看這頁網頁用到哪些中文字，才去要這些中文字的字型來加速載入。使用上就跟 Google webfont 一樣，官網教學考慮了很多使用情況，其實沒做什麼設定就好了，我以為要調很多東西才看得到效果，最後只改了 `font-family` 就完工。他的設定也能保留原本英文字的字型。

<div class="figure align-center">
  <img src="{attach}pics/justfont_setting.png"/>
  <p class="caption center"><span class="fig">Justfont 設定</span></p>
</div>

免費的試用沒問題之後就刷下去了。說真的免費只能綁兩個字型，設定好內文以及內文粗體 quota 就用完了，現在 100,000 page views/year 大約 NTD 350/year 也不貴。既然付費了當然要試試信黑體，電腦版的到現在還買不起啊。設了兩個字重，一樣加了一套楷體當引言用。楷體也選了比較秀氣的 cwTeX 楷。

也許未來會試試看仿宋體，但我有點擔心螢幕顯示的效果（用 Retina 表示解析度無感），而且 justfont 提供的（仿）宋體也沒有比信黑體更喜歡，這實驗暫且擱置。

#### 中文排版

受到 COSCUP 2015 Bobby Tung 給的演講[《中文排版需求以及我在W3C看到的事情》](http://www.slideshare.net/bobby3302/w3c-51661297)所感召，覺得如果自己不一開始好好做網頁中文排版，之後肯定更懶得改。

但最後還是有所妥協啦（跪）。

首先段落前後還是有留白，這主要是兼顧英文排版，因為不知道怎麼在不同語言套不同的版型，英文段落是前後留大間距。再來我在純文字的時候也很習慣段落前後空一行，感覺視覺上這樣比較舒適（也許是行高不夠……）。 <del>`margin` 也是設為 `1em`。</del>（EDIT: 見文末）

段落首行縮排最後也沒有放，主因是文句都蠻短的，有點怪；再來 markdown parser 會把我的全形空白吃掉，難以理解（但 rst 不會），真要加只能用`&#x3000;`硬加。中英交雜的段落中文字會無法對齊，不過就暫時算了，現在中英文的字重能一樣已經很感動了。

300 的中文字的確有點細，我把字調大了成 18px，還特別拿給我爸媽看，確定他們看得到這些字 XD 

做到這裡其實還蠻滿意了，長得像這樣：

<div class="figure align-center" style="width: 250px">
  <img src="{attach}pics/blog_mobile.png"/>
  <p class="caption center"><span class="fig">手機上的樣子</span></p>
</div>

<div class="figure">
  <img src="{attach}pics/blog_desktop.png"/>
  <p class="caption center"><span class="fig">電腦螢幕的樣子</span></p>
</div>

[Crimson Text]: https://www.google.com/fonts/specimen/Crimson+Text
[justfont]: http://justfont.com


### Figure caption

圖的下面還蠻常會放一些圖說、reference 之類。範例上面就有。在 markdown 不容易達成這效果，因為它的語法沒這麼複雜；但 rst 本來就有支援這樣的語法：

~~~rst
.. role:: fig

.. figure:: {filename}pics.jpg
    :align: center

    :fig:`Figure 1:` The figure caption.

    The legend consists of all elements after the caption.
~~~

這樣就會變成

~~~html
<div class="figure align-center">
  <img alt="" src="{filename}pics.jpg">
  <p class="caption"><span class="fig">Figure 1:</span> The figure caption</p>
  <div class="legend">The legend consists of all elements after the caption.</div>
</div>
~~~

在 markdown 基本上就手打上面那一串 HTML，其實也還好，只是醜了一點。真的寫得很煩時再想寫 plugin 來做這件事。


### Markdown or rst?

日常的編輯應該還是以 markdown 為主，看看精美的 [Macdown] 編輯器如此好用。但如果是很複雜的檔案（分析有公式有圖表什麼的）可能就會考慮 rst；rst 缺點就是語法有點複雜，而且很多語法仰賴句中空白，使得不適用中文，然後我的 vim linter 會一直抱怨它有很多沒看過的 directives。

不過很高興 Pelican 把兩者整合的很好，兩個都能用就能視情況轉換，但 template 也不用寫兩份。


### To do

這之外還加上了 LaTeX MathJax、Smartypants 等小細節，不過整體來說 blog 客製化就完成了。也許未來用到什麼再加吧。

目前想到的一些問題：

- 標題字重：本來是跟內文同字重，但感覺長文會抓不到段落，先改成粗體，希望短文不要因為這樣變得很混亂。
- Jupyter notebook include：還沒有試直接嵌入 nb 的功能，我想應該也是調整 CSS 那類的工（前端好累好難啊…）

[Pelican plugin] 裡面包含了很多樣的套件，我猜很多遇到的問題，前人都解掉了吧？……吧 xdd


### EDIT (2015-09-22)

看來看去，又調整了很多東西。

首先，字體大小調小成 16px 又調回 18px。會選擇 16px 是因為我發現在 13&#34; 筆電上閱讀會變得很擠。調回來是因為在大螢幕上看真的太小了，自己都需要放大來看。而且發現本來 13&#34; 上很擠的問題並不是字體，而是一行文字的字數。

一行文字太多會影響到閱讀的效率。PTT 一行最多 39 個中文字，但應該很少文章是打滿的，大約都打個五到八成寬，也就是在 20-32 個中文字。英文的話大約在 12-15 個字。我自己調了很多版本也差不多是這個數字。

所以理想的文章寬度要滿足中、英文的字數。中文字寬度是固定的，所以在決定一行有多少個中文字之後，就要想辦法調整英文字體讓一行英文字數剛好。原本使用的 Source Pro Sans 稍微窄了一點，會讓純英文的頁面看起來有點擠，字重 400 的時候就好多了，但中文就變得不適合內文。最後換成 Lato，也是很普及的字體，不過其實沒寬多少。如果還是覺得很擠就只好換成 Open Sans 了，但我覺得它就有點鬆散。

最後內文寬 738px (41em) 或 828px (46em)，實際一行最大為 612px (34em)。一行最多 34 個中文字、大約 14 個英文字（80 個字元）；程式碼一行最多只能放 74 個字元，短了一點點但還可以接受。

意外的小發現，在內文變窄之後，還可以加上右側的 sidenote，像是 [Tufte CSS] 這樣，有時會比 footnote 好用，但可能又變回內容太擠的狀態。

最後是在段落前後距離調整，把標題接內文的間距變小了，但段落間的間距調大。學到了一些以前不會的 CSS 語法，像

```css
p + p {
  margin-top: 1.5em;
}
```

代表選取相鄰的 p 元素，這樣可以避免直接改 p 的 margin 讓 p 與 h*、ul、pre 等間距太寬的狀況。**前端真的太神妙了。**


### EDIT (2015-09-23)

另外 smartypants 有時候有點煩，像是表達 13 吋時

<p class="center"><span style="font-size: 4em; line-height: 1em;">13" vs 13&#34;</span></p>

不把 `"`（QUOTATION MARK `\u0022`）直接寫成 `&#34;` 就會被轉換成左邊那樣 `”`（RIGHT DOUBLE QUOTATION MARK `\u201D`）。

也把表格的格式加上，仿造 bootstrap 表格 overflow 時會變成 block 可以滑動著看。


[Pelican plugin]: (https://github.com/getpelican/pelican-plugins)
[Macdown]: http://macdown.uranusjr.com/
[Tufte CSS]: http://www.daveliepmann.com/tufte-css/


[^1]: 以前部落格的長相：
<div class="figure align-center">
  <img src="{attach}pics/oldsite.png"/>
</div>
