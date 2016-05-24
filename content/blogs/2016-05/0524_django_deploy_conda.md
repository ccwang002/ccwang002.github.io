---
Title: 使用 conda env 部署 Django
Slug: django-deploy-conda
Date: 2016-05-24
Tags: zh, python, django, postgresql, deploy, debian, systemd, nginx, uwsgi, conda
Category: Coding
---

沒幾天前剛部署一次 Django，記錄在[《使用 uWSGI、nginx、systemd 部署 Django》][django-deploy]。今天又部署了另一個專案。部署的設定跟上次一樣：

```
nginx -- unix socket -- uWSGI -- Django
```

一樣寫一個 `PROJ.service` 的 systemd unit 來管理網站的啟動 (uWSGI)。之後提到 `PROJ` 時就換成自己的專案名稱；`USER` 就換成執行網站的帳號。

[TOC]

### conda

[conda] 是一個 Python 套件的管理系統，他的好處是，遇到要使用外部 library 時，會這些套件相依的 library 都一併安裝管理，也可以管理不同 Python 版本。可以想像是加強版的 pip + venv。conda 跟 pip 是相容的。
 
這個 Django 專案就用到很多像 numpy、pandas 的套件。為了維護方便，我考慮用 conda 來安裝。我使用的是 [miniconda3]，預設會安裝在 `~/miniconda3` 底下，虛擬環境會出現在 `~/miniconda3/envs/`。


```bash
$ conda create -n VENV python=3.5 numpy pandas django
$ source activate VENV
(VENV) $ pip install uwsgi
```

uWSGI 沒有在 conda 裡面，所以就用 pip 裝。從[上次的文章][django-deploy]知道系統並不用安裝。


### uWSGI 和 $PATH

理論上，之後就照著上次操作就好，但在 uWSGI 就碰到問題：

```pycon
$ sudo /home/USER/miniconda3/envs/VENV/bin/uwsgi --ini PROJ.ini
[uWSGI] getting INI configuration from PROJ.ini
*** Starting uWSGI 2.0.13.1 (64bit) on [Wed May 25 08:04:23 2016] ***
compiled with version: 5.3.1 20160413 on 25 May 2016 01:35:28
os: Linux-4.4.0-22-generic #40-Ubuntu SMP Thu May 12 22:03:46 UTC 2016
nodename: s66
machine: x86_64
clock source: unix
detected number of CPU cores: 24
current working directory: /etc/uwsgi/vassals
detected binary path: /home/USER/miniconda3/envs/VENV/bin/uwsgi
……
chdir() to /path/to/PROJ/
your processes number limit is 514650
your memory page size is 4096 bytes
detected max file descriptor number: 1024
lock engine: pthread robust mutexes
thunder lock: disabled (you can enable it with --thunder-lock)
uwsgi socket 0 bound to UNIX address /run/PROJ/django.sock fd 3
Python version: 3.5.1 |Continuum Analytics, Inc.| (default, Dec  7 2015, 11:16:01)  [GCC 4.4.7 20120313 (Red Hat 4.4.7-1)]
Set PythonHome to /home/USER/miniconda3/envs/VENV
Failed to import the site module
Traceback (most recent call last):
  File "/usr/lib/python3.5/site.py", line 580, in <module>
    main()
  …… 
  File "/usr/lib/python3.5/_sysconfigdata.py", line 6, in <module>
    from _sysconfigdata_m import *
ImportError: No module named '_sysconfigdata_m'
```

但因為步驟實在太簡單，想不出來哪裡有錯，查網路也沒什麼相關的結果。在這邊卡了很久。

結果後來才發現，Traceback 那邊 uWSGi 跑去讀到 `/usr/lib/python3.5/site.py`，這表示一定有環境設錯才讓它找到這個不是我們要的 python 環境，理論上應該是找到 `/home/USER/miniconda3/envs/VENV/lib/python3.5/site.py` 才對。

經過一陣嘗試，發現只要修改 `$PATH` 環境變數就能運作了。

```console
$ sudo -i
# echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
# export PATH=/home/USER/miniconda3/envs/VENV/bin:$PATH
# /home/USER/miniconda3/envs/VENV/bin/uwsgi --ini PROJ.ini
```

### 在 sysmted unit 使用環境變數

根據 [systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#%24PATH) 關於 `$PATH` 環境變數的使用：

> Colon-separated list of directories to use when launching executables. Systemd uses a fixed value of /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin. 

預設只有以上提到的路徑，如果要修改環境變數的話，就透過 [`Environment=`](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Environment=)，因此多加了一行在 systemd unit 裡。其餘的設定都是相同的。

```systemd
[Unit]
Description=PROJ Django server by uWSGI
After=syslog.target

[Service]
Environment="PATH=/home/USER/miniconda3/envs/VENV/bin:$PATH"
ExecStart=/home/USER/miniconda3/envs/VENV/bin/uwsgi --ini /etc/uwsgi/vassals/PROJ.ini
Restart=always
KillSignal=SIGQUIT
Type=notify
StandardError=syslog
NotifyAccess=all

[Install]
WantedBy=multi-user.target
```

### 結論

如果要改用 conda 管理套件的話，只要在 systemd unit 那邊多加一行修改 $PATH，加入虛擬環境放執行檔的路徑，其餘的設定都與一般 Python 虛擬環境相同。這樣就搞定了。但這個問題花了我 1 個多小時……

[conda]: http://conda.pydata.org/
[django-deploy]: {filename}0519_django_deploy.md
[miniconda3]: http://conda.pydata.org/miniconda.html
