---
Title: Django Login by Email
Slug: django-email-login
Date: 2015-11-06
Tags: zh, django
Status: draft
Category: Coding
---

呈接[上一篇]內容，將 Django 登入改成用 Email 和密碼。

在這個例子我們會重寫 User model 而不是 extending，並直接把 username 拿掉了。因為是自己寫 model，所以如果需要什麼額外的欄外，要加也不難（例如把 username/nickname 再加回來…）

在做 email 登入的時候，通常要確保使用者真的擁有這個 email。確認的方式，最簡單就是寄一個開通連結到那個信箱。在一個時間內點開那個連結，就可以開通這個帳號。當然使用者猜不出來連結跟帳號的關連，不能自己產生。

我們會從頭寫，因為是給實驗室的同學們練習用，並不會用[上一篇]介紹的 [django-custom-user]。完成練習之後可以自己比較，基本上大同小異。會分成兩個階段：

1. 換掉內建的 django.contrib.auth.**User** Model，改用 email 登入。
2. 利用 [django-allauth] 做到 email 認証開通的功能。

沒有意外也會是篇長文。大家可以用目錄隨意看：

[TOC]

[上一篇]: {filename}./1104_django_custom_user.md
[django-custom-user]: https://github.com/jcugat/django-custom-user
[django-allauth]:http://www.intenct.nl/projects/django-allauth/


## 環境設定

會用到這些套件。IPython 和 flake8 只是開發時的便利性，不裝也沒有差。

```
# requirements.txt
django >=1.8, <1.9
django-allauth >=0.23  # <-- 新的用來做登入整合
IPython >=4.0, <5
flake8
```

[django-allauth] 是以前沒有用到的第三方套件。他叫 allauth 不是隨便說說，除了提供 User model email 的認証機制外，還實做了 OpenID 登入，所以之後還可以加上 Facebook、Twitter、Github 帳號登入的功能。OpenID 這次沒有使用就是。

安裝就不再提了，一樣建議裝在 virtualenv 裡。

```bash
$ pip install -r requirements.txt
```

### Django 專案

建立一個 djauth_demo 的專案，同時開兩個 app：**demo_site**、**custom_user**。**demo_site** 用來放一些像首頁啊等有的沒的 view、template；**custom_user** 實作新的帳號登入

```bash 
$ django-admin startproject djauth_demo
$ cd djauth_demo
$ python manage.py startapp demo_site
$ python manage.py startapp custom_users
```

所以專案目前長得像這樣：

```tree
djauth_demo/
├── custom_users/
│   └── ...
├── demo_site/
│   └── ...
├── djauth_demo/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py*
└── requirements.txt
```

之後就不花時間去確認路徑了。


## Change Auth User Model

在做之前應該看一下[官網說明](https://docs.djangoproject.com/en/1.8/topics/auth/customizing/#specifying-a-custom-user-model)。
