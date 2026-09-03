# TestVix

TestVix - foydalanuvchilar test ishlashi, natijasini ko‘rishi va test yaratuvchilar kontent boshqarishi mumkin bo‘lgan ta’lim platformasi.

## Nimalar hal qilingan

- Foydalanuvchini ro‘yxatdan o‘tkazish, login qilish va user/admin rollariga qarab sahifalarni ajratish.
- Test, savol va variantlarni yaratish hamda boshqarish.
- Vaqtli test ishlash, javoblarni saqlash va yakuniy natijani hisoblash.
- Matematik formulali savollarni qulay kiritish va ko‘rsatish.
- Ommaviy testlarni hashtag, fan va boshqa maydonlar bo‘yicha izlash.
- Testlar ostida comment va reply yozish.
- Admin uchun foydalanuvchilar, testlar, savollar va natijalarni nazorat qilish.
- Og‘ir yoki keyin bajariladigan ishlarni Celery orqali alohida worker’ga chiqarish.

## Texnologiyalar

### Frontend

- React 19 va Vite
- React Router - sahifalar va rollarga asoslangan navigatsiya
- Material UI va Emotion - UI komponentlari va stillar
- MathLive va KaTeX - matematik formula kiritish va render qilish
- Excalidraw - vizual chizmalar bilan ishlash

### Backend

- Django - admin paneli, modellar va migratsiyalar
- FastAPI - account, testlar, savollar va commentlar uchun REST API mikroservislari
- PostgreSQL - asosiy ma’lumotlar bazasi
- Redis Stack - cache va full-text/search indekslari
- Celery - background task’lar
- Docker Compose va Nginx - servislarni ishga tushirish va yagona kirish nuqtasi

## Arxitektura

Frontend API gateway sifatida Nginx orqali backend servislariga ulanadi. Account, testlar, savollar va comment funksiyalari alohida FastAPI servislariga ajratilgan. Django esa umumiy ma’lumotlar modeli va admin boshqaruvi uchun ishlatiladi. PostgreSQL doimiy ma’lumotlarni, Redis tezkor qidiruv va cache’ni, Celery esa fon vazifalarini boshqaradi.

## Ishga tushirish

### Docker orqali backend va servislar

```bash
cd backend
docker compose up --build
```

Asosiy manzillar:

- Frontend: `http://localhost`
- Nginx orqali API: `http://localhost`
- Redis Insight: `http://localhost:8014`
- PostgreSQL: `localhost:5433`

### Frontend’ni alohida development rejimida

```bash
cd frontend/TestVix
npm install
npm run dev
```

Lint va production build:

```bash
npm run lint
npm run build
```

### Django migratsiyalari

PostgreSQL ishga tushgandan keyin:

```bash
cd backend/django_main
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Portfolio uchun qisqa ta’rif

TestVix loyihasida ta’lim platformasi uchun frontend va backendni mustaqil servislar ko‘rinishida ishlab chiqdim. React/Vite yordamida rollarga mos interfeys, test ishlash jarayoni, matematik formulalar va natijalar ekranlarini qurdim. Backendda Django admin hamda FastAPI mikroservislarini PostgreSQL, Redis, Celery va Docker bilan birlashtirdim.

<!-- Screenshot qo‘shish uchun: rasmlarni docs/screenshots/ papkasiga joylang va quyidagi kabi yozing:
![TestVix test ishlash sahifasi](docs/screenshots/test-taking.png)
Bir nechta rasm uchun alohida fayl nomlaridan foydalaning, masalan admin-panel.png yoki mobile-view.png.
-->
![TestVix test ishlash](frontend/TestVix/public/favicon.svg)