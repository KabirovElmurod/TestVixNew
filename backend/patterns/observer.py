"""
Pattern 5: OBSERVER — hodisani kuzatuvchilarga xabar berish.

TestVix'dagi muammo: imtihon ochilganda/yopilganda yoki
o'quvchi natija e'lon qilinganda — websocket orqali online
ishtirokchilarga, log'ga, kelajakdagi Telegram'ga xabar ketishi
kerak. Subyekt ularning har birini bevosita chaqirmasligi kerak.

Hozirgi kod: fastapi_comment/app/api/websocket.py dagi
websocket allaqachon "kuzatuvchi" vazifasini bajaradi — bu yerda
uni pattern ko'rinishida rasmiylashtiramiz.
"""

from abc import ABC, abstractmethod
from datetime import datetime


class ImtihonHodisa(ABC):
    """Kuzatuvchi interfeysi (Observer)."""

    @abstractmethod
    def yangilandi(self, hodisa: dict) -> None: ...


class WebSocketKuzatuvchi(ImtihonHodisa):
    """fastapi_comment websocket broker'iga mos."""
    def yangilandi(self, hodisa):
        print(f"[WS broadcast] {hodisa['type']}: {hodisa['text'][:50]}")


class LogKuzatuvchi(ImtihonHodisa):
    def yangilandi(self, hodisa):
        print(f"[LOG] {datetime.now():%H:%M:%S} {hodisa['type']} — {hodisa['text']}")


class TelegramKuzatuvchi(ImtihonHodisa):
    """Kelajakdagi bot — hozircha stub."""
    def yangilandi(self, hodisa):
        print(f"[Telegram] {hodisa['type']}: {hodisa['text'][:50]}")


class ImtihonSubyekti:
    """Subyekt — imtihon holati o'zgarishini kuzatuvchilarga yetkazadi."""

    def __init__(self, exam_id: int, nom: str):
        self.exam_id = exam_id
        self.nom = nom
        self._kuzatuvchilar: list[ImtihonHodisa] = []
        self.holati = "draft"

    def obuna(self, k: ImtihonHodisa) -> None:
        self._kuzatuvchilar.append(k)

    def obunadan_chiq(self, k: ImtihonHodisa) -> None:
        self._kuzatuvchilar.remove(k)

    def _xabar(self, hodisa_type: str, text: str) -> None:
        hodisa = {"type": hodisa_type, "text": text,
                  "exam_id": self.exam_id}
        for k in self._kuzatuvchilar:
            k.yangilandi(hodisa)

    def och(self) -> None:
        self.holati = "open"
        self._xabar("exam_opened", f"{self.nom} imtihoni boshlandi")

    def yop(self) -> None:
        self.holati = "closed"
        self._xabar("exam_closed", f"{self.nom} imtihoni yakunlandi")

    def natija_elon(self, student: str, ball: int) -> None:
        self._xabar("result_published",
                    f"{student}: {ball} ball")


def demo():
    imtihon = ImtihonSubyekti(exam_id=1, nom="Algebra")
    imtihon.obuna(WebSocketKuzatuvchi())
    imtihon.obuna(LogKuzatuvchi())
    imtihon.obuna(TelegramKuzatuvchi())

    imtihon.och()
    imtihon.natija_elon("Jasur", 18)
    imtihon.yop()
    print("Kuzatuvchilar soni:", len(imtihon._kuzatuvchilar))


if __name__ == "__main__":
    demo()
