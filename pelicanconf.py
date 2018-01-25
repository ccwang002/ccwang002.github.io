#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from pathlib import Path
import re


AUTHOR = 'Liang-Bo Wang'
SITENAME = "Liang2's Blog"
SITEURL = ''

PATH = 'content'
ARTICLE_URL = 'posts/{date:%Y}/{date:%m}/{slug}/'
ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%m}/{slug}/index.html'
ARTICLE_LANG_URL = 'posts/{date:%Y}/{date:%m}/{slug}/{lang}.html'
ARTICLE_LANG_SAVE_AS = 'posts/{date:%Y}/{date:%m}/{slug}/{lang}.html'
CATEGORY_URL = 'category/{slug}'
CATEGORY_SAVE_AS = 'category/{slug}/index.html'
PAGE_URL = '{slug}/'
PAGE_SAVE_AS = '{slug}/index.html'
PAGE_LANG_URL = '{slug}/{lang}.html'
PAGE_LANG_SAVE_AS = '{slug}/{lang}.html'
TAG_URL = 'tag/{slug}'
TAG_SAVE_AS = 'tag/{slug}/index.html'

# Static path
STATIC_PATHS = [
    'pics',
    'B233544E.pub.asc', '730992C4.pub.asc',
    'CNAME',
    'CV.pdf'
]

# Find blog post dirs based on regular expression
ARTICLE_PATHS = []
_CONTENT_DIR = Path('content')
_BLOG_ROOT = _CONTENT_DIR / 'blogs'
blog_dirs_by_month = []
for dir_pth in _BLOG_ROOT.iterdir():
    if dir_pth.is_dir() and re.match(r'^\d{4}-\d{2}$', dir_pth.stem):
        blog_dirs_by_month.append(
            dir_pth.relative_to(_CONTENT_DIR).as_posix()
        )
STATIC_PATHS += blog_dirs_by_month
ARTICLE_PATHS += blog_dirs_by_month

# Datetime settings
TIMEZONE = 'US/Central'
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%b %d, %Y'

DEFAULT_LANG = 'en'
OG_LOCALE = 'en_US'

USE_FOLDER_AS_CATEGORY = False

# Markdown settings
MARKDOWN = {
    'extension_configs' : {
        'markdown.extensions.codehilite': {'css_class': 'highlight'},
        'markdown.extensions.smarty': {},
        'markdown.extensions.toc': {},
        'markdown.extensions.extra': {},
    },
    'output_format': 'html5',
}

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = ()

# Social widget
SOCIAL = ()

SUMMARY_MAX_LENGTH = 24
DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True

# Theme settings
THEME = 'hauntr'

def sort_by_len(value, len_key=-1, reversed=False):
    return sorted(
        value,
        key=lambda t: (-len(t[len_key]), *t),
        reverse=reversed,
    )
JINJA_FILTERS = {
    'sort_by_len': sort_by_len  # required by theme-flex
}

# Plugin settings
PLUGIN_PATHS = ['pelican-plugins', ]
PLUGINS = [
    'assets',
    'render_math',
    'touch',
]

