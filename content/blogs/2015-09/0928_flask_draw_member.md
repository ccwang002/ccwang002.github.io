---
Title: 用 Flask 與 SQLite 架抽籤網站
Slug: flask-draw-member
Date: 2015-09-28 12:00
Tags: zh, flask, sqlite, jinja2, python
Category: Coding
---

為了實驗室的專題生而寫。

目標其實是 Django + Django ORM + PostgreSQL，不過一次接觸太多會有反效果，先來比較簡單的。所以這邊可能講的不是 best practice，但用的是最少（底層）的知識與工具。一開始讓太多套件（像 SQLAlchemy）做掉了細節部份，反而不太能掌握到重要的概念以及為什麼需要這些套件。

**本篇文章非常長，應該沒辦法幾分鐘內讀完。對象是初學者學習簡單網站架設。**

這個專案的目標：因為大家 meeting 的時候都不問問題，在教授的要求要，我們實驗室需要一個抽籤工具。又因為我們實驗室有分成幾個組別，所以抽籤的時候要針對某個組別去抽。

在這邊用 [LoveLive!] 還有 [K-ON!] 的成員來當例子。

**先聲明我兩個動畫都沒有看過，如果有什麼名字打錯請告訴我，絕對不是故意的。**

[TOC]

[LoveLive!]: https://zh.wikipedia.org/wiki/LoveLive!
[K-ON!]: https://zh.wikipedia.org/wiki/K-ON！輕音部


### 資料設計

我們先假設所有檔案都放在同個資料夾裡，估且叫 `draw_member`。之後沒有額外說明的話，都是在這個目錄下操作。

原始資料用 CSV 格式來儲存，有「名字」以及「團體」兩個欄位。不過考慮到可能會把檔案匯出，在原始檔案多加一個「最近被抽到的日期」欄位，希望最近被抽到的會比其他人再被抽到的機會低一點。

這個檔案叫做 `members.csv`。一開始沒有人被抽到，所以最後一欄都先設成空的[^1]，第一行是每一欄欄位的名稱。

```csv
"名字","團體","最近被抽到的日期"
"高坂 穂乃果","μ's",""
"絢瀬 絵里","μ's",""
"南 ことり","μ's",""
"園田 海未","μ's",""
"星空 凛","μ's",""
"西木野 真姫","μ's",""
"東條 希","μ's",""
"小泉 花陽","μ's",""
"矢澤 にこ","μ's",""
"平沢 唯","K-ON!",""
"秋山 澪","K-ON!",""
"田井中 律","K-ON!",""
"琴吹 紬","K-ON!",""
"中野 梓","K-ON!",""
```

首先我們先確定會用 Python 把資料讀出來。在 Python 當中有個叫 `csv` 的內建模組（module）可以處理 CSV 的檔案讀寫。在這邊我們選用 [csv.DictReader]，它預設會把檔案的第一行當成欄位名稱，然後根據這名稱，每一行都會產生一個 `dict` 物件。

```python
import csv

with open('./members.csv', newline='') as f:
    r = csv.DictReader(f)
    for row in r:
        print(row)
```

可以把這段程式碼直接打在 Python shell 裡或者存成一個檔案用 python 執行它，結果都會是：

```python
{'名字': '高坂 穂乃果', '團體': "μ's"}
{'名字': '絢瀬 絵里', '團體': "μ's"}
{'名字': '南 ことり', '團體': "μ's"}
{'名字': '園田 海未', '團體': "μ's"}
{'名字': '星空 凛', '團體': "μ's"}
{'名字': '西木野 真姫', '團體': "μ's"}
{'名字': '東條 希', '團體': "μ's"}
{'名字': '小泉 花陽', '團體': "μ's"}
{'名字': '矢澤 にこ', '團體': "μ's"}
{'名字': '平沢 唯', '團體': 'K-ON!'}
{'名字': '秋山 澪', '團體': 'K-ON!'}
{'名字': '田井中 律', '團體': 'K-ON!'}
{'名字': '琴吹 紬', '團體': 'K-ON!'}
{'名字': '中野 梓', '團體': 'K-ON!'}
```

如果在 `print(row)` 這邊整理一下資料，改成：

```python
import csv

with open('./members.csv', newline='') as f:
    r = csv.DictReader(f)
    for row in r:
        print('{} of {}'.format(row['名字'], row['團體']))
```

則輸出結果會是：


```text
高坂 穂乃果 of μ's
絢瀬 絵里 of μ's
南 ことり of μ's
園田 海未 of μ's
星空 凛 of μ's
西木野 真姫 of μ's
東條 希 of μ's
小泉 花陽 of μ's
矢澤 にこ of μ's
平沢 唯 of K-ON!
秋山 澪 of K-ON!
田井中 律 of K-ON!
琴吹 紬 of K-ON!
中野 梓 of K-ON!
```

這樣就確定我們有辦法把資料用 Python 讀取了。要拿每個欄位的內容也很簡單，像要名字的話，只要用 `row['名字']`。


[^1]: 在資料處理上其實會有個 NA 的值來區分「空」以及「空值」的概念。不過這用 Python 內建的 `csv.reader` 處理會太複雜就先算了。

[csv.DictReader]: https://docs.python.org/3.5/library/csv.html#csv.DictReader


### 網站架構規劃

這個抽籤網站主要就幾個功能：

- **首頁**可以選擇其中一個團體或所有人去抽籤
    - 送出之後可以看到結果
    - 並且把這個抽籤結果更新到歷史記錄裡
- **歷史記錄**列出過去被抽到的記錄
- **更新成員**清除所有資料，重新讀入

每一頁我們要有個功能表列，方便功能的切換。

所以資料庫的部份會有兩張表格：**members** 以及 **draw_histories** 分別記錄成員以及被抽過的時間。

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

Table **members** 應該很好理解，一個欄位是名字 name，一個是團體名稱 group_name。其中 id 這個欄位是程式內部在使用的，它會在讀入資料的時候自動產生。

Table **draw_histories** 記錄每次抽籤發生的時間 time 還有誰被抽到 memberid，可以發現 memberid 是用成員的 id，因此我們多加一個限制是這欄位的值應該要在 members 裡的 id 中出現過。

### 實作環境設定

我們選用 [Flask] 架設 server，因為它一開始用相當簡單。資料的部份會讀到 [SQLite] 資料庫。

> *Flask* is a microframework for Python based on Werkzeug, Jinja 2 and good intentions. (Flask official site)
>
> *SQLite* is a software library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine. (SQLite official site)


#### Python 環境

使用 [Python 3.5]。理論上 SQLite 就已經裝好了能直接使用。一般在開發 Python 程式的時候會使用虛擬環境，好處虛擬環境安裝的 Python 套件可以獨立管理，不受系統或其他虛擬環境影響。我們用內建的 [venv][pymodule-venv] 建立一個名稱為 `VENV` 的虛擬環境：

```bash
$ python3.5 -m venv VENV
```

這時候目錄底下就會多一個 `VENV` 資料夾，裡面是個完整的 python 執行結構，就好像裝了個 python 在這個路徑。先暫時不管它怎麼做到虛擬隔離，知道怎麼用就好。使用跟離開分別是：

```bash
$ source VENV/bin/activate
(VENV) $ which python
# /path/to/draw_member/VENV/bin/python
```

```bash
(VENV) $ deactivate
$  # 前面的 (VENV) 會消失
```

#### 安裝 Flask、Jinja2 等套件

Python 使用 pip 管理安裝的套件，

```bash
(VENV) $ pip install flask jinja2
# Collecting flask
# Collecting jinja2
# ... (連帶裝了相關的套件）
```

這時候如果查看裝了哪些套件就會看到：

```bash
(VENV) $ pip freeze
# Flask==0.10.1
# itsdangerous==0.24
# Jinja2==2.8
# MarkupSafe==0.23
# Werkzeug==0.10.4
```

為了方便之後把環境安裝在別的電腦上，記得用

```bash
pip freeze > requirements.txt
```

把套件版本的資訊都存在一個檔案裡的好處是，下次把要環境架起來就只要

```bash
pip install -r requirements.txt
```

就設定完成了。


#### SQLite Database

我們先把 SQLite 每個資料表設定好，這樣之後在寫程式就只要專心讀寫資料就好了。根據前面建的模型，我們可以轉換成 SQL 語法：

```sql
-- create_db.sql
CREATE TABLE members (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    name TEXT NOT NULL,
    group_name TEXT
);

CREATE TABLE draw_histories (
    memberid INTEGER,
    time DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (memberid) REFERENCES members(id)
);
```

把這串 SQL 寫到一個檔案 `create_db.sql` 後就可以實際測試一下。我們把兩個成員寫到檔案裡面，

```bash
$ sqlite3 -init create_db.sql test.db
```

```sqlite3
-- Loading resources from create_db.sql

SQLite version 3.8.11.1 2015-07-29 20:00:57
Enter ".help" for usage hints.
sqlite> INSERT INTO members (name, group_name)
   ...> VALUES
   ...> ('高坂 穂乃果', 'μ''s'),
   ...> ('平沢 唯', 'K-ON!');
sqlite> .header on
sqlite> SELECT * FROM members;
id|name|group_name
1|高坂 穂乃果|μ's
2|平沢 唯|K-ON!
```

`sqlite3 -init xxx.sql` 意思是把 `xxx.sql` 裡面的 SQL 指令都執行了一遍，所以一進到 SQLite shell 裡面就建立好表格了。

再來我們模擬幾次抽籤的過程。注意到我們之前有寫 **draw_histories**.time 的預設值，所以抽籤只要寫是誰就可以了，時間 SQLite 會自動根據指令執行的時間給值。不過我們都試一下吧。

```sqlite3
sqlite> INSERT INTO draw_histories (memberid) VALUES (1), (2);
sqlite> INSERT INTO draw_histories (memberid, time)
   ...> VALUES (2, datetime('2015-09-25 16:30'));
```

所以第一次 INSERT 指令抽了果果以及小唯各一次。第二次 INSERT 再抽了一次小唯，這次還有額外指定時間為的 9 月 25 號下午 4 點半。關於 SQLite 裡 `datetime` 的更多使用方式可以參考[官網 documentation](https://sqlite.org/lang_datefunc.html)，我們的例子只要這樣就足夠了。

```sqlite3
sqlite> SELECT * FROM draw_histories;
memberid|time
1|2015-09-28 16:55:03
2|2015-09-28 16:55:03
2|2015-09-25 16:30:00
```

前兩個就是第一次 INSERT 所建立的抽籤歷史，跟你下指令的時間有關。第二次 INSERT 有給定時間，所以記錄永遠是 9 月 25 號下午。

**draw_histories** 只儲存了 member_id，我們可以做一個比較複雜的查詢，把成員的名字跟所屬團體一起列出來。

```sqlite3
sqlite> SELECT m.id, m.name, m.group_name, d.time AS draw_time
   ...> FROM draw_histories AS d, members as m
   ...> WHERE m.id == d.memberid
   ...> ORDER BY d.time ASC;
id|name|group_name|draw_time
2|平沢 唯|K-ON!|2015-09-25 16:30:00
1|高坂 穂乃果|μ's|2015-09-28 16:55:03
2|平沢 唯|K-ON!|2015-09-28 16:55:03
```

### 把 CSV 寫進資料庫

我們就把之後要用的資料庫取名為 `members.db`。我們先把初始的資料寫進資料庫裡。

這邊只有多一個在 Python 裡操作 SQLite 的步驟。透過 Python 內建的 [sqlite][pymodule-sqlite] module 就可以控制資料庫存取。先確定有這些檔案了：

- `members.csv`: 所有成員資料
- `create_db.sql`: 資料庫 schema

先 import 用到的 module

```pycon
>>> import sqlite3
>>> import csv
```

把成員資料從 CSV 讀進來，跟之前一樣，只是我們稍微整理一下格式，存在 `members` 這個變數。

```pycon
>>> with open('./members.csv', newline='') as f:
...     csv_reader = csv.DictReader(f)
...     members = [
...         (row['名字'], row['團體'])
...         for row in csv_reader
...     ]
...
>>> members
[('高坂 穂乃果', "μ's"),
 ('絢瀬 絵里', "μ's"),
 ('南 ことり', "μ's"),
 ('園田 海未', "μ's"),
 # ...
 ('中野 梓', 'K-ON!')]
```

接著是新的部份，要先建立 SQLite database 連線，然後再用這個連線去下 SQL 指令。首先要把 table 都建立出來：

```pycon
>>> with open('create_db.sql') as f:
...     create_db_sql = f.read()
...
>>> with db:
...     db.executescript(create_db_sql)
...
```

`db.executescript('...')` 可以執行一系列的 SQL 指令（注意指令間要有分號）。另外使用 `with db: ...` 作用是會 sqlite3 module 會自動幫我們把中間的 SQL 指令送出[^sqlite3 auto commit]，等同於：

```python
>>> c = db.cursor()
>>> c.executescript(create_db_sql)
>>> c.commit()
```

再來把讀進來的 `members` 變數寫到資料表裡面。

```pycon
>>> with db:
...     db.executemany(
...         'INSERT INTO  members (name, group_name) VALUES (?, ?)',
...         members
...     )
```

試著把資料讀出來，確定真的存進去了。

```pycon
>>> c = db.execute('SELECT * FROM members LIMIT 3')
>>> for row in c:
>>>     print(row)
(1, '高坂 穂乃果', "μ's")
(2, '絢瀬 絵里', "μ's")
(3, '南 ことり', "μ's")
```

到了這邊我們資料的部份沒問題了，接下來就要著手處理網站流程本身。


[^sqlite3 auto commit]: 參考[官方說明文件](https://docs.python.org/3.5/library/sqlite3.html#using-the-connection-as-a-context-manager)，它是在進入 `with db: ...` code block 時開啟一個 transaction，並在正常離開的時候自動 commit。如果中間遇到沒有處理的 Exception 時，就會自動 roll back。


### Flask 基本架構

Flask 的 web server 可以把所有功能都寫在一個檔案，在這邊就以 `draw_member.py` 為例子。

```python3
from flask import Flask
app = Flask(__name__)


@app.route('/')
def index():
    return "<p>Hello World!</p>"


if __name__ == '__main__':
    app.run(debug=True)
```

以上就是最基本的 Flask server 架構。先來測試看看，都已經等待一千六百多字了。先把 server 跑起來，

```bash
(VENV) $ python draw_member.py
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
```

再來可以開瀏覽器訪問 <http://localhost:5000/>，或者用 command line 來訪問：

```bash
$ curl 'http://localhost:5000/'
# <p>Hello World!</p>
```

會看到 server 回傳「Hello World!」。太感動了！底下先說明整個流程與 code 的關係。

`app` 是整個 Flask application 的核心物件，可以看到最後我們會呼叫它的 `.run()` 來產生一個可以動的 web server。`debug=True` 表示如果 server 有錯誤的時候 Flask 會提供我們完整的錯誤訊息，包含錯誤是在哪個 Python function 裡產生的，錯誤時各個變數的值等等。因為這樣會也會讓有心人士知道網站是怎麼運行的，變正式網站（上 production）時會把這個選項關掉。

我們定義了一個 `index` function 並且用 decorator 把這個函式綁定在 `/` 路徑也就是首頁上。使用者訪問 `/` 就會跑到這個 function 裡來。


### Flask 與 SQLite 資料庫讀取

我們先把資料庫相關的函式都先寫好，這邊基本上參照 [Flask 官網 SQLite 使用方式][flask-offical-sqlite3]。

```python3
import csv
import sqlite3
from flask import Flask, g

app = Flask(__name__)
SQLITE_DB_PATH = 'members.db'
SQLITE_DB_SCHEMA = 'create_db.sql'
MEMBER_CSV_PATH = 'members.csv'


# SQLite3-related operations
# See SQLite3 usage pattern from Flask official doc
# http://flask.pocoo.org/docs/0.10/patterns/sqlite3/
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(SQLITE_DB_PATH)
        # Enable foreign key check
        db.execute("PRAGMA foreign_keys = ON")
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run(debug=True)
```

一下子多了很多 code，如果太複雜可以先當作就是這樣吧。

需要了解的部份，第一是 `g` 這個變數裡可以放很多需要傳來傳去的變數，所以就把建立好的資料庫連線放在 `g._database`。平常如果要用這個連線的話，就用 `db = get_db()` 去拿。

第二是我們把資料的路徑等等，都寫成變數放在程式碼的最開頭。這是個好習慣，把常數跟程式分開來，管理才方便[^flask-config]。

[^flask-config]: 其實 Flask 相關的設定通常放在 `app.config` 裡面，不過我們的例子沒差。


### First view, first template
先來做首頁，把 HTML 放在 `templates/index.html`。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>成員抽籤</title>
  </head>
  <body>
    <h1>來抽出快樂的夥伴吧！</h1>
    <h3>功能列</h3>
    <ul>
      <li>首頁（抽籤）</li>
      <li>歷史記錄</li>
      <li>清除記錄、更新成員資料</li>
    </ul>
  </body>
</html>
```

這只是個單純的首頁，有個標題，還有個功能列，但暫時都沒有功能。我們修改一下 `draw_member.py` 裡定義的 index 讓：

```python
@app.route('/')
def index():
    return render_template('index.html')
```

馬上來執行看看，用一樣的方式。不過之前執行的那個可能沒有結束，記得一個 port 只能有一個服務，所以要不是用舊的（Flask 很聰明，在 `debug=True` 時知道檔案被更新時就會用新的），要不是就關掉再重開一個新的。

打開瀏覽器訪問 <http://localhost:5000> 應該會出現底下的畫面。

<div class="figure align-center">
  <img src="{attach}pics/flask_helloworld.png"/>
  <p class="caption">Flask Hello World</p>
</div>


### 抽籤功能

接下來要實作抽籤的功能啦，照前面說的，我們在首頁會設一個團體列表，使用者就會選擇某個團體去抽籤。

在實作之前要來背景介紹一下，要先講一下 GET 與 POST 的差異。

#### GET vs POST

使用者平常在訪問網站時，該人輸入一個網站、點一個超連址，這時候瀏覽器會發送一個 GET request 到對應的 server 以及路徑。瀏覽器（通常）就會回傳一個對應的 HTML 檔案，瀏覽器就會負責把它顯示在畫面上。

但當使用者跟網站有更多互動的時候，常常是要把使用者的資訊送給網站時，像帳號登入、填問卷表單，或者在這邊的選擇某個團體去抽籤，這時候就會透過 POST。

更多的 GET/POST 以及其他的 HTTP request，可以參考[一頁式介紹（中）][HTTP intro zh]或[非常完整的介紹在 MDN（英）][MDN HTTP request]

#### Form

最常見的 POST 就是搭配[表單（form）][form]使用。像登入要填帳號密碼、問卷問題與回答，就很常用 form 實作。Form 裡面有很多種 input，代表使用者能填的欄位，類型可能是單選、複選、單行、多行、密文等。

我們就先看一下 form 實際的長相吧。改寫 `templates/index.html`，加上一個抽籤選團體的 form。

```flask
<h1>來抽出快樂的夥伴吧！</h1><!-- 本來有的 -->
<p>選擇要被抽的團體</p>
<form action="/draw" method="post">
  <label for="group_name">團隊名稱：</label>
  <input type="radio" name="group_name" value="μ's">μ's
  <input type="radio" name="group_name" value="K-ON!">K-ON!
  <input type="radio" name="group_name" value="ALL" checked>（全）
  <input type="submit" value="Submit">
</form>
<hr><!-- 這是分隔線 -->
```

基本上加在 body 裡面就可以。這個 form 包含了一個標籤，指定是給名為 `group_name` 的 input。底下接四個 input tags 但實際上只有兩大個。

第一大個是團體的單選選項共三個 input，注意到他們的 `name` 都是 `group_name` 但 `value` 不同，後面接著他們顯示的字。其中「（全）」它多了一個 `checked` 表示預設選擇這個選項。

另一大個是 `type=submit` 的 input，他就是送出的表單的按鈕。

再來注意 form tag 本身。`method="post"` 應該很好理解，表示要送出 POST request；`action="/draw"` 表示這個 POST 要發到 `/draw` 這個路徑。

同樣，form 底下也很多細節，歡迎再去 [MDN][MDN-form] 了解。


#### Request (Form / POST) handling in Flask

所以我們馬上來寫處理 `/draw` POST 的 view 吧。


```python3
import random
from flask import request


@app.route('/draw', methods=['POST'])
def draw():
    # Get the database connection
    db = get_db()

    # Draw member ids from given group
    # If ALL is given then draw from all members
    group_name = request.form.get('group_name', 'ALL')
    valid_members_sql = 'SELECT id FROM members '
    if group_name == 'ALL':
        cursor = db.execute(valid_members_sql)
    else:
        valid_members_sql += 'WHERE group_name = ?'
        cursor = db.execute(valid_members_sql, (group_name, ))
    valid_member_ids = [
        row[0] for row in cursor
    ]

    # If no valid members return 404 (unlikely)
    if not valid_member_ids:
        err_msg = "<p>No members in group '%s'</p>" % group_name
        return err_msg, 404

    # Randomly choice a member
    lucky_member_id = random.choice(valid_member_ids)

    # Obtain the lucy member's information
    member_name, member_group_name = db.execute(
        'SELECT name, group_name FROM members WHERE id = ?',
        (lucky_member_id, )
    ).fetchone()
    return '<p>%s（團體：%s）</p>' % (member_name, member_group_name)
```

Flask 會把使用者發給 server 的 request 存在 `request` 裡面，其實使用者會傳蠻多資訊的，像該人的語言、用的瀏覽器、時間等等，這些都能在 `request` 找到。而使用者填好的 form 的內容會存在當中 `request.form` 裡，而我們先前定義在 form 中 input name 就會變成這邊的 dict key。

因此如果要拿使用者決定的 `group_name` 時，就會寫成 `request.form.get('group_name', 'ALL')`。這相當於 `request.form['group_name']` 但在沒有這個 key 時回傳預設值 `'ALL'`。正常使用並不會找不到這個 key，但網站開發者永遠不要相信使用者會乖乖回傳這些內容。

拿了團體名稱之後，就用團體名稱去下查詢的 SQL。同理這名稱可能沒有結果，這時就回傳一個 HTTP status code 為 404 的錯誤訊息。一般情況 4XX 都代表使用者給的資料有問題的。

拿到了所有成員的 id 後，用了個 `random.choice` 隨機抽一個出來。如同字面上的意思，[random][pymodule-random] 是個 Python 內建的 module。再把這個 id 拿去查名字與團體。

我們總共做了兩個資料庫查詢，第一次把可能的 member id 都傳回來，第二次把抽中的人的名字、團體都拿回來。暫時還沒做寫到歷史的功能，但那個也不難，之後再說。先不做 template，把結果包在 HTML 最基本的 `<p>` 元素就傳回來。

#### Demo

重新整理首頁，可以看到多了一個表單（廢話）。Flask 的 web server 很聰明，不用重新啟動它，會自動看到檔案有更新做 reload。可以回去比對一下自己寫在 `index.html` 裡 HTML 在瀏覽器上呈現的對應關係。

<div class="figure align-center">
  <img src="{attach}pics/flask_index_form.png"/>
  <p class="caption">新的首頁，多了一個表單</p>
</div>

按下 Submit 之後就會跳到抽籤結果（注意 URL 的變化）

<div class="figure align-center">
  <img src="{attach}pics/flask_draw_result.png"/>
  <p class="caption">抽籤結果</p>
</div>

預計是抽全部，你也可以回到上一頁，選自己想要的團體。

最重要的功能就完成啦！如果自己程式遇到一些狀況的話，可以看[我寫的完整版本](https://github.com/ccwang002/draw_member/blob/169d81650d8ca649c5484c43c05324885e7cb7fb/draw_member.py)。


### More on templates

之前我們 `render_template` 其實都是傳一個完整的 HTML 內容給它，並沒有用到 template 功能。Template 有幾個用處：

- 集中重覆用到的片段、結構
- 讓一部份 HTML 的內容受變數控制

馬上來改寫一下吧。我們的功能表應該每一頁都要出現，再來我們希望 `/draw` 的頁面也是個完整的 HTML。

首先先把常用的部份獨立出來，做成 `templates/base.html`。

```flask
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>{% block title %}成員抽籤{% endblock title %}</title>
  </head>
  <body>
    {% block content %}{% endblock content %}
    <hr>
    <h3>功能列</h3>
    <ul>
      <li><a href="/">首頁（抽籤）</a></li>
      <li><a href="/history">歷史記錄</a></li>
      <li><a href="/reset">清除記錄、更新成員資料</a></li>
    </ul>
  </body>
</html>
```

像功能列這種不會變的就很適合放在這邊。而我們的首頁就可以重覆使用這個結構，

```flask
<!-- templates/index.html -->
{% extends "base.html" %}

{% block content %}
<h1>來抽出快樂的夥伴吧！</h1>
<p>選擇要被抽的團體</p>
<form action="/draw" method="post">
  <label for="group_name">團隊名稱：</label>
  <input type="radio" name="group_name" value="μ's">μ's
  <input type="radio" name="group_name" value="K-ON!">K-ON!
  <input type="radio" name="group_name" value="ALL" checked>（全）
  <input type="submit" value="Submit">
</form>
{% endblock content %}
```

可以看到最大的差異就是我們的 `index.html` 變簡單了。它就像物件繼承一樣，`{% extends "base.html" %}`，表示先把 `base.html` 的內容放進來，而裡面定義了兩個 block：`title` 以及 `content`。Index 有定義 content 的內容，所以就取代掉原本定義在 base 裡空的 content。  Index 並沒有定義 title，那就會用原本 block 內的值，即「成員抽籤」。

再來處理 `/draw` 的部份，我們除而再利用 `base.html` 之外，還要引入 template variable 的概念。

```flask
<!-- templates/draw.html -->
{% extends "base.html" %}

{% block title %}抽籤結果{% endblock title %}

{% block content %}
<h1>抽籤結果</h1>
<p>{{ name }}（團體：{{ group }}）</p>
{% endblock content %}
```

特別的是 `{{ name }}` 和 `{{ group }}`。這語法表示他們的值分別受 `name` 和 `group` 這兩個變數決定，變數的值在 `render_template` 時才會決定。要怎麼把變數的值傳到 template 裡呢？

```python3
@app.route('/draw', methods=['POST'])
def draw():
    # ...
    # return '<p>%s（團體：%s）</p>' % (member_name, member_group_name)
    return render_template(
        'draw.html',
        name=member_name,
        group=member_group_name,
    )
```

改寫好的 draw 使用 template `templates/draw.html`，並在 `render_template` 時把變數的值都放進去。

這時候才重新抽籤可以看到新的 template 的輸出結果，功能表也出現了。

<div class="figure align-center">
  <img src="{attach}pics/flask_new_draw_result.png"/>
</div>


### 歷史記錄

記得要在抽籤的時候把記錄加到 database 裡。因為之前有設好 schema 預設用現在時間當抽籤時間，所以時間的處理完全交給 SQLite。用 SQL 語法 `LIMIT 10` 以及 `ORDER BY` 選擇最近的十筆，同時在查結果時，也同時查詢 **members** table 對應的名字與團體。這個專業術語叫 [JOIN][wiki JOIN]。

把這個 view 放在 `/history` 路徑。

```python3
@app.route('/draw')
def draw():
    # ...
    # Update draw history
    with db:
        db.execute('INSERT INTO draw_histories (memberid) VALUES (?)',
                   (lucky_member_id, ))
    # Render template
    return ...


@app.route('/history')
def history():
    db = get_db()
    recent_histories = db.execute(
        'SELECT m.name, m.group_name, d.time AS "draw_time [timestamp]"'
        'FROM draw_histories AS d, members as m '
        'WHERE m.id == d.memberid '
        'ORDER BY d.time DESC '
        'LIMIT 10'
    ).fetchall()
    return render_template(
        'history.html',
        recent_histories=recent_histories
    )
```

同理也要建立對應的 template。

```flask
<!-- templates/history.html -->
{% extends "base.html" %}

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
      <td>{{ history.0 }}</td>
      <td>{{ history.1 }}</td>
      <td>{{ history.2 }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% endblock content %}
```

這邊用了新的 template 語法 for loop，每次 loop `history` 的值都會變，而且還可以再存取它底下的屬性，寫成 Python 就像：

```python
for history in recent_histories:
    history[0]
```

Flask 用的 Jinja2 template 功能很多，現在各位已經比較理解 server 的運作了，可以去閱讀一下 [Jinja2 官網文件][jinja2-tpl-design]看完整的使用方式。

<div class="figure align-center">
  <img src="{attach}pics/flask_history.png"/>
</div>

#### 時間處理用 datetime

如果有注意到的話，我們用的時間從 SQLite 回傳回來其實是字串。想要改寫時間格式怎麼辦？這時候就要用上內建 module [datetime][pymodule-datetime]。同時我們也順便把本來用 `fetchall()` 的結果，改成用 dict 表示每一筆歷史。

```python3
@app.route('/history')
def history():
    db = get_db()
    c = db.execute(...)
    recent_histories = []
    for row in c:
        recent_histories.append({
            'name': row[0],
            'group': row[1],
            'draw_time': datetime.strptime(row[2], '%Y-%m-%d %H:%M:%S'),
        })
    return render_template(...)
```

```flask
{% for history in recent_histories %}
<tr>
  <td>{{ history.name }}</td>
  <td>{{ history.group }}</td>
  <td>{{ history.draw_time.strftime("%Y 年 %m 月 %d 日 %H 時 %M 分") }}</td>
</tr>
{% endfor %}
```

可以看到 for loop 不再使用 0, 1, 2 去拿每筆歷史各欄位的值，而是用欄位名稱，相當於 `history['name']`。這樣的做法比較好，因為用數字一下就忘了，隨便調整一下 view 的內容順序就不一定是這樣了；單獨讀 template 也能懂每個欄位的意思。

<div class="figure align-center">
  <img src="{attach}pics/flask_history_zh.png"/>
</div>

### What's Next





### 總結

這樣就是一個完整的抽籤的網站了。其實架網站的主要知識也差不多是這些，再來就是細節以及知識的加強。

做好的成品我也放在 [Github](https://github.com/ccwang002/draw_member) 上了，裡面的 commit log 記錄了幾個重要的步驟，所以想要看看每一步的結果可以用 `git checkout` 回到每個記錄點，例如想要看抽籤功能寫完，用上 template 的版本就可以到 `git checkout f39fc1`。

PS: 沒想到會寫這麼長啊……


### Details

底下記了很多技術細節，有興趣再看吧。

#### SQLite table info

除了用 `.schema` 去看每個 TABLE 建立時的指令之外，也可以用 `PRAGMA table_info` 去看某個 table 每個欄位的設定。

```sqlite3
-- Run `sqlite -init create_db.sql`
sqlite> .header on
sqlite> .mode column
sqlite> PRAGMA table_info(members);
cid  name         type       notnul  dflt_value                    pk
---  -----------  ---------  ------  ----------------------------  --
0    id           INTEGER    0                                     1
1    name         TEXT       1                                     0
2    group_name   TEXT       0                                     0
sqlite> PRAGMA table_info(draw_histories);
cid  name         type       notnul  dflt_value                    pk
---  -----------  ---------  ------  ----------------------------  --
0    memberid     INTEGER    0                                     0
1    draw_time    DATETIME   0       datetime('now', 'localtime')  0
```

#### SQLite foreign key check

SQLite3 在比較新版才會去處理 foreign key 限制的功能，參考[官網的說明][SQLite foreign key]，

```sqlite3
sqlite> PRAGMA foreign_keys;
0
```

如果是 0 的話表示 SQLite 並不會去檢查 foreign key。這可以手動打開檢查。

``` sqlite3
sqlite> PRAGMA foreign_keys = ON;
sqlite> PRAGMA foreign_keys;
1
sqlite> INSERT INTO draw_histories(memberid) VALUES (1000);
Error: FOREIGN KEY constraint failed
```


#### 重新讀入資料
我們先包好一個 function `reset_db`。

```python3
# draw_members.py
def reset_db():
    with open(SQLITE_DB_SCHEMA, 'r') as f:
        create_db_sql = f.read()
    db = get_db()
    # Reset database
    # Note that CREATE/DROP table are *immediately* committed
    # even inside a transaction
    with db:
        db.execute("DROP TABLE IF EXISTS draw_histories")
        db.execute("DROP TABLE IF EXISTS members")
        db.executescript(create_db_sql)

    # Read members CSV data
    with open(MEMBER_CSV_PATH, newline='') as f:
        csv_reader = csv.DictReader(f)
        members = [
            (row['名字'], row['團體'])
            for row in csv_reader
        ]

    # Write members into databse
    with db:
        db.executemany(
            'INSERT INTO members (name, group_name) VALUES (?, ?)',
            members
        )
```

`reset_db()` 會 DROP 掉舊的 database ，然後再用剛剛介紹的方法再把資料從 CSV 讀進來。

所以這個 function 要怎麼使用？

一個是像之前一樣綁定一個路徑 `@app.route('/reset')`；另一個方式我們可以透過 python shell 達到。

```pycon
>>> from draw_member import app, reset_db
>>> with app.app_context():
...     reset_db()
```


#### Datetime in SQLite and Python

這篇文章太長了，寫到[下一篇去](../datetime-sqlite/#datetime-sqlite)。

[Asia/Taipei]: https://en.wikipedia.org/wiki/Asia/Taipei
[SQLite]: https://www.sqlite.org/
[Flask]: http://flask.pocoo.org/
[Python 3.5]: https://www.python.org/downloads/
[SQLite foreign key]: https://www.sqlite.org/foreignkeys.html#fk_enable
[flask-offical-sqlite3]: http://flask.pocoo.org/docs/0.10/patterns/sqlite3/#using-sqlite-3-with-flask
[form]: https://developer.mozilla.org/en/docs/Web/HTML/Element/form
[jinja2-tpl-design]: http://jinja.pocoo.org/docs/dev/templates/
[HTTP intro zh]: https://archer1609wp.wordpress.com/2014/03/02/httppost%E8%88%87get/
[MDN HTTP request]: https://developer.mozilla.org/en-US/docs/Web/HTTP
[MDN-form]: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms
[wiki JOIN]: https://en.wikipedia.org/wiki/Join_%28SQL%29
[pymodule-venv]: https://docs.python.org/3.5/library/venv.html#module-venv
[pymodule-sqlite]: https://docs.python.org/3.5/library/sqlite3.html
[pymodule-datetime]: https://docs.python.org/3.5/library/datetime.html#datetime-objects
[pymodule-random]: https://docs.python.org/3.5/library/random.html#random.choice
