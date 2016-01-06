---
Title: Blog defaults to HTTPS
Slug: blog-https
Date: 2016-01-06
Tags: zh, blog, pelican
Category: Coding
---

簡言之，現在 blog 使用 https。一般的 http 連線會被重新導向至 https。

Blog 本來就是架在 [GitHub Pages][blog-src] 上，其實預設有 https，但在網址改成自訂 domain 之後 https 自然就失效了。在 GitHub 上有開 issue 請他們加入 [HTTPS support for custom domain][GitHub https issue] 這功能，不過目前還是需要自己想辦法。隨著 [Let's Encrypt] 這種服務的流行，GitHub 才會去積極尋找比較合適的解決方案吧。

[TOC]

## CloudFlare SSL and CDN

在看那個 [issue][GitHub https issue] 就可以找到其他人用 CloudFlare 的解法。概念上就再用一層 CloudFlare CDN，然後它的 CDN 有提供 https 簽章。直接看 CloudFlare 在 Crypto 頁的介紹比較快：

<div class="figure">
  <img src="{attach}pics/cloudflare_ssl.png"/>
  <p class="caption center">source: <a href="https://www.cloudflare.com/ssl/"> CloudFlare one-click SSL</a></p>
</div>

所以 CloudFlare 去 cache GitHub 頁面時用的是 https，再到使用者時也是用 https。剩下就是你要不要相信 CloudFlare 了。

CloudFlare 的設定可以參考 [Keanu's Blog]。一些重點筆記：

- 換成 CloudFlare 的 DNS Server
- Crypto SSL options 選 Full（不是 Strict 目前 GitHub 還不支援）
- 在 Page Rules 強迫所有 http 連結重新使用 https（例如：`http://blog.liang2.tw/*`）

HTTPS 以及 DNS 的設定都需要一段時間，過幾個小時或觀察個一天再把 http 關掉。

Pelican 發佈設定 `publishconf.py` 管網址的 `SITE_URL` 能設成 `//blog.liang.tw` 不用帶 protocol（這麼重要的資訊沒寫在文件裡啊），這樣就能同時 serve http(s)。

這樣其實就完成了。但出乎意外還是有些小問題：

- 網頁字型 [justfont] 要 Business Plan 才能支援 HTTPS。
- 留言系統 [Disqus] HTTP 和 HTTPS 竟然是當作[不同留言板](https://github.com/aspnet/Docs/issues/623)來使用，而且要手動 merge。

## Disqus

似乎解法只有全部導向到 https。這還不能直接改 Disqus 設定，要用它的 [URL Mapper](https://help.disqus.com/customer/portal/articles/912757-url-mapper) 下載所有留言版出現連結的 CSV 手動修改。 

感覺很土砲。不過站上的留言不多，也不用改多少留言，很快就同步到新的位置上。

## justfont

之前有贊助金萱計畫，其實有拿到兩年的 Business Plan。寫信給客服一天就改好設定了。不過之後就要多付錢啦。

## Hinet 轉址服務

我沒有自己架任何 server，懶得維護。不過也很懶得打字。在其他 subdomain 都沒用的情況下，有透過 Hinet 設定 <http://liang2.tw> 會導向至 <http://blog.liang2.tw> 再被導向到 https。

<div class="figure">
  <img src="{attach}pics/cloudflare_dns_setting.png"/>
  <p class="caption center">CloudFlare DNS setting</p>
</div>

大概是這樣。希望能在不要自己架 server 的情況下繼續經營這個 blog。



[blog-src]: https://github.com/ccwang002/ccwang002.github.io
[Let's Encrypt]: https://letsencrypt.org/
[GitHub https issue]: https://github.com/isaacs/github/issues/156
[Keanu's Blog]: https://blog.keanulee.com/2014/10/11/setting-up-ssl-on-github-pages.html
[justfont]: http://en.justfont.com/membership
[Disqus]: https://disqus.com/
