# -*- coding: utf-8 -*-
"""Patternlar bo'yicha Word hisobotini generatsiya qiladi.

Ishga tushirish (backend papkasidan):
    python patterns_lab/make_report.py
Natija: patterns_lab/Patternlar_hisoboti.docx
"""
import io
import os
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERNS_DIR = os.path.join(BACKEND, "patterns")
HERE = os.path.dirname(os.path.abspath(__file__))
IMG_PATH = os.path.join(HERE, "class_diagram.png")
OUT_PATH = os.path.join(HERE, "Patternlar_hisoboti.docx")

# ---------------------------------------------------------------- diagram
from PIL import Image, ImageDraw, ImageFont


def draw_diagram(path):
    W, H = 1600, 1400
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 22)
        font_b = ImageFont.truetype("arialbd.ttf", 26)
        font_s = ImageFont.truetype("arial.ttf", 18)
    except OSError:
        font = font_b = font_s = ImageFont.load_default()

    def box(x, y, w, h, title, items, fill=(235, 242, 250), border=(60, 100, 160)):
        d.rectangle([x, y, x + w, y + h], fill=fill, outline=border, width=3)
        d.text((x + 12, y + 8), title, font=font_b, fill=(20, 40, 80))
        ty = y + 45
        for it in items:
            d.text((x + 20, ty), it, font=font_s, fill=(40, 40, 40))
            ty += 26

    def arrow(x1, y1, x2, y2, label=""):
        d.line([x1, y1, x2, y2], fill=(120, 60, 160), width=3)
        # uchburchak
        d.polygon([(x2, y2), (x2 - 12, y2 - 7), (x2 - 12, y2 + 7)], fill=(120, 60, 160))
        if label:
            d.text(((x1 + x2) / 2 - 40, (y1 + y2) / 2 - 22), label,
                   font=font_s, fill=(120, 60, 160))

    # sarlavhalar
    d.text((60, 30), "Patternlar sinflar diagrammasi (TestVix misolida)",
           font=font_b, fill=(0, 0, 0))

    gx = [70, 620, 1170]
    gy = 100
    titles = ["YARATUVCHI (Creational)", "TUZILMAVIY (Structural)", "XULQ-ATVOR (Behavioral)"]
    colors = [(220, 240, 220), (255, 245, 220), (235, 220, 245)]
    for x, t, c in zip(gx, titles, colors):
        d.rectangle([x, gy, x + 440, gy + 60], fill=c, outline=(80, 80, 80), width=2)
        d.text((x + 15, gy + 14), t, font=font_b, fill=(0, 0, 0))

    # --- Yaratuvchi ustuni ---
    x = gx[0]
    box(x, 220, 440, 140, "AppConfig  [Singleton]", [
        "_instance, _lock", "load(env) -> self",
        "database_url, redis_url, api_key"])
    box(x, 480, 440, 160, "XabarXizmati  [Factory Method]", [
        "+ kanal_yarat() -> XabarKanal", "xabar_yubor(qabuluvchi, matn)"])
    box(x, 720, 440, 160, "XabarKanal  (abstract)", [
        "+ yubor(qabuluvchi, matn)"])
    box(x, 960, 200, 200, "WebSocketKanal / TelegramKanal /", ["EmailKanal  (vorislar)"])

    arrow(x + 220, 360, x + 220, 470, "yaratadi")
    arrow(x + 150, 640, x + 110, 950, "yaratadi")
    arrow(x + 290, 640, x + 330, 950, "yaratadi")

    # --- Tuzilmaviy ustuni ---
    x = gx[1]
    box(x, 220, 440, 150, "LLMClient  [Adapter interfeys]", [
        "+ generate(prompt, json_mode) -> str"])
    box(x, 470, 440, 220, "GroqAdapter / FakeLLMAdapter /", ["OpenAIAdapter", "(tashqi servislarga mos)"])
    box(x, 790, 440, 200, "LLM provayderlari", ["Groq API, OpenAI, test fake"])

    arrow(x + 330, 370, x + 330, 460, "moslaydi")
    arrow(x + 110, 590, x + 110, 780, "chaqiradi")
    arrow(x + 330, 590, x + 330, 780, "chaqiradi")

    box(x, 960, 440, 190, "Decorator funksiyalar", [
        "@timed   — vaqt o'lchov", "@logged  — log yozish",
        "@retry   — qayta urinish", "(funksiyani o'raydi)"])

    # --- Xulq-atvor ustuni ---
    x = gx[2]
    box(x, 220, 440, 220, "TartiblashStrategiyasi  [Strategy]", [
        "+ tartibla(savollar, user_id, base) -> list"])
    box(x, 520, 440, 200, "NormalTartiblash", ["TempAralashTartiblash",
                                                "QiyinlikkaTartiblash"])
    box(x, 780, 440, 220, "SavolYetkazishXizmati", ["strategiya.tartibla(...)"])

    arrow(x + 330, 370, x + 430, 460, "amal qiladi")
    arrow(x + 110, 590, x + 110, 780, "qaytaradi")
    arrow(x + 660, 590, x + 660, 780, "ishlatadi")

    box(x, 960, 440, 220, "ImtihonSubyekti  [Observer]", [
        "obuna(kuzatuvchi)", "och() / yop() / natija_elon()",
        "_xabar() -> barcha kuzatuvchilarga"])
    box(x, 1230, 440, 160, "Kuzatuvchilar", [
        "WebSocketKuzatuvchi", "LogKuzatuvchi",
        "TelegramKuzatuvchi"])

    # subyekt -> kuzatuvchilar
    d.line([x + 220, 1180, x + 220, 1225], fill=(120, 60, 160), width=3)
    d.polygon([(x + 220, 1230), (x + 213, 1218), (x + 227, 1218)],
              fill=(120, 60, 160))
    d.text((x + 240, 1195), "yangilandi(hodisa)", font=font_s,
           fill=(120, 60, 160))

    img.save(path)
    print("diagram:", path)


# ---------------------------------------------------------------- docx helpers

def set_cell(cell, text, bold=False, size=10):
    cell.text = ""
    p = cell.paragraphs[0]
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.name = "Calibri"


def add_table(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        set_cell(t.rows[0].cells[j], h, bold=True)
        shade(t.rows[0].cells[j], "D9E2F3")
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            set_cell(t.rows[i + 1].cells[j], val)
    if widths:
        for j, w in enumerate(widths):
            for row in t.rows:
                row.cells[j].width = Cm(w)
    doc.add_paragraph()
    return t


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def add_code(doc, path):
    with open(path, encoding="utf-8") as f:
        code = f.read().rstrip()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.left_indent = Cm(0.6)
    pf.space_after = Pt(2)
    # fon uchun border
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    for side in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "6")
        el.set(qn("w:color"), "9AA7BD")
        pBdr.append(el)
    pPr.append(pBdr)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), "F2F4F7")
    pPr.append(shd)

    lines = code.split("\n")
    first = True
    for i, line in enumerate(lines):
        if i == 0:
            run = p.add_run(line + "\n")
        else:
            run = p.add_run(line + "\n")
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(0x20, 0x20, 0x20)
        rPr = run._element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.append(rFonts)
        rFonts.set(qn("w:ascii"), "Consolas")
        rFonts.set(qn("w:hAnsi"), "Consolas")
    doc.add_paragraph()


def add_output_block(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.left_indent = Cm(0.6)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    for side in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "6")
        el.set(qn("w:color"), "9AA7BD")
        pBdr.append(el)
    pPr.append(pBdr)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), "F2F4F7")
    pPr.append(shd)
    for line in text.split("\n"):
        run = p.add_run(line + "\n")
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)


def run_demo():
    res = subprocess.run(
        [sys.executable, "-m", "patterns.demo"],
        cwd=BACKEND, capture_output=True, text=True, encoding="utf-8",
        errors="replace")
    return res.stdout + res.stderr


# ---------------------------------------------------------------- hisobot

def build():
    draw_diagram(IMG_PATH)
    demo_out = run_demo()

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    title = doc.add_heading("TestVix — Design Patterns hisoboti", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("Fan: TestVix (imtihon/test platformasi) | Til: Python 3.13")
    doc.add_paragraph("Loyiha: backend/patterns/ — 6 ta pattern implementatsiyasi")
    doc.add_page_break()

    # ---------- 1-qadam ----------
    doc.add_heading("1-qadam. Loyihadagi takrorlanuvchi muammolar", 1)
    doc.add_paragraph(
        "TestVix backend'ida (FastAPI + Redis) quyidagi muammolar takrorlanadi. "
        "Har biri uchun pattern tanlash asoslanadi.")
    add_table(
        doc,
        ["№", "Muammo", "Nima o'zgaradi?", "Patternsiz yechim nimaga olib keladi?"],
        [
            ["1", "AI qatlami turli LLM provayderlarini qo'llab-quvvatlashi kerak "
                  "(Groq hozir, OpenAI/Gemini/test-fake kelajakda). "
                  "ai.py dagi kod Groq'ga qattiq bog'langan.",
             "Yangi LLM provayder qo'shilsa yoki testda soxta javob kerak bo'lsa.",
             "ai.py ning har bir funksiyasi o'zgartiriladi; testda haqiqiy "
             "tarmoq so'rovi ketadi — sekin va beqaror."],
            ["2", "Xabarlar turli kanallarga yuborilishi kerak: hozir websocket "
                  "(fastapi_comment), kelajakda Telegram bot, email.",
             "Yangi kanal (Telegram, email, SMS) qo'shilganda.",
             "Har bir kanal uchun alohida xabar-yuborish kodi; "
             "if/elif zanjirlari o'sib boradi."],
            ["3", "Imtihon ochildi/yopildi yoki natija e'lon qilindi — "
                  "websocket, log fayl va kelajakdagi Telegram barchasiga "
                  "xabar ketishi kerak.",
             "Yangi «kuzatuvchi» (masalan, email-xabarnoma) qo'shilganda.",
             "Subyekt har bir kanalni bevosita chaqiradi — kod o'sadi, "
             "kanalni o'chirish qiyin."],
            ["4", "Savollarni yetkazishda tartiblash algoritmi almashtiriladi: "
                  "oddiy tartib, TEMP_ANSWER_MODE aralash-tartiblash, "
                  "qiyinlikka qarab saralash.",
             "Yangi tartiblash algoritmi (tasodifiy, vaqti tugagan savollar "
             "oldin) qo'shilganda.",
             "get_savol_by_test_id ichida if/elif shartlari ko'payadi — "
             "funksiya o'zgarmaydi bo'ladi."],
            ["5", "DATABASE_URL, REDIS_URL, API kalitlari kabi sozlamalar "
                  "bir necha servislarda qayta-qayta yuklanadi.",
             "Testda boshqa config bilan ishlash kerak bo'lganda.",
             "Har bir modul .env'ni alohida o'qiydi — nomuvofiqlik "
             "va resurs sarfi."],
            ["6", "crud funksiyalariga logging, vaqt o'lchovi va qayta "
                  "urinish qo'shish kerak — har safar qo'lda.",
             "Yangi cross-cutting xulq (kesh, metrika) qo'shilganda.",
             "Har bir funksiyani alohida o'zgartirish; xulqni o'chirish "
             "qiyin."],
        ],
        widths=[0.8, 4.2, 3.0, 4.2],
    )
    doc.add_page_break()

    # ---------- 2-qadam ----------
    doc.add_heading("2-qadam. Pattern tanlash", 1)
    doc.add_paragraph(
        "Har bir muammo uchun nomzod patternlar ko'rib chiqilib, bittasi "
        "asoslab tanlandi.")
    add_table(
        doc,
        ["№", "Nomzodlar", "Tanlov", "Nima uchun?"],
        [
            ["1", "Adapter, Facade, Strategy",
             "Adapter",
             "Muammo interfeys mos kelmasligi (Groq'ning openai-client "
             "chaqiruvi vs bizning LLMClient). Adapter aynan "
             "«mos kelmaydigan interfeysni moslashtiradi» — Facade "
             "ko'p faylni bir eshik ostida jamlaydi, bu yerda kerak emas; "
             "Strategy algoritm almashtirish uchun, interfeys moslash "
             "emas."],
            ["2", "Factory Method, Builder, Abstract Factory",
             "Factory Method",
             "Kerak narsa — «qaysi kanal sinfi yaratilishini "
             "voris (WebSocketXizmat/TelegramXizmat) hal qiladi. "
             "Builder ob'ektni bosqichma-bosqich yig'ish uchun — kanal "
             "oddiy obyekt, ortiqcha murakkablik. Abstract Factory "
             "oilani yaratadi, bitta mahsulot yetarli."],
            ["3", "Observer, Pub/Sub broker, Callback funksiyalar",
             "Observer",
             "Bir subyekt (Imtihon) → ko'p kuzatuvchi munosabati "
             "aynan Observer'ning klassik holati. Pub/Sub alohida "
             "broker talab qiladi (Redis allaqachon bor, lekin demo "
             "uchun Observer sodda). Callback'lar type-safety yo'q."],
            ["4", "Strategy, if/elif shartlar, Template Method",
             "Strategy",
             "Algoritmni ish vaqtda almashtirish — Strategy'ning "
             "asosiy maqsadi. Template Method «qaysi qadamlar "
             "bajarilishini» belgilaydi, bu yerda butun algoritm "
             "almashtiriladi. if/elif — pattern emas, kengaymaydi."],
            ["5", "Singleton, Dependency Injection, modul-global o'zgaruvchi",
             "Singleton",
             "Bir xil konfiguratsiya obyekti butun servis bo'ylab — "
             "Singleton klassik holat. DI ham mumkin, lekin kichik "
             "demo'da Singleton oddiyroq va __new__ + Lock bilan "
             "thread-safe. Modul-global esa testda almashtirib "
             "bo'lmaydi."],
            ["6", "Decorator, Middleware, Monkey-patching",
             "Decorator",
             "Python'ning @decorator sintaksisi aynan shu pattern; "
             "funksiyani o'zgartirmasdan xulq qo'shadi. Middleware "
             "faqat HTTP so'rovlarga ishlaydi — bizda DB/servis "
             "funksiyalari ham bor. Monkey-patching xatarli."],
        ],
        widths=[0.8, 3.6, 2.6, 6.4],
    )
    doc.add_page_break()

    # ---------- Patternlar haqida umumiy bo'lim ----------
    doc.add_page_break()
    doc.add_heading("Patternlar haqida: nechta va nega", 1)
    doc.add_paragraph(
        "Jami 6 ta pattern tanlandi va implementatsiya qilindi — "
        "3 ta guruhdan ikkitadan: "
        "Yaratiluvchi (Singleton, Factory Method), "
        "Tuzilmaviy (Adapter, Decorator), "
        "Xulq-atvor (Observer, Strategy). "
        "Umumiy ma'lumotnomada (GoF, «Design Patterns») jami 23 ta "
        "klassik pattern bor — ularning 6 tasi loyihamizdagi real "
        "muammolarga mos kelgani uchun tanlandi. "
        "Har biri TestVix loyihasidagi aniq, mavjud muammoga javob beradi.")
    add_table(
        doc,
        ["Pattern", "Guruh", "Loyihada qayerda ishlatiladi",
         "Nega aynan shu pattern tanlandi?"],
        [
            ["Singleton", "Yaratiluvchi",
             "AppConfig — DATABASE_URL, REDIS_URL, GROQ_API_KEY, "
             "JWT_SECRET kabi sozlamalar butun FastAPI servis bo'ylab.",
             "Config obyekti bitta va global bo'lishi shart — "
             "har modul .env'ni alohida o'qisa nomuvofiqlik bo'ladi. "
             "Singleton + threading.Lock thread-safe va testda "
             "almashtirish mumkin."],
            ["Factory Method", "Yaratiluvchi",
             "Xabar kanallarini tanlash: WebSocketKanal (hozirgi "
             "fastapi_comment), TelegramKanal, EmailKanal.",
             "Yangi kanal qo'shilganda asosiy xabar-yuborish kodi "
             "o'zgarmasligi kerak (O tamoyili). Har kanal o'z "
             "voris sinfida kanal_yarat() ni belgilaydi — "
             "tanlov chaqiruvchi koddan ajraladi."],
            ["Adapter", "Tuzilmaviy",
             "AI qatlami (ai.py): Groq API hozir, OpenAI/Gemini va "
             "test uchun FakeLLM kelajakda — barchasi LLMClient "
             "interfeysiga moslangan.",
             "Muammo interfeys mos kelmasligi edi: Groq "
             "openai-client orqali chaqiriladi, lekin biz "
             "«generate(prompt) -> str» sodda interfeysi kerak. "
             "Adapter tashqi API'ni bu interfeysga o'raydi — "
             "ai.py dagi biznes-mantiq provider'dan mustaqil "
             "bo'ladi, testda soxta LLM ishlatiladi."],
            ["Decorator", "Tuzilmaviy",
             "crud/servis funksiyalariga @timed (vaqt o'lchovi), "
             "@logged (log yozish), @retry (xatoda qayta urinish).",
             "Bu xulqlar cross-cutting — har bir funksiyani "
             "qo'lda o'zgartirish o'rniga funksiya tashqarisidan "
             "o'rash kifoya. Python'dagi @sintaksis aynan "
             "Decorator pattern — kod toza, xulqni o'chirish oson."],
            ["Observer", "Xulq-atvor",
             "Imtihon hodisalari: ochildi, yopildi, natija e'lon "
             "qilindi — WebSocket, Log va Telegram kuzatuvchilarga.",
             "Subyekt (Imtihon) kuzatuvchilarni bevosita "
             "chaqirmasligi kerak — yangi kanal qo'shish "
             "obuna()/obunadan_chiq() bilan hal bo'ladi. "
             "Hozirgi websocket.py allaqachon shu rolni "
             "bajaradi — pattern uni rasmiylashtiradi."],
            ["Strategy", "Xulq-atvor",
             "Savollarni yetkazishdagi tartiblash: oddiy tartib, "
             "TEMP_ANSWER_MODE aralash-tartiblash, qiyinlikka "
             "saralash — get_savol_by_test_id / savol_delivery.py.",
             "Algoritmlar bir-birini almashtiradi va tanlov "
             "ish vaqtda sodir bo'ladi — Strategy'ning klassik "
             "holati. if/elif o'rniga strategiya klassi "
             "qo'shiladi — funksiya kengaymaydi."],
        ],
        widths=[2.0, 2.0, 5.6, 5.8],
    )
    doc.add_page_break()

    # ---------- 3-6-qadam: kod ----------
    doc.add_heading("3–6-qadam. Patternlar kodi (Python)", 1)
    doc.add_paragraph(
        "Kod joylashuvi: backend/patterns/ — har pattern alohida "
        "faylda, demo() funksiyasi bor. Quyida asosiy kodlar:")

    files = [
        ("Pattern 1: SINGLETON (Yaratiluvchi) — singleton.py",
         "patterns/singleton.py"),
        ("Pattern 2: FACTORY METHOD (Yaratiluvchi) — factory.py",
         "patterns/factory.py"),
        ("Pattern 3: ADAPTER (Tuzilmaviy) — adapter.py",
         "patterns/adapter.py"),
        ("Pattern 4: DECORATOR (Tuzilmaviy) — decorator.py",
         "patterns/decorator.py"),
        ("Pattern 5: OBSERVER (Xulq-atvor) — observer.py",
         "patterns/observer.py"),
        ("Pattern 6: STRATEGY (Xulq-atvor) — strategy.py",
         "patterns/strategy.py"),
    ]
    for caption, rel in files:
        doc.add_heading(caption, 2)
        add_code(doc, os.path.join(PATTERNS_DIR, rel.split("/", 1)[1]))

    doc.add_heading("demo.py — barcha demolarni ishga tushiradi", 2)
    add_code(doc, os.path.join(PATTERNS_DIR, "demo.py"))
    doc.add_page_break()

    # ---------- 7-qadam ----------
    doc.add_heading("7-qadam. Yakuniy qism", 1)

    doc.add_heading("7.1. Patternlar tuzilmasi — sinflar diagrammasi", 2)
    doc.add_picture(IMG_PATH, width=Cm(17))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(
        "Diagramma izohi: Yaratuvchi guruhida AppConfig yagona config "
        "obyekti, XabarXizmati esa kanal yaratish strategiyasini voris "
        "sinfga topshiradi. Tuzilmaviy guruhda GroqAdapter/FakeLLMAdapter "
        "LLMClient interfeysiga moslanadi, decorator'lar funksiyalarni "
        "o'raydi. Xulq-atvor guruhida TartiblashStrategiyasi algoritmlarni, "
        "ImtihonSubyekti esa kuzatuvchilarga hodisa tarqatadi.")

    doc.add_heading("7.2. Dasturni ishga tushirish va natija", 2)
    doc.add_paragraph(
        "Buyruq: cd backend && python -m patterns.demo")
    doc.add_paragraph("Terminaldagi natija:")
    add_output_block(doc, demo_out)
    doc.add_paragraph(
        "Barcha 6 ta pattern xatosiz ishlaydi: Singleton bitta obyekt "
        " qaytaradi, Factory 3 ta kanalga xabar yuboradi, Adapter Groq va "
        "Fake provayderlarni bir xil interfeysda ishlatadi, Decorator "
        "log+timing+retry ni birlashtiradi, Observer 3 ta hodisani 3 "
        "kuzatuvchiga tarqatadi, Strategy 3 xil tartiblashni "
        "almashtirib ko'rsatadi.")
    doc.add_page_break()

    # ---------- Foyda / Narx ----------
    doc.add_heading("7.3. «Foyda / Narx» jadvali", 2)
    add_table(
        doc,
        ["Pattern", "Foyda", "Narx / Kamchilik"],
        [
            ["Singleton",
             "Sozlamalar/ulanish yagona manbadan olinadi; resurs "
             "tejaydi; testda osongina almashtiriladi.",
             "Yagona holat — parallel testlarda e'tiborga olinishi "
             "kerak; global holat yashirin bog'liqlik yaratishi mumkin."],
            ["Factory Method",
             "Yangi kanal qo'shish — bitta voris sinf yozish kifoya; "
             "asosiy kod o'zgarmaydi (O tamoyili).",
             "Har bir mahsulot oilasi uchun voris sinf kerak — "
             "sinflar soni ko'payadi."],
            ["Adapter",
             "Tashqi servislarga (Groq, OpenAI) bir xil interfeys; "
             "testda soxta LLM ishlatish mumkin.",
             "Qo'shimcha wrapper sinf — biroz ortiqcha kod; interfeys "
             "ba'zan tashqi API cheklovlariga moslashishi shart."],
            ["Decorator",
             "Xulq (log, timing, retry) alohida funksiya — "
             "asosiy mantiq toza qoladi; @sintaksis bilan qulay.",
             "Ko'p decorator zanjiri xato topishni qiyinlashtirishi "
             "mumkin; debug'da traceback chuqurlashadi."],
            ["Observer",
             "Subyekt kuzatuvchilarni bilmaydi — yangi kanal qo'shish "
             "oson; hodisalar bir nuqtadan tarqaladi.",
             "Kuzatuvchilar soni oshsa xabar yo'qotish/keta ketish "
             "imkoni; debug qiyinroq."],
            ["Strategy",
             "Algoritm ish vaqtda almashtiriladi; if/elif yo'q — "
             "kod kengayuvchan.",
             "Har bir algoritm alohida sinf — kichik vazifalar uchun "
             "ortiqcha abstraksiya."],
        ],
        widths=[2.4, 6.3, 6.8],
    )

    try:
        doc.save(OUT_PATH)
        print("hisobot:", OUT_PATH)
    except PermissionError:
        # fayl Word'da ochiq — _v2 nomi bilan saqlash
        alt = OUT_PATH.replace(".docx", "_v2.docx")
        doc.save(alt)
        print("hisobot (fayl ochiq edi, yangi nom bilan):", alt)


if __name__ == "__main__":
    build()
