from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime, func, Text, JSON
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
