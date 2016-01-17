---
Title: Numpy Indexing
Slug: numpy-index
Date: 2016-01-18 02:00
Tags: zh, python, numpy, pandas
Category: Coding
Summary: Numpy 多維度的 indexing 跟 pandas 行為不一樣，需要額外的操作。
---

前幾天需要寫 [numpy] 時，突然發現它跟 [pandas] 在 indexing 的行為蠻不一樣的。

就用時事來舉例吧，把維基百科上[各政黨 2016 年臺灣立法委員提名數][wiki]的表格抓下來：

```python
import pandas as pd
import numpy as np
from urllib.parse import quote_plus

dfs = pd.read_html(
    'https://zh.wikipedia.org/wiki/%s' 
    % quote_plus('2016年中華民國立法委員選舉')
)
df = next(
    df for df in dfs 
    if '立法委員政黨提名名額' in str(df.iloc[0, 0])
)

# Data cleaning
df.columns = df.iloc[1, :].values
df['政黨'] = df['政黨'].str.replace(
    r'\[(註 |)\d+\]', ''
)
df.index = df['政黨']
df = df.replace('－', 0)
df = df.iloc[2:-1, 1:-1].astype(np.int)
```

做完大概長這樣：

|           |   區域 |   原住民 |   不分區 |
|:----------|-----:|------:|------:|
| 中國國民黨     |   72 |     5 |    33 |
| 民主進步黨     |   60 |     2 |    34 |
| 台灣團結聯盟    |    2 |     0 |    15 |
| 親民黨       |    6 |     1 |    16 |
| 無黨團結聯盟    |    0 |     1 |     7 |
| 民國黨       |   13 |     1 |    10 |
| 綠黨社會民主黨聯盟 |   11 |     0 |     6 |
| 中華統一促進黨   |   14 |     0 |    10 |
| 時代力量      |   12 |     0 |     6 |
| 大愛憲改聯盟    |   12 |     0 |     6 |


### Pandas indexing

Pandas indexing 花俏到用[一](http://pandas.pydata.org/pandas-docs/stable/indexing.html)、[兩](http://pandas.pydata.org/pandas-docs/stable/advanced.html)頁也介紹不完。

不過今天只想說有關兩個維度以上的 indexing，例如想看國民黨、民進黨、時代力量區域與不分區的提名好了，

```python
df.iloc[
    [0, 1, 8], [0, -1]
]
df.loc[
    ['中國國民黨', '民主進步黨', '時代力量'], 
    ['區域', '不分區']
]
```

上述兩個方法都能拿到一部份的表格。

|       |   區域 |   不分區 |
|:------|-----:|------:|
| 中國國民黨 |   72 |    33 |
| 民主進步黨 |   60 |    34 |
| 時代力量  |   12 |     6 |


### Numpy indexing

下意識地以為 [numpy indexing] 會是一樣的，畢竟 pandas 底層就是一個 numpy array。

```pycon
>>> arr = df.values
>>> arr[:5]
array([[72,  5, 33],
       [60,  2, 34],
       [ 2,  0, 15],
       [ 6,  1, 16],
       [ 0,  1,  7]])
>>> arr[[0, 1, 8], [0, -1]]
...
IndexError: shape mismatch: indexing arrays could not be broadcast 
together with shapes (3,) (2,) 
```

回去看[官方文件][numpy indexing]才想起來， numpy 這時候是如同給定 (x, y) 座標這樣，一個個把元素選出來。

```pycon
>>> arr[[0, 1, 8], [0, 1, 2]]
[72, 2, 6]
```

簡單的方式是分兩次選，

```python
arr[[0, 1, 8], :][:, [0, 2]]
```

但這樣 numpy 會傳兩次 copy[^1] 回來，資料很大的時候就沒效率。所以要怎麼做呢？

參考 [Stack Overflow](http://stackoverflow.com/a/30918530) 上的回答，底下幾種方式都可以。最簡單的方法就是透過 [numpy.ix_()][np.ix]，

```python
arr[np.ix_([0, 1, 8], [0, 2])]
```

如果了解 numpy broadcasting 機制的話，

```python
# index must be numpy array
cols = np.array([0, 1, 8])
rows = np.array([0, 2])
arr[cols[:, np.newaxis], rows]

# np.newaxis is None
arr[cols[:, None], rows]
```

或者直接把所有包含的 index 值都做出來，

```python
indices = np.meshgrid(
    [0, 1, 8], [0, 2], 
    indexing='ij'
)
arr[indices]
```

整理一下，這只要一段時間沒用就常會忘記。


[^1]: 在這情況資料會被 copy 傳回來，但如果是 `start:end:step` 的 simple indexing 就只會回傳 view。

[numpy]: http://docs.scipy.org/doc/numpy/index.html
[pandas]: http://pandas.pydata.org/
[wiki]: https://zh.wikipedia.org/wiki/2016%E5%B9%B4%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E7%AB%8B%E6%B3%95%E5%A7%94%E5%93%A1%E9%81%B8%E8%88%89
[numpy indexing]: http://docs.scipy.org/doc/numpy/reference/arrays.indexing.html#arrays-indexing
[np.ix]: http://docs.scipy.org/doc/numpy-1.10.1/reference/generated/numpy.ix_.html#numpy.ix_