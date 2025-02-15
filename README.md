## Liang-Bo Wang's blog
My static blog site using [Pelican] and a modified theme based on Kura's [Hauntr] theme (MIT license).

[Pelican]: https://blog.getpelican.com/
[Hauntr]: https://github.com/kura/hauntr


### Setup
For example, create a conda environment `blog` for the dependencies:

    # nodejs for KaTeX server-side render by pelican-katex
    conda create -n blog python=3.13 nodejs
    conda activate blog
    pip install -r requirements.txt

Launch a local web server to serve the blog content at <http://localhost:8000>:

    make devserver

Depoly the updates:

    make github


### License
The blog content is licensed under [Creative Commons Attribution 4.0 International License][CC BY 4.0]. In addition, the source code of this blog site is also licensed under MIT License. See the file `LICENSE` for details.

[CC BY 4.0]: https://creativecommons.org/licenses/by/4.0/
