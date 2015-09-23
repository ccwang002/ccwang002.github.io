---
Title: PNG Optimizer
Slug: png-optim
Date: 2015-09-22
Category: Coding
Tags: zh, png
---


```
180K	blog_desktop.png
 72K	blog_mobile.png
272K	justfont_setting.png
604K	oldsite.png
816K	oldsite_full.png
```

### OptiPNG

```
108K	blog_desktop.png
 52K	blog_mobile.png
196K	justfont_setting.png
536K	oldsite.png
684K	oldsite_full.png
```

### Zopfli

```
~/tools/zopfli/zopflipng --lossy_transparent --prefix *.png
```

```
100K	zopfli_blog_desktop.png
 44K	zopfli_blog_mobile.png
164K	zopfli_justfont_setting.png
492K	zopfli_oldsite.png
644K	zopfli_oldsite_full.png
```

### pngquant

```
pngquant -f --ext=.png --quality=70-85- --skip-if-larger *.png
```

```
 56K	blog_desktop.png
 28K	blog_mobile.png
 84K	justfont_setting.png
288K	oldsite.png
376K	oldsite_full.png
```

### pngquant + Zopflipng



| IP Address   | OS            | Owner      | Description              | 
|:-------------|:--------------|:-----------|:-------------------------| 
| 172.16.0.181 | CentOS 6      | -          | NFS 共享 1.5TB read only | 
| 172.16.0.182 | *不固定*      | -          | VM Template              | 
| 172.16.0.183 | -             | -          |                          | 



http://css-ig.net/png-tools-overview.html

[TruePNG tutorial]: http://css-ig.net/articles/truepng

[Zopflipng]: https://github.com/google/zopfli/blob/master/README.zopflipng