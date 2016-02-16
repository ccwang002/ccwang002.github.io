---
Title: 設定 Python 說明文件中文翻譯自動更新 Server
Slug: pydoctw-server
Date: 2016-02-14 21:00
Tags: zh, pydoctw, python, django, postgresql, deploy, debian, systemd, nginx, uwsgi
Category: Coding
Summary: 設定一個自動更新 Python 說明文件中文翻譯並且 host 中文化網頁版文件的 server。使用 Django 作 web server、Django-Q 做為 task queue，deploy stack 用 nginx、uWSGI，host 於 Amazon EC2 (Debian Jessie)，資料庫用 PostgreSQL，並用 systemd 管理相關的 process。
---

*TL;DR* 可至 <http://docs.python.org.tw> 看線上自動更新的[中文化的文件][pydoctw-doc]和 [build server][pydoctw-build-server]。

EDIT 2016-02-16: 加上 language code、git sshconfig、swap 的設定；文句潤飾。

[TOC]

## Python 說明文件中文翻譯計畫

最近一段時間都在準備 [Python 說明文件中文翻譯計畫][python-doc-tw]。翻譯本身雖然還沒很積極地進行，但經過[前](http://www.meetup.com/Taipei-py/events/226558484/)[幾次](http://www.meetup.com/Taipei-py/events/227001232/) Taipei.py Projects On 的 sprint 活動，已經有蠻多人加入翻譯的行列。大家都有各自翻譯的主題，像我自己是從 [Tutorial][pydoctw-doc-tutorial] 的部份開始翻譯。


### Sphinx 文件多國語言架構

先簡介一下 [CPython Documentation](https://docs.python.org/3/)（下稱 pydoc）的架構和翻譯方式。pydoc 是標準的 [Sphinx] 文件，因此翻譯使用 Sphinx 自帶的 [internationalization](http://www.sphinx-doc.org/en/stable/intl.html) (i18n or intl) 功能把文件的內容轉換到別的語言上。

如同 Django 等專案，i18n 都是透過 gettext，Sphinx 會按照 rst 檔案輸出同檔名的 po 檔。rst 檔案中的每個文字段落會對應到 po 檔一個 entry，不相干的程式碼範例等段落會被跳過。輸出的 po 檔放在對應的路徑例如 `locale/<lang>/LC_MESSAGES/xxx.po`。

[po 檔的格式](https://en.wikipedia.org/wiki/Gettext)很簡單，跳過有的沒的 header，實質內容長這樣：

```po
#: ../../tutorial/appetite.rst:50
msgid ""
"Python enables programs to be written compactly and readably.  Programs "
"written in Python are typically much shorter than equivalent C,  C++, or "
"Java programs, for several reasons:"
msgstr ""
"Python 讓程式寫得精簡並易讀。用 Python 實作的程式長度往往遠比用 "
"C、C++、Java 實作的短。這有以下幾個原因："
```

實際上 Sphinx 會先輸出一份乾淨的 po 檔範本（稱為 pot 檔）到 `locale/pot/`，基本上就是只有原文的 po 檔。每增加一個新語言就會從 pot 檔製作一份 po 檔到各自的 `locale/<lang>/` 目錄下，翻譯時就修改那份 po 檔就可以。

翻譯完成後，首先 Sphinx 會先呼叫 gettext 把 po 檔編譯成 mo 檔加速搜尋翻譯字串速度。輸出翻譯後的文件只要設定不同語言，Sphinx 就會去找該語言的 mo 檔，並把原文字串換成 mo 檔裡的內容，就可以看到中文的文件。

### Transifex 線上服務讓多人共同翻譯 po 檔

整個 Sphinx 文件翻譯流程就這樣，所以翻譯只要編輯中文 (lang code: zh-Hant[^zh-Hant]) 的 po 檔就好了。不過要直接寫 po 檔格式門檻還是太高，於是就有像 [Transifex] 這樣的網站。上傳 po/pot 檔就能線上修改翻譯，然後再把翻完的結果用 po 檔格式下載下來。我認為這是現在參加以 gettext-based PO 檔翻譯門檻最低的方式，至少日本也是這麼做。於是想要參考 pydoc 翻譯的人，只要登入 Transifex 就可以開始編輯。

用 Transifex 還有額外的好處。例如他有 POS tagging 可以標注專有名詞，定義統一的譯名，這些譯名會整理在 glossary terms 裡，翻譯時出現這些詞就會自動提示。類似的原文文句也會放在 suggestion 裡，讓翻譯完的用語文法也能一致。此外也有修改歷史、防呆提示（如該有的格式沒在譯文出現）、加註解 (comment)、評論 (issue) 等功能。

[^zh-Hant]: 八卦是，臺灣繁體中文的 language code (or locale identifier) 究竟是 zh_TW、zh-Hant、zh-Hant-TW、zh-Hant_TW、zh_Hant 還是 zh_Hant_TW？這問題本身就可以寫一篇了。<br><br>查國際規範 [BCP 47] 的話，只有 [zh-Hant](http://www.iana.org/assignments/lang-tags/zh-Hant) 和 [zh-Hant-TW](http://www.iana.org/assignments/lang-tags/zh-Hant-TW)，更多關於標準的說明與定義可以參考 [*Understanding the New Language Tags*, W3C](https://www.w3.org/International/articles/bcp47/) 一文。<br><br>不過現狀是很奇妙的。參考 OSX 定義 [*Language and Locale IDs*](https://developer.apple.com/library/ios/documentation/MacOSX/Conceptual/BPInternational/LanguageandLocaleIDs/LanguageandLocaleIDs.html) 的話應該是 zh_TW、zh-Hant 或 zh-Hant_TW。而在 Debain 中，所有支援的 locale 寫在 `/usr/share/i18n/SUPPORTED`，裡面只有 zh_TW，不過 Debian 只用 `language[_country][.charset]` 所以不會有定義中為 script 的 Hant，雖然在 locale 中使用底線與 [BCP 47] 的定義不同。Sphinx 透過 [Babel] 處理 locale，但它不允許 locale 中有 `-`，因此只能考慮 zh_Hant 或 zh_Hant_TW。更有趣的是，locale 應該是 case-insensitive 所以大小寫是不重要的 XD

### 翻譯體驗改善

這段時間翻譯的用詞、流程等規範都有個雛型了，相關的內容都可以在[專案的 wiki][pydoctw-wiki] 裡找到。所以開始想要怎麼讓大家更好參與翻譯和看到翻譯的結果。

我發現參加翻譯本身已經不困難，大家沒什麼疑問。維護整體的用詞、翻譯討論用 Transifex issue 和 comment 效果不錯。整體上能保持極度分散式的工作形式。

平常遇到最多問題是出現 rst 格式錯誤、缺少必要的空白、前後文加上程式碼範例之後不通順、譯文曲解或誤會原文的意思。這些問題，我覺得只要自己讀過翻完的 pydoc 該頁、看一下輸出的 log 就能明白，也不需要我多作解釋。

再來，看不到自己翻譯的成果**很沒有成就感**，過一段時間我怕會失去動力。

於是變成需要一份保持更新的翻譯成果。當然自己輸出 doc 的方法都有寫在 [wiki][pydoctw-wiki-local-build] 裡，但步驟很多，說簡單也沒多簡單，而且有錯或有問題可能都要來找我，就失去分散式分工的特性了。

**不如做個 autobuild server。**

於是有了這想法。但實在是個大坑，一直只能用想的。在過年的時候總算找到時間把 prototype 做出來了，其實蠻有成就感的。


## PyDoc Autobuild Server

簡單整理幾個需求：

- PyDoc 結果網址對應本家 <https://docs.python.org/>。例如 /3/ 就是 Python 3.x 版最新的，而現在 /3.5/ 就會自動轉址到 /3/[^pydoc-url]。
- 每一頁都有個更新翻譯連結，點一下就會從 Transifex 上抓新的翻譯，並更新輸出。
- 更新每頁翻譯的指令輸出都要保留，方便檢查 rst 語法等錯誤。
- 更新翻譯要有個 queue，才可以多人合作時不炸掉 autobuild server。
- 每日更新全部的文件，並且把更新加到 CPython-tw 的 git repo 中。更新的過程一樣要有記錄。
- 上述的所有功能都能在本機輕鬆地設定。

[^pydoc-url]: 其實在 <https://docs.python.org/> 上面 [/3/](https://docs.python.org/3/) 和 [/3.5/](https://docs.python.org/3.5/) 是不同份文件，即使是同個版本號它們更新的時間不相同。蠻意外會是這樣的情況。不過我們不用搞這麼複雜，只要轉址就好。


### 實作

目標就是完成上述的需求。pydoc 基本上就是個 static site，交給 nginx 設好路徑 host static files 就可以。Pydoc Sphinx 用 [Jinja2] 作 HTML template，所以只要多加一些變數就能控制頁面的輸出，在 autobuild server 上時就可以加上額外的連結。而 Autobuild server 本身是個 task queue，其實功能很簡單，但為了維護方便，並考慮到 local、production 環境都要能動的話，選擇 [Django] 為基礎。真的給 Django 管理的就顯示 task queue、task result、接受 rebuild doc request 這幾個 view。

#### Sphinx 文件

在 Sphinx 文件部份不想搞太複雜，就在每一頁加上一個自己的專屬連結，打這個網址就會加入一個更新該頁面的 task 到 autobuild server[^build-link]。

在 autobuild 時加入專屬連結只要修改 Sphinx doc template 即可。Sphinx 在 build doc 時可以透過 [`-A <name=value>`](http://www.sphinx-doc.org/en/stable/man/sphinx-build.html#options) 增加 Jinja2 template 的變數，就可控制 template render 行為：

```jinja2
{# <cpython-src>/Doc/tools/templates/layout.html #}
{%- if autobuildi18n %}
<a href="/_build/update/?source_path={{ pagename }}">Update Translation</a>
{%- endif %}
```

- `sphinx-build -A autobuildi18n=1` 時就會包含這個 Jinja2 block，多這個 Update Translation 連結。
- [`{{ pagename }}`](http://www.sphinx-doc.org/en/stable/templating.html#pagename) 是每頁文件的 rst 路徑。

[^build-link]: 開發時一直都是用 GET，即如文中所說，有個專屬的 link。但發現會有 robot / crawler 打這些路徑，因此最後改成 POST，把 `{{pagename}}` 用 data-\* 即 `<a href="#" data-pagename="{{ pagename }}">...</a>` 的方式存起來，在用 jQuery 綁定 click listener。

#### Autobuild Django server

Django server 目標就是接受 task request 和顯示 task result。一個標準的 task queue 就有這些功能。

Django 上的 task queue 選擇很多，從 [Django Packages] 上的 [Workers, Queues, and Tasks](https://www.djangopackages.com/grids/g/workers-queues-tasks/) 相關的套件可以看到有幾個有在更新而且 up 數多的：

- [django-celery](http://celery.github.io/django-celery/)
- [huey](http://huey.readthedocs.org/en/latest/)
- [django-RQ](https://github.com/ui/django-rq)
- [jobtastic](http://policystat.github.io/jobtastic/)
- [django-Q]

扣掉不支援 Python 3 的套件[^python3]後，就剩 django-celery、django-RQ、django-Q 可以選。這裡面最紅也最老牌的是 django-celery ，它與 [Celery] 整合，功能完整且穩定，我用過也覺得十分不錯，缺點是功能太多有點複雜，加上不同 message queue 時會有很多設定要調整，需要一段時間上手。一般 Celery 常見的搭配使用 [Rabbit-MQ] 和 [Redis]，的確在 task 很多時有必要，但我們這個 build doc 一天可能才十幾次，在不隔離 build doc 環境的情況同時間的 worker 只能有一個，不會有效能上的問題。因此我傾向只要使用與 Django 同一個 database 就好，不要再有額外非 Python 的 dependency，讓 local 開發簡單一點。

最後選擇 [django-Q]。雖然很新但作者維護得很勤，worker 可以只用 Python 內建的 multiprocessing 完成。功能簡單卻完整，包含 monitor，跟 django-admin 整合，還可以排程。所以要啟動 django-Q 的 cluster，只要多一個 

```
python manage.py qcluster
```

即可，十分方便。

怎麼使用 django-Q 就不在這篇 blog 討論範圍內了。我想我應該會投稿 PyCon TW 或 Taipei.py，到時候再整理成另一篇。Django-Q 的說明文件寫得很清楚，讀一讀應該就會了。

[^python3]: 看 [huey](https://github.com/coleifer/huey) 和 [jobtastic](https://github.com/PolicyStat/jobtastic) master branch 上有 py3k 的 commit 但感覺是最近的事，有待觀察。


## Autobuild server 部署

（這篇文的重點其實是部署，誰曉得背景介紹可以這麼長）

部署 (deploy) 方法百百種，有好有壞。但至少要會一種嘛，所以這邊就用其中一種：

> nginx <-> uwsgi <-> Django

也算很流行的組合。更完整地來說，整個處理 request 的流程經過：

> web client <-> nginx web server <-> socket <-> uwsgi <-> Django server

基本的設定與教學來自 [uWSGI] 官網的 [*Setting up Django and your web server with uWSGI and nginx*][uwsgi-doc-django] 一文，搭配 [*uWGSI and Systemd*][uwsgi-doc-systemd] 與 [systemd] 整合。

這也是目前 Pydoc production 的設定，記錄一下方便未來的維護。


### 作業系統

作業系統用 Debian Jessie，架設於 Amazon EC2 上，使用 t2.nano[^ec2-nano]。

Python web deploy 都會把套件裝在虛擬環境中，避免不同專案間互衝或與系統衝突。在 Debian 上可以用 `apt buid-dep python3-<pkg>` 把 Python <pkg> 套件所需的 header 或 library 安裝好，十分簡單。

[^ec2-nano]: 吐嘈一下，t2.nano vCPU 真的時快時慢，有時 build doc 幾分鐘就搞定了，有時要幾十分鐘，有一天超慢，然後又被 web crawler 抓到，讓 task queue timeout 陷入了 timeout、restart、timeout 的無限地獄……

#### Python 3.5 and APT-pinning

我的 code 裡用到了 [`subprocess.run`](https://docs.python.org/3/library/subprocess.html#subprocess.run)，這是 Python 3.5+ 才有的 API。但 Jessie 只有 Python 3.4，但我覺得很好用一點都不想改寫成相容舊版的 code。

因此需要安裝 Debian testing channel 上最新的 Python 3.5。這樣其實有安全上的疑慮，因為只有 stable channel 才有 security support，但自己編譯的問題更大，所以像 [pyenv](https://github.com/yyuu/pyenv) 這種多 Python 版本的工具不在考慮內。

於是用 [Apt-Pinning](https://wiki.debian.org/AptPreferences) 只讓 Python 3.5 相關的套件安裝 testing 的版本。首先把 testing channel 加到 `/etc/apt/source.list`

```
deb http://cloudfront.debian.net/debian testing main
deb-src http://cloudfront.debian.net/debian testing main
deb http://security.debian.org/ testing/updates main
deb-src http://security.debian.org/ testing/updates main
```

然後修改 `/etc/apt/preferences` 確定我們不會不小心裝到 testing 相關的套件，並把 Python 3.5 相關的套件設定權限 >= 990 讓它們能被自動安裝。

```
# Specify * rules first so later package-specfic rules can override them
Package: *
Pin: release a=testing
Pin-Priority: -10

Package: python3.5* libpython3.5*
Pin: release a=testing
Pin-Priority: 990
```

可以用 `sudo apt-cache policy <pkg-name>` 檢查目前的規則會裝到哪個版本。

```
$ sudo apt-get update 
$ sudo apt-get install python3.5 python3.5-venv python3.5-dev
```

這樣只有 Python 3.5 相關的套件才會裝到 testing。

#### 資料庫 PostgreSQL

資料庫用 PostgreSQL 9.4。參照之前 blog[《安裝 PostgreSQL 9 於 Debian Jessie / OSX》][postgres-debian]一文設定。

#### Swap

其實是上線不久才注意到 EC2 預設沒有 swap 空間。我很窮所以 production server 的 RAM 只有 512 MB，觀察一下有時候 build doc RAM 就全滿了，所以還是加個 swap 安心一點。

因為 Amazon EBS SSD I/O 數不會另外收錢（應該吧？），就建 swap file 在主硬碟裡。

Swap 設定的教學很多，這邊就參考 [Arch Wiki](https://wiki.archlinux.org/index.php/swap) 上的做法，我選擇放在 `/var/swap.1`。大小設定為 RAM 的 2 倍，即 1GB。

首先把這個檔案建出來，權限改為 600。

```bash
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=1024
# or faster with fallocate
sudo fallocate -l 1G /var/swap.1
```

```bash
sudo chmod 600 /var/swap.1
```

再來把這個檔案改成 swap 格式並啟用它，

```bash
sudo /sbin/mkswap /var/swap.1
sudo /sbin/swapon /var/swap.1
```

修改 fstab 讓每次開機都有這個 swap 設定，

```
# /etc/fstab
/var/swap.1 none swap defaults 0 0
```

用 `free -h`、`cat /proc/meminfo` 檢查此時應該有個 1GB swap 了。


#### Git repo ssh config

再來是 code 的同步與更新。autobuild server 只要更新 source code，但 cpython-tw source 需要定時 commit 新的翻譯，因此 deploy server 會有修改 git repo 的權限。

不應該使用自己的 SSH key，deploy server 上應該有專屬的 deploy key，其中 cpython-tw 的 deploy key 有寫入權限（即可以 commit）。

查了一下，要讓不同 git repo 使用不同的 SSH key 也不複雜。以這邊的例子，先修改 `~/.ssh/config` 加入兩個新的 host，使用不同的 SSH key：

```
Host github-pydoc_autobuild
  HostName github.com
  User git
  IdentityFile /home/pydoc/.ssh/id_rsa.pydoc_autobuild

Host github-cpython_tw
  HostName github.com
  User git
  IdentityFile /home/pydoc/.ssh/id_rsa.cpython_tw
```

建立對應的 SSH keypair，

```bash
ssh-keygen -t rsa -f ~/.ssh/id_rsa.pydoc_autobuild
ssh-keygen -t rsa -f ~/.ssh/id_rsa.cpython_tw
```

把兩個 repo 的 URL host 換掉，

```
git remote set-url origin git@github-pydoc_autobuild:python-doc-tw/pydoc_autobuild.git
```

這樣兩個 repo 會透過給定的 ssh key 連線。GitHub 會顯示每個 key 最近使用的時間，檢查時間就能確認設定正確與否（而且改 host 沒設定對應該直接連不上）。


### Django Stack -- nginx + uWSGI

在本地開發都用 `python manage.py runserver` 啟動 Django。但上線時內建的 runserver 就無法同時間服務太多人。因此需要像 nginx、uWSGI 等工具來協助。

參照 uWSGI [*Setting up Django and your web server with uWSGI and nginx*][uwsgi-doc-django] 一文以及 TP 寫的 《為程式人寫的 Django Tutorial》系列文中 [*Day 27 - Deploy to Ubuntu server*](https://github.com/uranusjr/django-tutorial-for-programmers/blob/master/25-deploy-to-ubuntu-server.md) 關於部署的文章。

Autobuild server 有特別為 production 寫一份設定檔，切換時只要設定成 `settings.production` 即可。在 Django 設定部份，建議把所有路徑都設成絕對路徑（包含執行檔）。不然後續在設定 systemd 要調整很多環境變數，systemd 也不會帶入使用者的 PATH 變數，不用絕對路徑其實蠻麻煩的也容易錯。

#### nginx 設定

nginx 會接受 incoming HTTP request，需要跟 Django server 聯絡時，就會會連到 uWSGI 開的 UNIX socket。

我們先假設 uWSGI 這段沒問題，首先設定 nginx 本身。由於 static files 在 nginx 就直接導到對應的檔案，不會經過 uWSGI ，所以設定好 nginx 之後 pydoc 文件本身就上線了。用這個來測試設定的正確性。

對本網站而言，/static 導到 Django staticfiles；/3/、/3.5/ 導到 pydoc build HTML 的路徑；其餘路徑再交給 Django 處理。其中，/3.5/\* 的連結將重新導向到 /3/\* 上。

整理上述的需求，寫個 nginx 設定檔在 `/etc/nginx/sites-available/pydoc_autobuild.conf`：

```nginx
# Upstream Django setting; the socket nginx connects to
upstream django {
    server unix:///var/run/django/pydoc_autobuild.sock;
}

server {
    listen      80;
    listen      443 default ssl;

    server_name docs.python.org.tw
                52.69.170.26
                ;
    charset     utf-8;

    client_max_body_size 10M;  # max upload size
    keepalive_timeout 15;

    location /static {
        alias /path/to/code/pydoc_autobuild/assets;
    }

    location /3 {
        alias /path/to/code/cpython-tw/Doc/build/html;
    }

    location ~ /3\.5/(.*) {
        return 302 /3/$1;
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     /etc/nginx/uwsgi_params;
    }
}
```

再把檔案 soft link 到 `/etc/nginx/sites-enabled/`，更新 nginx 設定：

```bash
cd /etc/nginx/sites-available/
sudo ln -s pydoc_autobuild.conf ../sites-enabled/
sudo systemctl reload nginx
```

確定 pydoc 上線就可以專心處理 uWSGI 了。

#### uWSGI 設定

uWSGI 在 VENV 外也要裝，我覺得還是用 pip 比較簡單，雖然這樣就要自己注意 uWSGI 的版本更新了：

```
sudo python3.5 -m pip install uwsgi
```

把 uWSGI 設定存成 `pydoc_autobuild_uwsgi.ini` 並且在測試時，都使用：

```
sudo uwsgi --ini pydoc_autobuild_uwsgi.ini
```

模擬實際上的執行方式，這樣之後改用 systemd 執行才不會又丟一堆權限的問題。設定檔的內容：

```uwsgi
[uwsgi]
chdir        = /path/to/code/pydoc_autobuild
# Django's wsgi file
module       = pydoc_autobuild.wsgi:application
env          = DJANGO_SETTINGS_MODULE=pydoc_autobuild.settings.production
# the virtualenv (full path)
home         = /path/to/VENV

# process-related settings
# master
master       = true
# maximum number of worker processes
processes    = 4
# the socket (use the full path to be safe
socket       = /var/run/django/pydoc_autobuild.sock
# ... with appropriate permissions - may be needed
chmod-socket = 664
uid          = pydoc
gid          = www-data
# clear environment on exit
vacuum       = true
```

權限上的設定可能要花點時間處理一下，nginx 使用 www-data/www-data 的身份執行，socket 要確定 nginx 能讀寫，但我的 code 放在 pydoc 使用者路徑下，用 www-data 可能會有權限的問題。建議把 uid、gid 都設定好。

過程中，搭配 nginx 的錯誤訊息比較好 debug：

```
sudo less +F /var/log/nginx/error.log
```

成功後，再用 uWSGI 的 Emperor mode，把設定檔丟到一個路徑底下（該路徑稱為 vassals）。uWSGI 在 Emperor mode 時會自動把 vassals 路徑內所有設定檔都讀進來並執行。

這裡 vassals 路徑使用 `/etc/uwsgi/vassals/`。因為有設 uid、gid，跑的時候就不用再設了：

```
sudo uwsgi --emperor /etc/uwsgi/vassals
```

這樣應該 Django 相關的 view 都沒問題了。接下來，要把啟動 uWSGI 的步驟交給系統來管理。


### Systemd services

Autobuild server 包含兩個部份：Django Server 與 Django-Q cluster。所以寫成 systemd service 時會有兩個服務。

Debian system service 放在 `/etc/systemd/system/` 底下，因此建立 `uwsgi.service` 和 `qcluster.service` 分別管理 uWSGI Emperor mode 和 Django-Q cluster。

`uwsgi.service` 參考 uWSGI 官網 [*Django and Systemd*][uwsgi-doc-systemd] 一文的設定：

```systemd
[Unit]
Description=uWSGI Emperor
After=syslog.target

[Service]
ExecStart=/usr/local/bin/uwsgi --emperor /etc/uwsgi/vassals
RuntimeDirectory=uwsgi
Restart=always
KillSignal=SIGQUIT
Type=notify
StandardError=syslog
NotifyAccess=all

[Install]
WantedBy=multi-user.target
```

`qcluster.service` 算是自己硬寫模擬 `python manage.py qcluster` 行為。因此環境變數都要設定好（當然用絕對路徑就沒問題了，我只是覺得這樣 build log 內的執行檔路徑都很長會很醜 xd）

```systemd
[Unit]
Description=Django-Q Cluster for site pydoc_autobuild
After=syslog.target
Wants=uwsgi.service

[Service]
User=pydoc
Group=www-data
Environment=VIRTUAL_ENV=/path/to/VENV
Environment=PATH=/path/to/VENV/bin:$PATH
Environment=DJANGO_SETTINGS_MODULE=pydoc_autobuild.settings.production
WorkingDirectory=/path/to/code/pydoc_autobuild
ExecStart=/path/to/VENV/bin/python manage.py qcluster
Restart=always
KillSignal=SIGQUIT
Type=simple
NotifyAccess=none
StandardError=syslog

[Install]
WantedBy=multi-user.target
```

這樣的設定檔應該不是 systemd 的慣例，我還在想是不是應該要改寫到 user service 去（但我不會）。

加入到 systemd 之後管理就很簡單，啟動這兩個 service：

```
sudo systemctl enable uwsgi
sudo systemctl enable qcluster
```

查看他們的狀態：

```
sudo systemctl status uwsgi
sudo systemctl status qcluster
```

查看它們的 log 也變得很簡單，因為有把它們的 stderr 抓起來。systemd 好處是 rotation 等等都會幫你注意，看 log 的功能也很多。

例如要查最近一小時 uWSGI 的連線記錄，並在有新連線時持續更新 log：

```
sudo journalctl -xef -u uwsgi --since '1 hour ago'
```



## 總結

介紹了 [Python 說明文件翻譯計畫][python-doc-tw]，線上文件autobuild server 基於 Django 與 Django-Q 的架構，以及在 Debian 上結合 nginx、uWSGI、systemd 的部署設定。

查資料時覺得文章還不多，只有幾篇像 [*How to Set Up Django with Nginx, uWSGI & systemd on Debian/Ubuntu*][Django-uwsgi-systemd] 的文章，剩下要自己組裝還是要花一點時間。同時也把部署 pydoc server 的設定都記在這，將來要重建也比較簡單。

關於說明文件翻譯，應該會再花篇文章好好寫整個計畫本身。

（是說如果有人能從頭看到尾的話，給個回饋吧 > <）

[pydoctw-build-server]: http://docs.python.org.tw/_build/
[pydoctw-doc]: http://docs.python.org.tw/3/
[pydoctw-doc-tutorial]: http://docs.python.org.tw/3/tutorial/index.html
[pydoctw-wiki]: https://github.com/python-doc-tw/python-doc-tw/wiki
[pydoctw-wiki-local-build]: https://github.com/python-doc-tw/python-doc-tw/wiki/How-to-build-the-doc-locally

[python-doc-tw]: https://github.com/python-doc-tw/python-doc-tw
[pydoc_autobuild]: https://github.com/python-doc-tw/pydoc_autobuild
[cpython-tw]: https://github.com/python-doc-tw/cpython-tw

[Sphinx]: http://www.sphinx-doc.org/en/stable/
[Jinja2]: http://jinja.pocoo.org/docs/dev/
[Transifex]: https://www.transifex.com/
[Django]: https://www.djangoproject.com/
[Django Packages]: https://www.djangopackages.com/
[Celery]: http://www.celeryproject.org/
[Rabbit-MQ]: https://www.rabbitmq.com/
[Redis]: http://redis.io/
[uWSGI]: http://uwsgi-docs.readthedocs.org/en/latest/index.html
[systemd]: https://www.freedesktop.org/wiki/Software/systemd/
[BCP 47]: http://www.ietf.org/rfc/bcp/bcp47.txt
[Babel]: http://babel.pocoo.org/

[uwsgi-doc-systemd]: http://uwsgi-docs.readthedocs.org/en/latest/Systemd.html
[uwsgi-doc-django]: http://uwsgi-docs.readthedocs.org/en/latest/tutorials/Django_and_nginx.html
[Django-uwsgi-systemd]: https://luxagraf.net/src/how-set-django-uwsgi-systemd-debian-8

[django-Q]: https://django-q.readthedocs.org/

[postgres-debian]: {filename}../2016-01/0125_postgres_debian_osx.md
