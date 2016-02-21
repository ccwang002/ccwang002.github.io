---
Title: Python 官方文件中文化 Server HTTPS 使用 Let's Encrypt
Slug: pydoctw-https
Date: 2016-02-21 14:00
Tags: zh, pydoctw, https, letsencrypt
Category: Coding 
Summary: 整理了 server 從 HTTP 到 HTTPS 相關設定的調整。
---

現在可以透過 <https://docs.python.org.tw> 訪問 Python 官方文件中文化網站。

Server 本身的設定可以參考[之前的文章]({filename}0214_pydoctw_server.md)。加入 HTTPS 就要設定相關的憑証，我選擇 [Let's Encrypt] 做為憑証的簽署者。

Let's Encrypt (LE) 使用 AMCE (Automated Certificate Management Environment) protocol 去驗証你是否擁有你欲簽証的 domain。官網上有[圖文說明](https://letsencrypt.org/howitworks/technology/)，簡單來說，LE 會要求你的 server 在特定的 path 加入特定的檔案，如果你做得到，就代表你擁有這個 domain。這樣的簽証第一次要在 LE server 上註冊，之後最長每 90 天認証一次。

[TOC]


### 參考資料

我不是網路安全相關的專家，所以設定都是參考網路上的說明整理而成。LE certificate 的設定參考 [*How to Secure Your Web App Using HTTPS With Letsencrypt*] by Rob McLarty 這篇文章。


### Let's Encrypt Certificate

沒有使用 LE 官方的 client，而是用 [Daniel Roesler] 所寫的 [acme-tiny]。這是一個不到 200 行的 Python script，可以自行檢查它有沒有做任何奇怪的事。

基本上都是照著 [*How to Secure Your Web App Using HTTPS With Letsencrypt*] 該篇文章做，不過有調整了以下的東西：

1. 建立 letsencrypt 帳號時，禁止使用 password login。<br>
   即： `adduser --disabled-password ...`
2. 使用 git 管理 [acme-tiny] script。
3. 改用 systemd 控制 nginx，而不是透過 service。<br>
   即： `systemctl reload nginx`
4. 沒有用 crontab 而是使用 [systemd Timers](https://wiki.archlinux.org/index.php/Systemd/Timers)。
5. 重新導引 http 連線至 https。

第 4、5 點設定比較多，整理到後面。


### 設定 systemd timer 定時更新 certificate

這邊參考 [*RHEL7: How to use Systemd timers.*] 一文。

Systemd Timer 概念如同 crontab，但差別是使用 timer 即與 systemd 整合。`<unit>.timer` 可以定期執行 `<unit>.service`，所以 <unit> 執行的結果與狀態都能顯示在 systemd 中，也帶入了 journald 有的 logging 功能。

更新 certificate 的指令寫在 `/etc/letsencrypt/renew_cert.sh`。Shell script 的內容與參考文章一樣。

#### Systemd service

首先建立一個 renew_cert，以 Debian 為例放在 `/etc/systemd/system/renew_cert.service`，

```ini
[Unit]
Description=Renew Let's Encrypt cert
After=syslog.target

[Service]
User=letsencrypt
Group=letsencrypt
ExecStart=/etc/letsencrypt/renew_cert.sh
Type=simple
StandardError=syslog

[Install]
WantedBy=multi-user.target
```

要手動更新 certificate 的時候執行這個 service 即可，

```
systemctl start renew_cert
```

我們不需要 enable 它，不然每次開機都會執行一次。看結果或記錄，

```
systemctl status renew_cert
journalctl -e -u renew_cert
```

#### Systemd Timer

建立一個 `/etc/systemd/system/renew_cert.timer`

```ini
[Unit]
Description=Update Let's Encrypt certificate every two months

[Timer]
OnCalendar=*-1/2-1 16:00:00
Unit=renew_cert.service

[Install]
WantedBy=multi-user.target
```

重點只有 `[Timer]` 這 directive。`Unit=` 表示要啟動的 service。`OnCalendar=`[^calendar] 則是設定這 timer 根據指定的時間點 (UTC 時間[^utc]) 啟動。

以這邊寫的時間 `*-1/2-1 16:00:00` 為例，代表每年的 1+2n 月 1 日 16:00 UTC 更新 certificate，即臺灣時間 1、3、5、……月 2 日凌晨更新。

啟用 timer，它需要被 enable 確保開機都能被執行。

```
systemctl enable renew_cert.timer
systemctl start renew_cert.timer
```

可以用 `systemctl list-timers` 檢查它下次執行的時間：

```console
$ sudo systemctl list-timers renew_cert.timer
NEXT                         LEFT                LAST PASSED UNIT             ACTIVATES
Tue 2016-03-01 16:00:00 UTC  1 weeks 2 days left n/a  n/a    renew_cert.timer renew_cert.service
```

[^calendar]: 除了 `OnCalendar` 還有很多設定 timer 的方式，如 `OnUnitActiveSec`。不過其他的時間算法都會受有沒有開機影響時間的計算。

[^utc]: Debian Jessie 的 [systemd.time (7)](https://www.freedesktop.org/software/systemd/man/systemd.time.html#Calendar%20Events) Calendar Events 裡並沒有指定時區的方式，所以加上時區會有 parse error。但新版的 systemd 似乎支援時區。總之應該用 `systemctl list-timers` 確定執行的時間。


### nginx HTTP redirect to HTTPS

（這邊設定我比較沒信心，有更好的設定方法歡迎告訴我 > <）

要解決的問題為，ACME challenge 是透過 HTTP，其餘的連線都轉到 HTTPS。

在 nginx 中把主要的設定檔中拿掉 `listen 80;` 與 ACM challenge 的部份。把它們移成新的 server block： 

```nginx
server {
    listen 80;
    server_name docs.python.org.tw;

    # For Let's Encrypt ACME challenge files
    location /.well-known/acme-challenge/ {
        alias /var/www/challenges/;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
``` 


### 測試 HTTPS 設定

用了 [securityheaders.io](https://securityheaders.io/) 和 [SSL Labs](https://www.ssllabs.com/index.html) 測試了一下，應該還可以：

<div class="figure">
  <img src="{attach}pics/pydoctw_securityheaders_report.png"/>
  <p class="caption center">Report from securityheaders.io (<a href="https://securityheaders.io/?q=https%3A%2F%2Fdocs.python.org.tw%2F3%2F">Live Report</a>)</p>
</div>

<div class="figure">
  <img src="{attach}pics/pydoctw_ssllabs_report.png"/>
  <p class="caption center">Report from SSL Labs (<a href="https://www.ssllabs.com/ssltest/analyze.html?d=docs.python.org.tw">Live Report</a>)</p>
</div>


### 心得

總結來說，使用 [Let's Encrypt] 不難，但也沒到非常簡單。如果你願意把 root 和 private key 權限給它的話，用 `letsencrypt-auto` 步驟能更少。覺得 [acme-tiny] 指令太複雜的話，原作者也寫了一個 [Get HTTPS for free!] 服務，用網頁的方式協助整個註冊流程。

要注意目前 public beta 階段，相同 domain 在 7 天只能被簽署 5 次，測試的時候不要太衝動不然就要等一週了。


### Misc.

建立 CSR (Certificate Signing Request) 檔時，可以加入自己的 email 地址，不然預設是 `webmaster@<domain>`：

```bash
openssl req -new -sha256 \
    -key /etc/letsencrypt/private/domain.key \
    -subj "/CN=docs.python.org.tw/emailAddress=me+pydoctw@liang2.tw" \
    > /etc/letsencrypt/private/domain.csr
```

[Let's Encrypt]: https://letsencrypt.org/
[*How to Secure Your Web App Using HTTPS With Letsencrypt*]: https://robmclarty.com/blog/how-to-secure-your-web-app-using-https-with-letsencrypt

[Daniel Roesler]: https://daylightpirates.org/
[acme-tiny]: https://github.com/diafygi/acme-tiny/

[*RHEL7: How to use Systemd timers.*]: http://www.certdepot.net/rhel7-use-systemd-timers/

[Get HTTPS for free!]: https://gethttpsforfree.com/