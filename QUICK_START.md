# ⚡ Navai Analytics - Tezkor Ishga Tushirish

## 🎯 1-Qadam: Xatolarni Bartaraf Etish

TypeScript xatolarini hal qilish uchun quyidagi buyruqlarni ketma-ket bajaring:

```bash
# 1. Kerakli paketlarni o'rnatish
npm install

# 2. Prisma Client generatsiya qilish (MUHIM!)
npx prisma generate
```

**Bu buyruq barcha TypeScript xatolarini hal qiladi!**

## 🎯 2-Qadam: Ma'lumotlar Bazasini Sozlash

### Docker bilan (Tavsiya etiladi):

```bash
# PostgreSQL va pgAdmin ishga tushirish
docker-compose up -d

# Tekshirish
docker ps
```

### Yoki mahalliy PostgreSQL:

`.env` faylida `DATABASE_URL` ni o'zgartiring.

## 🎯 3-Qadam: Ma'lumotlar Bazasi Migratsiyasi

```bash
# Migration yaratish va bajarish
npx prisma migrate dev --name init

# Yoki
npm run prisma:migrate
```

Migration nomi so'ralganda: `init` deb yozing va Enter bosing.

## 🎯 4-Qadam: Boshlang'ich Ma'lumotlarni Yuklash

```bash
npm run db:seed
```

Bu quyidagilarni yaratadi:
- ✅ Admin: `+998901234567` / `admin123`
- ✅ Employee: `+998901234568` / `employee123`
- ✅ Manager: `+998901234569` / `manager123`
- ✅ Filial, Bo'lim, Kriteriyalar

## 🎯 5-Qadam: Serverni Ishga Tushirish

```bash
npm run start:dev
```

Server muvaffaqiyatli ishga tushdi! 🎉

## 📍 Muhim URL'lar

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (email: `admin@navai.uz`, password: `admin`)
- **Prisma Studio**: `npm run prisma:studio` → http://localhost:5555

## 🧪 Tezkor Test

### 1. Login qilish:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "password": "admin123"
  }'
```

### 2. Token olish va foydalanish:

```bash
# Token'ni olish
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Foydalanuvchilarni ko'rish
curl http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Swagger UI orqali test:

1. http://localhost:3000/api/docs ga o'ting
2. `/auth/login` endpointini oching
3. "Try it out" tugmasini bosing
4. Phone va password kiriting
5. Token'ni nusxalang
6. Yuqoridagi "Authorize" tugmasini bosing
7. Token'ni joylashtiring
8. Barcha endpointlarni sinab ko'ring!

## 🔧 Muammolarni Hal Qilish

### ❌ TypeScript xatolari:
```bash
npx prisma generate
```

### ❌ "Cannot find module" xatolari:
```bash
npm install
npx prisma generate
```

### ❌ Ma'lumotlar bazasi ulanish xatosi:
```bash
# Docker konteynerlarni tekshirish
docker ps

# Agar ishlamasa, qayta ishga tushirish
docker-compose down
docker-compose up -d
```

### ❌ Port band:
```bash
# .env faylida PORT ni o'zgartiring
PORT=3001
```

### ❌ Migration xatosi:
```bash
# Ma'lumotlar bazasini tozalash va qayta yaratish
npx prisma migrate reset
npm run db:seed
```

## 📊 Keyingi Qadamlar

1. ✅ Backend ishga tushdi
2. 🔄 Swagger UI da API'larni sinab ko'ring
3. 🤖 AI integratsiyasini qo'shing (`src/ai/ai.service.ts`)
4. 📞 Sip.uz API'ni ulang (`src/sip/sip.service.ts`)
5. 🎨 Frontend yarating
6. 🚀 Production'ga deploy qiling

## 💡 Foydali Maslahatlar

### Prisma Studio (DB GUI):
```bash
npm run prisma:studio
```

### Real-time logs:
```bash
npm run start:dev
```

### Database backup:
```bash
docker exec navai-analytics-db pg_dump -U navai navai_analytics > backup.sql
```

### Database restore:
```bash
docker exec -i navai-analytics-db psql -U navai navai_analytics < backup.sql
```

## 📚 Qo'shimcha Hujjatlar

- **API Endpoints**: `API_ENDPOINTS.md`
- **To'liq Setup**: `SETUP.md`
- **README**: `README.md`

## 🎉 Tayyor!

Endi siz to'liq ishlaydigan backend'ga egasiz:

✅ Authentication (JWT)
✅ User Management (CRUD)
✅ Branches & Departments
✅ Calls Management
✅ AI Processing (placeholder)
✅ Dashboard Statistics
✅ Reports Generation
✅ Settings Management
✅ Criteria & Topics
✅ Swagger Documentation
✅ Database Seeding
✅ Docker Support

**Omad tilaymiz! 🚀**
