#!/usr/bin/env python3
"""
roadmap.py - TestVix: "bilim tahlili" + qog'oz/online imtihon roadmap'i.

Maqsad: ishlayotgan loyiha ustiga bosqichma-bosqich (vibe coding bilan) qo'shish.
Har vazifa uchun AI agentga tayyor prompt chiqaradi.

Ishlatish:
    python roadmap.py                 # umumiy holat + keyingi qadam
    python roadmap.py list            # hamma vazifalar
    python roadmap.py list --phase 3  # faqat 3-bosqich
    python roadmap.py next            # keyingi vazifa
    python roadmap.py show 3.1        # vazifa tafsiloti
    python roadmap.py prompt 3.1      # AI agent uchun tayyor prompt
    python roadmap.py start 3.1       # "jarayonda"
    python roadmap.py done 3.1        # bajarildi
    python roadmap.py undo 3.1        # belgini qaytarish
    python roadmap.py done-list       # bajarilganlar
    python roadmap.py status          # progress
    python roadmap.py reset --yes     # boshidan boshlash

Holat roadmap_state.json fayliga yoziladi (script yonida).
Boshqa joy uchun: ROADMAP_STATE=/yo'l/fayl.json
"""

import argparse
import json
import os
import sys
import textwrap
from dataclasses import dataclass, field
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

STATE_FILE = os.environ.get(
    "ROADMAP_STATE",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "roadmap_state.json"),
)

# ---------------------------------------------------------------------------
# Loyiha konteksti: har bir prompt boshiga qo'shiladi
# ---------------------------------------------------------------------------

PROJECT_CONTEXT = """\
LOYIHA KONTEKSTI (TestVix)
- Mahsulot: o'quv markazlar uchun imtihon va tashxis platformasi. Asosiy qiymat - test
  tuzish emas, NATIJA USTIDAGI TAHLIL: ustoz "darsda qaysi misollarni ishlayman" ro'yxatini oladi.
- Mavjud stek: Django (FAQAT admin) + 4 ta FastAPI mikroservis (account, testlar, savollar,
  comment) + React 19/Vite/MUI + PostgreSQL + Redis + Celery + Docker Compose + Nginx.
  Asosiy mantiq FastAPI'da. Aniq model va fayl nomlarini kodga qarab o'zing aniqla.
- Mavjud modellar (taxminan): Testlar, Savollar (svg_json bor), Variantlar (is_true),
  Natijalar (answer JSON, true_son, false_son, time_spent).
- Rollar (barchasi ro'yxatdan o'tgan user; alohida role maydoni minimal):
  * oddiy user: test yaratadi, mavjud testlarni ishlaydi (hozirgi xatti-harakat).
  * o'quvchi: oddiy user kabi, lekin guruh a'zoligi (group_members) bor;
    faqat o'z profilini va o'z natijalarini ko'radi, guruh/markaz tahlilini
    ko'rmaydi. AI tahlil markaz tomonida ishlaydi.
  * ustoz: test/guruh egasi; guruh tahlili, imtihon boshqaruvi.
  * admin: mavjud Django admin.
- Ro'yxatdan o'tish: Telegram bot orqali (t.me/bot?start=<join_code>),
  bir martalik kirish havolasi yoki kod orqali zaxira kirish. Telegram ID
  o'zgarmaydi, parol/email kerak emas. Bot alohida jarayon (aiogram),
  faqat ro'yxatdan o'tkazish va havola yuboradi - hisob-kitob uning ichida yo'q.
- Monetizatsiya (keyingi bosqich, 10): pullik obuna FAQAT markazlar uchun.
  Individual ustozlar bepul. Avval qo'lda obuna statusi, keyin Payme/Click.
- Maqsad: loyihani qayta yozish EMAS, uning ustiga qatlam qo'shish.

IKKI KANAL (teng, bitta ma'lumot modeli, bitta tahlil)
- Qog'oz (paper): test chop etiladi, ustoz javoblarni jadvalga kiritadi (keyin OMR).
- Online: havola orqali topshiriladi. Ikki xil tur (kind):
  * practice (mashq): public/private, cheksiz urinish, qoidabuzarlik kuzatilmaydi.
  * exam (imtihon): qattiq rejim, ustoz boshqaradi, jonli kuzatadi.

QABUL QILINGAN QARORLAR (buzma)
1. Hisob-kitob KODDA (oddiy Python/SQL). AI hisoblamaydi.
2. AI faqat USTOZ tomonida, tugma bosilganda, bitta savol uchun chaqiriladi; natija
   bazada saqlanadi. AI o'quvchiga imtihon paytida HECH QACHON yordam bermaydi.
3. O'quvchidan "ishonch belgisi" so'ralmaydi. Taxmin variantlar taqsimotidan aniqlanadi.
4. Har javobning TANLANGAN VARIANTI (original variant ID) saqlanadi, faqat to'g'ri/noto'g'ri emas.
5. Chizmali savolda AI yechim yozmaydi (ustoz tavsifi bo'lmasa); statistika baribir ishlaydi.
6. Matematik ifodalar LaTeX da. Matnni tizim formatlaydi, AI emas. AI ga ASL matn beriladi.
7. AI yechimi kalitga mos kelmasa "to'g'ri" deb ko'rsatilmaydi ("tekshiring" belgisi).
8. Mavzu teglash va o'quvchi mavzu profili KEYINGI bosqich (8), ustoz qiymatni tasdiqlagach.
9. Yangi microservice qurma: mavjud servis ichida alohida modul (masalan app/exam, app/analytics).
10. Imtihon holati, taymer va javoblar SERVERDA. Brauzer faqat ko'rsatadi.
11. Brauzer AI ishlatishni aniqlay olmaydi: faqat SIGNAL beradi (tab/oyna almashish, ulanish
    uzilishi, nusxa/qo'yish). Qaror ustozda (strictness: signal / ogohlantirish / avto-tugatish).
12. Ustoz imtihonni xohlagan paytda ochadi, boshlaydi, tugatadi (butun yoki yakka o'quvchi).
    Tugatilganda shu paytgacha berilgan javoblar saqlanadi va hisoblanadi.
13. Imtihon hayot sikli: draft -> lobby -> running -> finished. Faqat online'da.
14. Real time: WebSocket (FastAPI) + Redis pub/sub. Masshtab: bitta guruh, 20-40 kishi.
15. Maxfiylik: AI ga o'quvchi ismi/ma'lumoti yuborilmaydi, faqat savol, variantlar, kalit.
16. Groq API kaliti kodda hardcode qilingan va git tarixida ochiq: AVVAL rotate qilinadi.
17. Telegram bot tokeni ham sir: faqat .env. Bot alohida jarayon (aiogram) -
    "yangi microservice qurma" qoidasi uchun istisno; faqat ro'yxatdan o'tkazish
    va havola yuborish, hisob-kitob yo'q. Webhook uchun HTTPS kerak, lokalda polling.
18. Paper kanalida o'quvchi ismlarni ustoz oldindan kiritadi; o'quvchi botga
    kirganda "egasi yo'q" ismlardan o'znikini tanlaydi (claimed_at bilan bog'lanadi).
    Zaxira: ustoz o'quvchiga kirish kodi bera olsin (Telegram'sizlar uchun).
"""

PROMPT_RULES = """\
ISH QOIDALARI
- Avval mavjud kodni o'qi va uning nomlash/struktura uslubiga moslash. O'zingcha yangi
  arxitektura kiritma, mavjud funksiyalarni buzma.
- Faqat shu vazifani bajar, boshqa narsaga tegma.
- Bazaga o'zgarish faqat migratsiya orqali, eski ma'lumotlar saqlansin.
- Sirlarni (API kalit, parol) kodga yozma: faqat .env / muhit o'zgaruvchisi.
- Avval qisqa reja ber (qaysi fayllar o'zgaradi), keyin kod yoz. Noaniq joy bo'lsa savol ber.
- Hisob-kitob va holat o'tish funksiyalari uchun unit test yoz (qo'lda hisoblangan misollar bilan).
- Oxirida: nima o'zgargani, qanday tekshirish va "bajarilgan hisoblanadi" bandlari
  bo'yicha qaysilari bajarilgani.
"""

# ---------------------------------------------------------------------------
# Vazifalar
# ---------------------------------------------------------------------------

PHASES = {
    0: "Xavfsizlik va tekshiruv (kodsiz/minimal, birinchi navbatda)",
    1: "Ma'lumot asosi (ikki kanal uchun umumiy poydevor)",
    2: "Qog'oz kanali: chop etish va tez kiritish",
    3: "Tahlil (AI siz) - asosiy qiymat",
    4: "Online mashq (practice)",
    5: "Online imtihon: jonli sessiya, ustoz nazorati",
    6: "AI yechim va xato izohi (faqat ustoz tomonida)",
    7: "Fayl yuklash (Word)",
    8: "Mavzu teglash va profil (qiymat tasdiqlangach)",
    9: "Keyinga qoldirilgan (ixtiyoriy)",
    10: "Obuna va to'lov (faqat markazlar, ixtiyoriy)",
}


@dataclass
class Task:
    id: str
    title: str
    goal: str
    done_when: list
    depends: list = field(default_factory=list)
    notes: str = ""
    optional: bool = False
    gate: bool = False  # qaror nuqtasi

    @property
    def phase(self) -> int:
        return int(self.id.split(".")[0])


TASKS = [
    # ---------------- 0. Xavfsizlik va tekshiruv ----------------
    Task(
        "0.0",
        "Groq kalitini rotate qilish va .env ga ko'chirish",
        "backend/fastapi_testlar/app/api/ai.py va crud/ai.py dagi hardcode kalitni olib tashlash.",
        [
            "Eski kalit Groq panelida bekor qilingan, yangisi yaratilgan",
            "Kod kalitni faqat muhit o'zgaruvchisidan o'qiydi (.env, .env.example bor, .env gitignore'da)",
            "Kodda va yangi commitlarda kalit qolmagan (grep bilan tekshirilgan)",
            "Model nomi konfiguratsiyada; eskirgan llama-3.3-70b-versatile almashtirilgan",
        ],
        notes="Hamma narsadan oldin. Git tarixidagi eski kalit baribir ochiq, shuning uchun rotate shart.",
    ),
    Task(
        "0.1",
        "Natijalar modelini tekshirish",
        "Natijalar.answer JSON ichida har savol uchun tanlangan variant (ID) saqlanadimi yoki "
        "faqat to'g'ri/noto'g'ri - aniqlash.",
        [
            "Natijani saqlovchi model(lar) va maydonlari ro'yxati yozilgan",
            "Aniq javob: 'variant saqlanadi' / 'faqat to'g'ri-noto'g'ri' / 'faqat ball'",
            "Javob vaqti (time_ms) saqlanadimi - belgilangan",
            "Variantlar tartibi aralashtirilsa, javob original variant ID bilan bog'lanishi aniqlangan",
        ],
        notes="Kod yozish shart emas. Natija 1.1 hajmini belgilaydi.",
    ),
    Task(
        "0.2",
        "Haqiqiy testda qo'lda tekshiruv (qiymat gipotezasi)",
        "Dastursiz: markazdan 1 ta haqiqiy test va 20-30 o'quvchi javobini Excel'ga o'zing kiritib, "
        "ustoz 'darsda qaysi 5 misolni ishlayman' deganini tizim ro'yxati bilan solishtirish.",
        [
            "Ustozning o'z ro'yxati OLDINDAN yozib olingan",
            "Excel'da har savol: topganlar % va eng ko'p xato variant",
            "Ikki ro'yxat solishtirilgan; ustoz fikri o'z so'zi bilan yozilgan",
            "Mezon oldindan belgilangan (masalan: tizim ustoz o'ylamagan kamida 1-2 misol topsa)",
            "Ustozdan so'ralgan: savol statistikasi yetarlimi yoki mavzu bo'yicha tahlil ham kerakmi",
            "O'quvchilar natijasini tahlil qilishga ustoz/markazdan ochiq ruxsat olingan",
        ],
        notes="Bir kechalik ish. Tizim ustozga foyda beradimi shuni sinaydi. 1.x bilan parallel bo'lishi mumkin.",
        gate=True,
    ),
    Task(
        "0.3",
        "Markaz sharoiti va test namunalari",
        "Ustozlar testni qaysi formatda tuzishi, qurilmalar, internet va javob varag'i sharoitini aniqlash.",
        [
            "Test formati: Word / PDF / boshqa; til: o'zbek / qoraqalpoq / rus",
            "Formulalar: Word tenglama / oddiy matn / rasm; chizmali savollar ulushi",
            "Variantlar aralashtirilishi (A/B variant) bormi",
            "Markazda o'quvchilar telefoni/kompyuteri, Wi-Fi sig'imi (30 qurilma) aniqlangan",
            "Test generatori eksporti: har savol bo'yicha javob chiqarish mumkinmi (aniq javob)",
            "5-10 ta haqiqiy namuna fayl yig'ilgan",
        ],
        notes="7.x, 5.7 va 6.0 shu ma'lumotga tayanadi.",
    ),
    # ---------------- 1. Ma'lumot asosi ----------------
    Task(
        "1.1",
        "Har javobni tanlangan varianti bilan saqlash",
        "Javob yozilganda har savol uchun tanlangan variant, to'g'riligi, manbasi va turi saqlansin.",
        [
            "Javob yozuvi: attempt, savol, tanlangan variant ID (bo'sh javob uchun null), is_correct, "
            "answered_at, time_ms (online, ixtiyoriy), source ('online'/'paper'), kind ('practice'/'exam')",
            "Aralashtirilgan tartibda ham original variant ID saqlanadi",
            "Migratsiya yozilgan; eski natijalar va mavjud sahifalar buzilmagan",
            "Online test ishlanganda yangi yozuvlar paydo bo'lishi qo'lda tekshirilgan",
        ],
        depends=["0.1"],
        notes="Bu ma'lumotni keyin qaytarib bo'lmaydi - birinchi bo'lib qilinadi.",
    ),
    Task(
        "1.2",
        "Guruhlar va o'quvchilar (ro'yxatdan o'tgan userlar)",
        "Ustoz guruh ochadi; o'quvchi Telegram bot orqali (yoki kod bilan) a'zo bo'ladi. "
        "Paper uchun ustoz ismlarni oldindan kiritadi, o'quvchi keyin o'z ismini "
        "egallaydi. O'quvchi profilida faqat o'z natijalari ko'rinadi.",
        [
            "groups (ustoz_id, nom, join_code) va group_members (group_id, user_id "
            "ixtiyoriy, telegram_id ixtiyoriy, display_name, claimed_at, "
            "qo'shilgan sana)",
            "O'quvchi join_code bilan guruhga a'zo bo'ladi yoki ustoz qo'shadi; "
            "faqat o'z guruhlarini ko'radi",
            "Paper rejimi: ustoz ism ro'yxatini kiritadi (user_id'siz qatorlar); "
            "o'quvchi ulardan o'znikini tanlaganda user_id + claimed_at yoziladi, "
            "ustoz noto'g'risini bekor qila oladi",
            "Student statusi group_members yozuviga asoslanadi; alohida role maydoni yo'q",
            "Ruxsat: o'quvchi guruh/markaz tahlilini ko'rmaydi, faqat o'z profilini",
            "Migratsiya; mavjud ma'lumot buzilmagan",
        ],
        depends=["0.1"],
        notes="Minimal. 2.1 (qog'ozdan kiritish) va jonli lobby shunga tayanadi.",
    ),
    Task(
        "1.3",
        "Imtihon (exam) va urinish (attempt) jadvallari",
        "Testni guruhga bog'lab, imtihon/mashq sessiyasi va har o'quvchi urinishini saqlash.",
        [
            "exams: test, guruh, mode ('paper'/'online'), kind ('practice'/'exam'), "
            "status ('draft'/'lobby'/'running'/'finished'), strictness ('signal'/'warn'/'auto_end'), "
            "allow_late_join, duration, opened_at, started_at, finished_at",
            "attempts: exam, user (group_members orqali o'quvchi), status ('joined'/"
            "'in_progress'/'submitted'/"
            "'terminated_by_teacher'/'terminated_violation'), last_seen, started_at, finished_at",
            "Bir user bir necha testda urinish qilishi mumkin; student profili "
            "shu bog'lanishlardan yig'iladi",
            "violation_events: attempt, event, vaqt, tafsilot",
            "Holat o'tishlari bitta joyda (state machine funksiyasi) va unit test bilan",
            "Bir test bir necha guruhda/imtihonda ishlanishi mumkin",
            "Migratsiya yozilgan, mavjud sahifalar buzilmagan",
        ],
        depends=["1.1", "1.2"],
    ),
    Task(
        "1.4",
        "Savol maydonlari: chizma belgisi va to'g'ri javob tekshiruvi",
        "Savolda chizma borligini belgilash va to'g'ri javob kaliti to'liqligini tekshirish.",
        [
            "Savolda chizma_bor (bool) va chizma_tavsifi (matn, ixtiyoriy) maydonlari",
            "To'g'ri javob belgilanmagan savol uchun ogohlantirish",
            "Migratsiya yozilgan, mavjud savollar buzilmagan",
        ],
    ),
    # ---------------- 2. Qog'oz kanali ----------------
    Task(
        "2.1",
        "Qog'ozdagi javoblarni tez kiritish",
        "Qog'ozda ishlangan imtihon javoblarini tizimga tez kiritish jadvali.",
        [
            "exams.mode='paper' imtihon uchun: qator = o'quvchi (guruhdan), ustun = savol",
            "Klaviatura bilan A/B/C/D yoki bo'sh; Tab/Enter bilan tez o'tish",
            "Tekshiruv: bir nechta javob, noto'g'ri belgi, bo'sh qator ogohlantirilishi",
            "Saqlash: 1.1 dagi yozuvga source='paper' bilan; qog'ozda qoidabuzarlik tushunchasi yo'q",
            "Variant (A/B) aralashtirilgan bo'lsa, varaq varianti ham kiritiladi va original ID ga xaritalanadi",
            "30 o'quvchi x 30 savol kiritish vaqti o'lchangan va yozilgan",
        ],
        depends=["1.3"],
        notes="Qulaylik hal qiluvchi: noqulay bo'lsa ustoz foydalanmaydi. OMR hozir yo'q (9.4).",
    ),
    Task(
        "2.2",
        "Chop etiladigan test va javoblar varag'i (PDF)",
        "Tizimdagi testni qog'ozga chiqarish va javoblar varag'i (keyinchalik OMR ga mos).",
        [
            "Test va javoblar varag'i PDF: test identifikatori, savol raqamlari bilan",
            "Formulali savollar chop etilganda buzilmaydi",
            "Javoblar varag'i belgilash uchun aniq katakchalar (bubble) bilan",
        ],
        depends=["1.4"],
    ),
    # ---------------- 3. Tahlil ----------------
    Task(
        "3.1",
        "Savol statistikasi (analytics moduli)",
        "Imtihon (va guruh) bo'yicha har savol statistikasini hisoblaydigan alohida modul.",
        [
            "Har savol uchun: javoblar soni, topganlar %, bo'sh javoblar soni, "
            "variantlar taqsimoti, eng ko'p tanlangan xato variant va uning ulushi",
            "Kesim: butun test / bitta imtihon / bitta guruh; kind va source bo'yicha filtr",
            "terminated attemptlar belgilanadi va ustoz xohlasa chiqarib tashlanadi",
            "Hisob funksiyalari DB so'rovidan ajratilgan (sof funksiya sifatida testlanadi)",
            "Unit testlar qo'lda hisoblangan misol bilan",
        ],
        depends=["1.3"],
    ),
    Task(
        "3.2",
        "Savol xulosasi qoidalari",
        "Statistikadan xulosa: o'zlashtirilgan / noto'g'ri tushuncha / taxmin / aralash.",
        [
            "Chegaralar bitta konfiguratsiyada (kodga qotirilmagan)",
            "Boshlang'ich qoida: topganlar >= 70% -> o'zlashtirilgan; xatolarning kamida yarmi "
            "bitta variantga yig'ilgan va topganlar < 60% -> noto'g'ri tushuncha; "
            "javoblar variantlar bo'yicha deyarli teng -> taxmin",
            "Javoblar soni kam (masalan < 5) bo'lsa 'ma'lumot kam' belgisi",
            "Unit testlar har xulosa turi uchun",
        ],
        depends=["3.1"],
        notes="Chegaralar boshlang'ich taklif; real ma'lumotda sozlanadi.",
    ),
    Task(
        "3.3",
        "Tasodifni hisobga olgan ball (tuzatilgan ball)",
        "Taxminiy javoblar ta'sirini kamaytiruvchi tahlil balli.",
        [
            "Formula: (to'g'ri - xato / (variantlar_soni - 1)) / jami_savol; bo'sh javob hisobga olinmaydi",
            "O'quvchining haqiqiy bahosi O'ZGARMAYDI, tuzatilgan ball faqat tahlil uchun",
            "Test: 20 savol, 8 to'g'ri, 12 xato, 4 variant -> tuzatilgan ball 4 (20%)",
        ],
        depends=["3.1"],
    ),
    Task(
        "3.4",
        "Ustuvorlik hisobi (chiqmagan misollar tartibi)",
        "Qaysi misollarni darsda birinchi ishlash kerakligini hisoblash.",
        [
            "Ustuvorlik: xato qilganlar ulushi asosida, noto'g'ri tushuncha xulosasi yuqoriroq vaznda",
            "Savollar ustuvorlik bo'yicha tartiblanadi",
            "Vaznlar konfiguratsiyada; unit test",
        ],
        depends=["3.2"],
    ),
    Task(
        "3.5",
        "Tahlil sahifasi (ustoz uchun)",
        "Ustoz 'chiqmagan misollar' ro'yxatini bitta ekranda ko'radi, guruh/imtihon kesimida.",
        [
            "Jadval: savol raqami, savol (qisqa, KaTeX), topganlar %, eng ko'p xato variant (%), xulosa, ustuvorlik",
            "Tartib: ustuvorlik bo'yicha; 'ma'lumot kam' savollar belgilangan",
            "Kesim tanlash: guruh / imtihon; manba (paper/online) va kind filtri",
            "Faqat test egasi ko'ra oladi",
            "Tahlil yo'q testda tushunarli bo'sh holat",
            "O'quvchi bo'yicha ko'rinish: tuzatilgan ball va asl ball yonma-yon",
        ],
        depends=["3.2", "3.3", "3.4", "1.2"],
    ),
    Task(
        "3.6",
        "Ustozga ko'rsatish va qaror (QIYMAT NUQTASI)",
        "Haqiqiy test natijalarida sahifani ustozga ko'rsatib, 0.2 dagi mezon bo'yicha baholash.",
        [
            "Ustoz sahifani haqiqiy qog'oz test natijasida ko'rgan",
            "0.2 dagi mezon bo'yicha xulosa yozilgan: davom etish / o'zgartirish / to'xtatish",
            "Mavzu tahlili kerakmi yoki yo'qmi - ustoz javobi yozilgan (8-bosqich uchun)",
            "Markaz bilan keyingi qadam (online, AI) kelishilgan",
        ],
        depends=["3.5", "2.1", "0.2"],
        notes="Shu yerda to'xta va qaror qil: tizim qiymat beradimi. Keyingi bosqichlarga o'tishdan oldin.",
        gate=True,
    ),
    # ---------------- 4. Online mashq ----------------
    Task(
        "4.0",
        "Telegram bot orqali ro'yxatdan o'tish",
        "O'quvchi Telegram bot orqali user yaratadi va guruhga a'zo bo'ladi; "
        "bot veb-kirish uchun bir martalik havola yuboradi. Zaxira: kod bilan kirish.",
        [
            "Bot: t.me/bot?start=<join_code> -> ismidni so'raydi/tasdiqlaydi -> "
            "group_members ga telegram_id + display_name yozadi",
            "Bot bir martalik kirish havolasi/tokeni yuboradi (veb-login); "
            "eskirishi va bir martalikligi tekshirilgan",
            "Zaxira: ustoz o'quvchiga kirish kodi bera oladi; Telegram'siz ham kirish mumkin",
            "Paper ismlarni egallash: group_members da user_id'siz qatorlar "
            "ro'yxatdan o'tgandan keyin claim qilinadi (1.2 bilan bog'liq)",
            "Bot tokeni faqat .env; bot alohida jarayon (aiogram), polling lokalda, "
            "webhook uchun HTTPS; hisob-kitob bot ichida yo'q",
        ],
        depends=["1.2", "0.0"],
        notes="O'quvchi ro'yxatdan o'tishi faqat online (4.x, 5.x) uchun kerak; "
              "paper kanali (2.x) buni talab qilmaydi. 3.6 gate'dan keyin.",
    ),
    Task(
        "4.1",
        "Online mashq: havola orqali topshirish (practice)",
        "Public/private testni ro'yxatdan o'tgan o'quvchi ishlaydi; "
        "natija user_id bilan 1.1 ga yoziladi.",
        [
            "Public: havola bilan; private: kod yoki guruh a'zosi bilan",
            "Kirish 4.0 dagi Telegram havolasi yoki kod orqali; group_members bo'lsa student profili yangilanadi, "
            "bo'lmasa oddiy user sifatida urinish saqlanadi",
            "Savollar UI (KaTeX, rasm/chizma), javob tanlanganda darhol saqlanadi",
            "Cheksiz urinish; qoidabuzarlik kuzatilmaydi; natija va to'g'ri javoblar tugagach ko'rinadi",
            "kind='practice', source='online'; sahifa yangilansa o'quvchi joyiga qaytadi",
            "Eski test ishlash mantig'i buzilmagan",
        ],
        depends=["1.3", "3.6", "4.0"],
        notes="AI yordami yo'q. Mashq natijalari tahlilda alohida filtr bilan.",
    ),
    Task(
        "4.2",
        "Online va qog'oz natijalari bitta tahlilda",
        "Ikki manbadan kelgan javoblar tahlil sahifasida bir xil ishlashini tekshirish.",
        [
            "Aralash (online + qog'oz) imtihon tahlilida to'g'ri hisoblanadi",
            "Manba bo'yicha farq faqat kerak joyda ko'rsatiladi (vaqt faqat online'da)",
            "practice va exam natijalari adashtirilmaydi",
        ],
        depends=["4.1", "2.1"],
    ),
    # ---------------- 5. Online imtihon ----------------
    Task(
        "5.1",
        "Imtihon holat mashinasi va server taymeri",
        "Ustoz imtihonni ochadi/boshlaydi/tugatadi; taymer va holat serverda.",
        [
            "draft -> lobby -> running -> finished o'tishlari faqat ustoz tomonidan (vaqt tugasa avtomatik finished)",
            "Server taymeri; brauzer vaqtiga ishonilmaydi; kechikib kirish sozlamasi ishlaydi",
            "Tugatilganda barcha attemptlar yopiladi, shu paytgacha javoblar saqlanadi va hisoblanadi",
            "Yakka o'quvchini tugatish (terminated_by_teacher) va tiklash",
            "Imtihon faqat ro'yxatdagi guruh o'quvchisiga ochiladi, bitta urinish",
            "Unit testlar: noto'g'ri o'tishlar rad etiladi",
        ],
        depends=["4.2"],
    ),
    Task(
        "5.2",
        "Real time kanal (WebSocket + Redis)",
        "Ustoz va o'quvchi tomoni uchun jonli aloqa.",
        [
            "FastAPI WebSocket: o'quvchi kanali (savollar, javob yuborish) va ustoz kanali (hodisalar)",
            "Hodisalar Redis pub/sub orqali tarqatiladi",
            "Heartbeat: last_seen yangilanadi, 'ulangan/uzilgan' aniqlanadi",
            "Uzilgan o'quvchi qaytib kirsa, holati va javoblari tiklanadi",
            "Autentifikatsiya: 4.0 dagi kirish (Telegram havolasi/kod) cookie + attempt tokeni (exam_id + user_id ga bog'liq)",
            "Har javob tanlanishi bilan darhol bazaga yoziladi",
        ],
        depends=["5.1"],
    ),
    Task(
        "5.3",
        "O'quvchi imtihon UI (qattiq rejim)",
        "Lobby, savollar, taymer va signal yig'ish.",
        [
            "Lobby: o'quvchi 4.0 orqali kirgan holda ochiladi, guruh a'zosi ekanligi tekshiriladi, kutish ekrani",
            "Start bilan savollar ochiladi; savol/variant tartibi aralashtiriladi (original ID saqlanadi)",
            "Signallar: tab/oyna almashish (visibilitychange/blur), fullscreen chiqish (qo'llanilsa), "
            "nusxa/qo'yish/o'ng tugma; hammasi violation_events ga yoziladi",
            "iOS Safari kabi fullscreen ishlamaydigan brauzerlarda asosiy signal tab/oyna almashishi",
            "Imtihon tugagach natija ustoz ruxsatisiz ko'rsatilmaydi",
        ],
        depends=["5.2"],
    ),
    Task(
        "5.4",
        "Ustoz paneli: jonli kuzatuv",
        "Ustoz kim qo'shilganini, holatini va qoidabuzarlikni real time ko'radi.",
        [
            "Lobby ro'yxati: kim kirdi, kim ulangan; shubhali kirganni chiqarib yuborish",
            "Running: har o'quvchi uchun javob berdi N/jami, ulangan/uzilgan, qoidabuzarlik soni",
            "Tugmalar: Boshlash, Imtihonni tugatish, o'quvchini tugatish, tiklash",
            "Qoidabuzarlik hodisasi darhol ekranda chiqadi",
            "20-40 o'quvchida panel qotmaydi",
        ],
        depends=["5.3"],
    ),
    Task(
        "5.5",
        "Qoidabuzarlik siyosati (strictness)",
        "Signalga javob: faqat signal / ogohlantirish / avtomatik tugatish; qaror ustoz sozlamasida.",
        [
            "Standart: signal + ustoz ekraniga chiqarish; 'warn': 1 ogohlantirish keyin tugatish; "
            "'auto_end': darhol terminated_violation",
            "Tugatilgan attemptda javoblar saqlanadi, sababi va vaqti yoziladi",
            "Ustoz noto'g'ri tugatilganni bir tugma bilan tiklay oladi",
            "UI da ustozga ochiq yozilgan: tizim AI ishlatishni to'liq aniqlay olmaydi, faqat signal beradi",
        ],
        depends=["5.4"],
        notes="Telefondagi AI ni faqat markazda nazorat ostida topshirish to'xtatadi.",
    ),
    Task(
        "5.6",
        "Markazda yuk sinovi (30 qurilma)",
        "Haqiqiy sharoitda kichik sinov: Wi-Fi, uzilish, qaytib kirish.",
        [
            "Kamida 1 guruh bilan sinov imtihoni o'tkazilgan",
            "Ommaviy uzilishdan keyin hamma davom eta olgani tekshirilgan",
            "Muammolar ro'yxati va tuzatishlar yozilgan",
            "Ustoz panelidan foydalanish bo'yicha fikr yozilgan",
        ],
        depends=["5.5", "0.3"],
        gate=True,
    ),
    # ---------------- 6. AI yechim (ustoz tomonida) ----------------
    Task(
        "6.0",
        "AI promptini kodsiz sinash",
        "Loyihaga qo'shishdan oldin promptni 10-20 haqiqiy savolda tekshirish (bepul limit bilan).",
        [
            "Kirish formati: fan, savol, variantlar, to'g'ri javob, eng ko'p xato variant",
            "10-20 savolda yechim kalitga mos kelishi tekshirilgan",
            "O'zbekcha (kerak bo'lsa qoraqalpoq/rus) izoh tushunarliligi baholangan",
            "Yakuniy prompt matni va chiqish JSON formati yozilgan",
        ],
        depends=["0.3", "3.6"],
        notes="AI ga ASL matnni ber, tarjima qilma. Bepul model matematikada xato qiladi: 6.4 shuning uchun kerak.",
    ),
    Task(
        "6.1",
        "AI kirish blokini yig'ish",
        "Savoldan AI uchun tuzilgan kirish blokini yig'adigan funksiya.",
        [
            "Blok: fan, savol (LaTeX), variantlar (harf + matn), to'g'ri javob, "
            "eng ko'p xato variant va foizi, chizma bayrog'i",
            "O'quvchi ismi/ma'lumoti blokda YO'Q",
            "Matnni tozalash (HTML teg, ortiqcha bo'shliq) kodda bajariladi",
            "Unit test",
        ],
        depends=["3.1", "1.4"],
    ),
    Task(
        "6.2",
        "Yuborishdan oldingi tekshiruv",
        "Yaroqsiz savolda AI chaqirilmasligi.",
        [
            "Chizma bor va tavsif yo'q -> chaqirilmaydi, sababi ustozga aytiladi",
            "Variantlar to'liq emas yoki to'g'ri javob yo'q -> chaqirilmaydi",
            "Savol matni bo'sh/juda qisqa -> chaqirilmaydi",
            "Unit testlar",
        ],
        depends=["6.1"],
    ),
    Task(
        "6.3",
        "AI chaqiruvi (tugma bilan, bitta savol, faqat ustoz)",
        "Savol uchun yechim va xato izohini AI dan olish va saqlash.",
        [
            "Faqat ustoz tugmani bosganda chaqiriladi; o'quvchi endpointidan chaqirib bo'lmaydi",
            "JSON chiqish: yechim_qadamlari, yakuniy_javob, xato_sababi ('ehtimoliy sabab')",
            "Natija bazada saqlanadi; ikkinchi marta chaqirilmaydi (qayta yaratish tugmasi bundan mustasno)",
            "Vaqt chegarasi, limitga yetganda va xatolikda tushunarli xabar",
            "Model va kalit konfiguratsiyada (bepul -> pullik modelga o'tish faqat sozlama)",
            "Foydalanish hisobi: nechta savol, nechta chaqiruv (xarajatni oldindan bilish uchun)",
        ],
        depends=["6.0", "6.2", "0.0"],
    ),
    Task(
        "6.4",
        "Yechimni kalit bilan tekshirish",
        "AI yechimi kalitga mos kelmaganda 'to'g'ri' deb ko'rsatilmasligi.",
        [
            "yakuniy_javob kalitdagi variantga mos kelmasa, natija 'tekshiring' belgisi bilan chiqadi",
            "Mos kelmagan yechim o'quvchiga ko'rsatilmaydi",
            "Unit test (mos va mos emas holat)",
        ],
        depends=["6.3"],
    ),
    Task(
        "6.5",
        "Tahlil sahifasida 'Yechim va izoh' tugmasi",
        "Ustozga qulay UI: har savol yonida tugma, kutish holati bilan.",
        [
            "Savol yonida tugma; bosilganda tugma ichida kutish holati (sahifa qotmaydi)",
            "Tayyor yechim ko'rinadi, ustoz tahrir qila oladi (ixtiyoriy)",
            "Xato/'tekshiring' holatlari tushunarli ko'rsatiladi",
            "Imtihon tugagach, ustoz ruxsati bilan o'quvchiga ko'rsatish imkoniyati (ixtiyoriy)",
        ],
        depends=["6.4", "3.5"],
    ),
    # ---------------- 7. Fayl yuklash ----------------
    Task(
        "7.1",
        "Document AI / import vositasini kodsiz sinash",
        "Mavjud vositani 10 ta haqiqiy savolda tekshirish va qaror qabul qilish.",
        [
            "Matn aynan saqlandimi (so'zma-so'z, tarjima/tuzatishsiz)",
            "Variantlar to'liq va tartibi to'g'ri; savollar to'g'ri ajratilgan",
            "Formulalar buzilmagan yoki toza LaTeX",
            "Til (qoraqalpoq/o'zbek/rus) matni o'zgarmagan",
            "Qaror yozilgan: asosiy vosita / faqat yordamchi / ishlatilmaydi",
        ],
        depends=["0.3"],
        notes="Document AI TestVix'ga bog'liq emas: faqat ixtiyoriy import (TestVix JSON sxemasida).",
    ),
    Task(
        "7.2",
        "Word (.docx) dan savollarni import qilish",
        "Ustoz faylni yuklaydi, tizim savollarni tuzilgan holda ajratadi.",
        [
            "Savollar va variantlarni ajratish (raqamlash va A) B) C) D) qoidalari)",
            "Word tenglamalari LaTeX ga o'giriladi (Pandoc yoki OMML->LaTeX); AI ishtirok etmaydi",
            "Rasmlar alohida faylga ajratiladi va savolga bog'lanadi, chizma_bor belgilanadi",
            "To'g'ri javob kaliti uchun kelishuv (faylning oxirida jadval yoki belgi)",
            "Katta fayl uchun import orqa fonda (Celery); progress ko'rinadi (12/30)",
        ],
        depends=["7.1", "1.4"],
        notes="Faqat .docx. PDF'dan Word'ga o'tkazilgan fayllarda formulalar buziladi.",
    ),
    Task(
        "7.3",
        "Oldindan ko'rish va tasdiqlash ekrani",
        "Import qilingan savollarni ustoz tasdiqlamaguncha saqlamaslik.",
        [
            "Savollar KaTeX bilan ko'rsatiladi",
            "Ustoz tuzata oladi; tasdiqlagandan keyingina testga qo'shiladi",
            "Formulasi buzilgan/ajratilmagan savol belgilanadi",
        ],
        depends=["7.2"],
    ),
    # ---------------- 8. Teglash va profil ----------------
    Task(
        "8.1",
        "Mavzular ro'yxati va savol-mavzu bog'lanishi",
        "Bitta fan uchun bob -> mavzu ro'yxati (barqaror ID) va savolga mavzu bog'lash.",
        [
            "Jadval: bob, mavzu, barqaror id; ixtiyoriy 'oldingi mavzu' bog'lanishi",
            "Savol-mavzu ko'p-ko'pga: rol ('core'/'required'/'path_dependent'), vazn",
            "Asosiy mavzu majburiy, qo'shimcha ko'pi bilan 2 ta; vaznlar konfiguratsiyada",
            "Ro'yxatni ustoz tekshirgan",
        ],
        depends=["3.6"],
        notes="Faqat 3.6 da ustoz mavzu tahlilini kerak desa.",
    ),
    Task(
        "8.2",
        "AI teglash va ustoz tasdig'i",
        "Savollarni tayyor mavzular ro'yxatidan tanlab teglash; ustoz tasdiqlaydi.",
        [
            "Butun test (yoki 10 savollik guruh) bitta so'rovda; AI faqat ro'yxatdan tanlaydi, mos kelmasa null",
            "Arzon model, javob faqat JSON, savol asl tilida",
            "Orqa fonda ishlaydi (status, 12/30, qayta urinish); test berishni kutdirmaydi",
            "Hamma teg avval ustozga ko'rsatiladi; tag_feedback (accepted/edited/rejected) saqlanadi",
        ],
        depends=["8.1", "6.4"],
    ),
    Task(
        "8.3",
        "Mavzu bo'yicha heatmap va o'quvchi profili",
        "Mavzu bo'yicha zaiflik va o'quvchi holati, faqat yetarli ma'lumot bo'lganda. "
        "O'quvchi o'z profilini (bir necha test yig'indisi) ko'radi; markaz tahlili "
        "faqat ustozga.",
        [
            "Guruh x mavzu heatmap (SQL agregatsiya) — faqat ustoz/markaz egasi",
            "O'quvchi profili: o'z user_id bo'yicha barcha attemptlar yig'iladi "
            "(bir necha test bo'lsa ham); mavzu, to'g'ri soni, jami, vaznli ball",
            "O'quvchi faqat o'z profilini ko'radi (ruxsat tekshiruvi); boshqa "
            "o'quvchi/guruh ma'lumotlari ko'rinmaydi",
            "1 test va 1-2 savol -> 'aniqlanmadi'; o'quvchiga 'tur' yorlig'i qo'yilmaydi, faqat faktlar",
        ],
        depends=["8.2", "3.3"],
    ),
    # ---------------- 9. Keyinga ----------------
    Task(
        "9.1",
        "Telegram orqali qayta tekshiruv va eslatmalar",
        "Darsdan 2-3 kun keyin o'quvchiga xato qilgan mavzusidan 3-5 savol yuborish; "
        "imtihon eslatmalari. Ro'yxatdan o'tkazish allaqachon 4.0 da.",
        ["Avval qo'lda kichik tajriba (bir guruhda); 4.0 dagi bot orqali yuboriladi"],
        depends=["8.3"],
        optional=True,
    ),
    Task(
        "9.2",
        "PDF import (alohida funksiya)",
        "PDF dan to'g'ridan-to'g'ri LaTeX chiqaradigan vositani sinash va ulash.",
        ["5-10 haqiqiy PDF'da vosita sinalgan; litsenziya/narx tekshirilgan; natija 7.3 dan o'tadi"],
        depends=["7.3"],
        optional=True,
    ),
    Task(
        "9.3",
        "Markaz/ota-ona hisoboti va ko'p markazli tizim",
        "Markaz darajasidagi hisobot va markaz identifikatori.",
        ["Faqat 3.6 da qiymat tasdiqlangandan keyin"],
        depends=["3.6"],
        optional=True,
    ),
    Task(
        "9.4",
        "OMR: javoblar varag'ini suratdan o'qish",
        "Qog'ozdagi javoblarni telefon surati orqali kiritish.",
        ["Faqat 2.1 qo'lda kiritish noqulay ekani isbotlansa; 2.2 dagi varaq shakliga tayanadi"],
        depends=["2.1", "2.2"],
        optional=True,
    ),
    Task(
        "9.5",
        "Savol bankidan tasodifiy test va variant aralashtirish",
        "Savollarni bazadan tanlab test generatsiya qilish; A/B variant.",
        ["Faqat markaz talab qilsa; aralash variantlar tahlilga original ID orqali ulanadi"],
        depends=["2.2"],
        optional=True,
    ),
    # ---------------- 10. Obuna va to'lov (faqat markazlar) ----------------
    Task(
        "10.1",
        "Markaz (center) entitiyasi",
        "Bir nechta ustoz va guruh bir markazga birlashadi; guruhlar markazga tegishli.",
        [
            "centers (nom, egasi/administrator user_id, tarif, holat)",
            "center_members (center_id, user_id, rol: owner/admin/teacher) - ustozlar markazga a'zo",
            "groups.center_id maydoni; mavjud guruhlar bittaga biriktiriladi",
            "Ustoz faqat o'z markazi guruhlarini ko'radi; individual ustozlar markazsiz qoladi",
            "Migratsiya; mavjud ma'lumot buzilmagan",
        ],
        depends=["1.2", "9.3"],
        optional=True,
    ),
    Task(
        "10.2",
        "Obuna modeli va limitlar",
        "Markazga tarif (plan), obuna holati va limitlar: o'quvchi soni, "
        "imtihon soni, saqlash muddati.",
        [
            "subscriptions: center_id, plan ('free'/'pro'/...), status "
            "('active'/'trial'/'expired'/'cancelled'), started_at, expires_at",
            "Limitlar konfiguratsiyada (kodga qotirilmagan): masalan oyiga N imtihon, "
            "M o'quvchi",
            "Limit oshganda aniq xabar (qaysi limit, qachon yangilanadi)",
            "Individual ustozlar (markazsiz) cheklanmaydi yoki alohida free tarif",
        ],
        depends=["10.1"],
        optional=True,
    ),
    Task(
        "10.3",
        "To'lov integratsiyasi (Payme/Click)",
        "Markaz to'lov qiladi; invoice -> to'lov -> obuna faollashuvi.",
        [
            "Avval qo'lda: admin obunani belgilaydi (10.2 bilan)",
            "Keyin: Payme/Click merchant API - invoice yaratish, to'lov webhook, "
            "imzo tekshiruvi (strategiya pattern: provider almashtiriladigan)",
            "To'lov tasdiqlangach subscriptions.status='active', expires_at yangilanadi",
            "Webhook qayta urinishlariga chidamli (idempotent)",
        ],
        depends=["10.2"],
        optional=True,
        notes="Provider tanlov: Payme/Click (O'zbekiston). Adapter pattern qo'llash mumkin.",
    ),
    Task(
        "10.4",
        "Limit tekshiruvi va degrade rejim",
        "Obuna tugaganda yoki limit to'lganda tizim nima qilishini belgilash.",
        [
            "Imtihon yaratish/o'quvchi qo'shish limit tekshiruvidan o'tadi",
            "Expired: mavjud natijalar ko'rinadi, yangi imtihon ochish bloklanadi",
            "Ogohlantirish: muddati 7 kun qolganda ustozga xabar (email/Telegram)",
            "Unit testlar: limit chegarasi, expired holati",
        ],
        depends=["10.2"],
        optional=True,
    ),
    Task(
        "10.5",
        "Admin panel: obuna boshqaruvi",
        "Admin markazlar, tariflar va to'lovlarni boshqaradi.",
        [
            "Markazlar ro'yxati: kim, qaysi tarif, qachon tugaydi",
            "Qo'lda obuna uzaytirish/bekor qilish",
            "To'lovlar tarixi (10.3 dan keyin)",
        ],
        depends=["10.2"],
        optional=True,
    ),
]

TASK_BY_ID = {t.id: t for t in TASKS}

# ---------------------------------------------------------------------------
# Holat
# ---------------------------------------------------------------------------


def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict) and "tasks" in data:
                return data
        except (OSError, json.JSONDecodeError):
            print(f"Ogohlantirish: {STATE_FILE} o'qilmadi, bo'sh holat ishlatiladi.")
    return {"tasks": {}}


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def status_of(state: dict, task_id: str) -> str:
    return state["tasks"].get(task_id, {}).get("status", "todo")


def set_status(state: dict, task_id: str, status: str) -> None:
    if status == "todo":
        state["tasks"].pop(task_id, None)
    else:
        state["tasks"][task_id] = {
            "status": status,
            "updated": datetime.now().isoformat(timespec="seconds"),
        }


def unmet_deps(state: dict, task: Task) -> list:
    return [d for d in task.depends if status_of(state, d) != "done"]


def find_task(task_id: str) -> Task:
    task = TASK_BY_ID.get(task_id)
    if task is None:
        print(f"Bunday vazifa yo'q: {task_id}. Ro'yxat uchun: python roadmap.py list")
        sys.exit(1)
    return task


# ---------------------------------------------------------------------------
# Ko'rsatish
# ---------------------------------------------------------------------------

MARK = {"done": "[x]", "doing": "[~]", "todo": "[ ]"}


def wrap(text: str, indent: str = "    ") -> str:
    return textwrap.fill(text, width=88, initial_indent=indent, subsequent_indent=indent)


def print_task_line(state: dict, task: Task) -> None:
    st = status_of(state, task.id)
    extra = ""
    if st != "done":
        blocked = unmet_deps(state, task)
        if blocked:
            extra = f"  (avval: {', '.join(blocked)})"
    opt = " (ixtiyoriy)" if task.optional else ""
    gate = " (QAROR NUQTASI)" if task.gate else ""
    print(f"  {MARK[st]} {task.id:<4} {task.title}{opt}{gate}{extra}")


def print_task_detail(state: dict, task: Task) -> None:
    st = status_of(state, task.id)
    print(f"{MARK[st]} {task.id}  {task.title}")
    print(f"    Bosqich: {task.phase}. {PHASES[task.phase]}")
    print(f"    Holat: {st}" + (" (ixtiyoriy)" if task.optional else ""))
    if task.gate:
        print("    Qaror nuqtasi: bajarilgach to'xtab, davom etish-etmaslikni hal qil.")
    if task.depends:
        parts = [f"{d}{'+' if status_of(state, d) == 'done' else '-'}" for d in task.depends]
        print(f"    Bog'liq: {', '.join(parts)}  (+ bajarilgan, - bajarilmagan)")
    print("\n    Maqsad:")
    print(wrap(task.goal, "      "))
    print("\n    Bajarilgan hisoblanadi, agar:")
    for item in task.done_when:
        print(textwrap.fill(
            "- " + item, width=88, initial_indent="      ", subsequent_indent="        "))
    if task.notes:
        print("\n    Eslatma:")
        print(wrap(task.notes, "      "))


def next_task(state: dict):
    for t in TASKS:
        if status_of(state, t.id) == "doing":
            return t
    for t in TASKS:
        if t.optional:
            continue
        if status_of(state, t.id) == "todo" and not unmet_deps(state, t):
            return t
    return None


def progress_line(state: dict) -> str:
    core = [t for t in TASKS if not t.optional]
    done = sum(1 for t in core if status_of(state, t.id) == "done")
    total = len(core)
    width = 30
    filled = int(width * done / total) if total else 0
    bar = "#" * filled + "-" * (width - filled)
    pct = int(100 * done / total) if total else 0
    return f"[{bar}] {done}/{total} ({pct}%)  (ixtiyoriy vazifalar hisobga olinmagan)"


# ---------------------------------------------------------------------------
# Buyruqlar
# ---------------------------------------------------------------------------


def cmd_list(args) -> None:
    state = load_state()
    for phase, name in PHASES.items():
        if args.phase is not None and args.phase != phase:
            continue
        print(f"\n{phase}. {name}")
        for t in TASKS:
            if t.phase == phase:
                print_task_line(state, t)
    print("\n[x] bajarilgan   [~] jarayonda   [ ] bajarilmagan")


def cmd_next(args) -> None:
    state = load_state()
    t = next_task(state)
    if t is None:
        print("Keyingi vazifa yo'q: asosiy vazifalar tugagan yoki hammasi bloklangan.")
        print("Ixtiyoriy vazifalar uchun: python roadmap.py list --phase 9")
        return
    print("Keyingi vazifa:\n")
    print_task_detail(state, t)
    print(f"\nAI agent uchun prompt: python roadmap.py prompt {t.id}")


def cmd_show(args) -> None:
    state = load_state()
    print_task_detail(state, find_task(args.id))


def cmd_prompt(args) -> None:
    state = load_state()
    t = find_task(args.id)
    blocked = unmet_deps(state, t)
    if blocked:
        print(f"# Ogohlantirish: avval bajarilishi kerak: {', '.join(blocked)}\n")
    done_ids = [x.id for x in TASKS if status_of(state, x.id) == "done"]
    lines = [
        PROJECT_CONTEXT,
        f"BAJARILGAN VAZIFALAR: {', '.join(done_ids) if done_ids else 'hali yo`q'}",
        "",
        f"HOZIRGI VAZIFA {t.id}: {t.title}",
        f"Maqsad: {t.goal}",
        "",
        "Bajarilgan hisoblanadi, agar:",
    ]
    lines += [f"- {item}" for item in t.done_when]
    if t.notes:
        lines += ["", f"Eslatma: {t.notes}"]
    lines += ["", PROMPT_RULES]
    print("\n".join(lines))


def cmd_start(args) -> None:
    state = load_state()
    t = find_task(args.id)
    blocked = unmet_deps(state, t)
    if blocked and not args.force:
        print(f"Avval bajarilishi kerak: {', '.join(blocked)}. Baribir boshlash: --force")
        return
    set_status(state, t.id, "doing")
    save_state(state)
    print(f"[~] {t.id} {t.title} - jarayonda")


def cmd_done(args) -> None:
    state = load_state()
    t = find_task(args.id)
    blocked = unmet_deps(state, t)
    if blocked and not args.force:
        print(f"Bog'liq vazifalar bajarilmagan: {', '.join(blocked)}. Baribir belgilash: --force")
        return
    set_status(state, t.id, "done")
    save_state(state)
    print(f"[x] {t.id} {t.title} - bajarildi")
    print("\n" + progress_line(state))
    if t.gate:
        print("\nBu qaror nuqtasi edi: davom etishdan oldin xulosani yozib qo'y.")
    nxt = next_task(state)
    if nxt:
        print(f"\nKeyingi: {nxt.id} {nxt.title}   (tafsilot: python roadmap.py next)")
    else:
        print("\nAsosiy vazifalar tugadi yoki bloklangan.")


def cmd_undo(args) -> None:
    state = load_state()
    t = find_task(args.id)
    set_status(state, t.id, "todo")
    save_state(state)
    print(f"[ ] {t.id} {t.title} - bajarilmagan holatga qaytarildi")
    dependents = [x.id for x in TASKS if t.id in x.depends and status_of(state, x.id) == "done"]
    if dependents:
        print(f"Ogohlantirish: bunga bog'liq va bajarilgan vazifalar bor: {', '.join(dependents)}")


def cmd_done_list(args) -> None:
    state = load_state()
    items = [(state["tasks"][t.id].get("updated", ""), t) for t in TASKS if status_of(state, t.id) == "done"]
    if not items:
        print("Hali bajarilgan vazifa yo'q.")
        return
    print("Bajarilganlar:\n")
    for updated, t in sorted(items, key=lambda x: x[0]):
        print(f"  [x] {t.id:<4} {t.title}   ({updated})")


def cmd_status(args) -> None:
    state = load_state()
    print(progress_line(state) + "\n")
    for phase, name in PHASES.items():
        ts = [t for t in TASKS if t.phase == phase]
        done = sum(1 for t in ts if status_of(state, t.id) == "done")
        doing = sum(1 for t in ts if status_of(state, t.id) == "doing")
        extra = f", jarayonda: {doing}" if doing else ""
        print(f"  {phase}. {name}: {done}/{len(ts)}{extra}")
    nxt = next_task(state)
    if nxt:
        print(f"\nKeyingi: {nxt.id} {nxt.title}")


def cmd_reset(args) -> None:
    if not args.yes:
        print("Hamma belgilar o'chadi. Tasdiqlash uchun: python roadmap.py reset --yes")
        return
    save_state({"tasks": {}})
    print("Holat tozalandi.")


def cmd_default(args) -> None:
    cmd_status(args)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="TestVix roadmap'i")
    sub = p.add_subparsers(dest="cmd")

    sp = sub.add_parser("list", help="hamma vazifalar")
    sp.add_argument("--phase", type=int, default=None, help="faqat shu bosqich")
    sp.set_defaults(func=cmd_list)

    sub.add_parser("next", help="keyingi vazifa").set_defaults(func=cmd_next)
    sub.add_parser("status", help="progress").set_defaults(func=cmd_status)
    sub.add_parser("done-list", help="bajarilganlar").set_defaults(func=cmd_done_list)

    for name, func, help_ in [
        ("show", cmd_show, "vazifa tafsiloti"),
        ("prompt", cmd_prompt, "AI agent uchun prompt"),
        ("undo", cmd_undo, "belgini qaytarish"),
    ]:
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("id")
        sp.set_defaults(func=func)

    for name, func, help_ in [
        ("start", cmd_start, "jarayonda deb belgilash"),
        ("done", cmd_done, "bajarildi deb belgilash"),
    ]:
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("id")
        sp.add_argument("--force", action="store_true", help="bog'liqlikni e'tiborsiz qoldirish")
        sp.set_defaults(func=func)

    sp = sub.add_parser("reset", help="hammasini boshidan boshlash")
    sp.add_argument("--yes", action="store_true")
    sp.set_defaults(func=cmd_reset)

    p.set_defaults(func=cmd_default)
    return p


def main() -> None:
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()