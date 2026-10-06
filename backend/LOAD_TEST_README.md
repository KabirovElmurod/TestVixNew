# Register Endpoint Load Test (Python)

## Docker-da Ishga Tushirish

### 1. Docker Compose ni Start Qilish
```bash
cd d:\Projects\TestVix\TestVixNew\backend
docker-compose up -d
```

### 2. Register Load Testni Ishga Tushirish

```bash
docker-compose exec account python load_test_register.py
```

**Qanday ishlaydi:**
- Har bir VU (Virtual User) random username, email bilan register qiladi
- JWT tokenlarni cookie'dan olish
- Tokenlarni avtomatik Redis ga saqlash (`test_tokens` key)
- Natijalarni consolega chiqarish

**Parametrlar:**
- `concurrent_users=10` - Bir vaqtda nechta request
- `total_users=100` - Jami nechta user

### 3. Boshqa Endpointlarni Testdan O'tkazish

Tokenlar Redis ga saqlangandan so'ng, boshqa endpointlarni test qilish:

```bash
docker-compose exec account python load_test_with_tokens.py
```

Bu skript:
- Redis dan random token oladi
- Token bilan authenticated request yuboradi
- `get_savol` endpointiga request yuboradi

**Parametrlar:**
- `concurrent_requests=10` - Bir vaqtda nechta request
- `total_requests=100` - Jami nechta request

**Eslatma:** `TEST_DATA` massividagi `hash_url` larni haqiqiy ma'lumotlar bilan almashtiring.

## Eslatmalar

1. **Password talabi:** Kamida 8 ta belgi, harf va raqam bo'lishi kerak
2. **Token muddati:** 30 kun (backend da sozlangan)
3. **Redis key:** `test_tokens`
4. **Rate limiting:** Hozircha yo'q, lekin qo'shish tavsiya etiladi
5. **Test data:** `load_test_with_tokens.py` dagi `TEST_DATA` ni haqiqiy ma'lumotlar bilan yangilang
