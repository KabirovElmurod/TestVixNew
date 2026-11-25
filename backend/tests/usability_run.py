# -*- coding: utf-8 -*-
"""TestVix foydalanish qulayligi sinovi — Playwright, domcontentloaded +
selector-based kutishlar (vite dev websocket networkidle'ni buzadi)."""
import json, time, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
UNAME = "usability_tester4"
EMAIL = "usability4@testvix.uz"
PASS = "test1234"
NICK = "usability tester"

results = {}
console_errors = []
page_errors = []

def note(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def goto(page, path, sel=None, timeout=90000):
    page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=timeout)
    if sel:
        page.wait_for_selector(sel, timeout=timeout)
    else:
        page.wait_for_timeout(4000)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()
    page.on("console", lambda m: console_errors.append(m.text[:200]) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)[:200]))

    # ---------- 0. Ro'yxatdan o'tish ----------
    note("0. Ro'yxatdan o'tish")
    t0 = time.monotonic()
    try:
        goto(page, "/register", "input[placeholder='Sizning ismingiz']")
        page.fill("input[placeholder='Sizning ismingiz']", NICK)
        page.fill("input[type='email']", EMAIL)
        page.fill("input[placeholder='username']", UNAME)
        page.fill("input[type='password']", PASS)
        page.click("button[type='submit']")
        page.wait_for_timeout(4000)
        results["register"] = {"time": round(time.monotonic()-t0,1),
                               "success": UNAME in page.content() or page.url.rstrip('/') != f"{BASE}/register"}
        note(f"register url={page.url}")
    except Exception as e:
        # login fallback
        try:
            goto(page, "/login", "input[placeholder='Username']")
            page.fill("input[placeholder='Username']", UNAME)
            page.fill("input[type='password']", PASS)
            page.click("button[type='submit']")
            page.wait_for_timeout(4000)
            results["register"] = {"time": round(time.monotonic()-t0,1),
                                   "success": True, "via": "login"}
        except Exception as e2:
            results["register"] = {"time": round(time.monotonic()-t0,1),
                                   "success": False, "errors": f"{e} | {e2}"}
    note(f"0 natija: {results['register']}")

    # ---------- V1: Test yaratish ----------
    note("V1. Test yaratish")
    t0 = time.monotonic()
    try:
        goto(page, "/my_test", "text=Test qo'shish", timeout=90000)
        page.locator("button", has_text="Test qo'shish").first.click()
        page.wait_for_timeout(2500)
        inputs = page.locator(".add_test_inputs input")
        inputs.nth(0).fill("Usability test A")
        inputs.nth(1).fill("Matematika")
        page.locator(".add_test_inputs textarea").first.fill("Playwright sinovi")
        page.locator("button", has_text="Test Qo'shish").last.click()
        page.wait_for_timeout(3000)
        goto(page, "/my_test", "text=Mening testlarim", timeout=90000)
        page.wait_for_timeout(2000)
        found = page.locator("text=Usability test A").count() > 0
        results["V1"] = {"time": round(time.monotonic()-t0,1), "success": found}
    except Exception as e:
        results["V1"] = {"time": round(time.monotonic()-t0,1),
                         "success": False, "errors": str(e)[:300]}
    note(f"V1 natija: {results['V1']}")
    page.screenshot(path="usability_v1.png")

    # ---------- V2: Savol qo'shish ----------
    note("V2. Savol qo'shish")
    t0 = time.monotonic()
    try:
        card = page.locator(".test-card", has_text="Usability test A").first
        card.locator("button[title=\"Savol qo'shish\"]").click()
        page.wait_for_selector("textarea[placeholder*='Savol matnini']", timeout=60000)
        page.fill("textarea[placeholder*='Savol matnini']", "2+2=?")
        opts = page.locator("input[placeholder*='variant matni']")
        for i, val in enumerate(["3", "4", "5", "6"]):
            if i < opts.count():
                opts.nth(i).fill(val)
        checks = page.locator(".action-icon.check")
        checks.nth(1).click()
        page.wait_for_timeout(300)
        page.locator("button.save-btn").first.click()
        page.wait_for_timeout(3000)
        url = page.url
        # my_testga qaytib, kartada savollar sonini tekshiramiz
        goto(page, "/my_test", "text=Mening testlarim", timeout=90000)
        page.wait_for_timeout(2000)
        card2 = page.locator(".test-card", has_text="Usability test A")
        txt = card2.first.inner_text() if card2.count() else ""
        results["V2"] = {"time": round(time.monotonic()-t0,1),
                         "success": card2.count() > 0,
                         "detail": url, "card": txt[:200]}
    except Exception as e:
        results["V2"] = {"time": round(time.monotonic()-t0,1),
                         "success": False, "errors": str(e)[:300]}
    note(f"V2 natija: {results['V2']}")
    page.screenshot(path="usability_v2.png")

    # ---------- V3: Statistika ----------
    note("V3. Statistika")
    t0 = time.monotonic()
    try:
        card = page.locator(".test-card", has_text="Usability test A").first
        card.locator("button[title=\"Statistika\"]").click()
        page.wait_for_timeout(4000)
        url = page.url
        body = page.locator("body").inner_text()
        has_stats = any(w in body.lower() for w in ["ball", "statistika", "natija", "%", "savol"])
        results["V3"] = {"time": round(time.monotonic()-t0,1),
                         "success": has_stats, "detail": url}
    except Exception as e:
        results["V3"] = {"time": round(time.monotonic()-t0,1),
                         "success": False, "errors": str(e)[:300]}
    note(f"V3 natija: {results['V3']}")
    page.screenshot(path="usability_v3.png")

    browser.close()

print("\n===== YAKUNIY =====")
print(json.dumps(results, ensure_ascii=False, indent=2))
print("\n===== KONSOL XATOLARI =====")
seen = set()
for e in console_errors + page_errors:
    if e not in seen:
        seen.add(e); print("ERR:", e[:200])
with open("usability_results2.json", "w", encoding="utf-8") as f:
    json.dump({"results": results,
               "console_errors": console_errors,
               "page_errors": page_errors}, f, ensure_ascii=False, indent=2)
print("saved usability_results2.json")
