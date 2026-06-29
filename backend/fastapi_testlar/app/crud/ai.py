import os
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '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')

from openai import OpenAI
import json
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)
def GetHashTag(nom, fan, tavsif):
    response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    response_format={"type": "json_object"},
    messages=[{
    "role": "system",
    "content": f'''
Siz test platformasi uchun keyword extraction modelisiz.

Vazifa:
Nom, fan va tavsifdan qidiruv uchun kerak bo'ladigan asosiy kalit tushunchalarni ajrating.

Nom: {nom},
Fan: {fan},
Tavsif: {tavsif}


Qoidalar:

- Siz HASHTAG YARATMAYSIZ.
- So'zni son bilan yozish mumkin bo'lsa son bilan yoz. Kerak bo'lsa son bilan yozish ham mumkin. son bilan so'zni bog'lash uchun _ bilan bog'lash mumkin. Son bilan yozsan qisqa qilish mumkin.
- so'zlarni bog'lashda qo'shib yoz. - ishlatma.
- Siz faqat matndan kalit tushunchalarni ajratasiz.
- Yangi mavzu o'ylab topmang.
- Inglizcha yozmang.
- Matnda bo'lmagan fan yoki mavzuni yozmang.
- "test", "savol", "javob", "variant", "dars", "o'rganish" kabi umumiy so'zlarni yozmang.
- Har bir element 1-2 so'zdan iborat bo'lsin.
- Kichik harflarda yozing.
- Takrorlamang.
- 3-8 ta element qaytaring.
- Testga mos 2-5 ta hashtag tanlab unga tag=1 deb ol, qolganni tag=0 deb ol.

Javob faqat quyidagi JSON formatida bo'lsin:
{
{
    "keywords": [
        {"hash:... , tag: 0 or 1"},
        {"hash:... , tag: 0 or 1"},
        {"hash:... , tag: 0 or 1"}
    ]
}}
'''
}]
)

    hashtags = json.loads(response.choices[0].message.content)
    return hashtags

# nom = 'Matematika birinchi sinf'
# fan = 'Matematika'
# tavsif = '''
#     Bu test birinchi sinflar uchun bo'lib, testda oddiy tenglamalar, hisob-kitoblar va har xil masalalar mavjud

# '''







