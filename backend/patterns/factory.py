"""
Pattern 2: FACTORY METHOD — xabar kanali yaratish.

TestVix'dagi muammo: tizim turli kanallar orqali xabar yuboradi —
websocket (fastapi_comment), kelajakdagi Telegram bot, email.
Yangi kanal qo'shilganda asosiy kod o'zgarmasligi kerak (O tamoyili).

Yechim: har kanal o'z "fabrika" metodiga ega — qaysi obyekt
yaratilishini voris sinf hal qiladi.
"""

from abc import ABC, abstractmethod


# --- Mahsulotlar: xabar kanallari ---
class XabarKanal(ABC):
    @abstractmethod
    def yubor(self, qabuluvchi: str, matn: str) -> None: ...


class WebSocketKanal(XabarKanal):
    """fastapi_comment dagi mavjud websocket ga mos."""
    def yubor(self, qabuluvchi, matn):
        print(f"[WebSocket -> {qabuluvchi}] {matn}")


class TelegramKanal(XabarKanal):
    """Kelajakdagi aiogram botiga mos."""
    def yubor(self, qabuluvchi, matn):
        print(f"[Telegram -> {qabuluvchi}] {matn}")


class EmailKanal(XabarKanal):
    def yubor(self, qabuluvchi, matn):
        print(f"[Email -> {qabuluvchi}] {matn}")


# --- Yaratuvchi: kanal tanlash strategiyasi ---
class XabarXizmati(ABC):
    @abstractmethod
    def kanal_yarat(self) -> XabarKanal: ...

    def xabar_yubor(self, qabuluvchi: str, matn: str) -> None:
        kanal = self.kanal_yarat()          # qaysi sinf — bilmaydi
        kanal.yubor(qabuluvchi, matn)


class WebSocketXizmat(XabarXizmati):
    def kanal_yarat(self):
        return WebSocketKanal()


class TelegramXizmat(XabarXizmati):
    def kanal_yarat(self):
        return TelegramKanal()


class EmailXizmat(XabarXizmati):
    def kanal_yarat(self):
        return EmailKanal()


def demo():
    # "Imtihon ochildi" xabari turli kanallarga
    for xizmat in (WebSocketXizmat(), TelegramXizmat(), EmailXizmat()):
        xizmat.xabar_yubor("group_42", "Yangi imtihon boshlandi: Algebra")


if __name__ == "__main__":
    demo()
