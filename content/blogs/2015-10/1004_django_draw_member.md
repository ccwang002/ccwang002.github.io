---
Title: 用 Django 與 SQLite 架抽籤網站
Slug: django-draw-member
Date: 2015-10-04 14:55
Tags: zh, django, sqlite, python
Summary: 把之前用 Flask 架的抽籤網站改用 Django 實作，也藉這個機會比較一下兩個 Framework 設計概念的不同。
Category: Coding
---

#### 前情提要

我把 LoveLive! 兩季看完了！μ's 在第一季的成長充滿感動啊。**\真姫最高/**

……呃好啦，之前講了[用 Flask 去架一個抽籤網站](../../09/flask-draw-member)。不過我們最終的目標是用 Django 嘛，所以接下來就要改寫。也藉這個機會比較一下兩個 Framework 設計概念的不同（<del>例如 Django 一開始寫有多冗</del>、<del>Flask 寫到最後有多冗</del>）。


### From Flask to Django

為了轉換但又不要一下子把所有 Django 的功能都放進來，中間過程有很多「不常見的寫法」。想要直接寫 Django best practice 的話，可以參考 TP 大大的[《為程式人寫的 Django Tutorial 》][tp-django]，他的規劃是 30 個單元做一個訂餐系統。

過程中會用到很多 Django API，沒有解釋的話可以到[官網][django]去查使用。另外我發現如果能用 debugger 去 trace Django 執行的流程能幫助理解，想要一個精美的 debugger 的話可以裝像 PyCharm 的 IDE。

整體的規劃會漸近把 Django 的功能加進來，依序應該是：

- Django View, Template
- Django Model, ORM
- Django Form
- (Django Admin 沒有用到)

如果看 [Django doc][django] 首頁的話，也是分這幾個部份，雖然這篇文章並不會把所有概念都介紹一遍。

另外，在改寫的時候會跳過用 raw SQL，因為完全不用 ORM 有點難銜接其他 Django 部份。有興趣的話在講完 Model 之後可以參考 Details。

[TOC]

[tp-django]: https://github.com/uranusjr/django-tutorial-for-programmers
[django]: https://docs.djangoproject.com/en/1.8/


### Django 初始設定

一樣開一個 Python 虛擬環境（這時候就是它的好處了，能把不同專案的套件隔離）。

```
pip install django pytz ipython pyyaml
```

[pytz] 在[前一篇](../../09/datetime-sqlite)已經介紹過，是處理時區的套件。[IPython] 全名是 Interactive Python，同樣是 Python shell 但提供了很多附加功能，最常用的應該是自動補完。[PyYAML] 用來處理 YAML 物件，可裝可不裝，不裝之後的例子就用 JSON 即可。


我們的專案根目錄是 `demo_django_draw_member`。因為 Django 的設定很多，先在這目錄下用 [django-admin] 把基本的架構建起來。我們建了一個名為 `draw_site` 的專案（Project）。


```bash
(VENV) $ django-admin startproject draw_site
```

執行完之後應該會多出一堆檔案，結構如下。注意到有兩層 `draw_site`。

```tree
demo_django_draw_member/
└── draw_site/
    ├── draw_site/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    └── manage.py*
```

之後工作的目錄其實是 `demo_django_draw_member/draw_site/`，也就是有 `manage.py` 的那層目錄，之後的路徑都是相對於 `demo_django_draw_member/draw_site/`。介紹一下每個檔案。

- `manage.py` 之後就會取代 django-admin 的功能。兩者最大的差別是 manage.py 知道 project 的設定。
- `draw_site/settings.py` 裡面存著 Django 的各種設定，像 secret key、database、template engine、app 等。
- `draw_site/urls.py` 裡面存著 URL dispatching 設定，即哪個路徑要用哪個 function 去處理。
- `draw_site/wsgi.py` [WSGI] 是規範 Python web server 的標準，通常不會動這個檔案就不細提。Flask、Django 都是相容 WSGI 的實作。

[pytz]: http://pythonhosted.org/pytz/
[IPython]: http://ipython.org/
[PyYAML]: http://pyyaml.org/
[django-admin]: https://docs.djangoproject.com/en/1.8/ref/contrib/admin/
[WSGI]: http://wsgi.org/

一個 Django 由一個 project 和很多個 apps 所組成。每個 app 就專注在網站的某個功能上，各自包著各自需要的 database schema、template、view logics。這樣的好處是同樣的功能就不用重寫，同時在很大的網站時這樣的結構有助於管理運作的邏輯。

#### Django server

先把 Django 跑起來看看吧。

```console
$ python manage.py runserver
...
Django version 1.8.5, using settings 'draw_site.settings'
Starting development server at http://127.0.0.1:8000/
```

<div class="figure align-center">
  <img src="{attach}pics/django_initial.png"/>
  <p class="caption">Django Hello World</p>
</div>

這是 Django 內建在什麼 URL 都沒設定時的歡迎畫面。看到這個至少表示基本的 settings 正常。Django 跟 Flask 一樣，內建的 server 會在 source code 有改變的時候 reload，所以一直開著跑也可以。


#### 第一個 Django app

我們的網站只會用到一個 app，把它建出來取名為 `draw_member`。

```bash
python manage.py startapp draw_member
```

```tree
demo_django_draw_member/
└── draw_site/
    ├── draw_member/
    │   ├── __init__.py
    │   ├── admin.py
    │   ├── migrations/
    │   ├── models.py
    │   ├── tests.py
    │   └── views.py
    ├── draw_site/
    │   └── ...
    └── manage.py*
```

可以看到 app 與 project 的架構是不一樣的。

要把這個新的 app 加到 project 裡，修改 `draw_site/settings.py`。

```python3
# draw_site/settings.py

INSTALLED_APPS = (
    'draw_member',    # 加這一行
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
)
```

預設其實裝了很多 app。暫時不理他們是什麼。

#### Django settings

先簡單介紹一下 `draw_site/settings.py`。除了剛剛用到 INSTALLED_APPS，講幾個跟這邊比較有關的參數。

```python
# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
```

DATABSES 裡定義了使用的資料庫。預設會使用 `db.sqlite3` 這個 SQLite 資料庫。

再來是語言、時區的設定。預設是 UTC 並且使用 timezone，也就是 server 的時間都是用 UTC 記錄的。

#### Database Migration

在什麼 code 都還沒寫之前，介紹一個 database 觀念：[migration][django-migration]。

在之前的例子可以知道，我們會先設計一個資料庫該存什麼東西，整個網站流程會怎麼用這些資料，這些形成 table schema。但是隨著時間，可能網站有新的功能，很難說完全不去更動 schema。

更動 schema 不是件簡單的事，如果是上 production 的網站，資料庫會有運作以來累積的資料，總不能 schema 改了這些資料就丟掉吧？而且在網站開發的時候，在不同版本的（或不同人開發的）code 就可能有不同的 schema。要怎麼確保 code 與 database 的狀態就要靠 migration。

……一開始就這麼複雜？好啦我們的例子沒有用到 migration 大多數的功能，只有用它 initiate database。內建的 app 都有自己的 database schema，可以用它把資料庫的 table 建出來。


```console
$ python manage.py migrate
Operations to perform:
  Synchronize unmigrated apps: messages, staticfiles
  Apply all migrations: sessions, auth, contenttypes, admin
Synchronizing apps without migrations:
  Creating tables...
    Running deferred SQL...
  Installing custom SQL...
Running migrations:
  Rendering model states... DONE
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying sessions.0001_initial... OK
```

migration 就會一步步把 database 調整到符合現在 code 的狀態，這些調整就會記錄在 `<app>/migrations/` 底下，等等就會看到了。

[django-migration]: https://docs.djangoproject.com/en/1.8/topics/migrations/


### URL dispatcher

我們接下來要改首頁，把 Django 預設的 `/` 首頁換成 Hello World。

Flask URL routing 是直接用 decorator 寫在 view function 上面。幫大家回顧一下：

```python3
@app.route('/')
def index():
    return "<p>Hello World!</p>"
```

Django 的 view 和 URL 是分開的，首先是 view：

```python3
# draw_member/views.py
from django.shortcuts import render  # 先暫時留著
from django.http import HttpResponse

def home(request):
    return HttpResponse("<p>Hello World!</p>")
```

結構上大同小異（也因為有 [WSGI] 規範的關係啦）。


再來是 URL 設定。我們先把 URL 加在 project 設定。這邊可能覺得設定有點分散比較怪，等一下再把它放到 app 裡面。

```python3
# draw_site/urls.py
"""draw_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
...
"""
from django.conf.urls import include, url
from django.contrib import admin
from draw_member.views import home

urlpatterns = [
    url(r'^$', home, name="home"),
    url(r'^admin/', include(admin.site.urls)),
]
```

概念也很簡單，把要的 view function 從 app import 進來（所以 app 目錄是個 Python module，底下會 `__init__.py`），給一個 regex 表示的路徑，後面放上處理 function 以及一個 optional 的名字，這個名字就代表了這個 URL 路徑，之後可以反查。

測一下確認設定都是正確的。

```console
$ curl -XGET "localhost:8000"
<p>Hello World!</p>
```

再看一下 `draw_site/urls.py`，可以看到 Django 預設放了個 `/admin` 後面用的是 `include(app.urls)`，表示這一整包只要是 admin/ 開頭的 URL 都交給 admin.site.urls 去處理路徑。這樣方便 app 在不同網站中重覆利用，因為可能放的路徑都不一樣，但一個 app 內在處理路徑上會有一致性。

馬上來改寫一下。首先在 app draw_member 底下加一個 `urls.py`。

```python3
# draw_member/urls.py
from django.conf.urls import include, url
from .views import home  # explicit relative import

urlpatterns = [
    url(r'^$', home, name="home"),
]
```

基本上格式就是照抄原本就有的。因為放在同個 app 裡面了，import view 時就可以用 explicit relative import（這不是 relative import 喔）

原本的 urls.py 就改成把 URL 的處理「dispatch」給這個 app，改成底下這樣。

```
# draw_site/urls.py
from django.conf.urls import include, url
from django.contrib import admin


urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include('draw_member.urls')),
]
```

`r'^'` 代表從根目錄就交給這個 app 去管理，也因為這樣比較專一的路徑要放前面，像是 /admin。用字串表示在執行的時候才 import 這個 module，不想也可以拿掉字串把 app import 進來。

以上就是最基本的 [URL dispatching][django-url-dispatcher]。


### Django Model and ORM

接著處理資料庫的問題。當然可以在 Django 裡面寫 raw SQL，但這邊提供另一個想法：Object-relational Mapping (ORM)。ORM 把資料用物件導向的方式整理，把 SQL、table、database 的細節交給 ORM engine 去翻譯。這可以在找到非常多介紹，直接跳到實作。

<pre style="font-family: Consolas, 'Courier New', monospace">
    ┌─────────────────────┐
    │ members             │
    ├─────────────────────┤
    │ id          INTEGER │ <─┐
    │ name           TEXT │   │
    │ group_name     TEXT │   │
    └─────────────────────┘   │
                              │
    ┌─────────────────────┐   │
    │ draw_histories      │   │ foreign
    ├─────────────────────┤   │ key
    │ memberid    INTEGER │ ──┘
    │ time       DATETIME │
    └─────────────────────┘
</pre>

回想一下我們的 schema 設計。改用 ORM 來思考我們就會有成員（Member）以及抽籤歷史（History）兩大 models。Member 記錄了名字與所屬團體；History 會記錄時間、這筆抽籤是屬於哪個成員的。

在 Django 中，model 定義在 `models.py` 裡面，馬上來寫寫看。

```python3
# draw_members/models.py
from django.db import models
from django.utils.timezone import now


class Member(models.Model):
    name = models.CharField(max_length=256)
    group_name = models.CharField(max_length=256)

    def __str__(self):
        return '%s of %s' % (self.name, self.group_name)


class History(models.Model):
    member = models.ForeignKey(Member, related_name="draw_histories")
    # now() will return datetime.utcnow()
    time = models.DateTimeField(default=now)

    def __str__(self):
        return '%s at %s' % (self.member.name, self.time)
```

一個 class 裡的屬性就對應到一個欄位（Field），欄位會有他的型別以及資料庫實作上的限制（例如字串有上限，當然也可以不設）。Field type 可以參考[官網][django-field-type]。

**Member** 底下都是字串所以是 `CharField`。 **History** 稍微複雜一點，時間的記錄 date 用 `DateTimeField`，這樣欄位拿回來就會轉換成 Python datetime object；另一個 member 用的是 `ForeignKey`，也就是 relationship field，來表示這筆抽籤屬於拿個成員。後面的 `related_name` 提供了反查功能，也就是能從一個 member 去查他所有的 histories。

同時先寫好兩個 class 底下的 `__str__`，這樣等下在 Python shell 操作時容易辨認每個物件的內容。


#### Migration the tracker of model changes

多說無用，馬上來試一試。

……等等，想到 migration 了嗎？每次更動 database model 都要跑 migration，確保 code 與資料庫狀態一致。

```console
$ python manage.py makemigrations draw_member
python manage.py makemigrations draw_member
Migrations for 'draw_member':
  0001_initial.py:
    - Create model History
    - Create model Member
    - Add field member to history
```

可以看到 Django 很聰明的知道我們多定義了兩個 models，裡面有些對應到資料庫的欄位型態。這些資訊會寫在 migration file 裡面，

```python3
# draw_member/migrations/0001_initial.py
class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='History',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('time', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(max_length=256)),
                ('group_name', models.CharField(max_length=256)),
            ],
        ),
        migrations.AddField(
            model_name='history',
            name='member',
            field=models.ForeignKey(to='draw_member.Member', related_name='draw_histories'),
        ),
    ]
```

注意到 Django ORM 自動幫我們加了 `id` 這個 primary key，等等就會用到。Migration 裡面的細節等對 Django 更熟了之後就能慢慢了解了。

有了新的 migration 就要同步資料庫的狀態，

```console
$ python manage.py migrate
...
Running migrations:
  Rendering model states... DONE
  Applying draw_member.0001_initial... OK
```

#### ORM queries in shell

接下來我們操作一下 ORM。

```bash
$ python manage.py shell
```

就會打開一個 Python shell。如果裝了 IPython 就會打開 IPython shell。
這個與一般的有什麼差別呢？他會帶有 Django project 的設定。如果是從一般的 shell 可以先跑以下的指令來達到相同的效果。

```pycon
$ DJANGO_SETTINGS_MODULE="draw_site.settings" python
>>> import django
>>> django.setup()
```


```ipythonconsole
In [1]: from draw_member.models import Member, History
In [2]: m1 = Member(name="高坂 穂乃果", group_name="μ's")
In [4]: m2 = Member(name="平沢 唯", group_name="K-ON!")
In [5]: m1, m2
Out[5]: (<Member: 高坂 穂乃果 of μ's>, <Member: 平沢 唯 of K-ON!>)
In [7]: m1.save()
In [8]: m2.save()
In [6]: h1 = History(member=m1)
In [9]: h1.save()
```

使用上就把資料當作物件來操作，如同 ORM 字面的意思。注意只有在 `.save()` 才真正被存到資料裡。拿沒有存的 object 來操作 database 就會出現 exception。

```pycon
>>> h_failed = History(member=Member(name='FF', group_name='f'))
>>> h_failed.save()
Traceback (most recent call last):
...
IntegrityError: NOT NULL constraint failed: draw_member_history.member_id
```

覺得麻煩的話，用 `Model.objects.create()` 就可以一步搞定。正確的存好之後，現在資料庫已經有資料了。我們可以先在 SQLite 裡確認。

```sqlite3
-- sqlite3 db.sqlite3
sqlite> .header on
sqlite> SELECT * FROM draw_member_member;
id|name|group_name
1|高坂 穂乃果|μ's
2|平沢 唯|K-ON!
sqlite> SELECT * FROM draw_member_history;
id|time|member_id
1|2015-10-05 15:17:32.061384|1
```

透過像剛剛 object 的操作，我們也能建出如同手寫 SQL 一樣的資料庫，當然像 `id`、`member_id` 這些欄位是 ORM engine 自動幫我們做出來的，這些可以自訂，不過預設的行為不難理解。

要怎麼從 ORM 像剛剛下 SQL 一樣撈資料呢？

```pycon
>>> from draw_member.models import Member, History
>>> Member.objects.all()
[<Member: 高坂 穂乃果 of μ's>, <Member: 平沢 唯 of K-ON!>]
>>> History.objects.all()
[<History: 高坂 穂乃果 at 2015-10-05 15:17:32.061384+00:00>]
```

資料透過 `Model.objects` 這個 Manager 去查詢，細節就去看 Django 關於 [Making queries][django-making-queries] 的內容吧。查詢資料庫就會回傳 [QuerySet][django-QuerySet]，這並不會真的去「查」資料庫，但先把指令存著等真的要用到值時才去計算，也就是 lazy evaluation。

QuerySet 底下就有很多對應到 SQL 指令的查詢，像是拿回所有 objects 的 `QuerySet.all()`，前面已經用過了。或者篩選的 `QuerySet.filter()`，

```pycon
>>> Member.objects.filter(group_name='K-ON!')
[<Member: 平沢 唯 of K-ON!>]
>>> Member.objects.filter(group_name__contains='!')
[<Member: 平沢 唯 of K-ON!>]
```

其中 `<field>__contains` 就是 Django ORM 為了實做像 SQL `LIKE` 指令的對應欄位。

先講幾個有關的，首先每個 Model 都有個 primary key `pk`，預設指到 `Model.id` 這個欄位上，另用 `QuerySet.get()` 可以拿到單一物件，這時候萬用的 pk 就派上用場了。

```pycon
>>> Member.objects.get(pk=1)
<Member: 高坂 穂乃果 of μ's>
```

查 relation 也很簡單，

```pycon
>>> h1 = History.objects.get(pk=1)
>>> h1.member
<Member: 高坂 穂乃果 of μ's>
>>> h1.member.name
'高坂 穂乃果'
```

還記得之前設得 `related_name="draw_histories"`，表示我們能從 Member 反查回去該人相關的歷史，

```pycon
>>> m1 = Member.objects.get(pk=1)
>>> m1.draw_histories.all()
[<History: 高坂 穂乃果 at 2015-10-05 15:17:32.061384+00:00>]
```

最後我們來刪資料，

```pycon
>>> Member.objects.all().delete()
>>> History.objects.all().delete()
```

當然一開始我們可以暴力把 `db.sqlite3` 整個刪掉再重新 `python manage.py migrate` 一次就可以讓 database 對應的 table 都建立好，不過只適用於 SQLite 而已。或者，正確的「清空資料庫」做法是用 `flush` 指令，

```console
$ python manage.py flush
You have requested a flush of the database.
This will IRREVERSIBLY DESTROY all data currently in the 'draw_site/db.sqlite3' database,
and return each table to an empty state.
Are you sure you want to do this?

    Type 'yes' to continue, or 'no' to cancel: yes
Installed 0 object(s) from 0 fixture(s)
Installed 0 object(s) from 0 fixture(s)
```


#### Data in ORM and fixtures

我們把 `members.csv` 的資料填到資料庫吧。這邊就不用細說了。

```ipythonconsole
In [1]: import csv
In [2]: with open('../../draw_member/members.csv', newline='') as f:
   ...:    csv_reader = csv.DictReader(f)
   ...:    members = [
   ...:    (row['名字'], row['團體'])
   ...:    for row in csv_reader
   ...:    ]
In [3]: from draw_member.models import Member
In [4]: for m in members:
   ...:     Member(name=m[0], group_name=m[1]).save()
   ...:
```

可以自己檢查一下是不是 14 個人都寫到資料庫了。

不過現在有個問題是，之後可能會常常把資料庫砍掉重練，或者要把這些（或很多來源）的資料讀到資料庫，每次都重新讀寫也是可以，但有沒有別的做法能把資料先存起來？

這邊就要介紹 [Django fixtures](https://docs.djangoproject.com/en/1.8/howto/initial-data/#providing-initial-data-with-fixtures) 了。他能把資料庫的資料存成 JSON、YAML（需要 [PyYAML]）等格式。

一般 fixtures 是被在 `<app>/fixtures/` 目錄底下，記得先把目錄建出來。

```bash
mkdir draw_member/fixtures
```

根據 database 的內容建立 fixtures 可以使用 `dumpdata` 指令：

```bash
python manage.py dumpdata \
    --format=yaml \
    --indent=4 \
    --output draw_member/fixtures/anime_members.yaml
    draw_member.Member \
```

```yaml
# draw_member/fixtures/anime_members.yaml
-   fields: {group_name: "\u03BC's", name: "\u9AD8\u5742 \u7A42\u4E43\u679C"}
    model: draw_member.member
    pk: 1
-   fields: {group_name: "\u03BC's", name: "\u7D62\u702C \u7D75\u91CC"}
    model: draw_member.member
    pk: 2
# ...
```

用 JSON 輸出也可以，改成 `--format=json` 就可以了

```json
[
{
  "model": "draw_member.member",
  "pk": 1,
  "fields": {
    "name": "\u9ad8\u5742 \u7a42\u4e43\u679c",
    "group_name": "\u03bc's"
  }
},
```

我們可以用 `python manage.py flush` 把資料庫清掉，模擬資料的讀入。

```console
$ python manage.py loaddata anime_members.yaml
Installed 14 object(s) from 1 fixture(s)
```

這樣資料的存取就介紹得差不多了。更多的細節可以參考[官網 model layer](https://docs.djangoproject.com/en/1.8/#the-model-layer) 的說明。


[django-url-dispatcher]: https://docs.djangoproject.com/en/1.8/topics/http/urls/
[django-field-type]: https://docs.djangoproject.com/en/1.8/ref/models/fields/#field-types
[django-making-queries]: https://docs.djangoproject.com/en/1.8/topics/db/queries
[django-QuerySet]: https://docs.djangoproject.com/en/1.8/ref/models/querysets/#django.db.models.query.QuerySet


### Django Template

在進行下去之前，先確認我們的目錄結構是一樣的。

```tree
demo_django_draw_member/
└── draw_site/
    ├── db.sqlite3
    ├── draw_member/
    │   ├── __init__.py
    │   ├── admin.py
    │   ├── fixtures/
    │   │   ├── anime_members.json
    │   │   └── anime_members.yaml
    │   ├── migrations/
    │   │   ├── 0001_initial.py
    │   │   └── __init__.py
    │   ├── models.py
    │   ├── tests.py
    │   ├── urls.py
    │   └── views.py
    ├── draw_site/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    └── manage.py*
```

Django 的 template 預設是放在 `<app>/templates/` 底下。不過為了在跨 app 時不要衝到名字，我們會多包一層 app 為名的資料夾。

```bash
mkdir -p draw_member/templates/draw_member
```

它跟 Flask 用的 Jinja2 templates 乍看下非常類似（Jinja2 模仿 Django template），兩者最大的差別是在 Jinja2 裡能很自由的使用 Python function，不過 Django 靠的是 template tag 以及 filter。我們的例子兩者是沒差多少。

一樣先把 `base.html` 以及 `home.html` 做出來。我們也先把 Form 寫上了，暫時先用 GET。

```html+django
{# draw_member/templates/draw_member/base.html #}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>{% block title %}抽籤系統{% endblock title %}</title>
</head>
<body>
{% block content %}{% endblock content %}
<hr>
<h3>功能列</h3>
<ul>
  <li><a href="{% url 'home' %}">首頁（抽籤）</a></li>
  <li><a href="{% url 'history' %}">歷史記錄</a></li>
</ul>
</body>
</html>
```


```html+django
{# draw_member/templates/draw_member/home.html #}
{% extends 'draw_member/base.html' %}

{% block content %}
  <h1>來抽出快樂的夥伴吧！</h1>
  <p>選擇要被抽的團體</p>
  <form action="{% url 'draw' %}" method="get">
    <label for="group_name">團隊名稱：</label>
    <input type="radio" name="group_name" value="μ's">μ's
    <input type="radio" name="group_name" value="K-ON!">K-ON!
    <input type="radio" name="group_name" value="ALL" checked>（全）
    <input type="submit" value="Submit">
  </form>
{% endblock content %}
```

整體的概念應該很好理解。`{% url 'xxxx' %}` 就是 URL resolver，還記得在 `urls.py` 的設定時有給個 `name` 參數嗎，這邊就會根據那個名字回傳正確的網址。

順便更新一下 URL 把這些 view 先加好，不然等下 runserver 會說找不到這些網址。

```python3
# draw_members/urls.py
from django.conf.urls import include, url
from .views import home, draw, history

urlpatterns = [
    url(r'^$', home, name="home"),
    url(r'^draw/$', draw, name="draw"),
    url(r'^history/$', history, name="history")
]
```

```python3
# draw_members/views.py
from django.shortcuts import render
from django.http import HttpResponse


def home(request):
    return HttpResponse("<p>Hello World!</p>")


def draw(request):
    return HttpResponse("<p>Draw</p>")


def history(request):
    return HttpResponse("<p>History</p>")
```

緊接著改寫我們的首頁，讓它用上 `home.html`。

```python3
def home(request):
    return render(request, 'draw_member/home.html')
```

<div class="figure align-center">
  <img src="{attach}pics/django_home.png"/>
  <p class="caption">加上 template 的首頁</p>
</div>

Template 更多的說明可以參考[官網 template layer](https://docs.djangoproject.com/en/1.8/#the-template-layer) 的說明。


### More on Django's model, template and view (MTV)

我們把最重要的抽籤功能實作出來吧。

這邊需要理解的就是，Django 會把傳到 GET / POST 的參數以 dict 存在 `request.GET` / `request.POST` 裡面，`@require_GET` 限制只能使用 GET 去溝通。

其他的邏輯都是照抄以前的。

```python3
import random
from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_GET
from .models import Member, History

@require_GET
def draw(request):
    # Retrieve all related members
    group_name = request.GET.get('group_name', 'ALL')
    if group_name == 'ALL':
        valid_members = Member.objects.all()
    else:
        valid_members = Member.objects.filter(group_name=group_name)
    # Raise 404 if no members are found given the group name
    if not valid_members.exists():
        raise Http404("No member in group '%s'" % group_name)
    # Lucky draw
    lucky_member = random.choice(valid_members)
    # Update history
    draw_history = History(member=lucky_member)
    draw_history.save()

    return HttpResponse(
        "<p>{0.name}（團體：{0.group_name}）</p>"
        .format(lucky_member)
    )
```

用 ORM 寫起來比 raw SQL 乾淨多了，不過一開始要把對應的 function 都記起來就是。
馬上測試一下，一樣偷懶先不去寫 template。

```console
$ curl -XGET "localhost:8000/draw/?group=ALL"
<p>小泉 花陽（團體：μ's）</p>
```

如果是從首頁去點的，觀察一下網址的變化。例如：`http://localhost:8000/draw/?group_name=K-ON!`，可以看到 form 的選項直接寫在網址列。這是使用 POST 與 GET 最大的不同。

再來把歷史記錄的部份也寫一下，也把 template 都補上。

```html+django
{# draw_member/templates/history.html #}
{% extends 'draw_member/base.html' %}

{% block title %}抽籤歷史{% endblock title %}

{% block content %}
  <h1>抽籤歷史（最近 10 筆）</h1>
  <table>
    <thead>
    <tr>
      <th>名字</th>
      <th>團體</th>
      <th>抽中時間</th>
    </tr>
    </thead>
    <tbody>
    {% for history in recent_histories %}
      <tr>
        <td>{{ history.member.name }}</td>
        <td>{{ history.member.group_name }}</td>
        <td>{{ history.time|date:"r"}}</td>
      </tr>
    {% endfor %}
    </tbody>
  </table>
{% endblock content %}
```

history.html 與本來 Flask 不一樣的地方，在用上了 `date:"r"` 的 filter，傳的參數接在 `:` 之後。也更新對應 view 的動作，

```python3
def history(request):
    recent_draws = History.objects.order_by('-time').all()[:10]
    return render(request, 'draw_member/history.html', {
        'recent_histories': recent_draws,
    })
```

<div class="figure align-center">
  <img src="{attach}pics/django_history.png"/>
</div>

可以看到預設用的是 UTC 時區，時區的轉換細節放到文末吧。我們可以在 view 裡更改要呈現的時區，

```python3
from django.utils.timezone import activate

def history(request):
    activate('Asia/Taipei')
    # ...
```

<div class="figure align-center">
  <img src="{attach}pics/django_history_tz.png"/>
</div>

這樣基本功能就搞定啦！細節一樣參考[官網 view layer](https://docs.djangoproject.com/en/1.8/#the-view-layer) 的說明。



### Django Form

直接把 form 寫在 template 裡面也是可以，有時候 form 可能跟 model 息息相關，而且 form input 多了之後每個欄位都要自己讀寫也太不直覺。想要驗証使用者的 input 的話就更複雜了。

於是就有了 Django Form。馬上來看用起來是怎麼樣。

```
# draw_member/forms.py
from django import forms

class DrawForm(forms.Form):
    GROUP_CHOICES = [
        ("μ's", "μ's"),
        ("K-ON!", "K-ON!"),
        ("ALL", "（全）"),
    ]
    group = forms.ChoiceField(
        choices=GROUP_CHOICES,
        label='團隊名稱',
        label_suffix='：',
        widget=forms.RadioSelect,
        initial='ALL'
    )
```

建了一個新的 form class，像 Model 一樣，裡面規定了每個欄位的屬性。我們這邊只有一個 `group` 是個單選的 ChoiceField，`choices` 是個 list of two-item tuples，第一個是內部的值，第二個是顯示的字。其他的都是細節的調整。

把這個 form 用到 view 裡面。新建一個 form object `form`，然後把這個變數 `form` 傳進 template 裡面。

```python3
from .forms import DrawForm

def home(request):
    form = DrawForm()
    return render(request, 'draw_member/home.html', {
        'form': form,
    })
```

再來修改 template，就不用自己寫 form 的內容了，改成 `{{ form }}` Django 就會自動產生。

```html+django
{# draw_member/home.html #}
{% extends 'draw_member/base.html' %}

{% block content %}
  <h1>來抽出快樂的夥伴吧！</h1>
  <p>選擇要被抽的團體</p>
  <form action="{% url 'draw' %}" method="get">
    {{ form }}
    <input type="submit" value="Submit">
  </form>
{% endblock content %}
```

<div class="figure align-center">
  <img src="{attach}pics/django_form.png"/>
</div>

不過這個長得跟我們原本的 form 不一樣嘛。好在 Django form 是很彈性的，form 在被 render 成 HTML 時可以提供細節的調整，大家可以參考[官網 Form rendering options](https://docs.djangoproject.com/en/1.8/topics/forms/#form-rendering-options) 調整。我直接給調好的結果吧。

```html+django
  <form action="{% url 'draw' %}" method="get">
    {{ form.group.label_tag }}
    {% for radio in form.group %}
      {{ radio.tag }}{{ radio.choice_label }}
    {% endfor %}
    <input type="submit" value="Submit">
  </form>
```

用結果去對照每個 `{{ ... }}` 部件對應的 HTML 元素吧。


#### More Django form in view

Form 的功能可不只這樣，可以在創建 DrawForm 時直接把 `request.GET` 傳入。

```python3
# draw_member/views.py
def draw(request):
    # Retrieve all related members
    form = DrawForm(request.GET)
    if form.is_valid():
        group_name = form.cleaned_data['group']
        if group_name == 'ALL':
            valid_members = Member.objects.all()
        else:
            valid_members = Member.objects.filter(group_name=group_name)
    else:
        # Raise 404 if no members are found given the group name
        raise Http404("No member in group '%s'" %
                      form.data.get('group', ''))
    # Lucky draw
    lucky_member = random.choice(valid_members)
    # ...
```

用 `form.is_valid()` 可以驗証每個欄位的資料是不是正確的。


我們也順便把 /draw 加上 template 吧。


```html+django
{# draw_member/draw.html #}
{% extends 'draw_member/base.html' %}

{% block title %}抽籤結果{% endblock title %}

{% block content %}
<h1>抽籤結果</h1>
<p>{{ lucky_member.name }}（團體：{{ lucky_member.group_name }}）</p>
{% endblock content %}
```

```python3
# draw_member/views.py
def draw():
    # ...
    return render(request, 'draw_member/draw.html', {
        'lucky_member': lucky_member
    })
```

更多 Forms 的介紹一樣參考[官網](https://docs.djangoproject.com/en/1.8/#forms)。



### 總結

這樣就把 Django 最基本的 Model, View, Template, Form 幾個大部份體驗一遍了。可以感覺出來 Django 提供的功能比 Flask 多很多，但也代表要花更多的時候學習使用它。其實改寫到最後我們的 code 非常少，可以為了結構化的 code 還比較多。

當然這不代表就學會 Django 了。最後來介紹幾個可以接續學習的 Django 資源：

- [《為程式人寫的 Django Tutorial 》][tp-django]是個真正從零到一的 30 天學習規劃（雖然我學了好幾個月 T___T），有了這個抽籤程式的概念再去讀一次應該會更清楚整個 Django 的設計。作者：Tzu-ping Chung (@uranusjr)
- [*Mastering Django: Core*], the successor to [*The Django Book*] last updated in 2009, is the definitive guide to Django targeting the latest Django version 1.8 at the time of writing.

更多的 Django 技能樹選擇請見 TP 的 lesson 30。

[*Mastering Django: Core*]: http://masteringdjango.com
[*The Django Book*]: http://www.djangobook.com/en/2.0/index.html



### Details

跟 Flask 一樣，底下記錄一些細節或改善等等為了避免篇幅過長（已經太長了）而移至此的段落。

#### Raw SQL

在介紹 Django Model 的時候直接用了 ORM，但實際上 Django 是可以寫 raw SQL 了，而且還有「聰明版」的 raw SQL 能夠拿回對應的 model object。馬上來看怎麼回事。

先來看聰明版的 raw SQL，使用 `Model.objects.raw` 拿回所有團體是 K-ON 類的成員。

```pycon
>>> list(Member.objects.raw("""
... SELECT id, name, group_name
... FROM draw_member_member
... WHERE group_name LIKE 'K-ON%%'
... """))
[<Member: 平沢 唯 of K-ON!>,
 <Member: 秋山 澪 of K-ON!>,
 <Member: 田井中 律 of K-ON!>,
 <Member: 琴吹 紬 of K-ON!>,
 <Member: 中野 梓 of K-ON!>]
```

會回傳一個 RawQuerySet，裡面其實也是 Member objects，這是靠 Django 去認對應的 primary key，也就是說在 raw() SQL query 裡一定要放 primary key。注意那個 `%` 需要被 escape 因為 raw() 的 SQL query 是能放參數的（就像 Python 內建 str %-formatting）。

不過我們怎麼知道 Member 是存在哪個 table 呢？預設是 `<app>_<model>`，但資訊在 meta options 裡的 `db_table`，也能被覆寫。

```pycon
>>> Member._meta.db_table
'draw_member_member'
```

因為 Member 裡面有像 name、group_name 等欄位，在下 query 的時候不一定都會寫在 SELECT 裡面把拿值回來，那麼這些欄位就是 deferred 狀態，只有在真的拿值時才會去跟 database 要。一般使用不會有感覺兩者的差異。

```pycon
>>> m = list(Member.objects.raw(
...     "SELECT id FROM draw_member_member"
... ))[0]
>>> type(m)
draw_member.models.Member_Deferred_group_name_name
>>> m.get_deferred_fields()
{'group_name', 'name'}
```

但我就是不想用 ORM，速度慢，也沒辦法寫複雜的 query（戰）。這就回歸到最傳統的 database connection, cursor 這些概念，就像沒有 SQLAlchemy 的 Flask。

```pycon
>>> from django.db import connection
>>> c = connection.cursor()
>>> list(c.execute("""
... SELECT name
... FROM draw_member_member
... WHERE group_name LIKE %s
... """, ["K-ON"]))
[('平沢 唯',), ('秋山 澪',), ('田井中 律',), ('琴吹 紬',), ('中野 梓',)]
>>> list(c.execute("""
... SELECT member_id, time
... FROM draw_member_history
... LIMIT 3
... """))
[(8, datetime.datetime(2015, 10, 5, 17, 36, 41, 608078, tzinfo=<UTC>)),
 (11, datetime.datetime(2015, 10, 5, 17, 37, 26, 164830, tzinfo=<UTC>)),
 (11, datetime.datetime(2015, 10, 5, 17, 37, 37, 483697, tzinfo=<UTC>))]
```

Here you go.


#### Better QuerySet

看過了 raw SQL 之後，我們來想想 ORM 的改善吧。雖然說每次要查詢的時候像寫 SQL 一樣把 query 組合出來也可以，但用 ORM 的好處應該是能把這些實作細節跟「包裝起來」。例如最近 n 次抽籤記錄、所有成員的團體名稱（目前是寫死在 DrawForm 裡面）。

這時候就可以把常用的 query 變成一個 method，例如最近 10 次抽籤記錄就只要用 `History.objects.recent(10)` 就可以了。

這其實有很多做法，像是寫一個 classmethod、Override default Manager、Override default QuerySet。哪個方法比較好呢？在 [StackOverflow](http://stackoverflow.com/a/2213341)、[mail list](https://groups.google.com/forum/#!topic/django-users/0WSdnWFTuUg) 都有討論。基本上都能達到相同的效果，但後兩者的做法是比較偏好的，因為 Manager(or QuerySet for Django 1.7+) 負責處理 model 對應到的 database table 等級的操作，但 classmethod 應該是處理已經從 table row 中拿出的一個 model object 相關的操作。如果把同樣性質的 code 放在一起，就應該使用 Manager(QuerySet)。

而且 TP 也在 Gitter 上開示了，就是這樣（結案）。來改寫 model。

```python3
# draw_member/models.py
class MemberQuerySet(models.QuerySet):

    def unique_groups(self):
        return self.values_list('group_name', flat=True).distinct()


class HistoryQuerySet(models.QuerySet):

    def recent(self, n):
        return self.order_by('-time')[:n]


class Member(models.Model):
    # ...
    objects = MemberQuerySet.as_manager()


class History(models.Model):
    # ...
    objects = HistoryQuerySet.as_manager()
```

在 Member 我們定義了一個 `unique_groups` 拿回所有團體的名稱；在 History 定義了 `recent` 拿出按時間排序最前面 n 個。新定義的 `QuerySet.as_manager()` 就取代掉本來的 `Model.objects`。

接著來改寫 view 把之前寫的 query 換掉。

```python3
#draw_member/views.py
def history(request):
    # ...
    recent_draws = History.objects.recent(10)
    # ...
```

這樣就簡潔一點。再來順便把 form 改得比較彈性，不要把團體名寫死。

```python3
#draw_member/forms.py
from .models import Member


def member_group_choices():
    valid_groups = Member.objects.unique_groups()
    choices = []
    for grp in valid_groups:
        choices.append((grp, grp))
    choices.append(('ALL', '（全）'))
    return choices


class DrawForm(forms.Form):
    group = forms.ChoiceField(
        choices=member_group_choices,
        # ...
    )
```


#### Timezone

感覺最近一直在寫[時區相關的東西](../../09/datetime-sqlite/)啊。基本上 server 記錄的時間都用 UTC 問題就少很多，但最後還是要呈現一個使用者用的時區。

但問題是 HTTP header 裡面並沒有這樣的資訊，所以一來用 geoip 去猜，二來用寫個 javascript 在使用者載入的時候去判斷時區，總之是個要另外記錄的東西。細節[官網上也有說明](https://docs.djangoproject.com/en/1.8/topics/i18n/timezones/#selecting-the-current-time-zone)。

在文中是使用 `activate('Aisa/Taipei')` 把時區改成 UTC+8。這邊介紹另一個方式，是寫在 template 裡面的。

```html+django
{# draw_member/templates/draw_member/history.html #}
{% block content %}
  {% load tz %}
  <h1>抽籤歷史（最近 10 筆）</h1>
  <table>
  {# ... #}
    <tbody>
    {% timezone 'Asia/Taipei' %}
    {% for history in recent_histories %}
      <tr>{# ... #}</tr>
    {% endfor %}
    {% endtimezone %}
    </tbody>
  </table>
{% endblock content %}
```


#### POST form and CSRF

忘記講了，我們的 form 目前是用 `action="get"`，當然可以改回用 POST，也很簡單，就 GET 換成 POST 就好了。

```python3
# draw_site/views.py
from django.views.decorators.http import require_POST

@require_POST
def draw(request):
    # Retrieve all related members
    form = DrawForm(request.POST)
    # ...
```

```html+django
{# draw_site/templates/home.html #}
  <form action="{% url 'draw' %}" method="post">
```

馬上來試試看。

<div class="figure align-center">
  <img src="{attach}pics/django_csrf_failed.png"/>
  <p class="caption">POST form without CSRF token</p>
</div>

拿到了一個　403 Forbidden ”CSRF verification failed.”。CSRF (Cross Site Request Forgery) 在 [wiki](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0) 有比較完整的介紹，這是一種攻擊手法，在使用者登入網站之後（session 為登入狀態），偽造一個跟網站上一樣的 form 來偽裝使用者的行為。例如購票系統買票，如果沒檢查的話，我可以拿使用者的 session 去網站上隨便買票，網站都會認為是使用者在操作。

因此 [CSRF token][django-CSRF] 用來防範這個偽造，在產生 form 的時候，網站會再產生一個欄位的值，這個欄位的值每次都會改變，這樣就能確定這個 form 是從網站上拿到的。Django 處理 CSRF protection 是透過 [Middleware](https://docs.djangoproject.com/en/1.8/topics/http/middleware/)，一個以前沒有提到的概念，表示他是比較底層的東西。相對而言，也不用改我們的 code，在這個例子就只要把 `{% csrf_token %}` 加到 form 裡面就可以了。

```html+django
{# draw_site/templates/home.html #}
  <form action="{% url 'draw' %}" method="post">
    {# ... #}
    {% csrf_token %}
    <input type="submit" value="Submit">
  </form>
```

[django-CSRF]: https://docs.djangoproject.com/en/1.8/ref/csrf/