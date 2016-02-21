---
Title: Add language name as CSS class of highlighted code blocks in Pelican markdowns
Slug: markdown-codehilite-lang
Date: 2016-02-19 15:00
Tags: en, blog, pelican, codehilite, pygment
Category: Coding 
---

I used [Pelican] and its [Markdown] plugin to render blog post. 

Recently I was playing with the [Python Official Documentation], which has a decent code syntax highlighter powered by [Pygments]. 

What's more, the output of code examples can be toggled. That is, a code example:

```python3
>>> print('Hello World')
Hello World
>>> 6 * 7
42
```  

can be toggled to:

```python3
print('Hello World')

6 * 7

```

which is very convenient for code copy-pasting.

However, the functionality is currently failed on the official Python doc (given by [`copybutton.js`](https://docs.python.org/3/_static/copybutton.js)) because the jQuery updates break previous API behavior. I've filed [issue 26246](http://bugs.python.org/issue26246) on the Python issue tracker for this problem.

Anyway, you can find a [workable example](http://docs.python.org.tw/3/tutorial/controlflow.html) from Taiwan's doc translation (I'm involved in it so I already fixed it) and its functional [copybutton.js](http://docs.python.org.tw/3/_static/copybutton.js) file.

[Pelican]: http://docs.getpelican.com/
[Markdown]: https://pythonhosted.org/Markdown/
[Python Official Documentation]: https://docs.python.org/
[Pygments]: http://pygments.org/



### Code output toggle in Pelican 

After I fixed the copybutton.js, I wished to add this functionality to my blog. 

Code highlighting in Pelican markdown files is handled by its [CodeHilite](https://pythonhosted.org/Markdown/extensions/code_hilite.html) extension. To my surprise, I found CodeHilite does not express the language name specified for each code block.

What I expected was

```html
<div class="highlight-python3">
    <div class="highlight">
        <pre>
            <!-- ... -->
        </pre>
    </div>
</div>
```

but the actual output was

```html
<div class="highlight">
    <pre>
        <!-- ... -->
    </pre>
</div>
```

So no way to find the language name the code block used, nor the lexer aliases Pygments guessed when no language name was specified.

A quick dig into the [source code](https://github.com/waylan/Python-Markdown/blob/master/markdown/extensions/codehilite.py#L106-L123) showed that it is relatively easy to fix. Here is the diff:

```diff
diff --git a/extensions/codehilite.py b/extensions/codehilite_updated.py
index 0657c37..4fad7c5 100644
--- a/extensions/codehilite.py
+++ b/extensions/codehilite_updated.py
@@ -75,7 +75,8 @@ class CodeHilite(object):

     def __init__(self, src=None, linenums=None, guess_lang=True,
                  css_class="codehilite", lang=None, style='default',
-                 noclasses=False, tab_length=4, hl_lines=None, use_pygments=True):
+                 noclasses=False, tab_length=4, hl_lines=None, use_pygments=True, 
+                 wrap_by_lang=True):
         self.src = src
         self.lang = lang
         self.linenums = linenums
@@ -86,6 +87,7 @@ class CodeHilite(object):
         self.tab_length = tab_length
         self.hl_lines = hl_lines or []
         self.use_pygments = use_pygments
+        self.wrap_by_lang = wrap_by_lang

     def hilite(self):
         """
@@ -114,13 +116,22 @@ class CodeHilite(object):
                         lexer = get_lexer_by_name('text')
                 except ValueError:
                     lexer = get_lexer_by_name('text')
+            lang = lexer.aliases[0]
             formatter = get_formatter_by_name('html',
                                               linenos=self.linenums,
                                               cssclass=self.css_class,
                                               style=self.style,
                                               noclasses=self.noclasses,
                                               hl_lines=self.hl_lines)
-            return highlight(self.src, lexer, formatter)
+            hilited_html = highlight(self.src, lexer, formatter)
+            if self.wrap_by_lang and self.lang:
+                return '<div class="%(class)s-%(lang)s">%(html)s</div>\n' % {
+                    'class': self.css_class,
+                    'lang': lang.replace('+', '-'),
+                    'html': hilited_html,
+                }
+            else:
+                return hilited_html
         else:
             # just escape and build markup usable by JS highlighting libs
             txt = self.src.replace('&', '&amp;')
```

I'm happy with the patched codehilite output. I am now able to give code toggle function to specific code languages. 

However it's quite busy these days, so it may take a while to submit a proper pull request (e.g. fix any broken unit tests, write new tests, and tune the API as well as the new behavior). Moerover, **currently my site does not use jQuery** so I am missing a huge dependency. Rewriting it using vanilla JS seems to require considerable work, and the very thing I don't have at hand is time :(

I've decided to leave this improvement in future development. But if your site use Pelican Markdown and imports jQuery, the diff will add the code language back. 