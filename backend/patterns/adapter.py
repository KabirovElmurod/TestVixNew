"""
Pattern 3: ADAPTER — mos kelmaydigan interfeysni moslashtirish.

TestVix'dagi muammo: AI qatlami Groq API'dan foydalanadi
(openai client + base_url="https://api.groq.com/openai/v1"),
lekin kod faqat "matn -> matn" emas, test uchun soxta LLM
kerak. Yangi LLM provayder (OpenAI, Gemini) qo'shilganda
eski chaqiruvlar o'zgarmasligi kerak.

Yechim: LLMClient interfeysini belgilab, har bir tashqi
servisni unga moslaymiz (Adapter).
"""

from abc import ABC, abstractmethod
import json


class LLMClient(ABC):
    """Required interface: matn generatsiya qiluvchi klient."""

    @abstractmethod
    def generate(self, prompt: str, json_mode: bool = False) -> str: ...


class GroqAdapter(LLMClient):
    """Mavjud Groq chaqiruvini LLMClient interfeysiga moslaydi."""

    def __init__(self, api_key: str, model: str = "openai/gpt-oss-120b"):
        self.api_key = api_key
        self.model = model

    def generate(self, prompt: str, json_mode: bool = False) -> str:
        # Haqiqiy kodda: OpenAI(base_url=groq).chat.completions...
        print(f"[Groq:{self.model}] {prompt[:40]}...")
        return '{"hashtags": ["matematika", "algebra"]}'


class FakeLLMAdapter(LLMClient):
    """Test uchun soxta adapter — hech qanday tarmoq so'rovi yo'q."""

    def __init__(self, javob: str = "{}"):
        self.javob = javob
        self.chaqiruvlar = []

    def generate(self, prompt: str, json_mode: bool = False) -> str:
        self.chaqiruvlar.append(prompt)
        return self.javob


class OpenAIAdapter(LLMClient):
    """Kelajakdagi OpenAI provayderi — interfeys allaqachon mos."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self.javob = "{}"

    def generate(self, prompt: str, json_mode: bool = False) -> str:
        print(f"[OpenAI:{self.model}] {prompt[:40]}...")
        return self.javob


def hashtag_yarat(llm: LLMClient, nom: str, fan: str) -> dict:
    """Biznes-mantiq — faqat LLMClient interfeysiga bog'liq."""
    javob = llm.generate(f"Hashtag yarat: {nom} / {fan}", json_mode=True)
    return json.loads(javob)


def demo():
    real = GroqAdapter(api_key="gsk_xxx")
    fake = FakeLLMAdapter('{"hashtags": ["test"]}')
    print("Groq:", hashtag_yarat(real, "Algebra", "Matematika"))
    print("Fake:", hashtag_yarat(fake, "Algebra", "Matematika"),
          "| chaqiruvlar:", len(fake.chaqiruvlar))


if __name__ == "__main__":
    demo()
