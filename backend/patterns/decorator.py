"""
Pattern 4: DECORATOR — obyekt/funksiyaga xulq qo'shish.

TestVix'dagi muammo: crud funksiyalariga logging, timing,
kesh va retry qo'shilishi kerak — lekin har birini qo'lda
qo'shsak, kod chiroyli bo'lmaydi va testda o'chirish qiyin.

Yechim: funksiyani o'rab, yangi xulq qo'shadigan decoratorlar.
Python'dagi @syntax aynan shu patternning til ko'rinishi.
"""

import asyncio
import functools
import time


def timed(func):
    """Vaqt o'lchovchi decorator — async funksiya uchun."""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        print(f"[timed] {func.__name__}: {time.perf_counter()-start:.3f}s")
        return result
    return wrapper


def logged(func):
    """Kirish log'i decorator (sync funksiya uchun)."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[log] {func.__name__} chaqirildi")
        return func(*args, **kwargs)
    return wrapper


def retry(times: int = 3, delay: float = 0.1):
    """Xatoda qayta urinish decorator'i (parameterli, async)."""
    def deco(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if i == times - 1:
                        raise
                    print(f"[retry] {func.__name__} xato, "
                          f"{i+1}-urinish: {e}")
                    await asyncio.sleep(delay)
        return wrapper
    return deco


def demo():
    @timed
    @logged
    async def get_savollar_son():
        await asyncio.sleep(0.05)
        return 42

    @retry(times=2)
    async def flaky():
        raise RuntimeError("test xatosi")

    async def main():
        print("Natija:", await get_savollar_son())
        try:
            await flaky()
        except RuntimeError as e:
            print("flaky yakunlandi:", e)

    asyncio.run(main())


if __name__ == "__main__":
    demo()
