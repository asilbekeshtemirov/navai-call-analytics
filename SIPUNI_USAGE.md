# Sipuni Integration - Qo'llanma

## Sistemaning ishlash tartibi

### 1. Sipuni API dan call recordlarni olish

Sipuni serviceda **date range filter** qo'shildi. Endi 1-7 oktabr oralig'idagi qo'ng'iroqlarni olish mumkin.

### 2. API endpoint

```http
POST http://localhost:3000/sipuni/sync-and-process?limit=1000&from=01.10.2025&to=07.10.2025
Authorization: Bearer <your_jwt_token>
```

**Parametrlar:**
- `limit`: Maksimal qo'ng'iroqlar soni (default: 500)
- `from`: Boshlanish sanasi (format: DD.MM.YYYY, masalan: 01.10.2025)
- `to`: Tugash sanasi (format: DD.MM.YYYY, masalan: 07.10.2025)

**Eslatma:** Bu endpoint faqat ADMIN rolidan foydalanuvchilar uchun mavjud.

### 3. Sistemaning ishlash jarayoni

#### 3.1. Sipuni API orqali qo'ng'iroqlar olinadi
- `/statistic/export/all` endpoint orqali barcha qo'ng'iroqlar olinadi
- Ma'lumotlar CSV formatida keladi (`;` delimiter)
- Har bir qo'ng'iroq uchun `recordId` mavjud bo'lsa, audio fayl yuklanadi

#### 3.2. Sana filtri qo'llaniladi
- Agar `from` va `to` parametrlari berilgan bo'lsa
- Qo'ng'iroqlar vaqti bo'yicha filterlanadi
- Faqat berilgan sana oralig'idagi qo'ng'iroqlar qayta ishlanadi

#### 3.3. Audio fayllar yuklab olinadi
- Agar `recordId` mavjud bo'lsa
- `/statistic/record` endpoint orqali `.mp3` formatida yuklab olinadi
- `./recordings/` papkaga saqlanadi

#### 3.4. Employee matching
- Qo'ng'iroqning `from` va `answered` maydonlari orqali xodim topiladi
- Agar xodim topilmasa, qo'ng'iroq o'tkazib yuboriladi (skipped)

#### 3.5. Database ga saqlanadi
- Call record yaratiladi
- Status: `UPLOADED` (agar audio bor) yoki `DONE` (agar audio yo'q)
- `organizationId`, `branchId`, `departmentId` bog'lanadi

#### 3.6. AI tahlil pipeline
1. **STT (Speech-to-Text)**: Audio fayldan transkriptsiya olinadi
   - Navai STT API ishlatiladi: `https://ai.navai.pro/v1/asr/transcribe`
   - Diarization: speaker detection (agent/customer)

2. **Gemini AI tahlil**: Transkripsiya tahlil qilinadi
   - Model: `gemini-2.5-flash`
   - Criteriyalar bo'yicha ball beriladi (0-10 yoki 0-100)
   - Xatolar va buzilishlar aniqlanadi

3. **Natijalar saqlanadi**:
   - Transcript segments
   - Call scores (har bir criteria uchun)
   - Violations (xatolar)
   - Overall analysis (JSON format)

4. **Audio fayl o'chiriladi**: Transkriptsiyadan keyin audio fayl avtomatik o'chiriladi

### 4. Muammolar va yechimlar

#### 4.1. Sipuni API credentials
`.env` faylda quyidagi sozlamalar kerak:
```env
SIPUNI_API_URL=https://sipuni.com/api
SIPUNI_API_KEY=your_api_key
SIPUNI_USER_ID=your_user_id
```

Yoki frontend orqali Settings da sozlanadi (har bir organization uchun alohida).

#### 4.2. STT service
Agar STT service ishlamasa:
- Audio fayllar yuklab olinadi
- Lekin tahlil qilinmaydi
- Status `UPLOADED` da qoladi

#### 4.3. Employee matching
Qo'ng'iroqlar `extCode` (extension code) orqali xodimga bog'lanadi:
- Outgoing calls: `from` field
- Incoming calls: `answered` field

Agar xodim topilmasa, qo'ng'iroq skipped bo'ladi.

### 5. Misol so'rov

**cURL:**
```bash
curl -X POST "http://localhost:3000/sipuni/sync-and-process?limit=1000&from=01.10.2025&to=07.10.2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Javob:**
```json
{
  "success": true,
  "message": "Processed: 85, Skipped: 10, Failed: 5",
  "recordsProcessed": 85
}
```

### 6. Avtomatik sync

Sistema startup paytida avtomatik sync qiladi:
- Har bir aktiv organization uchun
- Oy boshidan hozirgi kunga qadar
- Agar `autoSyncOnStartup: true` bo'lsa

Cron job orqali ham avtomatik sync mavjud:
- Har bir organization o'z scheduliga ega
- Default: `50 23 * * *` (23:50 har kuni)
- Settings da sozlanadi: `syncSchedule` field

### 7. Xulosa

Endi sizning sistema:
✅ 1-7 oktabr oralig'idagi qo'ng'iroqlarni oladi
✅ Audio fayllarni yuklab oladi
✅ Transkriptsiya qiladi (STT)
✅ Gemini AI bilan tahlil qiladi
✅ Natijalarni database ga saqlaydi
✅ Audio faylni o'chiradi

**Keyingi qadamlar:**
1. Backend serverni ishga tushiring: `npm run start:dev`
2. Database migratsiyalarini qo'llang: `npm run prisma:migrate`
3. Admin token oling (login endpoint orqali)
4. `/sipuni/sync-and-process` endpoint ga so'rov yuboring
5. Dashboard da natijalarni ko'ring
