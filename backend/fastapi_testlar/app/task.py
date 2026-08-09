from doctest import debug
from urllib import response

from celery_app import celery_app
# from  import AsyncSessionLocal
# from ..app.cure.celery_db import AsyncSessionLocal
from sqlalchemy import select
from ..app.cure.celery_db import get_session
import asyncio
import time
from sqlalchemy import text
import json



from dotenv import load_dotenv
import os

load_dotenv(r'D:\Projects\TestVix\TestVixNew\.env')

api_key = os.getenv("OPENAI_API_KEY")


# @celery_app.task
# def generate_hashtags(test_id: int, nom: str, fan: str, tavsif: str):
#     asyncio.run(process_generate_hashtags(test_id, nom, fan, tavsif))







@celery_app.task
def generate_hashtags(test_id, nom, fan, tavsif):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    try:
        loop.run_until_complete(
            process_generate_hashtags(
                test_id,
                nom,
                fan,
                tavsif
            )
        )
    finally:
        loop.close()




from groq import Groq
import json, re

client = Groq(api_key=api_key)

async def ai_generate_hashtags(nom: str, fan: str, tavsif: str):
        
    #   nom = input("Nomni kiriting: ")
    #   fan = input("Fanni kiriting: ")
    #   tavsif = input("Tavsifni kiriting: ")
    # nom = "Abituryentlar uchun Fizika dtm testi"
    # fan = "Fizika"
    # tavsif = "Bu test abituryentlar uchun mo‘ljallangan. Bilimlarni sinab ko'rishlari mumkin, bu yerda oddiy Nyuton qonuni va oddiy masalalar bor."
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

    - # ni ishlatma.
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
        1-sinf → 1sinf
        2-sinf → 2sinf
        10-sinf → 10sinf

    - Agar fan ko'rsatilgan bo'lsa, fan nomini ALBATTA hashtag sifatida qo'shing.
        Masalan:
        Fizika → fizika
        Matematika → matematika

    - Agar tavsifda muhim mavzu (masalan Nyuton, Algebra, Geometriya va boshqalar) mavjud bo'lsa, unga mos hashtagni qo'shing.

    - Qolgan hashtaglar auditoriya, ta'lim, test, mashq va mavzuni ifodalovchi mos hashtaglardan tanlansin.

    Har doim kamida 5 ta ko'pida 10 ta hashtag qaytaring.

    tag=1 bo'lgan hashtaglar soni 3 yoki 4 yoki 5 ta bo'lsin.
    Qolganlari tag=0 bo'lsin.

    Natija formati:

    {
        "nom": "...",
        "fan": "...",
        "hashtags": [
        {
            "name": "1sinf",
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
    try:
        content = response.choices[0].message.content
        content = re.sub(r"^```(?:json)?", "", content)
        content = re.sub(r"```$", "", content)
        content = content.strip()
        data = json.loads(content)
    except json.JSONDecodeError as e:
        print("JSONDecodeError:", e)
        print("RAW content:", response.choices[0].message.content)
        data = None
    return data

from ..app.models.testlar import Testlar, Hashtag
async def process_generate_hashtags(test_id: int, nom: str, fan:str, tavsif:str):
    AsyncSessionLocal = get_session()
    async with AsyncSessionLocal() as db:

        ai_hashtags = await ai_generate_hashtags(nom, fan, tavsif)
        

        # ai_hashtags = re.sub(r"^```(?:json)?", "", ai_hashtags)
        # ai_hashtags = re.sub(r"```$", "", ai_hashtags)
        # ai_hashtags = ai_hashtags.strip()

        # ai_hashtags = json.loads(ai_hashtags)
        # ai_hashtags = json.decoder.JSONDecoder().decode(json.dumps(ai_hashtags))
        print('\n\n\n', ai_hashtags, '\n\n\n')
        for tag in ai_hashtags['hashtags']:
            tag['tag'] = bool(tag['tag'])  # Convert to boolean
        sql = text(

"""
        WITH input AS (
    SELECT *
    FROM jsonb_to_recordset(CAST(:data AS jsonb))
    AS x(name text, tag boolean)
),

ins AS (
    INSERT INTO myapp_hashtag (name)
    SELECT DISTINCT name FROM input
    ON CONFLICT (name) DO UPDATE 
    SET name = EXCLUDED.name
    RETURNING id, name
),

all_tags AS (
    SELECT id, name FROM ins

    UNION

    SELECT id, name 
    FROM myapp_hashtag
    WHERE name IN (SELECT name FROM input)
)

INSERT INTO myapp_testlarhashtag (hashtag_id, test_id, tag)
SELECT
    a.id,
    :test_id,
    i.tag
FROM input i
JOIN all_tags a ON a.name = i.name
ON CONFLICT DO NOTHING;
"""

        )

        await db.execute(
            sql,
            {
                "test_id": test_id,
                "data": json.dumps(ai_hashtags['hashtags'])
            }
        )


        await db.commit()

