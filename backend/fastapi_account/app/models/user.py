from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Text
from ...app.base import Base


# class User(models.Model):
#     username = models.CharField(max_length=100, unique=True, db_index=True)
#     password = models.CharField(max_length=300, null=False)
#     email = models.EmailField(unique=True, null=False, db_index=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     nickname = models.CharField(max_length=100, null=True, blank=True)
    # is_admin = models.BooleanField(default=False)
    # is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return self.username



class User(Base):
    __tablename__ = "myapp_user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    password = Column(String(300), nullable=False)
    email = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime, default=func.now())
    nickname = Column(String(100), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    def __str__(self):
        return self.username


# class Testlar(models.Model):
#     # user = models.ForeignKey(User)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     nom = models.CharField(max_length=200)
#     fan = models.CharField(max_length=200)
#     tavsif = models.TextField()
#     test_id = models.CharField(max_length=100, unique=True, db_index=True)
#     test_code = models.CharField(max_length=300, unique=True, db_index=True)
#     test_key = models.CharField(max_length=100, unique=True, db_index=True)
#     ispublic = models.BooleanField(default=False)
#     istime = models.BooleanField(default=False)
#     time = models.IntegerField(null=True, blank=True)  # vaqtni minutlarda saqlaymiz
#     created = models.DateTimeField(auto_now_add=True)

class Testlar(Base):
    __tablename__ = "myapp_testlar"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    nom = Column(String(200), nullable=False)
    fan = Column(String(200), nullable=False)
    tavsif = Column(Text, nullable=False)
    test_id = Column(String(100), unique=True, index=True)
    test_code = Column(String(300), unique=True, index=True)
    test_key = Column(String(100), unique=True, index=True)
    ispublic = Column(Boolean, default=False)
    istime = Column(Boolean, default=False)
    time = Column(Integer, nullable=True)  # vaqtni minutlarda saqlaymiz
    created = Column(DateTime, default=func.now())

    def __str__(self):
        return self.nom