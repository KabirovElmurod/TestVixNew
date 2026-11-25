"""
Pattern 1: SINGLETON — yagona konfiguratsiya/ulanish menejeri.

TestVix'dagi muammo: har bir FastAPI servis o'z config.py'sida
DATABASE_URL, Redis manzili kabi sozlamalarni yuklaydi. Singleton
 orqali bitta Config obyekti butun servis bo'ylab ishlatiladi.

Eslatma: modul-darajasidagi `engine = create_async_engine(...)`
 allaqachon de-facto singleton — bu klass uni rasmiylashtiradi
 va testda almashtirish imkonini beradi.
"""

import threading


class AppConfig:
    """Yagona sozlamalar obyekti (Singleton)."""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._loaded = False
        return cls._instance

    def load(self, env: dict):
        """Sozlamalarni bir marta yuklaydi (qayta chaqiruv e'tiborsiz)."""
        if self._loaded:
            return self
        self.database_url = env.get("DATABASE_URL", "")
        self.redis_url = env.get("REDIS_URL", "redis://redis:6379/0")
        self.groq_api_key = env.get("GROQ_API_KEY", "")
        self.jwt_secret = env.get("JWT_SECRET", "")
        self._loaded = True
        return self

    def __repr__(self):
        return f"<AppConfig db={self.database_url[:30]}...>"


def demo():
    c1 = AppConfig().load({"DATABASE_URL": "postgresql://x"})
    c2 = AppConfig().load({"DATABASE_URL": "boshqa"})
    print("Singleton: bitta obyekt =", c1 is c2,
          "| birinchi qiymat saqlanadi =", "postgresql://x" in repr(c2))


if __name__ == "__main__":
    demo()
