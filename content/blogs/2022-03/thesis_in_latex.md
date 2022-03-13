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
The WUSTL LaTeX template I could find has a long history[^note-template-history], which has a relative lengthy implementation and includes unnecessary code.
I didn't feel comfortable to build on top of it.

I ended up rewriting the template based on the [memoir] package, which is designed for long documents like book and thesis.
Overall I enjoyed my experience writing in LaTeX, so I wanted to share my LaTeX setup and my experience of editing a long document.

[^note-template-history]:
The history of the existing template goes way back to 1995.
I tried to summarize the history I can be find from the file comments [here][template-history].


[TOC]


## Writing thesis in LaTeX is easy and rewarding (once it's set up)
The advantages of LaTeX and its ecosystem[^latex-advantages] over WYSIWYG editors (e.g., Word and Google Doc) are more obvious when the document gets longer, as WYSIWYG editors start to slow down, say, to change the figure style across the whole document, or to swap some figures and sections.
On the other hand, the LaTeX workflow remains the same.
While the compilation takes longer, it usually runs in the background and I have adapted to only check the output periodically.
I appreciate its reliability and modularity when my document gets really long.
I can just focus on the writing.

The hardest part is the setup of a LaTeX document.

What are the "recommended" packages? What are all these parameters of the packages and commands? How to set up the folder structure? How do I make a figure block whose caption overflows to the next page (and any other visual components)? Finally, not to mention the time I spent fixing the errors and the debugging when the code doesn't work as expected.

Now, after some time going over the documentations, I wanted to write down my setup for future usage.

[^latex-advantages]: Here are the advantages LaTeX I appreciate the most:

    - Precise control of the layout
    - Automatic positioning of float objects (figures and tables)
    - Programmable and reusable visual components, especially those provided by the packages
    - Excellent bibliography management
    - Excellent equation display


## My LaTeX setup
I prefer the combination of LuaLaTeX (XeLaTeX) and BibLaTeX/Biber.
Both LaTeX engines can utilize system fonts and support Unicode.
As for the bibliography management, BibLaTeX is more customizable.


### Bibliography management with Zotero and Better BibTeX
I manage all my reference in [Zotero][zotero].
[My Zotero setup][zotero-post] (Zotero + [Zotfile][zotfile]) has been the same over the past 6 years, which is surprisingly stable in the software world.
Zotero has builtin support to export the reference in BibTeX and BibLaTeX formats.

To further integrate Zotero to the LaTeX workflow, [Better BibTeX for Zotero][better-bibtex] plugin comes in handy.
The plugin can customize the citation key generation, and it can automatically export the `.bib` file when the reference changes.

I currently have the following rule for the citation key generation:

```text
[auth+initials:lower]_[authorLast+initials:lower][>1]:[shorttitle2_2][year]
|[Auth+initials:lower:(unknown)]:[Title:capitalize:substring=1,64][year]
```

The key will try to extract the first and last author of the paper, the first two words of the title, and the publication year.
If the reference is not a article (mostly websites), it will try to use the author, title, and year when available.

Under this rule, for example, the citation key of the famous CRISPR paper ([doi:10.1126/science.1225829][crispr-2012]):

> Jinek, M., Chylinski, K., Fonfara, I., Hauer, M., Doudna, J.A., and Charpentier, E. (2012). A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity. Science 337, 816–821.

becomes `jinekm_charpentiere:ProgrammableDualRNAguided2012`.

Better BibTeX also allows fixing the citation key, which is useful to keep a nickname of some commonly referred publications, or to maintain backward compatibility.


### Overflowing legend of large figures
A feature I found very useful is to allow figure caption/legend to overflow to the next page, which is common in many journals.
Usually the figure is large, taking up the full page, and has multiple panels combined into one file.
And the remaining figure legend need to be put at the next page.
Here's an example of the desired behavior:

<div class="figure">
    <img src="{attach}pics/fig_legend_first_half.png">
    <img src="{attach}pics/fig_legend_second_half.png">
    <p class="caption">Example of the figure legend overflow.</p>
</div>

To create "fake" panels for [subcaption] to keep track of the reference, I followed [the suggestion on LaTeX Stack Exchange](https://tex.stackexchange.com/a/255790) to create a hidden anchor for the label using `\phantomsubcaption`.

To allow the figure legend/caption to overflow, two figure environments are constructed side by side.
Then I used a quotation helper function `\sourceatright` by memoir to place the "(legend continued on next page)" right aligned to the end of legend.

Here's the final helper functions in the permeable:

```latex
% Allowing subcaptions when all figure panels are combined
% into one source image. Require subcaption package.
% Based on https://tex.stackexchange.com/a/255790
\newcommand{\phantomlabel}[1]{%
    \parbox{0pt}{\phantomsubcaption\label{#1}}%
}

% Note for figure caption spanning multiple pages
\newcommand{\legendcontdnote}{\sourceatright[2em]{%
        \footnotesize\itshape(legend continued on next page)%
}}
\newcommand{\legendcontdref}[1]{\emph{(\fref{#1} continued)}}
```

And the following shows an example usage:

```latex
\begin{figure}[p]  % usually large and will need a full page
    \centering
    \phantomlabel{fig:panel-a}  % hidden label of each figure panel
    \phantomlabel{fig:panel-b}
    \phantomlabel{fig:panel-c}
    ...
    \includegraphics{figures/myfigure.pdf}
    \caption{%
        Overview of the whole figure.
        \subref{fig:panel-a}
        Some description about panel A.
        \legendcontdnote
    }
    \label{fig:myfigure}
\end{figure}
\begin{figure}[t]  % place at the top of the very next page
    \centering
    \legend{%
        \legendcontdref{fig:myfigure}
        \subref{fig:panel-b}
        Some description about panel B.
        \subref{fig:panel-c}
        Some description about panel C.
        ...
    }
\end{figure}
```


### Folder structure
I have a very typical folder structure of a thesis:

```tree
wustlthesis.cls     # document class
thesis.tex          # main file (structure and settings)
abstract.tex
acknowledgments.tex
chapters/           # text per chapter
  ├── XX_name.tex
  └── ...
figures/            # figures per chapter
  ├── chapXX_name/
  └── ...
fonts/              # External fonts
.github/workflows/  # Autobuild GitHub workflows
README.md           # Instructions to build the file
latexmkrc           # latexmk settings
references.bib      # Bibliography in BibLaTex
```

The main goal of the folder structure is to organize the materials by chapters.
I also keep all the related files together so the project is standalone and reproducible.


### GitHub online editing workflow
Another pain point of LaTeX setup is the installation of the toolchains (TexLive, MacTex, and etc).
Sometimes I want to work on the document on other's laptop for just a while, to fix an obvious typo or to write down some ideas.
Also a working LaTeX toolchain always read to use will help others to adapt the workflow much more easily.

Turn out I can tap into the continuous integration and continuous delivery (CI/CD) service provided by the online code repositories.
On GitHub, such service is [GitHub Actions][github-actions], allowing user to provide custom Docker image and run arbitrary code.

Luckily, someone has already laid out the ground work by preparing a TeXLive environment into a GitHub Action workflow: <https://github.com/xu-cheng/latex-action>.
Below is an example of creating an online workflow to build the document using LuaLaTeX:

```yaml
# .github/workflows/build_latex.yml
name: Build LaTeX PDF
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Check out Git Repository
      uses: actions/checkout@v2

    - name: Build LaTeX files
      uses: xu-cheng/latex-action@v2
      with:
        root_file: thesis.tex
        latexmk_use_lualatex: true

    - name: Check if PDF file is generated
      run: |
        file thesis.pdf | grep -q ' PDF '

    - name: Upload PDF
      uses: actions/upload-artifact@v2
      with:
        name: PDF
        path: thesis.pdf
```

The workflow is triggered on every git push. Here is an example of my WUSTL thesis template ([link][wustl-tpl-github-actions-overview]):

<div class="figure">
    <img src="{attach}pics/github_actions_overview.png">
    <p class="caption">Overview of all the online LaTeX document compilation jobs using GitHub actions.</p>
</div>

Not only the workflow records the output messages useful to debug, the final PDF output is stored as an artifact.
I no longer need to install LaTeX locally.

<div class="figure">
    <img src="{attach}pics/github_actions_artifact.png">
    <p class="caption">Auto-generated PDF output of the document.</p>
</div>

By putting everything in a GitHub repo, I can also use [GitHub's online editor][github-online-editor] to work on my document in a web browser anywhere.
Together with GitHub Actions, it can be an alternative to online LaTeX platform like Overleaf; hacky but more flexible.

<div class="figure">
    <img src="{attach}pics/github_online_editor.png">
    <p class="caption">Online editor of a LaTeX project in a GitHub repository.</p>
</div>

Currently, the online workflow is not fully optimized.
My full thesis takes about 6--12 minutes to complete on GitHub, while locally, a full run without cache takes about 3--5 minutes.
And incremental local builds can be much faster with caches.
By caching the environment and the intermediate outputs, the online workflow can be faster.


## Package recommendation to start a new LaTeX template
I look into a few package alternatives while updating the thesis template.

For a new template/project, start with [memoir], seriously.

Memoir is certainly a giant package and has a very lengthy documentation (~600 pages).
But it pretty much covers > 90% of the possible formatting I can possibly think of.
The first few chapters of its documentation (up to "Paragraphs and Lists" chapter) are very useful to get the main components and structures in place.

While memoir is powerful and covers everything, I do wish certain aspects of it can be better. The chapter title styling is complicated and difficult.
My another issue is the lack of examples.
I understand the current documentation is already crazily long.
But memoir has *many many* options and features that I sometimes find it difficult to comprehend how to use a specific feature.
Maybe more examples or code snippets can be added in a separate documentation.

With memoir, very few additional packages are required.
Here is a short list of packages:

- [microtype]: final touch on the typography. pure black magic in my view
- [enumitem]: list environment customization
- [threeparttable]: pretty table styling and in-table notes
- [subcaption]: subfloat references
- [hyperref]: link and PDF metadata
- [graphicx]: external graphics
- [fontspec]: custom system fonts
- [csquotes]: quotes
- [babel]: localization

Each package is powerful in their specific usage.
Their documentations are worth reading to fully utilize the package.

[microtype]: https://ctan.org/pkg/microtype
[enumitem]: https://ctan.org/pkg/enumitem
[threeparttable]: https://ctan.org/pkg/threeparttable
[subcaption]: https://ctan.org/pkg/subcaption
[hyperref]: https://ctan.org/pkg/hyperref
[graphicx]: https://ctan.org/pkg/graphicx
[fontspec]: https://ctan.org/pkg/fontspec
[csquotes]: https://ctan.org/pkg/csquotes
[babel]: https://ctan.org/pkg/babel


## Why I didn't use LaTeX a lot during my PhD
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
I don't know yet if I want to create my one-page resume in LaTeX.

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

[zotero]: https://www.zotero.org/
[zotero-post]: {filename}../2015-09/0925_zotero.md
[zotfile]: https://github.com/jlegewie/zotfile

[better-bibtex]: https://retorque.re/zotero-better-bibtex/
[crispr-2012]: https://pubmed.ncbi.nlm.nih.gov/22745249/

[subcaption]: https://www.ctan.org/pkg/subcaption
[github-online-editor]: https://docs.github.com/en/codespaces/the-githubdev-web-based-editor
[github-actions]: https://docs.github.com/en/actions/using-workflows
[wustl-tpl-github-actions-overview]: https://github.com/ccwang002/wustl-latex-dissertation-template/actions/workflows/build_latex.yml
