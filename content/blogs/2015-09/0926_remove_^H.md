---
Title: 清除 ^H
Slug: remove-^H
Category: Coding
Date: 2015-09-27 02:28
Tags: zh
---

中文輸入我用嘸蝦米，在打中英文切換時候，很容易打出 `\x08` 這東西，在 vim 就會顯示成 `^H`，功能是 <kbd>Backspace</kbd>，但在一般 GUI 環境裡，可能就會因為它而把前面的字吃掉。

因此今天寫了個小腳本可以把清掉當目錄底下的文字檔的 `^H`：

```bash
ag -l '\x08' | xargs sed -i '' 's/\x08//'
```

[ag] 能夠換成比較慢但內建就有的 grep，參數兩者是相容的。


如果要順便印出改了哪些檔案的話：

```bash
echo 'Found ^H in the following files:'
ag -l '\x08' | tee /dev/fd/2 | xargs sed -i '' 's/\x08//'
```

用 tee 把 stdout 導向到 stderr 還蠻有趣的，以前都不知道這樣用。

[ag]: https://github.com/ggreer/the_silver_searcher
