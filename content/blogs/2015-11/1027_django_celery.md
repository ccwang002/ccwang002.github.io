---
Title: Celery for Django Background Jobs
Date: 
Category: Coding
Tags: zh
Slug: django-celery
Status: draft
---


```
celery -A bgjob shell
```

## Monitoring

http://docs.celeryproject.org/en/latest/userguide/monitoring.html


### Builtin `celery events` 

First enable the worker to send messages whenever some event happens. Check this if you always get empty task result.

```
celery -A bgjob control enable_events
```

```
celery -A bgjob events
```
 
<div class="figure align-center">
  <img src="{attach}pics/celery_events.png"/>
  <p class="caption">使用 curses 的監控畫面</p>
</div>