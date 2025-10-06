# Production Setup Guide - Haqiqiy Call Markazi Integratsiyasi

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/navai_analytics"

# Sipuni API (Haqiqiy ma'lumotlar)
SIPUNI_API_URL="https://sipuni.com/api"
SIPUNI_API_KEY="your-real-api-key"
SIPUNI_USER_ID="your-user-id"

# STT API (Navai)
STT_API_URL="https://ai.navai.pro/v1/asr/transcribe"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# JWT
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV=production
```

### 2. Database Setup
```bash
# 1. Prisma migratsiyalarini ishga tushirish
npx prisma migrate deploy

# 2. Database'ni tekshirish
npx prisma studio

# 3. Test userlar yaratish (agar kerak bo'lsa)
node create-test-users.js
```

### 3. Initial Sync - Oy Boshidan Bugungi Kungacha

```bash
# Server ishga tushirish (birinchi terminalda)
npm run start:dev

# Initial sync (ikkinchi terminalda)
node scripts/initial-sync-sipuni.js
```

Bu script:
- ✅ Joriy oyning 1-sanasidan bugungi kungacha barcha qo'ng'iroqlarni yuklab oladi
- ✅ Javob berilgan qo'ng'iroqlarni STT + AI bilan tahlil qiladi
- ✅ Javob berilmagan qo'ng'iroqlarni statistika uchun saqlaydi
- ✅ Audio fayllarni DONE statusdan keyin o'chiradi

### 4. Cron Job - Har Kuni Avtomatik

**Hozirgi sozlama:** Har kuni 23:50 da avtomatik ishga tushadi

Location: `src/sipuni/sipuni.service.ts:493`
```typescript
@Cron('50 23 * * *')
async dailySipuniSync() {
  await this.syncAndProcessRecordings(500);
}
```

### 5. Settings API - PBX/Sipuni Boshqarish

Frontend'dan sozlamalarni boshqarish uchun:

**GET** `/settings` - Hozirgi sozlamalarni olish
```json
{
  "dataSource": "SIPUNI",
  "sipuniApiUrl": "https://sipuni.com/api",
  "sipuniApiKey": "...",
  "sipuniUserId": "...",
  "language": "uz",
  "scoringMode": "TEN",
  "analyticsStatus": true
}
```

**PATCH** `/settings` - Sozlamalarni yangilash
```bash
curl -X PATCH http://localhost:3000/settings \
  -H "Content-Type: application/json" \
  -d '{
    "dataSource": "SIPUNI",
    "sipuniApiUrl": "https://sipuni.com/api",
    "sipuniApiKey": "new-key",
    "sipuniUserId": "new-user-id",
    "language": "uz"
  }'
```

### 6. API Endpoints

#### Sipuni
- `GET /sipuni/test-connection` - Sipuni API ni tekshirish
- `POST /sipuni/sync-and-process?limit=500` - Manual sync va tahlil

#### Company Statistics
- `GET /company/employees/performance?period=today` - Xodimlar performance
- `GET /company/calls/recent?limit=50` - So'nggi qo'ng'iroqlar
- `GET /company/statistics?type=ALL&dateFrom=2025-10-01&dateTo=2025-10-06` - To'liq statistika

#### Settings
- `GET /settings` - Sozlamalarni olish
- `PATCH /settings` - Sozlamalarni yangilash

### 7. Monitoring va Logging

**Real-time Logs:**
```bash
# Server loglarini kuzatish
npm run start:dev

# Faqat Sipuni loglarini ko'rish
npm run start:dev | grep -i sipuni
```

**Log Levels:**
- `[SYNC]` - Sync jarayoni
- `[DOWNLOAD]` - Audio yuklab olish
- `[STT]` - Speech-to-Text
- `[LLM]` - Gemini AI tahlil
- `[ERROR]` - Xatolar

### 8. Data Flow

```
1. Sipuni API → CSV ma'lumotlar
   ↓
2. Filter (barcha qo'ng'iroqlar)
   ↓
3. Database → Call record
   ↓
4. Agar audio bor bo'lsa:
   ├── Audio yuklab olish
   ├── STT (Navai) → Transkripsiya
   ├── Gemini AI → O'zbek tilida tahlil
   ├── Scores va Violations saqlash
   └── Audio o'chirish
   ↓
5. Status: DONE
```

### 9. Production Optimizations

**Hozirgi sozlamalar:**
- ✅ Batch processing: 2 soniya delay qo'ng'iroqlar orasida
- ✅ Rate limiting: STT va Gemini uchun built-in retry
- ✅ Audio cleanup: DONE statusdan keyin avtomatik
- ✅ Duplicate prevention: externalId unique constraint
- ✅ Error handling: Try-catch barcha jarayonlarda

**Tavsiya qilinadigan:**
- 📊 Monitoring dashboard (Grafana/Prometheus)
- 🔔 Alert system (Slack/Telegram)
- 📈 Performance metrics tracking
- 💾 Database backup strategy
- 🔄 Load balancing (agar high traffic bo'lsa)

### 10. Troubleshooting

**Muammo:** Qo'ng'iroqlar yuklanmayapti
```bash
# 1. Sipuni connectionni tekshirish
curl http://localhost:3000/sipuni/test-connection

# 2. Loglarni ko'rish
npm run start:dev

# 3. Database'ni tekshirish
node check-db.js
```

**Muammo:** STT 413 Error (file too large)
- Audio fayllar 10MB dan katta bo'lishi mumkin
- STT API konfiguratsiyasini tekshiring

**Muammo:** Gemini AI timeout
- Internet tezligini tekshiring
- Gemini API key aktivligini tasdiqlang

### 11. Security Checklist

- [ ] .env faylni .gitignore ga qo'shish
- [ ] Production API keylarni maxfiy saqlash
- [ ] JWT secret kuchli parol
- [ ] Database backup setup
- [ ] SSL/HTTPS sozlash
- [ ] Rate limiting qo'shish (agar public API bo'lsa)

### 12. Deployment Steps

```bash
# 1. Git repositoryga push
git add .
git commit -m "Production ready: Sipuni integration complete"
git push origin main

# 2. Production serverda
npm install
npx prisma migrate deploy
npm run build
npm run start:prod

# 3. Initial sync
node scripts/initial-sync-sipuni.js

# 4. Cron job tekshirish
# Cron avtomatik ishga tushadi (23:50 da)
```

### 13. Testing

```bash
# 1. Test connection
curl http://localhost:3000/sipuni/test-connection

# 2. Manual sync (1 call)
curl -X POST http://localhost:3000/sipuni/sync-and-process?limit=1

# 3. Check statistics
curl http://localhost:3000/company/statistics?type=ALL
```

---

## ✅ Production Ready!

Loyha haqiqiy call markazi bilan integratsiya uchun tayyor:
- ✅ Barcha qo'ng'iroqlar (javob berilgan va javob berilmagan)
- ✅ O'zbek tilida tahlil
- ✅ Avtomatik daily sync (23:50)
- ✅ Settings API orqali boshqarish
- ✅ To'liq statistika va monitoring
