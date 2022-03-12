---
Title: Thesis in LaTeX
Slug: thesis-latex
Date: 2022-03-12
Tags: en, latex
Category: Coding
Lang: en
---

<!-- cSpell:words zotero WUSTL -->

A few months ago, I finished [my PhD thesis][my-phd-thesis] in LaTeX.
Because the available WUSTL LaTeX template I could find has a long history[^note-template-history], which has a relative lengthy implementation and includes unnecessary code.
In the end, I decided to rewrite it based on [memoir], a LaTeX package designed for long documents like book and thesis.

Just wanted to share my LaTeX setup and my experience of editing a long document.

[^note-template-history]:
The history of the existing template goes way back to 1995.
I tried to summarize the history I can be find from the file comments [here][template-history].


[TOC]


[old post about zotero][zotero-post]


## Why I didn't use LaTeX much during my PhD
I didn't really have many chances to use LaTeX during my PhD.
It's usually not worth the effort to use LaTeX for documents less than 50 pages.

The most common documents I need to produce are presentations and manuscripts, and I don't think LaTeX is useful here.
My presentations are figure heavy.
Many figures are clipped from webpages, tool outputs, and other papers.
They are messy and require post-editing like croppings and overlays, which are easier to do interactively; PowerPoint wins.
Moreover, I need to finish my slides in a short time.
LaTeX is not the right tool.

As for the manuscripts, the figures and text are managed separately, so there is no need to work on how to insert the figures at the right location in text.
The main text editing is about citations.
While LaTeX is good at them, Zotero can manage citations and bibliography easily on Google Docs, Word, and LibreOffice Writer.
Another main hassle of manuscript editing is collaboration.
While it's possible for LaTeX, the existing services have a high entry bar with little benefit.


## Types of documents I will write in LaTeX in future
I think LaTeX (and its ecosystem) has the following advantages over WYSIWYG editors:

- Precise control of the layout
- Automatic positioning of float objects (figures and tables)
- Programmable and reusable visual components, especially powered by some packages
- Excellent bibliography management
- Excellent equation display

The advantages above are stronger for a longer document, as WYSIWYG editors start to slow down and become difficult to manage, say, to change the figure style across the whole document.
On the other hand, for LaTeX, while the compilation time becomes longer, it is usually running in the background.
So if I need to write a report longer than 50 pages, I will definitely start with LaTeX based on my thesis setup.

I also updated [my LaTeX based CV][my-CV] while I am playing with LaTeX for my thesis.
In fact, I changed it with a different theme and rewrote many parts of the theme to utilize awesome packages.


[my-phd-thesis]: https://github.com/ccwang002/phd-thesis
[template-history]: https://github.com/ccwang002/wustl-latex-dissertation-template/#origin-of-this-template
[memoir]: https://www.ctan.org/pkg/memoir
[my-CV]: https://github.com/ccwang002/cv
[zotero-post]: {filename}../2015-09/0925_zotero.md
