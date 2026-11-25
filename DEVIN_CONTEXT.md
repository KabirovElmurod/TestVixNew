# TestVix — Loyiha konteksti va maqsad (Devin uchun)

> Bu fayl boshqa loyihadan (Document AI) olib kelilgan to'liq kontekst.
> TestVixNew'da ishlovchi Devin shu hujjatni o'qib, rejani davom ettirsin.

## Mahsulot maqsadi

**TestVix** — o'quv markazlar uchun imtihon va tashxis platformasi.

- **Ustoz**: test tuzadi, guruh ochadi, imtihon (qog'oz yoki online) ochadi, mavzu bo'yicha tahlilni ko'radi.
- **O'quvchi**:akkauntsiz (Telegram ID yoki oddiy ism), imtihon topshiradi.
- **Admin**: foydalanuvchilarni boshqaradi.

**Asosiy qiymat**: test tuzish emas — **natija ustidagi tahlil**
(mavzu bo'yicha zaiflik, heatmap, AI tavsiya).

## Muhim dizayn qarorlari (MUHOKAMA QILINGAN)

1. **Imtihon ikki rejimli**: `exam.mode = "paper" | "online"`
   - `paper`: test chop etiladi (PDF), o'quvchilar qog'ozda yechadi, ustoz natijani kiritadi (jadval yoki CSV/Excel import)
   - `online`: o'quvchi havola orqali tizimda topshiradi (aralash savollar, timer, qaytib bo'lmasligi)
   - Ikkalasi ham bir xil `attempts` + tahlilga ulanadi.

2. **AI minimal ishlatiladi** (token tejash):
   - Savolga mavzu taklifi (bir marta, ustoz tasdiqlaydi)
   - AI xulosa matni (hisoblangan raqamlardan tavsiya)
   - Tahlilning o'zi **sof SQL/Python** — AI emas (100% aniqlik)

3. **Online cheating himoyasi**: client-side blur/focus faqat "signal" (shubhali log),
   bloklash emas. To'liq himoya imkonsiz — shuning uchun paper rejim birinchi.

4. **Document AI bilan aloqa**: MUSTAQIL. Document AI (`D:\Projects\StartUp\AIDocumant\document_ai`)
   faqat ixtiyoriy "hujjatdan test import" uchun — `test yarat` buyru'g'i
   TestVix JSON sxemasida (`nom`, `fan`, `savollar[{savol, variantlar, javob, svg_json}]`)
   generatsiya qiladi. TestVix'ning ishlashiunga bog'liq emas.

5. **Diqqat — xavfsizlik**: `backend/fastapi_testlar/app/api/ai.py` va `crud/ai.py` da
   Groq API key **hardcode** qilingan (`gsk_wO92...`). Ish boshi bilan:
   - `.env`'ga ko'chirish
   - keyni **rotate** qilish (u git tarixida ochiq)

## Mavjud holat (tekshirilgan)

**Arxitektura**: Django admin + 4 ta FastAPI mikroservis (account, testlar, savollar, comment)
+ React 19/Vite/MUI frontend + PostgreSQL + Redis + Celery + Docker Compose + Nginx.

**Modellar** (fastapi_testlar/app/models/testlar.py, fastapi_savollar/app/models/savollar.py):
- `Testlar`: id, user_id, nom, fan, tavsif, test_id, test_code, test_key, ispublic, istime, time, question_count
- `Savollar`: id, test_id, text, svg_json (mavzu/qiyinlik YO'Q — qo'shish kerak)
- `Variantlar`: id, savol_id, text, is_true
- `Natijalar`: id, user_id, test_id, sum_son, true_son, false_son, answer(JSON), isfinish, time_spent
  — `answer` JSON'da har bir savol javobi bor → tahlil uchun tayyor

**Endpoint**: `POST /testlar/create_test_with_json` — TestlarCreate sxemasi
(savollar: savol, variantlar[], javob=indeks, svg_json). `get_current_user` talab qiladi.

**AI**: `fastapi_testlar/app/api/ai.py` — Groq (eski model `llama-3.3-70b-versatile`
deprecated — `openai/gpt-oss-120b` yoki `qwen/qwen3.8-27b` ga almashtirish kerak).

## Qo'shiladigan jadvallar/modullar

- `groups` (ustoz_id, nom, join_code)
- `students` (telegram_id YOKI ism, akkauntsiz)
- `exams` (test_id, group_id, mode[p|online], start/end time)
- `attempts` (exam_id, student_id, answers JSON, score, tab_switches, started/finished)
- `question_topics` (savol_id → mavzu, qiyinlik) — `Savollar` ga ustun qo'shish ham mumkin

**Arxitektura qarori kerak**: qaysi FastAPI servis "egasi" bo'ladi?
(Tavsiya: yangi `fastapi_exam` mikroservis yoki fastapi_testlar ichida)

## Bosqichma-bosqich reja

**MVP (paper mode + tahlil):**
1. `Savollar` ga `mavzu`/`qiyinlik` maydonlari + migratsiya
2. `groups`, `exams`, `attempts` jadvallari + CRUD endpointlar
3. Natija kiritish UI (jadval) + CSV/Excel import
4. Mavzu bo'yicha heatmap endpoint (SQL agregatsiya)
5. AI xulosa endpoint (Groq, .env'dan key)
6. Test chop etish/PDF ko'rinish

**Keyingi:**
7. Online imtihon (exam link, student token, savol UI, timer, tab-switch log)
8. Telegram bot (aiogram, alohida servis)
9. Document AI integratsiyasi (ixtiyoriy import tugmasi)

**Keyinroq:** mavzular grafi (prerequisite), "ildiz sabab" tahlili,
takroriy testlar dinamika, ochiq javob AI baholash.

## Chegaralar (qilmaymiz)

- Umumiy test platformasi bo'lib qolish Yo'q — faqat matematika/fan, ustoz-guruh-imtihon-tahlil
- O'quvchi akkaunt tizimi Yo'q — akkauntsiz
- Ko'p rol Yo'q — faqat ustoz/admin
