from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from ..base import Base


class Testlar(Base):
    __tablename__ = "myapp_testlar"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    nom = Column(String(200), nullable=False)
    fan = Column(String(200), nullable=False)
    tavsif = Column(Text, nullable=False)
    test_id = Column(Integer, unique=True, index=True)
    test_code = Column(String(300), unique=True, index=True)
    test_key = Column(String(100), unique=True, index=True)
    ispublic = Column(Boolean, default=False)
    istime = Column(Boolean, default=False)
    time = Column(Integer, nullable=True)
    created = Column(DateTime, default=func.now())

    savollar = relationship("Savollar", back_populates="test")
    testlar_hashtag = relationship("TestlarHashtag", back_populates="test")

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
    variantlar = relationship("Variantlar", back_populates="savol")
    test = relationship("Testlar", back_populates="savollar")


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
    savol = relationship("Savollar", back_populates="variantlar")



class Hashtag(Base):
    __tablename__ = "myapp_hashtag"
    id = Column(Integer, primary_key=True)
    # test_id = Column(
    #     Integer,
    #     ForeignKey("myapp_testlar.id", ondelete="CASCADE")
    # )
    name = Column(String(100), unique=True, index=True)
    tag = Column(Boolean, default=False)

    

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
    
    test = relationship("Testlar", back_populates="testlar_hashtag")
