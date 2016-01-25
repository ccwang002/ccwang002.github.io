---
Title: 安裝 PostgreSQL 9 於 Debian Jessie / OSX
Slug: postgresql-install
Date: 2016-01-25 17:00
Tags: zh, postgresql, debian, osx
Category: Coding
---

平常用最多的是 [SQLite]，但 [PostgreSQL] 有很多好用的功能，每次要用想不起來怎麼裝。總之把相關設定的筆記存在這。

用 [Debian Jessie] (Debian 8.3) 與 OSX [Homebrew] 舉例。不過 OSX 大概也不會沒事把 PostgreSQL 開著，主要是著重在 Debian 的環境設定上。目前 PostgreSQL 出到 9.5 但 Debian stable 是 9.4。基本設定應該完全沒差別。

[SQLite]: https://www.sqlite.org/
[PostgreSQL]: http://www.postgresql.org/
[Debian Jessie]: https://www.debian.org/releases/stable/
[Homebrew]: http://brew.sh/

[TOC]

## 安裝 PostgreSQL

### 安裝在 OSX

```console
brew install postgresql
```

要用的時候手動把 PostgreSQL server 打開，

```console
postgres -D /usr/local/var/postgres
```

PostgreSQL 的設定參考 Debian 的版本。

### 安裝在 Debian Jessie

```console
$ sudo apt-get install postgresql-9.4
```

現在系統服務都由 [Systemd][systemd] 管理了，檢查 PostgreSQL 有沒有跑起來透過 `systemctl` 這指令就可以。

```console
# systemctl status postgresql.service
● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)
   Active: inactive (dead) since Mon 2016-01-25 17:26:08 CST; 4s ago
  Process: 913 ExecStart=/bin/true (code=exited, status=0/SUCCESS)
 Main PID: 913 (code=exited, status=0/SUCCESS)
```

不過這 service 看不太到什麼運行的資訊，其實是個 dummy service，它會 trigger 可能很多個 PostgreSQL database cluster 什麼的。預設只有一個 `main` 的 cluster。
 
``` console
# systemctl status postgresql@9.4-main.service
● postgresql@9.4-main.service - PostgreSQL Cluster 9.4-main
   Loaded: loaded (/lib/systemd/system/postgresql@.service; disabled)
   Active: active (running) since Mon 2016-01-25 17:26:30 CST; 4min 7s ago
  Process: 9641 ExecStop=/usr/bin/pg_ctlcluster -m fast %i stop (code=exited, status=0/SUCCESS)
  Process: 9717 ExecStart=postgresql@%i %i start (code=exited, status=0/SUCCESS)
 Main PID: 9723 (postgres)
   CGroup: /system.slice/system-postgresql.slice/postgresql@9.4-main.service
           ├─9723 /usr/lib/postgresql/9.4/bin/postgres -D /var/lib/postgresql/9.4/main -c config_file=/etc/postgr...
           ├─9725 postgres: checkpointer process
           ├─9726 postgres: writer process
           ├─9727 postgres: wal writer process
           ├─9728 postgres: autovacuum launcher process
           └─9729 postgres: stats collector process
```

[systemd]: http://freedesktop.org/wiki/Software/systemd/



## 初始個人的 Database

在 OSX 上用 homebrew 安裝 PostgreSQL 的使用者會有 superuser 的權限，反正是本地開發也沒差，建 database 等設定都比較簡單。

在 Debian 上的話，有這 superuser 權限的使用者為 `postgres`。所以預設使用者（這邊以 `vm` 為例）會無法連線。

```console
$ psql
psql: FATAL:  role "vm" does not exist
```

切到 root 再切到 postgres 身份就能用 `psql` （PostgreSQL 的 REPL shell）連到 database。用 `\q` 就可以退出 psql。

```console
$ sudo -u postgres psql
[sudo] password for vm:
psql (9.4.5)
Type "help" for help.

postgres=# \q
$
```

但用 postgres 這 superuser 去連資料庫不是很安全，一開始養成好習慣應該用個人帳號。所以接下來要完成：

1. 建立同使用者名稱的 PostgreSQL 帳號
2. 建立與帳號同名稱的 database


### 建立同使用者名稱的 PostgreSQL 帳號

在 Debian 上可以用 `$USER` 來抓到現在登入者的帳號，即使用 sudo 切換身份這環境變數的值不會變。（讀 [Ubuntu wiki](https://help.ubuntu.com/community/PostgreSQL) 看到的技巧）

擔心的話就直接在有 `$USER` 的地方打出帳號即可。先確認一下，

```console
vm@vm-debian:~$ echo $USER
vm
vm@vm-debian:~$ sudo -u postgres echo $USER
vm
```

建立使用者是透過 `createuser` 這指令。這是使用者帳號就不給太多權限。

```console
$ sudo -u postgres createuser --interactive $USER
Shall the new role be a superuser? (y/n) n
Shall the new role be allowed to create databases? (y/n) n
Shall the new role be allowed to create more new roles? (y/n) n
```

這時候透過 `psql` 看就會多一個使用者。

```psql
-- Run with command `sudo -u postgres psql`
postgres=# \du
                             List of roles
 Role name |                   Attributes                   | Member of
-----------+------------------------------------------------+-----------
 postgres  | Superuser, Create role, Create DB, Replication | {}
 vm        |                                                | {}
```

### 建立與帳號同名稱的 database

透過 `createdb` 這指令。把與帳號同名 database 的 owner 設定成該帳號。

```console
$ sudo -u postgres createdb --owner=$USER $USER
```

要多建別的 database 給這帳號也沒問題，例如名為 `vm_database` 的 database，

```console
$ sudo -u postgres createdb --owner=$USER vm_database
```

### 用使用者帳號連接 psql

這時候打 `psql` 就沒問題了。

```console
$ psql
psql (9.4.5)
Type "help" for help.

vm=> \conninfo
You are connected to database "vm" as user "vm" via socket in "/var/run/postgresql" at port "5432".
```

Prompt 從 `#=` 變成 `=>` 表示現在連線的使用者不是 superuser。透過 psql 的指令 `\l` 或 `\l+` 可以看現在所有的 database：

```psql
vm=> \l
                                   List of databases
    Name     |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges
-------------+----------+----------+-------------+-------------+-----------------------
 postgres    | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 template0   | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
             |          |          |             |             | postgres=CTc/postgres
 template1   | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
             |          |          |             |             | postgres=CTc/postgres
 vm          | vm       | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 vm_database | vm       | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
(5 rows)
```

連另一個 database `vm_database` 也很簡單，

```console
$ psql -d vm_database
psql (9.4.5)
Type "help" for help.

vm_database=>
```


## psql 指令

psql 的指令很多，用 `\?` 可以看到列表。完整的版本可以見[官網 psql meta-commands] 的介紹。底下列幾個常用的：

~~~
\l          # list all database
\d          # list tables in current database
\du         # list roles
\conninfo   # show current SQL connection
\q          # quit
help        # print a hub message for all kinds of help
~~~

[官網 psql meta-commands]: http://www.postgresql.org/docs/9.4/static/app-psql.html#APP-PSQL-META-COMMANDS



## 刪除使用者、Database

各有一個指令對應。

```console
$ dropuser <usr>
$ dropdb <db>
```


## 進階主題

### 透過 psql 創建使用者帳號、資料庫

Ref: <http://www.cyberciti.biz/faq/howto-add-postgresql-user-account/>

```psql
-- Run with command `sudo -u postgres psql -d template1`
template1=# CREATE USER <usr> WITH PASSWORD '<pwd>';
template1=# CREATE DATABASE <db>;
template1=# GRANT ALL PRIVILEGES ON DATABASE <db> TO <usr>;
```



### PostgreSQL Logging

設定在 `/etc/postgresql/9.4/main/postgresql.conf` 裡。不同管理 log 的方式就要選擇不同的 `log_destination`。

1. PostgreSQL 自己管：`stderr`, ...
2. 透過 [Systemd][systemd]：`syslog`

不過我沒深入研究就是，看那個 conf 裡很多設定可以調整。設定修改後要 restart PostgreSQL cluster，

```bash
sudo systemctl restart postgresql.service
```


#### Logging 讓 PostgreSQL 自己管

```cfg
# At /etc/postgresql/9.4/main/postgresql.conf
log_destination = 'stderr' 
logging_collector = on                              
```

Log files 預設寫在 `/var/lib/postgresql/9.4/main/pg_log/`。


#### Logging 透過 Systemd

我覺得 systemd 的優點之一就是能把 log 都集中管理，只要照它的規則，就能用一樣的方法管理 logging 是蠻方便的。

```cfg
# At /etc/postgresql/9.4/main/postgresql.conf
log_destination = 'syslog'  
logging_collector = off   # on 也只會說被導向到 syslog 了                             
```

這時候重啟服務，再看 `systemctl status` 就能看到最近的 log 了。

```console
# systemctl status postgresql@9.4-main
● postgresql@9.4-main.service - PostgreSQL Cluster 9.4-main
   Loaded: loaded (/lib/systemd/system/postgresql@.service; disabled)
   Active: active (running) since Mon 2016-01-25 17:52:02 CST; 1min 13s ago
  Process: 14632 ExecStop=/usr/bin/pg_ctlcluster -m fast %i stop (code=exited, status=0/SUCCESS)
  Process: 14641 ExecStart=postgresql@%i %i start (code=exited, status=0/SUCCESS)
 Main PID: 14648 (postgres)
   CGroup: /system.slice/system-postgresql.slice/postgresql@9.4-main.service
           ├─14648 /usr/lib/postgresql/9.4/bin/postgres -D /var/lib/postgresql/9.4/main -c config_file=/etc/postg...
           ├─14650 postgres: checkpointer process
           ├─14651 postgres: writer process
           ├─14652 postgres: wal writer process
           ├─14653 postgres: autovacuum launcher process
           └─14654 postgres: stats collector process

Jan 25 17:52:00 vm-debian postgres[14648]: [1-1] 2016-01-25 17:52:00 CST [14648-1] LOG:  ending log output to stderr
Jan 25 17:52:00 vm-debian postgres[14648]: [1-2] 2016-01-25 17:52:00 CST [14648-2] HINT:  Future log output ...log".
Jan 25 17:52:00 vm-debian postgres[14649]: [2-1] 2016-01-25 17:52:00 CST [14649-1] LOG:  database system was...9 CST
Jan 25 17:52:00 vm-debian postgres[14649]: [3-1] 2016-01-25 17:52:00 CST [14649-2] LOG:  MultiXact member wr...abled
Jan 25 17:52:00 vm-debian postgres[14648]: [2-1] 2016-01-25 17:52:00 CST [14648-3] LOG:  database system is ...tions
Jan 25 17:52:00 vm-debian postgres[14653]: [2-1] 2016-01-25 17:52:00 CST [14653-1] LOG:  autovacuum launcher started
Jan 25 17:52:00 vm-debian postgres[14658]: [3-1] 2016-01-25 17:52:00 CST [14658-1] [unknown]@[unknown] LOG: ...acket
Jan 25 17:52:38 vm-debian postgres[14793]: [3-1] 2016-01-25 17:52:38 CST [14793-1] root@root FATAL:  role "r...exist
Hint: Some lines were ellipsized, use -l to show in full.
```

或用 systemd 標準看 log 的方式 `journalctl`

```console
# journalctl -u postgresql@9.4-main 
-- Logs begin at Mon 2016-01-25 16:46:25 CST, end at Mon 2016-01-25 19:22:07 CST. --
Jan 25 17:47:06 vm-debian postgres[13699]: [1-1] 2016-01-25 17:47:06 CST [13699-1] LOG:  redirecting log output to logging collector process
Jan 25 17:47:06 vm-debian postgres[13699]: [1-2] 2016-01-25 17:47:06 CST [13699-2] HINT:  Future log output will appear in directory "pg_log".
Jan 25 17:47:06 vm-debian postgres[13699]: [2-1] 2016-01-25 17:47:06 CST [13699-3] LOG:  ending log output to stderr
Jan 25 17:47:06 vm-debian postgres[13699]: [2-2] 2016-01-25 17:47:06 CST [13699-4] HINT:  Future log output will go to log destination "syslog".
Jan 25 17:47:06 vm-debian postgres[13701]: [3-1] 2016-01-25 17:47:06 CST [13701-1] LOG:  database system was shut down at 2016-01-25 17:47:05 CST
Jan 25 17:47:06 vm-debian postgres[13701]: [4-1] 2016-01-25 17:47:06 CST [13701-2] LOG:  MultiXact member wraparound protections are now enabled
Jan 25 17:47:06 vm-debian postgres[13699]: [3-1] 2016-01-25 17:47:06 CST [13699-5] LOG:  database system is ready to accept connections
Jan 25 17:47:06 vm-debian postgres[13705]: [3-1] 2016-01-25 17:47:06 CST [13705-1] LOG:  autovacuum launcher started
Jan 25 17:47:07 vm-debian postgres[13710]: [4-1] 2016-01-25 17:47:07 CST [13710-1] [unknown]@[unknown] LOG:  incomplete startup packet
Jan 25 17:49:30 vm-debian postgres[14170]: [4-1] 2016-01-25 17:49:30 CST [14170-1] root@root FATAL:  role "root" does not exist
...
```


## Reference

- [How to Install and Use PostgreSQL 9.4 on Debian 8](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-9-4-on-debian-8) by Digital Ocean
- [PostgreSQL](https://wiki.archlinux.org/index.php/PostgreSQL) on Arch Wiki
- [PostgreSQL](https://wiki.debian.org/PostgreSql) on Debian wiki
- [PostgreSQL](https://help.ubuntu.com/community/PostgreSQL) on Ubuntu wiki




