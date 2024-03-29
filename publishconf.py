#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'https://blog.liang2.tw'
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'

DELETE_OUTPUT_DIRECTORY = True

# Don't publish drafts
SHOW_DRAFTS = False  # from pelican draft plugin
DRAFT_SAVE_AS = ''
DRAFT_LANG_SAVE_AS = ''

# Following items are often useful when publishing

# utterances, comment system built on GitHub issues
# https://utteranc.es/
UTTERANCES_REPO = "ccwang002/ccwang002.github.io"
UTTERANCES_ISSUE_TERM = "pathname"
UTTERANCES_LABEL = "Comment"


# GOOGLE_ANALYTICS = ""
