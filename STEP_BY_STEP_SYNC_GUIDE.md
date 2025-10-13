# Bosqichma-bosqich Sipuni Sync Guide

## Umumiy ma'lumot

Sipuni integratsiyasi endi 2 bosqichga bo'lingan:

### **Bosqich 1**: CSV faylni Sipuni API dan yuklash
- Sipuni API dan barcha qo'ng'iroq ma'lumotlarini oladi
- CSV formatda `sipuni-all-records.csv` fayliga saqlaydi
- Hech qanday recording yuklamaydi (tez ishlaydi)

### **Bosqich 2**: CSV dan o'qish va recordinglarni yuklash
- CSV fayldan qo'ng'iroqlarni o'qiydi
- Har bir qo'ng'iroq uchun:
  - Employee (extCode) mavjudligini tekshiradi
  - Qo'ng'iroq bazada yo'qligini tekshiradi
  - Recording faylni Sipuni dan yuklaydi
  - Database ga saqlaydi
  - AI processing ishga tushiradi

---

## API Endpointlari

### 1. CSV faylni yuklash (Step 1)

**Endpoint**: `POST /sipuni/step1-fetch-csv`

**Query parametrlari**:
- `limit` (optional): Nechta yozuv olish kerak (default: 500)

**Misol**:
```bash
curl -X POST "http://localhost:3000/sipuni/step1-fetch-csv?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully fetched and saved 100 records to CSV",
  "totalRecords": 100,
  "csvPath": "C:\\Users\\user\\OneDrive\\Desktop\\Navai.2\\navai-analytics-backend\\sipuni-all-records.csv"
}
```

---

### 2. Recordinglarni yuklash (Step 2)

**Endpoint**: `POST /sipuni/step2-process-recordings`

**Query parametrlari**:
- `from` (optional): Boshlanish sanasi (DD.MM.YYYY format, masalan: 01.10.2025)
- `to` (optional): Tugash sanasi (DD.MM.YYYY format, masalan: 13.10.2025)

**Misol (barcha yozuvlar)**:
```bash
curl -X POST "http://localhost:3000/sipuni/step2-process-recordings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Misol (sana filtri bilan)**:
```bash
curl -X POST "http://localhost:3000/sipuni/step2-process-recordings?from=10.10.2025&to=13.10.2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Processed: 45, Skipped: 20, Failed: 0",
  "recordsProcessed": 45
}
```

---

## Webhook (eski usul - avtomatik 2 bosqichni birga bajaradi)

**Endpoint**: `POST /sipuni-integration`

**Headers**:
- `X-API-Key`: `navai-secure-webhook-key-2025`

**Body**:
```json
{
  "organizationId": 1,
  "limit": 10
}
```

**Misol**:
```bash
curl -X POST "http://localhost:3000/sipuni-integration" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: navai-secure-webhook-key-2025" \
  -d '{"organizationId": 1, "limit": 10}'
```

---

## Afzalliklari

### ✅ Bosqichma-bosqich usul
- **Tezlik**: Step 1 juda tez (faqat CSV)
- **Nazorat**: Step 2 ni xohlaganingizda ishga tushirish mumkin
- **Sana filtri**: Faqat kerakli sanalarni qayta ishlash
- **Debug oson**: Har bir bosqichni alohida tekshirish mumkin

### ⚡ Eski usul (sync-and-process yoki webhook)
- Bir marta chaqirish - hamma narsa avtomatik
- Lekin sekinroq (barcha recordinglar yuklanadi)

---

## Skipped yozuvlar sabablari

Agar `Skipped` ko'p bo'lsa, quyidagilar sabab bo'lishi mumkin:

1. **Employee topilmadi** - `extCode` mos kelmayapti
2. **Qo'ng'iroq bazada mavjud** - `externalId` duplikat
3. **Recording 404** - Sipuni serverida audio fayl yo'q

**Tekshirish**:
```bash
# Server console outputini ko'ring
# [STEP2] Employee not found for extCode: 123
# [STEP2] Call already exists
# [STEP2] Recording not available (404)
```

---

## Misol: To'liq workflow

```bash
# 1. CSV faylni yuklash (tez)
curl -X POST "http://localhost:3000/sipuni/step1-fetch-csv?limit=500" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. CSV faylni ko'rib chiqish (optional)
cat sipuni-all-records.csv

# 3. Faqat oxirgi 3 kunni qayta ishlash
curl -X POST "http://localhost:3000/sipuni/step2-process-recordings?from=10.10.2025&to=13.10.2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Muhim eslatmalar

- **JWT Token**: `/auth/login` orqali oling
- **Role**: `ADMIN` yoki `SUPERADMIN` bo'lishi kerak
- **CSV fayl**: Loyha root papkasida saqlanadi
- **Date format**: Har doim `DD.MM.YYYY` (masalan: `13.10.2025`)

---

## Xatoliklarni tuzatish

### CSV fayl topilmadi
```json
{
  "success": false,
  "message": "CSV file not found. Please run Step 1 first."
}
```
**Yechim**: Avval Step 1 ni ishga tushiring

### Employee not found
```
[STEP2] Employee not found for extCode: 123
```
**Yechim**: Database da `User` jadvalida `extCode = "123"` bo'lgan xodim mavjudligini tekshiring

### Recording 404
```
[STEP2] Recording not available for recordId: abc123
```
**Yechim**: Bu qo'ng'iroq skip qilinadi, bu normal (Sipuni serverida fayl yo'q)
