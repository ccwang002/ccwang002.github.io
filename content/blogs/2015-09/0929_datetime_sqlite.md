---
Title: Datetime in SQLite and Python
Slug: datetime-sqlite
Date: 2015-09-28 12:00
Tags: zh, datetime, pytz, sqlite, python
Summary: 整理在 Python 中處理時區的問題，並如何自 SQLite 存取考慮時區的時間
Category: Coding
---

要正確處理時間並不容易。承接[我們先前的例子](../flask-draw-member)，其實是直接把時間轉換出來的字串存在 SQLite 裡。這有幾個問題。

首先是時區的問題。我們直接把 server 所在時區的時間存到資料庫去，台北的時區為 [Asia/Taipei] \(UTC+8)。如果今天 server 跑到另一個時區，例如東京 Asia/Tokyo (UTC+9) 好了，這時候資料庫裡就包含了兩個時區的時間，但因為是字串是完全看不出差異的。

再來用字串存時間也有一些問題。首先是排序，雖然我們的例子是能正確的排序，但如果時間格式換了（像 `%H:%M:%S %Y-%m-%d`）那就不一定。再來可以看到後續想處理時間就會比較複雜。不過這一部份是因為 SQLite 沒有專門處理日期時間的資料型態，像 PostgreSQL 就能看得懂。

所以想要正確處理時間有幾個要點：

- 存到資料庫的時間應該要 UTC 來表示
- 在處理時間時（排序、顯示、處理時區），應該轉成正確的資料格式（例如 [datetime][pymodule-datetime]）
- 呈現給使用者時再轉換到該人（或 server）所在時區

底下是比較正確處理時間的方式。

[TOC]


### 時區（Timezone）

我們都還沒有處理過時區。時區在 Python 內建的 datetime 只是個「概念」，也就是說，使用者可以傳進去不同的時區（存在 `datetime.tzinfo` 中），Python 能針對有提供時區的 datetime 做正確的判斷。但台北的時區是多少，紐約的時區是多少它不知道。

為什麼不處理各地時區這麼重要的概念？因為時間變動的速度很快，加上日光節約時間每年可能都不一樣，Python 下一版還沒出時區的資訊已經更新了很多次。

因此在 Python 中實際上時區處理靠得是第三方套件 [pytz]。像安裝 Flask 一樣，用 `pip install pytz` 就可以了。

實際操作看看。

```pycon
>>> from datetime import datetime
>>> datetime.now()      # local time
datetime.datetime(2015, 9, 29, 16, 33, 39, 537111)
>>> datetime.utcnow()   # UTC time
datetime.datetime(2015, 9, 29, 8, 33, 39, 538745)
```

首先，可以看到 datetime 本身提供了 `now()` 以及 `utcnow()` 兩個 function 來拿到現在的時間。台北是 UTC+8 所以時間比 UTC 時間字面上快 8 小時。注意到兩個回傳的 datetime 物件都沒有包含時區的資訊。

處理時間原則上都以 UTC 為基準。我們建立一個 UTC 的現在時間存在變數 `utcnow`，並且用 pytz 處理時間。Import pytz 進來，並且定義了兩個時區：UTC 以及 TPE（台北時間）。


```pycon
>>> import pytz
>>> utc = pytz.utc
>>> tpe = pytz.timezone('Asia/Taipei')
>>> utcnow = datetime.utcnow()
>>> utcnow
datetime.datetime(2015, 9, 29, 8, 38, 14, 738241)
>>> utc.fromutc(utcnow)
datetime.datetime(2015, 9, 29, 8, 38, 14, 738241, tzinfo=<UTC>)
>>> tpe.fromutc(utcnow)
datetime.datetime(2015, 9, 29, 16, 38, 14, 738241, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>)
>>> utc.fromutc(utcnow) == tpe.fromutc(utcnow)
True
```

用 pytz 定義的時區處理 datetime 之後就會多了 `tzinfo` 的資訊。這時也能正確比較不同時區的時間。

如何處理一個任意定義的時間呢？例如 2016 年台北元旦好了，

```pycon
>>> str(datetime(2016, 1, 1, 0, 0))
'2016-01-01 00:00:00'
>>> tpe_2016_newyear = tpe.localize(datetime(2016, 1, 1, 0, 0))
>>> tpe_2016_newyear
datetime.datetime(2016, 1, 1, 0, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>)
>>> utc.normalize(tpe_2016_newyear)
datetime.datetime(2015, 12, 31, 16, 0, tzinfo=<UTC>)
```

使用 `.localize(<datetime>)` 給予一個初始沒有時區資訊的 `datetime` 時區。有了時區之後，要在不同時區間轉換就使用 `.normalize(<datetime>)`。

可以再查查當台北 2016 元旦時，美國東岸時間是幾點。

```pycon
>>> est = pytz.timezone('US/Eastern')
>>> est.normalize(tpe_2016_newyear)
datetime.datetime(2015, 12, 31, 11, 0, tzinfo=<DstTzInfo 'US/Eastern' EST-1 day, 19:00:00 STD>)
```

以後要看球賽轉播、重要發表就不會再搞不清楚時間了。


### Datetime in SQLite, again

我們會處理 datetime 與時區了，那麼就來改寫一下本來 SQLite 存時間的方式。其實 Python datetime 支援 SQLite 轉換，同樣從[Python module 說明文件](https://docs.python.org/3.5/library/sqlite3.html#default-adapters-and-converters)裡面拿出來的。

```pycon
>>> from datetime import datetime
>>> import sqlite3
>>> import pytz
>>> utc = pytz.utc
>>> tpe = pytz.timezone('Asia/Taipei')
```

```pycon
>>> db = sqlite3.connect(
...     "test.db",
...     detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES
... )
>>> db.execute('CREATE TABLE test(dt timestamp)')
<sqlite3.Cursor object at 0x10a59b960>
```

資料欄位的設為 `timestamp`，並且在連接的時候設定 `PARSE_DECLTYPES` 及 `PARSE_COLNAMES`，稍後可以看到他們的效果。
趕快把時間存進去吧。

```pycon
>>> utcnow = datetime.utcnow()
>>> utcnow
datetime.datetime(2015, 9, 29, 12, 48, 16, 671538)
>>> with db:
...     db.execute(
...         'INSERT INTO test(dt) VALUES (?)',
...         (utcnow, )
...     )
...
<sqlite3.Cursor object at 0x1082380a0>
>>> tpe_2016_newyear = tpe.localize(datetime(2016, 1, 1, 0, 0))
>>> utc.normalize(tpe_2016_newyear)
datetime.datetime(2015, 12, 31, 16, 0, tzinfo=<UTC>)
>>> utc_dt = utc.normalize(tpe_2016_newyear).replace(tzinfo=None)
>>> with db:
...     db.execute(
...         'INSERT INTO test(dt) VALUES (?)',
...         (utc_dt, )
...     )
...
<sqlite3.Cursor object at 0x10a59b960>
```

存了兩個時間，一個是 UTC 的現在時間，另一個是以 UTC 表示的台北 2016 元旦。注意兩個時間都把 UTC 時區去掉了，因為在某些情況底下 SQLite 與 python 的 datetime adapter 會看不懂時區（這是個 [bug #19065][python issue 19065]）。

如果用 SQLite 可以看到時間都是以 UTC 呈現。仍可以用它內建的 `datetime('<UTC time>', 'localtime')` 把 UTC 時間字串轉換成電腦的當地時間。這樣處理是容易與其他應用程式相容的。

```sqlite3
-- sqlite3 test.db
sqlite> .schema
CREATE TABLE test(dt timestamp);
sqlite> SELECT dt FROM test;
2015-09-29 12:48:16.671538
2015-12-31 16:00:00
sqlite> SELECT datetime(dt, 'localtime') FROM test;
2015-09-29 20:48:16
2016-01-01 00:00:00
```

再用 Python 讀回來仍然是 datetime 格式：

```pycon
>>> ret_vals = db.execute('SELECT dt AS "[timestamp]" FROM test').fetchall()
>>> ret_vals
[(datetime.datetime(2015, 9, 29, 12, 48, 16, 671538),),
 (datetime.datetime(2015, 12, 31, 16, 0),)]
>>> [tpe.fromutc(t[0]) for t in ret_vals]
[datetime.datetime(2015, 9, 29, 20, 48, 16, 671538, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>),
 datetime.datetime(2016, 1, 1, 0, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>)]
```

#### Python 3 內建 timezone 支援

為了寫這篇 blog 又研究了一下內建的 datetime.timezone。Python 2 沒有這個功能，不過基本的 timedelta 有，所以要自己做應該也是做得到…吧？

內建的 datetime.timezone 由一個 utcoffset 做建立，基本上就是傳個相對於 UTC 的時間差，以 datetime.timedelta 表示。一樣內建帶有 UTC 時區，這邊試著建了台北以及東京的時間。

```pycon
>>> import datetime as dt
>>> tpe_now = dt.datetime.now()
>>> tpe_now
datetime.datetime(2015, 9, 29, 20, 40, 49, 347568)
>>> utc = dt.timezone.utc
>>> tpe_delta = dt.timedelta(hours=8)
>>> tpe = dt.timezone(tpe_delta)
>>> jpn_delta = dt.timedelta(hours=9)
>>> jpn = dt.timezone(jpn_delta)
```

我人在台北，所以 datetime.datetime.now() 會給我台北時間，再用 timedelta 手動算出各時區的時間。

```pycon
>>> utc_now = tpe_now - tpe_delta  # manually time shift
>>> jpn_now = utc_now + jpn_delta
>>> utc_now
datetime.datetime(2015, 9, 29, 12, 40, 49, 347568)
>>> tpe_now == utc_now
False
```

直接比較這些算出來的時間，不意外不相等，因為預設的 tzinfo 是空的。

```pycon
>>> tpe_now.replace(tzinfo=tpe)
datetime.datetime(2015, 9, 29, 20, 40, 49, 347568, tzinfo=datetime.timezone(datetime.timedelta(0, 28800)))
>>> tpe_now.replace(tzinfo=tpe) == utc_now.replace(tzinfo=utc)
True
>>> jpn_now.replace(tzinfo=jpn) == tpe_now.replace(tzinfo=tpe)
True
```

給了各地的時區的 tzinfo 之後，可以看到 datetime 在做比較的時候是有考慮時區位移的。

接著再來看一下pytz 與內建 datetime.timezone 的相容程度。

```pycon
>>> import pytz
>>> pytz_utc = pytz.utc
>>> pytz_tpe = pytz.timezone('Asia/Taipei')
>>> pytz.utc.normalize(jpn_now.replace(tzinfo=jpn))
datetime.datetime(2015, 9, 29, 12, 40, 49, 347568, tzinfo=<UTC>)
>>> pytz_tpe.localize(tpe_now) == utc_now.replace(tzinfo=utc)
True
```

比較跟轉換都沒有問題，可以放心轉換。


### 讓 Python 內建 SQLite adapter 支援時區

看了一下 [Python issue 19065][python issue 19065]，之所以沒有解決其實是缺 patch，因為現在的 patch 並不相容 Python 2.x（沒有 datetime.timezone），然後 pysqlite 的維護者並沒有想要支援 timezone 的意思。

不過那只是內建的 default adapter for datetime.datetime object，要自己做也沒問題。參考 issue 裡面提供的解法（在 Github [gist](https://gist.github.com/acdha/6655391) 上）。


```python3
# tz_aware_adpater.py
# Adapt from https://gist.github.com/acdha/6655391
import datetime
import sqlite3

def tz_aware_timestamp_adapter(val):
    datepart, timepart = val.split(b" ")
    year, month, day = map(int, datepart.split(b"-"))

    if b"+" in timepart:
        timepart, tz_offset = timepart.rsplit(b"+", 1)
        if tz_offset == b'00:00':
            tzinfo = datetime.timezone.utc
        else:
            hours, minutes = map(int, tz_offset.split(b':', 1))
            tzinfo = datetime.timezone(
                datetime.timedelta(hours=hours, minutes=minutes))
    else:
        tzinfo = None

    timepart_full = timepart.split(b".")
    hours, minutes, seconds = map(int, timepart_full[0].split(b":"))
    if len(timepart_full) == 2:
        microseconds = int('{:0<6.6}'.format(timepart_full[1].decode()))
    else:
        microseconds = 0

    val = datetime.datetime(
        year, month, day, hours, minutes, seconds, microseconds,
        tzinfo
    )
    return val

sqlite3.register_converter('timestamp', tz_aware_timestamp_adapter)
```


```pycon
python3 -i tz_aware_adpater.py
>>> db = sqlite3.connect(
...     'test.db',
...      detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES
... )
>>> import pytz
>>> tpe = pytz.timezone('Asia/Taipei')
>>> pycontw = tpe.localize(datetime.datetime(2016, 6, 3, 8, 0))
>>> str(pycontw)
'2016-06-03 08:00:00+08:00'
>>> db.executemany(
...     'INSERT INTO test(dt) VALUES (?)',
...     [(pycontw,), (pytz.utc.normalize(pycontw),)]
... )
>>> db.commit()
```

存了兩個帶有時區的時間（兩個時間是相同的）。先從 SQLite 來讀讀看。

```sqlite3
sqlite> SELECT dt FROM test;
2015-09-29 12:48:16.671538
2015-12-31 16:00:00
2016-06-03 08:00:00+08:00
2016-06-03 00:00:00+00:00
sqlite> SELECT datetime(dt, 'localtime') FROM test;
2015-09-29 20:48:16
2016-01-01 00:00:00
2016-06-03 08:00:00
2016-06-03 08:00:00
```

時區是直接寫到 SQLite 裡面，沒有的話就當成是 UTC 時區。

再用 Python 讀回來，測一下修改的 adapter。

```pycon
>>> dts = db.execute('SELECT dt FROM test').fetchall()
>>> dts
[(datetime.datetime(2015, 9, 29, 12, 48, 16, 671538),),
 (datetime.datetime(2015, 12, 31, 16, 0),),
 (datetime.datetime(2016, 6, 3, 8, 0, tzinfo=datetime.timezone(datetime.timedelta(0, 28800))),),
 (datetime.datetime(2016, 6, 3, 0, 0, tzinfo=datetime.timezone.utc),)]
>>> [t[0].astimezone(tpe) for t in dts[2:]]
[datetime.datetime(2016, 6, 3, 8, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>),
 datetime.datetime(2016, 6, 3, 8, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>)]
```

讀回來沒有問題，如果要完整處理所有情況（前面兩個 datetime 是 naive 沒有時區）

```pycon
>>> [(t[0].astimezone(utc) if t[0].tzinfo is not None
...   else utc.localize(t[0]))
...  for t in dts]
[datetime.datetime(2015, 9, 29, 12, 48, 16, 671538, tzinfo=<UTC>),
 datetime.datetime(2015, 12, 31, 16, 0, tzinfo=<UTC>),
 datetime.datetime(2016, 6, 3, 0, 0, tzinfo=<UTC>),
 datetime.datetime(2016, 6, 3, 0, 0, tzinfo=<UTC>)]
>>> [(t[0].astimezone(tpe) if t[0].tzinfo is not None
...   else tpe.fromutc(t[0]))
...  for t in dts]
[datetime.datetime(2015, 9, 29, 20, 48, 16, 671538, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>),
 datetime.datetime(2016, 1, 1, 0, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>),
 datetime.datetime(2016, 6, 3, 8, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>),
 datetime.datetime(2016, 6, 3, 8, 0, tzinfo=<DstTzInfo 'Asia/Taipei' CST+8:00:00 STD>)]
```


### 總結

時區真的很煩，尤其是很多地方不一定都完整支援時區，最好的情況還是用 UTC 溝通，只有在真的需要時再轉換成當地時間。

如果大家對時區很有興趣，不久前 [PEP 495] 已經被接受，沒有意外應該會出現在 Python 3.6 裡面，它處理的是日光節約時間的問題。（感覺在臺灣對日光節約時間完全沒有概念啊）

不得不說要正確處理時間…很麻煩啊。



[pytz]: http://pythonhosted.org/pytz/
[Asia/Taipei]: https://en.wikipedia.org/wiki/Asia/Taipei
[pymodule-datetime]: https://docs.python.org/3.5/library/datetime.html#datetime-objects
[python issue 19065]: https://bugs.python.org/issue19065
[PEP 495]: https://www.python.org/dev/peps/pep-0495/
