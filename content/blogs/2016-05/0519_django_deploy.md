---
Title: 使用 uWSGI, nginx, and systemd 部署 Django
Slug: django-deploy-uwsgi-nginx-systemd
Date: 2016-05-19
Tags: zh, python, django, postgresql, deploy, debian, systemd, nginx, uwsgi
Category: Coding
---

上一次很認真的 Django 部署記錄在[《設定 Python 官方文件中文化自動更新 Server》][pydoctw-server]一文。很巧地自己畢業的題目也要架個 Django 網站，所以就再跑了一次部署設定。舊文還提了有的沒的，這篇僅針對 Django 的部署。

這邊的部署設定都儘量不使用 root 權限，整個連線的流程圖如下：

```
nginx -- unix socket -- uWSGI -- Django
```

寫一個名為 `PROJ.service` 的 systemd unit 來管理這網站的啟動與否。之後 `PROJ` 就換成自己的專案名稱；`USER` 就換成執行網站的帳號。

[TOC]


### 作業系統
使用 Ubuntu 16.04 LTS。我對 Ubuntu 其實沒愛，但因為很多人用，畢業之後應該還找得到人維護。他跟 Debian 差不多，所以跟舊文沒什麼差別。Ubuntu 16 內建就有 Python 3.5，不用再裝；PostgreSQL 也來到 9.5 版。

使用 [unattended-upgrades] 定期更新與 security 相關的套件，它預設一天檢查一次，更新的記錄會在 `/var/log/unattended-upgrades` 目錄中。


### PostgreSQL
參考[《安裝 PostgreSQL 9 於 Debian Jessie / OSX》][postgres-debian]一文設定。建立跟 OS user 同名的 PostgreSQL 帳號，給了建立 database 的權限，這樣開發比較方便。不用設定密碼。


### Django PROJ
使用內建 [venv] 在自己家目錄下某處，建立名為 `VENV` 的虛擬環境：

```bash
python3.5 -m venv VENV
```

有關部署的設定（即 `settings.py`），利用 [django-environ] 把 secret key、database 連線資訊、寄信 SMTP server 等設定寫在獨立的檔案，就可以讓 local 和 production 環境讀到各自的設定。具體的做法可以參考 [PyCon Taiwan 2016 網站管理設定][pycontw2016-settings] 的寫法。

在連 PostgreSQL 時使用 local connection (Unix-domain socket)，即使用者同名的身份。

```ini
DATABASE_URL=postgres:///TABLE_NAME
```


### tmpfiles.d

把 nginx 與 uwsgi 溝通用的 socket 放在 `/run/PROJ` 底下，但這也表示重開機之後，`/run/PROJ` 資料夾就會消失不見，所以使用 [tmpfiles.d][tmpfiles.d][^systemd-runtimedir]。除了資料夾的命名改成用專案名稱，設定都跟[舊文][pydoctw-server]一樣。

[^systemd-runtimedir]: 也可以用 [systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) 提到的 `RuntimeDirectory=PROJ` 來建立執行用目錄。但因為 `PROJ.service` 的 USER 必須是 root，這種情況 man page 就建議改用 tmpfiles.d。我覺得應該能解決使用 root 權限的問題，但太懶了就先這樣……


### nginx

nginx 設定跟[舊文][pydoctw-server]一樣。放在 `/etc/nginx/sites-available/PROJ.conf`

```nginx
# Upstream Django setting; the socket nginx connects to
upstream django {
    server unix:///run/PROJ/django.sock;
}

server {
    listen      80;
    listen      443 default ssl;

    server_name 123.123.123.123
                ;
    charset     utf-8;

    client_max_body_size 10M;  # max upload size
    keepalive_timeout 15;

    location /static {
        alias /path/to/PROJ/assets;
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     /etc/nginx/uwsgi_params;
    }
}
```

`/path/to/PROJ/assets` 是 Django [STATIC_ROOT] 的路徑。只要執行 `python manage.py collectstatic` 後，即使 uWSGI 還沒設定就可以測試 /static/.../ 有沒有被 nginx 抓到。 

啟動時，先把檔案連結到 `/etc/nginx/site-enabled/`，重載 nginx 設定：

```bash
cd /etc/nginx/sites-available/
sudo ln -s PROJ.conf ../sites-enabled/
sudo systemctl reload nginx
```


### uWSGI
跟舊文最大的差別，只要裝在 VENV 裡面就好了；然後也不使用 emperor mode。寫一個 `/etc/uwsgi/vassals/PROJ.ini` 放設定：

```ini
[uwsgi]
chdir        = /path/to/PROJ
# Django's wsgi file
module       = PROJ.wsgi:application
env          = DJANGO_SETTINGS_MODULE=PROJ.settings.production
# the virtualenv (full path)
home         = /path/to/VENV

# process-related settings
# master
master       = true
# maximum number of worker processes
processes    = 4
# the socket (use the full path to be safe
socket       = /run/PROJ/django.sock
# ... with appropriate permissions - may be needed
chmod-socket = 664
uid          = USER
gid          = www-data
# clear environment on exit
vacuum       = true
```

設定好後執行以下指令，就應該能看到網站能動了。

```bash
sudo /path/to/VENV/bin/uwsgi --ini /etc/uwsgi/vassals/PROJ.ini
```


### systemd

這邊除了執行 uWSGI 的指令不同外，都跟[舊文][pydoctw-server]相同。Debian 系 systemd system unit 設定檔放在 `/etc/systemd/system/PROJ.service`：

```systemd
[Unit]
Description=PROJ's Django server by uWSGI
After=syslog.target

[Service]
ExecStart=/path/to/VENV/bin/uwsgi --ini /etc/uwsgi/vassals/PROJ.ini
Restart=always
KillSignal=SIGQUIT
Type=notify
StandardError=syslog
NotifyAccess=all

[Install]
WantedBy=multi-user.target
```

這邊設定它會（有錯誤時）自動重新起動，並把 stderr 導到 syslog。接著，就要啟動這個 `PROJ.service` 服務：

```bash
sudo systemctl enable PROJ
sudo systemctl status PROJ
```

可以透過 `sudo journalctl -xe -u PROJ` 來查看 uWSGI 執行、連線 log。

### 確認、總結

重啟系統一次，如果網站還活著，就表示一切設定都沒問題。整體上不太複雜，但權限不符的錯誤可能會讓你鬼打牆，要有耐心。

[django-environ]: https://github.com/joke2k/django-environ
[postgres-debian]: {filename}../2016-01/0125_postgres_debian_osx.md
[pydoctw-server]: {filename}../2016-02/0214_pydoctw_server.md
[pycontw2016-settings]: https://github.com/pycontw/pycontw2016/blob/master/src/pycontw2016/settings/production.py
[STATIC_ROOT]: https://docs.djangoproject.com/en/1.9/ref/settings/#std:setting-STATIC_ROOT
[tmpfiles.d]: https://www.freedesktop.org/software/systemd/man/tmpfiles.d.html
[unattended-upgrades]: https://wiki.debian.org/UnattendedUpgrades
[venv]: https://docs.python.org/3/library/venv.html
