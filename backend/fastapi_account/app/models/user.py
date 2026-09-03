from sqlalchemy import JSON, Column, Integer, String, Boolean, DateTime, func, Text, ForeignKey
from sqlalchemy.orm import relationship
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




class Savollar(Base):
    __tablename__ = "myapp_savollar"
    id = Column(Integer, primary_key=True)
    test_id = Column(
        Integer,
        ForeignKey("myapp_testlar.id", ondelete="CASCADE")
    )
    text = Column(Text, nullable=True)
    svg_json = Column(Text, nullable=True)

class Variantlar(Base):
    __tablename__ = "myapp_variantlar"
    id = Column(Integer, primary_key=True)
    savol_id = Column(
        Integer,
        ForeignKey("myapp_savollar.id", ondelete="CASCADE")
    )
    # savol = ForeignKey(Savollar, ondelete="CASCADE")
    text = Column(Text, nullable=True)
    is_true = Column(Boolean, nullable=True)



class Hashtag(Base):
    __tablename__ = "myapp_hashtag"
    id = Column(Integer, primary_key=True)
    # test_id = Column(
    #     Integer,
    #     ForeignKey("myapp_testlar.id", ondelete="CASCADE")
    # )
    name = Column(String(100), unique=True, index=True)
    

    

class TestlarHashtag(Base):
    __tablename__ = "myapp_testlarhashtag"
    id = Column(Integer, primary_key=True)
    test_id = Column(
        Integer,
        ForeignKey("myapp_testlar.id", ondelete="CASCADE")
    )
    hashtag_id = Column(
        Integer,
        ForeignKey("myapp_hashtag.id", ondelete="CASCADE")
    )
    tag = Column(Boolean, default=False)



class Natijalar(Base):
    __tablename__ = "myapp_natijalar"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    test_id = Column(Integer, ForeignKey("myapp_testlar.id", ondelete="CASCADE"))
    sum_son = Column(Integer, default=0)
    true_son = Column(Integer, default=0)
    false_son = Column(Integer, default=0)
    answer = Column(JSON, nullable=True)
    isfinish = Column(Boolean, default=False)
    created = Column(DateTime, default=func.now())
    isfinish = Column(Boolean, default=False)
    created = Column(DateTime, default=func.now())
