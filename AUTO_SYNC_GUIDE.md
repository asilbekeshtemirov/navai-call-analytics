# 📅 Avtomatik Sipuni Sinxronizatsiya - Qo'llanma

Ushbu tizim har bir kompaniya uchun **avtomatik** va **sozlanuvchi** Sipuni qo'ng'iroqlar sinxronizatsiyasini ta'minlaydi.

## ✨ Asosiy Imkoniyatlar

### 1. 🚀 Dastur Ishga Tushganda Avtomatik Sync

Dastur ishga tushganda **har bir kompaniya** uchun:
- ✅ Oyning 1-sanasidan hozirgi vaqtgacha bo'lgan barcha qo'ng'iroqlar yuklanadi
- ✅ Audio fayllar Sipuni'dan yuklanadi
- ✅ STT orqali transkripsiya qilinadi
- ✅ Gemini AI orqali tahlil qilinadi

**Misol:**
```
Bugun: 15-Dekabr, 2024
Sync boshlandi: 01-Dekabr, 2024 → 15-Dekabr, 2024
Yuklanadi: 14 kunlik qo'ng'iroqlar
```

### 2. ⏰ Har Bir Kompaniya O'z Vaqtini Belgilashi

Har bir kompaniya **mustaqil ravishda** kundalik sync vaqtini sozlashi mumkin:

#### Default (23:50 da):
```json
{
  "syncSchedule": "50 23 * * *"
}
```

#### 22:00 da:
```json
{
  "syncSchedule": "0 22 * * *"
}
```

#### 20:00 da:
```json
{
  "syncSchedule": "0 20 * * *"
}
```

#### Yarim tunda (00:00):
```json
{
  "syncSchedule": "0 0 * * *"
}
```

## 🔧 Settings Konfiguratsiyasi

Har bir kompaniya o'z Settings'ida quyidagi sozlamalarni o'zgartirishi mumkin:

### syncSchedule
**Tavsif:** Avtomatik sync vaqti (cron format)
**Default:** `"50 23 * * *"` (har kuni 23:50 da)
**Misol:**
```json
{
  "syncSchedule": "0 22 * * *"  // Har kuni 22:00 da
}
```

### autoSyncOnStartup
**Tavsif:** Dastur ishga tushganda oyning boshidan sinxronizatsiya qilish
**Default:** `true`
**Qiymatlar:**
- `true` - Avtomatik sync yoqilgan (oyning 1-sanasidan hozirgi kungacha)
- `false` - Avtomatik sync o'chirilgan

```json
{
  "autoSyncOnStartup": true  // Yoqilgan
}
```

## 📝 Cron Schedule Formati

Cron schedule format: `"minute hour day month weekday"`

| Format | Izoh | Misol |
|--------|------|-------|
| `"50 23 * * *"` | Har kuni 23:50 da | Default |
| `"0 22 * * *"` | Har kuni 22:00 da | |
| `"0 20 * * *"` | Har kuni 20:00 da | |
| `"0 0 * * *"` | Yarim tunda | |
| `"30 18 * * *"` | Har kuni 18:30 da | |
| `"0 0,6,12,18 * * *"` | Har 6 soatda (00:00, 06:00, 12:00, 18:00) | |
| `"0 */4 * * *"` | Har 4 soatda | |

## 🔄 Ishlash Jarayoni

### Dastur Ishga Tushganda:

1. **Barcha faol kompaniyalarni olish**
   ```
   SELECT * FROM organizations WHERE isActive = true
   ```

2. **Har bir kompaniya uchun:**

   a) **Dynamic cron job yaratish**
   ```
   Kompaniya A: 23:50 da sync
   Kompaniya B: 22:00 da sync
   Kompaniya C: 20:00 da sync
   ```

   b) **AutoSyncOnStartup tekshirish**
   ```
   Agar true bo'lsa:
     - Oyning 1-sanasidan hozirgi vaqtgacha sync
     - Barcha qo'ng'iroqlarni yuklab processing boshlash
   ```

### Kundalik Avtomatik Sync:

Har bir kompaniya **o'z belgilagan vaqtida** avtomatik sync bo'ladi:

```
23:50 → Kompaniya A sync boshlandi
22:00 → Kompaniya B sync boshlandi
20:00 → Kompaniya C sync boshladi
```

## 📊 API Orqali Settings O'zgartirish

### GET /settings
```bash
GET http://localhost:3000/settings
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "org-123",
  "analyticsStatus": true,
  "scoringMode": "TEN",
  "language": "uz",
  "sipuniApiUrl": "https://sipuni.com/api",
  "sipuniApiKey": "***",
  "sipuniUserId": "***",
  "syncSchedule": "50 23 * * *",
  "autoSyncOnStartup": true
}
```

### PATCH /settings
```bash
PATCH http://localhost:3000/settings
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "syncSchedule": "0 22 * * *",
  "autoSyncOnStartup": true
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "syncSchedule": "0 22 * * *",
  "note": "Cron job will be updated after application restart"
}
```

⚠️ **Muhim:** Sync vaqtini o'zgartirganingizdan keyin dasturni qayta ishga tushirish kerak!

## 🎯 Foydalanish Misollar

### Misol 1: Kompaniya 22:00 da sync qilmoqchi

1. **Settings'ni yangilash:**
```bash
PATCH /settings
{
  "syncSchedule": "0 22 * * *"
}
```

2. **Dasturni qayta ishga tushirish:**
```bash
npm run start:dev
```

3. **Natija:**
```
[STARTUP] Setup dynamic job for My Company: 0 22 * * *
```

Endi har kuni 22:00 da avtomatik sync boshlanadi! ✅

### Misol 2: Startup sync'ni o'chirish

Agar siz dastur ishga tushganda oyning boshidan sync qilishni xohlamasangiz:

```bash
PATCH /settings
{
  "autoSyncOnStartup": false
}
```

Dasturni qayta ishga tushiring:
```bash
npm run start:dev
```

Natija:
```
[STARTUP] Auto-sync disabled for My Company, skipping...
```

### Misol 3: Har 4 soatda sync qilish

```bash
PATCH /settings
{
  "syncSchedule": "0 */4 * * *"
}
```

Dasturni qayta ishga tushiring. Endi har 4 soatda sync bo'ladi:
- 00:00
- 04:00
- 08:00
- 12:00
- 16:00
- 20:00

## 📜 Log'larni Ko'rish

Dastur ishlayotganda quyidagi log'lar ko'rinadi:

### Startup Log'lari:
```
[STARTUP] Initializing Sipuni auto-sync...
[STARTUP] Found 3 active organizations
[STARTUP] Setup dynamic job for Default Organization: 50 23 * * *
[STARTUP] Auto-sync enabled for Default Organization, syncing from month start...
[STARTUP] Syncing from 01.12.2024 to 15.12.2024 for org default-org-id
[STARTUP] Sync completed for org default-org-id: Processed: 120, Skipped: 5, Failed: 0
[STARTUP] Sipuni auto-sync initialization completed
```

### Kundalik Sync Log'lari:
```
[CRON] Running scheduled sync for My Company (0 22 * * *)
[SYNC] Starting Sipuni sync for org org-123 with limit 500...
[SYNC] Processed 45/50 records
[SYNC] Processed: 45, Skipped: 3, Failed: 2
```

## ⚙️ Database Sozlamalari

Settings jadvalida yangi qo'shilgan fieldlar:

```sql
ALTER TABLE settings
ADD COLUMN "syncSchedule" VARCHAR(50) DEFAULT '50 23 * * *';

ALTER TABLE settings
ADD COLUMN "autoSyncOnStartup" BOOLEAN DEFAULT true;
```

Mavjud barcha kompaniyalar uchun default qiymatlar:
- `syncSchedule`: `"50 23 * * *"` (23:50 da)
- `autoSyncOnStartup`: `true`

## 🔒 Xavfsizlik

✅ Har bir kompaniya faqat **o'z** Settings'ini ko'radi va o'zgartiradi
✅ ADMIN roli kerak Settings'ni o'zgartirish uchun
✅ Har bir kompaniya **mustaqil** sync qilinadi
✅ Bitta kompaniyada xato bo'lsa, boshqalariga ta'sir qilmaydi

## 🚀 Keyingi Qadamlar

1. **Dasturni ishga tushiring:**
   ```bash
   npm run start:dev
   ```

2. **Startup log'larini tekshiring:**
   - Necha kompaniya topildi?
   - Har biri uchun cron job yaratildimi?
   - Startup sync bajarildimi?

3. **Settings'ni sozlang:**
   ```bash
   PATCH /settings
   {
     "syncSchedule": "0 22 * * *"
   }
   ```

4. **Dasturni qayta ishga tushiring:**
   ```bash
   # Ctrl+C
   npm run start:dev
   ```

5. **Yangi cron job tekshiring:**
   ```
   [CRON] Setup dynamic job for My Company: 0 22 * * *
   ```

## ❓ FAQ

### Q: Sync vaqtini o'zgartirsam nima bo'ladi?
A: Settings'ni yangilaganingizdan keyin dasturni qayta ishga tushiring. Yangi vaqt qo'llaniladi.

### Q: Bir necha kompaniya bir xil vaqtda sync qilsa?
A: Muammo yo'q! Har bir kompaniya alohida process qilinadi.

### Q: Startup sync juda uzoq davom etsa?
A: `autoSyncOnStartup: false` qiling. Faqat kundalik sync bo'ladi.

### Q: Sync paytida xato bo'lsa?
A: Xato log'ga yoziladi va keyingi sync davom etadi. Bitta xato boshqalariga ta'sir qilmaydi.

### Q: Qaysi vaqtda sync qilish yaxshi?
A: Ish soatlari tashqarisida (masalan, 22:00-23:59) tavsiya etiladi.

---

**Muvaffaqiyatli sinxronizatsiya tilaymiz! 🎉**
