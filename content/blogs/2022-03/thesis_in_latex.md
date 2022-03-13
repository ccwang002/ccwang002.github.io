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


## Writing thesis in LaTeX is easy and rewarding (once it's set up)
LaTeX and its ecosystem, in my opinion, has the following advantages over WYSIWYG editors (e.g., Word and Google Doc):

- Precise control of the layout
- Automatic positioning of float objects (figures and tables)
- Programmable and reusable visual components, especially powered by some packages
- Excellent bibliography management
- Excellent equation display

The advantages above are stronger when the document gets longer, as WYSIWYG editors start to slow down and become difficult to make big changes across the document, say, to change the figure style across the whole document, or to swap some figures and sections.

On the other hand, in LaTeX, the workflow is the same.
While the compilation time becomes longer, it is usually running in the background and I have adapted to check the output only periodically.
I appreciate its reliability when my document reaches 100 pages.
With the correct syntax, it will work.
I can just focus on the writing and leave everything else to LaTeX.


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
If I need to write a report longer than 50 pages, I will write in LaTeX and use my thesis setup.

I also have been updating my CV in LaTeX.
While I am playing with LaTeX for my thesis, I also applied the new things I learned to [my CV][my-CV].
In fact, I applied a different theme and rewrote many parts of the theme to utilize the awesome packages.
I like my new CV to be clean, minimalist, and easy to extend.
I don't know yet if I want to create my one-page résumé in LaTeX.

So is LaTeX worth learning if I am not going to write a book or a long report in future?

It's a bad investment in time for sure, since I have been putting hours in learning LaTeX.
But I have since been paying more attention to typography and layout of my documents in general.
I appreciate certain aesthetics of the printings.
And by trying to fulfill the desired look and feel in my documents, I've also improved my editing skills in all WYSIWYG editors (even Adobe InDesign) and webpages (CSS).
It's hard to beat that artistic satisfaction of getting the style right.

I am glad that I learned LaTeX.


[my-phd-thesis]: https://github.com/ccwang002/phd-thesis
[template-history]: https://github.com/ccwang002/wustl-latex-dissertation-template/#origin-of-this-template
[memoir]: https://www.ctan.org/pkg/memoir
[my-CV]: https://github.com/ccwang002/cv
[zotero-post]: {filename}../2015-09/0925_zotero.md
