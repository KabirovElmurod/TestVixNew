from django.db import models
from django.contrib.postgres.indexes import GinIndex

class User(models.Model):
    username = models.CharField(max_length=100, unique=True, db_index=True)
    password = models.CharField(max_length=300, null=False)
    email = models.EmailField(unique=True, null=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username


class Testlar(models.Model):
    # user = models.ForeignKey(User)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    fan = models.CharField(max_length=200)
    tavsif = models.TextField()
    test_id = models.CharField(max_length=100, unique=True, db_index=True)
    test_code = models.CharField(max_length=300, unique=True, db_index=True)
    test_key = models.CharField(max_length=100, unique=True, db_index=True)
    ispublic = models.BooleanField(default=False)
    istime = models.BooleanField(default=False)
    time = models.IntegerField(null=True, blank=True)  # vaqtni minutlarda saqlaymiz
    created = models.DateTimeField(auto_now_add=True)


class Hashtag(models.Model):
    # test = models.ForeignKey(Testlar, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    class Meta:
        indexes = [
            GinIndex(
                fields=["name"],
                name="hashtag_name_trgm_idx",
                opclasses=["gin_trgm_ops"]
            )
        ]

class TestlarHashtag(models.Model):
    test = models.ForeignKey(Testlar, on_delete=models.CASCADE)
    hashtag = models.ForeignKey(Hashtag, on_delete=models.CASCADE)
    tag = models.BooleanField(default=False)

# class Alias(models.Model):
#     name = models.CharField(max_length=100, unique=True, db_index=True)

# class HashtagAlias(models.Model):
#     hashtag = models.ForeignKey(Hashtag, on_delete=models.CASCADE)
#     alias = models.ForeignKey(Alias, on_delete=models.CASCADE)


class Savollar(models.Model):
    test = models.ForeignKey(Testlar, on_delete=models.CASCADE)
    text = models.TextField(null=True)
    svg_json = models.TextField(null=True)



class Variantlar(models.Model):
    savol = models.ForeignKey(Savollar, on_delete=models.CASCADE)
    text = models.TextField(null=True)
    is_true=models.BooleanField(null=True)

class Natijalar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Testlar, on_delete=models.CASCADE)
    sum_son = models.IntegerField(default=0)
    true_son = models.IntegerField(default=0)
    false_son = models.IntegerField(default=0)
    answer = models.JSONField(null=True)
    isfinish = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

# class NatijaAnswer(models.Models):
#     natija = models.ForeignKey(Natijalar, on_delete=models.CASCADE)

