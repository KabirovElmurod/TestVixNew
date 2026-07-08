from django.contrib import admin
from .models import Testlar, Hashtag, Savollar, Variantlar, TestlarHashtag


admin.site.register(Testlar)
admin.site.register(Hashtag)
admin.site.register(TestlarHashtag)
admin.site.register(Savollar)
admin.site.register(Variantlar)

# Register your models here.
