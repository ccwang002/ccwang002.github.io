---
Title: PNG Optimizer
Slug: png-optim
Date: 2015-09-22
Category: Coding
Tags: zh, png
---

部落格剛成立總是特別興奮，測了一下瀏覽像這樣的網站要用多少頻寬，稍微。首頁能壓在 700KB 左右，因為文章 summary 裡面暫時還沒圖。不過像部落格設定這文章，有幾張螢幕截圖的就要花快 2MB 傳。

就想了一下圖檔有什麼壓縮方式。如果是 JPG 的話，[jpegoptim] 簡單又有效；如果是 PNG 的話，以前都是用 [OptiPNG]，但效果有限，而且是無損壓縮。在螢幕截圖的情況，我倒不介意幾個像素的顏色稍微不一樣（其實人眼無法分辨）

於是，需要比較看看市面找得到的幾種 PNG 壓縮方式。很碰巧找到 <http://css-ig.net/png-tools-overview.html> 專講 PNG 優化的比較，就挑了幾款來試。

直接把結果整理成下表：

|             Filename |  Original size |   [OptiPNG] \(lossless) |   [Zopfli] \(lossless) |   [pngquant] \(lossy) |
|:---------------------|------:|----------:|---------:|-----------:|
| [blog_desktop.png] |  180K |      108K |     100K |        56K |
|      [blog_mobile.png] |   72K |       52K |      44K |        28K |
| [justfont_setting.png] |  272K |      196K |     164K |        84K |
|          [oldsite.png] |  604K |      536K |     492K |       288K |
|     [oldsite_full.png] |  816K |      684K |     644K |       376K |



### OptiPNG

[OptiPNG] 還是有部份效果，不過他跑不快。


### Zopfli (Zopflipng)

[Zopfli] 是 Google 開發的壓縮演算法，相容於 deflate, gzip, zlib 格式。也因此能用在 PNG 上面。他也是 lossless compression。

> Zopfli Compression Algorithm is a compression library programmed in C to perform very good, but slow, deflate or zlib compression.
> ([Zopfli Readme](https://github.com/google/zopfli))

這個 [Zopflipng] 也是同個 repo 維護。自己編譯簡單，

~~~
git clone https://github.com/google/zopfli.git
make zopflipng
~~~

如果要一口氣壓縮一堆 PNG，可以這樣使用：

~~~
zopflipng --lossy_transparent --prefix *.png
~~~

速度也蠻慢的，有個 `-q` 選項可以加速。但壓縮效率比 OptiPNG 還好。

PS 剛好今天早上看到 Google 又出了另一個壓縮演算法 [Brotli]，但這個與 deflate 不相容，應該不能用在 PNG 上面。


### pngquant

想要有損的 PNG 可以用 [pngquant]。看官網有特別強調在透明度的資訊會被保留，並能像 JPEG 一樣設定 quality。一般 quality 容許越低壓縮比都會越高。

```
pngquant -f --ext=.png --quality=70-85- --skip-if-larger *.png
```

可以看到 pngquant 能很容易達到 50% 以下的壓縮比。就我的例子看不太出現螢幕截圖哪裡失真了，而且失真了……也不會怎麼樣啦。


### pngquant + Zopflipng

看了一下相關的討論，pngquant 還有再被壓縮的空間，所以最後再套上 Zopflipng 還可以再變小，還蠻驚人的。

|             Filename |   Orig. size |   pngquant |   pngquant + Zopfli |   Compress ratio |
|:---------------------|----------------:|-----------:|--------------------:|-----------------:|
|     [blog_desktop.png] |            180K |        56K |                 60K |             0.33 |
|      [blog_mobile.png] |             72K |        28K |                 28K |             0.39 |
| [justfont_setting.png] |            272K |        84K |                 76K |             0.28 |
|          [oldsite.png] |            604K |       288K |                268K |             0.44 |
|     [oldsite_full.png] |            816K |       376K |                348K |             0.43 |


### 沒有測的 TruePNG

在原始網站中有提到 [TruePNG][TruePNG tutorial] 表現很好，但它不是 open source 而且好像只能在 Windows 上跑，那就算了。


### 結論

以後沒事截圖都會用 pngquant 壓縮一下，完全不能有色差的考慮從 OptiPNG 改為 Zopfli。



[jpegoptim]: https://github.com/tjko/jpegoptim
[OptiPNG]: http://optipng.sourceforge.net/
[Zopfli]:https://github.com/google/zopfli
[Zopflipng]: https://github.com/google/zopfli/blob/master/README.zopflipng
[Brotli]: https://github.com/google/brotli
[pngquant]: https://pngquant.org/

[TruePNG tutorial]: http://css-ig.net/articles/truepng

[blog_desktop.png]: {filename}pics/blog_desktop.png
[blog_mobile.png]: {filename}pics/blog_mobile.png
[justfont_setting.png]: {filename}pics/justfont_setting.png
[oldsite.png]: {filename}pics/oldsite.png
[oldsite_full.png]: {filename}pics/oldsite_full.png