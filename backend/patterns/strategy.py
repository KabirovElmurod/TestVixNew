"""
Pattern 6: STRATEGY — almashinadigan algoritmlar oilasi.

TestVix'dagi muammo: get_savol_by_test_id ichida
`if TEMP_ANSWER_MODE` sharti bor — normal vs aralash-tartiblash
algoritmlari bitta funksiyada. Yangi algoritm (masalan,
qiyinlikka qarab saralash) qo'shilganda funksiya o'zgaradi.

Yechim: har bir algoritm alohida strategiya klassi —
xizmat ularni almashtirib ishlatadi (bizning
savol_delivery.py dagi _javoblarni_aralashtirish ga mos).
"""

from abc import ABC, abstractmethod


class TartiblashStrategiyasi(ABC):
    @abstractmethod
    def tartibla(self, savollar: list[dict], user_id: int,
                 base_position: int) -> list[dict]:
        """Savollar ro'yxatini qaytaradi (in-place yoki yangi)."""


class NormalTartiblash(TartiblashStrategiyasi):
    """Oddiy tartib — Redis LIST'dagi ketma-ketlik (eski xatti-harakat)."""
    def tartibla(self, savollar, user_id, base_position):
        return savollar


class TempAralashTartiblash(TartiblashStrategiyasi):
    """TEMP_ANSWER_MODE: to'g'ri javobni deterministik joylashtiradi."""

    def tartibla(self, savollar, user_id, base_position):
        if not savollar:
            return savollar
        h_str = str((user_id * 137 + 19) ** 40)
        h_len = len(h_str)

        for idx, savol in enumerate(savollar):
            variants = savol.get("variantlar") or []
            n = len(variants)
            if n <= 1:
                continue
            pos = base_position + idx
            target = (int(h_str[pos % h_len]) + pos) % n
            true_idx = next(
                (i for i, v in enumerate(variants) if v.get("is_true")),
                None)
            if true_idx is None or true_idx == target:
                continue
            true_variant = variants.pop(true_idx)
            variants.insert(target, true_variant)
        return savollar


class QiyinlikkaTartiblash(TartiblashStrategiyasi):
    """Yangi strategiya misoli: qiyinlik bo'yicha saralash."""

    def __init__(self, qiyinlik_kamayi: bool = True):
        self.kamayi = qiyinlik_kamayi

    def tartibla(self, savollar, user_id, base_position):
        return sorted(
            savollar,
            key=lambda s: s.get("qiyinlik", 0),
            reverse=self.kamayi,
        )


class SavolYetkazishXizmati:
    """Strategiyani tashqaridan oladi — if/elif yo'q."""

    def __init__(self, strategiya: TartiblashStrategiyasi):
        self.strategiya = strategiya

    def ber(self, savollar: list[dict], user_id: int,
            base_position: int = 0) -> list[dict]:
        return self.strategiya.tartibla(savollar, user_id, base_position)


def demo():
    savol = {"id": 1, "qiyinlik": 2, "variantlar": [
        {"id": 1, "is_true": True},
        {"id": 2, "is_true": False},
        {"id": 3, "is_true": False},
        {"id": 4, "is_true": False},
    ]}
    savollar = [savol]

    for strat in (NormalTartiblash(), TempAralashTartiblash(),
                  QiyinlikkaTartiblash()):
        xizmat = SavolYetkazishXizmati(strat)
        natija = xizmat.ber(
            [{"id": s["id"], "qiyinlik": s["qiyinlik"],
              "variantlar": [dict(v) for v in s["variantlar"]]}
             for s in savollar],
            user_id=7)
        print(type(strat).__name__, "->",
              [v["id"] for v in natija[0]["variantlar"]])


if __name__ == "__main__":
    demo()
