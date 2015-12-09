```
python manage.py makemigrations --empty demo_site
```

```
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


def change_site_name(apps, schema_editor):
    # We can't import the Site model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Site = apps.get_model('sites', 'Site')
    Site.objects.update_or_create(
        pk=settings.SITE_ID,
        domain='localhost', name='localhost'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('sites', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(change_site_name),
    ]
```