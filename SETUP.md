# Navai Analytics Backend - Setup Guide

## 🚀 Tezkor Ishga Tushirish

### 1. Kerakli Paketlarni O'rnatish

```bash
npm install
```

### 2. Ma'lumotlar Bazasini Ishga Tushirish (Docker)

```bash
docker-compose up -d
```

Bu quyidagilarni ishga tushiradi:
- PostgreSQL (port 5432)
- pgAdmin (port 5050, http://localhost:5050)

### 3. Environment Faylini Sozlash

`.env` faylini yarating (yoki `.env.example`dan nusxa oling):

```env
DATABASE_URL="postgresql://navai:navai_password@localhost:5432/navai_analytics?schema=public"
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Prisma Client Generatsiya Qilish

```bash
npm run prisma:generate
```

**MUHIM**: Bu buyruq TypeScript xatolarni bartaraf etadi!

### 5. Ma'lumotlar Bazasi Migratsiyasi

```bash
npm run prisma:migrate
```

Migration nomi so'ralganda: `init` yoki `initial_setup` deb yozing.

### 6. Boshlang'ich Ma'lumotlarni Yuklash (Seed)

```bash
npm run db:seed
```

Bu quyidagilarni yaratadi:
- **Admin**: phone: `+998901234567`, password: `admin123`
- **Employee**: phone: `+998901234568`, password: `employee123`
- **Manager**: phone: `+998901234569`, password: `manager123`
- Filial, Bo'lim, Kriteriyalar va Sozlamalar

### 7. Serverni Ishga Tushirish

Development rejimida:
```bash
npm run start:dev
```

Production rejimida:
```bash
npm run build
npm run start:prod
```

## 📚 API Hujjatlari

Server ishga tushgandan keyin:
- Swagger UI: http://localhost:3000/api/docs
- API Base URL: http://localhost:3000

## 🔧 Asosiy Endpointlar

### Authentication
- `POST /auth/login` - Login (phone va password)

### Users
- `GET /users` - Barcha foydalanuvchilar
- `POST /users` - Yangi foydalanuvchi yaratish
- `GET /users/:id` - Foydalanuvchi ma'lumotlari
- `PATCH /users/:id` - Foydalanuvchini yangilash
- `DELETE /users/:id` - Foydalanuvchini o'chirish

### Branches & Departments
- `GET /branches` - Barcha filiallar
- `POST /branches` - Yangi filial yaratish
- `GET /departments` - Barcha bo'limlar
- `POST /departments` - Yangi bo'lim yaratish

### Calls
- `GET /calls` - Barcha qo'ng'iroqlar (filtrlar bilan)
- `GET /calls/:id` - Qo'ng'iroq tafsilotlari
- `GET /calls/:id/transcript` - Qo'ng'iroq transkripsiyasi
- `POST /calls/upload-from-url` - URL dan audio yuklash

### Dashboard
- `GET /dashboard/stats` - Umumiy statistika
- `GET /dashboard/calls-over-time` - Vaqt bo'yicha qo'ng'iroqlar
- `GET /dashboard/top-performers` - Eng yaxshi xodimlar
- `GET /dashboard/violations` - Xatolar statistikasi

### Reports
- `POST /reports/generate` - Hisobot yaratish

### Settings
- `GET /settings` - Tizim sozlamalari
- `PATCH /settings` - Sozlamalarni yangilash

### Criteria & Topics
- `GET /criteria` - Barcha kriteriyalar
- `POST /criteria` - Yangi kriteriya yaratish
- `GET /topics` - Barcha mavzular
- `POST /topics` - Yangi mavzu yaratish

## 🛠️ Foydali Buyruqlar

```bash
# Prisma Studio (DB GUI)
npm run prisma:studio

# Linting
npm run lint

# Testing
npm run test

# Format code
npm run format
```

## 🔍 Muammolarni Hal Qilish

### TypeScript xatolari ko'rsatilsa:

```bash
npm run prisma:generate
```

### Ma'lumotlar bazasi ulanish xatosi:

1. Docker konteynerlar ishlab turganini tekshiring:
```bash
docker ps
```

2. `.env` faylidagi `DATABASE_URL` to'g'riligini tekshiring

### Port band bo'lsa:

`.env` faylida `PORT` ni o'zgartiring yoki band portni bo'shatish:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📦 AI Integratsiyasi (Keyingi Bosqich)

AI xizmatlarini ulash uchun `.env` ga qo'shing:

```env
# OpenAI (Speech-to-Text va Analysis)
OPENAI_API_KEY=sk-...

# yoki AssemblyAI (Speech-to-Text)
ASSEMBLYAI_API_KEY=...
```

Keyin `src/ai/ai.service.ts` da placeholder kodlarni haqiqiy API chaqiruvlari bilan almashtiring.

## 🎯 Keyingi Qadamlar

1. ✅ Backend to'liq ishga tushdi
2. 🔄 Frontend yaratish (React/Next.js)
3. 🤖 AI xizmatlarini ulash (OpenAI, AssemblyAI)
4. 📞 Sip.uz API integratsiyasi
5. 📊 Real-time dashboard (WebSocket)
6. 🚀 Production deployment

## 📞 Yordam

Muammo yuzaga kelsa, quyidagi loglarni tekshiring:

```bash
# Application logs
npm run start:dev

# Database logs
docker logs navai-analytics-db

# Prisma Studio
npm run prisma:studio
```
