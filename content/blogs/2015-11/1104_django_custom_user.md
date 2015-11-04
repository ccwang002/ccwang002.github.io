---
Title: Customize Django User Model
Slug: django-custom-user
Date: 2015-11-04 18:23
Tags: zh, django
Category: Coding
---

Django 帳號的欄位定義在 `django.contrib.auth` 的 [User] 中，對使用者而言包含了：username\*、first_name、last_name、email、password\*。同時對開發者來說，還有：

- 指定 Group 和 Permission
- 是否為 staff、superuser
- 帳號開通、最後一次登入時間

內建的帳號功能應該很實用，安全性也很好。所以一般來說都不會去改它。

如果只是想要幫 User 加個 profile，例如生日、來自哪個星球等欄位，也不需要改寫 User。參考官網 [Extending the existing User model][djdoc:extending-user]，只需要建一個 one-to-one relationship 指到 User 就好了：

```python
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL)
    birth = models.DateField()
    orig_planet = models.CharField(max_length=255)
```

但 Django 預設用 username 來登入，如果要改用 email 登入要怎麼做？


### 改用 Email 做帳號登入
因為 User 是個很重要的 model，所以改寫時要注意相容性的問題。其實官網也有教學 [Specifying a custom User model][djdoc:custom-user]，不過這教學比前面長很多。

網路上已經有人 @jcugat 做了一個套件 [django-custom-user]，他實作了 `EmailUser` 即用 email 作為帳號登入。已經把所有苦工都做好了，所以如果想要再加上自己的欄位等等，可以繼承他的 `AbstractEmailUser`。

其實如果看完自定 User 之後，寫好 User Model 不難，比較複雜的是像創建、修改 User 以及 admin 的設定。除了讀這個套件的 source code 之後，[這串 Stack Overflow 討論][SO:custom-user]也提到了不同的實作方式。Django 這部份的 source code 蠻好讀的，也可以看一下。

因為之後要做 Email 認証，應該會用 [django-allauth] 做。感覺很久沒發文了，應該要把文章拆短才對 XD

[User]: https://docs.djangoproject.com/en/1.8/ref/contrib/auth/#fields
[djdoc:extending-user]: https://docs.djangoproject.com/en/1.8/topics/auth/customizing/#extending-the-existing-user-model
[djdoc:custom-user]: https://docs.djangoproject.com/en/1.8/topics/auth/customizing/#specifying-a-custom-user-model
[django-custom-user]: https://github.com/jcugat/django-custom-user
[SO:custom-user]: http://stackoverflow.com/questions/15012235
[django-allauth]: https://github.com/pennersr/django-allauth
