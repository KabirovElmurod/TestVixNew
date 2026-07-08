from groq import Groq
import json

client = Groq(api_key="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")

while True:
  # nom = input("Nomni kiriting: ")
  # fan = input("Fanni kiriting: ")
  # tavsif = input("Tavsifni kiriting: ")
  nom = "Abituryentlar uchun Fizika dtm testi"
  fan = "Fizika"
  tavsif = "Bu test abituryentlar uchun mo‘ljallangan. Bilimlarni sinab ko'rishlari mumkin, bu yerda oddiy Nyuton qonuni va oddiy masalalar bor."
  response = client.chat.completions.create(
      model="llama-3.3-70b-versatile",
      messages=[
          {
      "role": "system",
      "content": ("""
      Siz faqat valid JSON qaytarasiz.

  Hech qanday izoh yozmang.
  Faqat JSON chiqaring.

  Har doim aynan 10 ta hashtag yarating.

  Qoidalar:

  - Har bir hashtag # bilan boshlansin.
  - Faqat bitta so'zdan iborat bo'lsin.
  - Faqat kichik harflardan foydalaning.
  - Faqat harf va raqamlardan foydalaning.
  - Tire (-), pastki chiziq (_), nuqta (.) va bo'sh joy ishlatilmasin.
  - Hashtaglar mavzuga mos bo'lsin.
  - Noma'noli, sun'iy yoki tasodifiy hashtag yaratmang.
  - Bir xil ma'nodagi hashtaglarni takrorlamang.

  Majburiy qoidalar:

  - Agar nom yoki tavsifda sinf ko'rsatilgan bo'lsa, mos hashtagni ALBATTA qo'shing.
    Misollar:
    1-sinf → #1sinf
    2-sinf → #2sinf
    10-sinf → #10sinf

  - Agar fan ko'rsatilgan bo'lsa, fan nomini ALBATTA hashtag sifatida qo'shing.
    Masalan:
    Fizika → #fizika
    Matematika → #matematika

  - Agar tavsifda muhim mavzu (masalan Nyuton, Algebra, Geometriya va boshqalar) mavjud bo'lsa, unga mos hashtagni qo'shing.

  - Qolgan hashtaglar auditoriya, ta'lim, test, mashq va mavzuni ifodalovchi mos hashtaglardan tanlansin.

  Har doim 10 ta hashtag qaytaring.

  tag=1 bo'lgan hashtaglar soni 3–5 ta bo'lsin.
  Qolganlari tag=0 bo'lsin.

  Natija formati:

  {
    "nom": "...",
    "fan": "...",
    "hashtags": [
      {
        "name": "#1sinf",
        "tag": 1
      }
    ]
  }
  """)
  },
          {
              "role": "user",
              "content": f"""
  Nom: {nom}
  Fan: {fan}
  Tavsif: {tavsif}

  Shundan kelib chiqib 10 ta hashtag yarat.
  Format:
  {{
    "nom": "",
    "fan": "",
    "hashtags": [{{"name": "tag", "tag": 1 or 0}}]
  }}
  """
          }
      ]
  )

  content = response.choices[0].message.content

  print("RAW:", content)

  data = json.loads(content)
  print("\nPARSED JSON:")
  print(data)
  break