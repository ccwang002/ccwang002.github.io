#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals
from pathlib import Path
import re

AUTHOR = 'Liang2'
SITENAME = "Liang2's blog"
SITEURL = '/'

PATH = 'content'
ARTICLE_URL = 'posts/{date:%Y}/{date:%m}/{slug}/'
ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%m}/{slug}/index.html'
TIMEZONE = 'Asia/Taipei'

DEFAULT_LANG = 'zh-Hant'
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%b %d, %Y'
USE_FOLDER_AS_CATEGORY = False


# Static path
STATIC_PATHS = ['pics', 'B233544E.pub.asc', 'CNAME']
ARTICLE_PATHS = []

# Find blog post dirs based on regular expression
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

# Plugin
PLUGIN_PATHS = ['./pelican-plugins', ]
PLUGINS = ['liquid_tags.img', 'render_math']

# Theme
THEME = "./theme-flex"
# Flex Theme setting
SITETITLE = "Liang2's Blog"
SITESUBTITLE = "Code / Stat / Bioinfo"
SITEDESCRIPTION = SITETITLE
SITELOGO = "/pics/headpic.jpg"
MAIN_MENU = True
MENUITEMS = [
    ('Archives', '/archives.html'),
    ('Categories', '/categories.html'),
    ('Tags', '/tags.html'),
]
COPYRIGHT_YEAR = 2015
CC_LICENSE = { 'name': 'Creative Commons Attribution', 'version':'4.0', 'slug': 'by' }
OG_LOCALE = 'zh_TW'


# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
# LINKS = (('Pelican', 'http://getpelican.com/'),
#          ('Python.org', 'http://python.org/'),
#          ('Jinja2', 'http://jinja.pocoo.org/'),
#          ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (
    ('twitter', 'https://twitter.com/ccwang002'),
    ('facebook', 'https://www.facebook.com/lbwang.2'),
    ('github', 'https://github.com/ccwang002'),
    ('bitbucket', 'https://bitbucket.org/ccwang002'),
    ('envelope-o', 'mailto:ccwang002@gmail.com'),
    ('linkedin', 'http://tw.linkedin.com/in/liangbowang/'),
)

SUMMARY_MAX_LENGTH = 8
DEFAULT_PAGINATION = 5

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
