# Sipuni Full Integration Guide

## Overview

Sipuni integratsiyasi to'liq implementatsiya qilindi va quyidagi xususiyatlarga ega:

### ✅ Implemented Features

1. **Avtomatik Yozuvlarni Yuklab Olish**
   - `/statistic/export/all` API orqali barcha qo'ng'iroqlarni olish
   - Faqat javob berilgan qo'ng'iroqlar (answered calls) yuklanadi
   - Faqat yozuvi mavjud qo'ng'iroqlar (recordId) yuklanadi

2. **Duplikatsiyani Oldini Olish**
   - Database da mavjud qo'ng'iroqlarni `externalId` orqali tekshirish
   - Avvaldan yuklab olingan qo'ng'iroqlarni qayta yuklamaslik

3. **Database Integration**
   - Har bir qo'ng'iroq uchun `Call` record yaratiladi
   - Status: `UPLOADED` → `PROCESSING` → `DONE`
   - Employee `extCode` orqali topiladi

4. **AI Pipeline Integration**
   - STT (Speech-to-Text) orqali transkript yaratiladi
   - LLM (Gemini) orqali qo'ng'iroq tahlil qilinadi
   - Criteriyalar bo'yicha ball beriladi
   - Violations (xatolar) aniqlanadi

5. **Audio File Management**
   - Qo'ng'iroq yuklab olingandan keyin `recordings/` papkasiga saqlanadi
   - Status `DONE` bo'lgandan keyin avtomatik o'chiriladi

6. **Scheduled Jobs**
   - Har kecha yarim tunda avtomatik sync ishlaydi
   - `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`

## API Endpoints

### 1. Manual Sync and Process

**POST** `/api/sipuni/sync-and-process?limit=100`

Bu endpoint:
- Sipuni dan yozuvlarni oladi
- Database ga yozadi
- STT orqali transkript qiladi
- LLM orqali tahlil qiladi
- Audio faylni o'chiradi (status `DONE` bo'lganda)

**Query Parameters:**
- `limit` (optional): Nechta record olish (default: 500)

**Response:**
```json
{
  "success": true,
  "message": "Processed: 10, Skipped: 5, Failed: 0",
  "recordsProcessed": 10
}
```

### 2. Test Connection

**GET** `/api/sipuni/test-connection`

Sipuni API konfiguratsiyasini tekshirish.

## How It Works

### End-to-End Flow:

```
1. Sipuni API
   ↓ fetchAllRecords()
2. Filter answered calls with recordings
   ↓
3. Check if call exists in DB
   ↓ (if not exists)
4. Download recording (.mp3)
   ↓
5. Create Call record (status: UPLOADED)
   ↓
6. AI Pipeline - processCall()
   ├─ STT: Transcribe audio → segments
   ├─ Save segments to DB
   ├─ Delete audio file (after transcription)
   ├─ LLM: Analyze transcript
   ├─ Save scores & violations
   └─ Update status: DONE
   ↓
7. Audio file deleted (if still exists)
```

### Database Schema

**Call Table:**
- `externalId`: Sipuni recordId (unique)
- `employeeId`: User ID (found by extCode)
- `fileUrl`: Path to audio file
- `status`: UPLOADED → PROCESSING → DONE
- `callerNumber`: From
- `calleeNumber`: To
- `callDate`: Parsed from Sipuni time
- `durationSec`: Talk duration
- `transcription`: Full text transcript
- `analysis`: JSON with LLM results

## Environment Variables

```env
SIPUNI_API_URL=https://sipuni.com/api
SIPUNI_API_KEY=0.tdtbjy193bm
SIPUNI_USER_ID=064629

STT_API_URL=https://ai.navai.pro/v1/asr/transcribe
GEMINI_API_KEY=your_gemini_api_key
```

## Testing

### Manual Test:

1. **Start server:**
   ```bash
   npm run start:dev
   ```

2. **Trigger sync:**
   ```bash
   curl -X POST "http://localhost:3000/api/sipuni/sync-and-process?limit=5"
   ```

3. **Check logs:**
   - Watch for `[SYNC]`, `[DOWNLOAD]`, `[STT]`, `[LLM]` prefixes
   - Verify calls created in database
   - Check `recordings/` directory (should be empty after processing)

4. **Verify in database:**
   ```sql
   SELECT id, externalId, status, callDate, durationSec FROM "Call" ORDER BY createdAt DESC LIMIT 10;
   SELECT * FROM "CallScore" WHERE callId = '<call_id>';
   SELECT * FROM "Violation" WHERE callId = '<call_id>';
   ```

## Scheduled Sync

Avtomatik sync har kecha yarim tunda ishlaydi:
- Oxirgi 500 ta qo'ng'iroq tekshiriladi
- Faqat yangi qo'ng'iroqlar yuklanadi
- Barcha qo'ng'iroqlar AI pipeline orqali o'tadi

## Error Handling

- Agar employee topilmasa: Skip (log warning)
- Agar 404 xato: Skip (yozuv mavjud emas)
- Agar 429 xato: Retry 2 marta (2s delay)
- Agar STT xato: Status = UPLOADED (qayta urinish mumkin)
- Agar LLM xato: Status = ERROR
- Har qanday xatoda audio fayl o'chiriladi

## Performance

- **Parallel downloads**: 5 ta bir vaqtda (script/download-all-sipuni.js)
- **Sequential processing**: Bitta-bitta (AI pipeline overhead)
- **Delays**: 2s between calls (API rate limiting)
- **Estimated time**: ~10 calls/minute

## Future Improvements

- [ ] Parallel AI processing (with queue)
- [ ] Webhook integration (real-time sync)
- [ ] Retry mechanism for failed calls
- [ ] Progress tracking UI
- [ ] Audio file compression before STT
