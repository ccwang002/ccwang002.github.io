---
Title: Coding 初學指南附錄 - Bioinfo Practices using Python
Slug: lab-coding-appendix-bioinfo-python
Date: 2016-01-21 23:30
Tags: en, labcoding, python
Category: Coding
Summary: A walk through of practices created by Rosalind Team.
---

Last Edited: Jan, 2016 （如果內容有誤，你可以留言，或用任何管道告訴我）

We are going to walk through a series of practice created by [Rosalind Team][rosalind].

Once you register an account at Rosalind, you can use their judging system to work through all problems. However, in this case you cannot arbitrarily skip easy levels and it sucks. So I'm not going to force you using the system. Luckily, in each problem one set of example data and expected output is given, which can be used for checking our answer.

Note: Their code assumes Python 2 but everything I mention here is Python 3.

[TOC]

> **其他 Coding 初學指南系列文章：**
>
> - [Introduction][intro]
> - [Chapter 1 -- Linux][chp1-linux]
> - [Chapter 2 -- Text Editing (Markdown, Text Editor)][chp2-text-editing]
> - [Chapter 3 -- Version Control (Git)][chp3-git]
> - [Chapter 4 -- Python][chp4-python]
> - [Appendix 1 -- OSX Development Environment][apx0-osx]
> - [Appendix 2 -- Python in Bioinformatics][apx1-bioinfo]
>
> 或者，用 [labcoding](/tag/labcoding.html) 這個 tag 也可以找到所有的文章。

[intro]: {filename}0121_lab_coding_intro.md
[chp1-linux]: {filename}0121_lab_coding_linux.md
[chp2-text-editing]: {filename}0121_lab_coding_text_editing.md
[chp3-git]: {filename}0121_lab_coding_version_control.md
[chp4-python]: {filename}0121_lab_coding_python.md
[apx0-osx]: {filename}0121_lab_coding_a_osx_env.md
[apx1-bioinfo]: {filename}0121_lab_coding_a_bioinfo_python.md



## Python Basics

Do their [Python Village][rosalind-python] problem sets. If any topic you don't know, go read your Python reference.

Should be very trivial.


## Bininfo First Try

### Q DNA: Counting DNA Nucleotides
Link: <http://rosalind.info/problems/dna/>

- Hint: use [collections.Counter](https://docs.python.org/3/library/collections.html#collections.Counter) provided by Python's stdlib
- More Hint: use `' '.join` and list comprehension to output the answer


### Q REVC: The Secondary and Tertiary Structures of DNA
Link: <http://rosalind.info/problems/revc/>

- Hint: [reversed](https://docs.python.org/3/library/functions.html#reversed) for any sequence object and a dict for nucleotide code mapping
- More Hint: done in a list comprehension

[rosalind]: http://rosalind.info/problems/
[rosalind-python]: http://rosalind.info/problems/list-view/?location=python-village


### Q: GC: Computing GC Content
Link: <http://rosalind.info/problems/gc/>

This is the first complicated problem that some abstraction should help you come up the solution. Try write some re-usable code blocks, for example, function calls and class definitions.

Don't worry about the computation complexity

#### Workthrough
*You should implement by yourself before looking my solution. Also I didn't see their official solution so my solution can differ a lot from theirs.*

Intuitively, we need to implement a FASTA file parser. FASTA contains a series of sequence reads with unique ID. From a object-oriented viewpoint, we create classes `Read` for reads and `Fasta` for fasta files.

`Read` is easy to design and understand,

~~~python
class Read:
    def __init__(self, id, seq):
        self.id = id
        self.seq = seq
~~~

Since we need to compute their GC content, add a method for `Read`.

~~~python
class Read:
    # ... skipped
    def gc(self):
        """Compute the GC content (in %) of the read."""
        # put the logic here (think of problem Q DNA)
        gc_percent = f(self.seq)
        return gc_percent
~~~

Then we have to implement the FASTA parser, which reads all read entries and converts them through `Read`. In real world we are dealing with `myfasta.fa`-like files, but here the input is string.

~~~python
class Fasta:
    def __init__(self, raw_str):
        """Parse a FASTA formated string."""
        self.raw_str = raw_str
        # convert string into structured reads.
        self.reads = list(self.parse())

    def parse(self):
        """Parse the string and yield read in Read class."""
        # though we have no idea right now, the code structure
        # should be something like the following.
        raw_lines = self.raw_str.splitlines()
        for line in raw_lines:
            yield Read(...)
~~~

Here I use `yield Read(...)`, which may be unfamiliar for Python beginners. It turns `parse(self)` function as a generator. Generator makes you focus on the incoming data. Once data is parsed and converted, the result is immediated thrown out by `yield`. We don't care about how to collect all the results. In our case, we catch all the results into a list by `list(...)`.

So how should we read FASTA file? A simple rule in this case is that every read consists by two continuous row. Also, the first row will always be the first read id.

All we need is read two lines at the same time. Here [a Pythonic idiom](https://docs.python.org/3/library/functions.html#zip) is introduced. The following code read two non-overlapping lines,

~~~python
for first_line, second_line in zip(*[iter(raw_lines)]*2):
    yield Read(id=first_line, seq=second_line)
~~~

By `zip(*[iter(s)]*n)` magic, we are very close to implement a full parser. You could find a lot of [explanations](http://stackoverflow.com/a/2233247) for this magic.

Read id line percedes with a `>` sign, so we could use something like `first_line[1:]` or `first_line[len('>'):]` for explicity.

Then sorting the GC% of reads in a FASTA file is easy.

~~~python
fasta = Fasta('...')
sorted_reads = sorted(fasta.reads, key=lambda r: r.gc())  # note 1
top_gc_read = sorted_reads[-1]  # note 2
print(
    '>{0:s}\n'
    '{1:.6f}'  # note 3, 4
    .format(top_gc_read.id, top_gc_read.gc())
)
~~~

The code above completes the following steps:

1. `sorted(list, key=key_func)` sorts the list based on the return value of key_func applied to each element.
2. or `top_gc_read = sorted(..., reversed=True)[0]`
3. two string with no operands in between will be joint automatically. In this case it is exactly `>{0:s}\n{1:.6f}`. This is useful to tidy a super long string.
4. `'...'.format()` fills the string with given values. See [doc](https://docs.python.org/3/library/string.html#formatspec).

In real case FASTA can span across multiple lines, also likely the file we parse is broken. How could we modify this parser to handle these situations?


### Q: (next?)
I'm super tired now so I'll leave the rest for you. Try those problems within yellow correct ratio range.
