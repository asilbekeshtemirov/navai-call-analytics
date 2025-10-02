# 🚀 BOSHLASH - Navai Analytics Backend

## ⚠️ MUHIM: Xatolarni Hal Qilish

Hozirda TypeScript xatolari ko'rsatilmoqda. Bularni hal qilish uchun **faqat bitta buyruq** kerak:

```bash
npx prisma generate
```

Bu buyruq Prisma Client'ni regenerate qiladi va **barcha TypeScript xatolari yo'qoladi**.

---

## 📋 To'liq Ishga Tushirish Qo'llanmasi

### 1️⃣ Docker'da PostgreSQL ishga tushirish

```bash
docker-compose up -d
```

Natija:
- ✅ PostgreSQL: `localhost:5432`
- ✅ pgAdmin: http://localhost:5050

### 2️⃣ Paketlarni o'rnatish

```bash
npm install
```

### 3️⃣ Prisma Client generatsiya (XATOLARNI HAL QILADI!)

```bash
npx prisma generate
```

**Bu eng muhim qadam!** Bu buyruq:
- ✅ Prisma Client'ni yaratadi
- ✅ TypeScript type'larini generatsiya qiladi
- ✅ Barcha import xatolarini hal qiladi
- ✅ `sipId` va boshqa field'lar uchun type'lar yaratadi

### 4️⃣ Ma'lumotlar bazasi migratsiyasi

```bash
npx prisma migrate dev --name init
```

Migration nomi so'ralganda `init` yoki `initial` deb yozing.

### 5️⃣ Boshlang'ich ma'lumotlarni yuklash

```bash
npm run db:seed
```

Bu yaratadi:
- 👤 Admin: `+998901234567` / `admin123`
- 👤 Employee: `+998901234568` / `employee123`
- 👤 Manager: `+998901234569` / `manager123`
- 🏢 Filial va Bo'lim
- 📋 Kriteriyalar
- ⚙️ Sozlamalar

### 6️⃣ Serverni ishga tushirish

```bash
npm run start:dev
```

Server ishga tushdi! 🎉

---

## 🎯 Tezkor Variant (Avtomatik)

### Windows:
```bash
fix-errors.bat
```

### Linux/Mac:
```bash
chmod +x fix-errors.sh
./fix-errors.sh
```

Bu skriptlar avtomatik ravishda barcha qadamlarni bajaradi.

---

## 🌐 Muhim URL'lar

| Xizmat | URL | Tavsif |
|--------|-----|--------|
| **API Server** | http://localhost:3000 | Backend API |
| **Swagger Docs** | http://localhost:3000/api/docs | Interaktiv API hujjatlari |
| **Prisma Studio** | `npm run prisma:studio` | Database GUI |
| **pgAdmin** | http://localhost:5050 | PostgreSQL admin panel |

---

## 🧪 API'ni Sinab Ko'rish

### 1. Swagger UI orqali (Eng oson):

1. http://localhost:3000/api/docs ga o'ting
2. `/auth/login` ni oching
3. "Try it out" tugmasini bosing
4. Quyidagi ma'lumotlarni kiriting:
   ```json
   {
     "phone": "+998901234567",
     "password": "admin123"
   }
   ```
5. "Execute" tugmasini bosing
6. Token'ni nusxalang
7. Yuqoridagi "Authorize" tugmasini bosing
8. Token'ni joylashtiring
9. Barcha endpoint'larni sinab ko'ring!

### 2. cURL orqali:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+998901234567","password":"admin123"}'

# Token bilan foydalanish
curl http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 Xatolarni Tuzatish

### ❌ TypeScript xatolari ko'rsatilsa:

**Yechim:**
```bash
npx prisma generate
```

### ❌ "Cannot find module" xatolari:

**Yechim:**
```bash
npm install
npx prisma generate
```

### ❌ Ma'lumotlar bazasi ulanish xatosi:

**Tekshirish:**
```bash
docker ps
```

**Agar konteynerlar ishlamasa:**
```bash
docker-compose down
docker-compose up -d
```

### ❌ Port band (3000):

**.env faylida o'zgartiring:**
```env
PORT=3001
```

### ❌ Migration xatosi:

**Ma'lumotlar bazasini reset qilish:**
```bash
npx prisma migrate reset
npm run db:seed
```

---

## 📚 Qo'shimcha Hujjatlar

| Fayl | Tavsif |
|------|--------|
| `QUICK_START.md` | Tezkor boshlash qo'llanmasi |
| `SETUP.md` | Batafsil sozlash yo'riqnomasi |
| `API_ENDPOINTS.md` | Barcha API endpoint'lar ro'yxati |
| `PROJECT_SUMMARY.md` | Loyiha xulosasi va arxitektura |

---

## ✅ Tayyor!

Agar barcha qadamlarni to'g'ri bajarsangiz:

✅ Backend server ishlamoqda
✅ Ma'lumotlar bazasi to'ldirilgan
✅ API hujjatlari mavjud
✅ Test foydalanuvchilar yaratilgan
✅ Barcha endpoint'lar ishlaydi

**Endi frontend yaratishingiz yoki API'ni ishlatishingiz mumkin!**

---

## 🆘 Yordam Kerakmi?

1. Swagger UI'da API'larni ko'ring: http://localhost:3000/api/docs
2. Prisma Studio'da ma'lumotlarni ko'ring: `npm run prisma:studio`
3. Loglarni tekshiring: `npm run start:dev` (terminal'da)
4. Hujjatlarni o'qing: `API_ENDPOINTS.md`, `SETUP.md`

---

## 🎯 Keyingi Qadamlar

1. ✅ **Backend tayyor** - Siz shu yerdasiz!
2. 🔄 **Frontend yaratish** - React/Next.js
3. 🤖 **AI integratsiya** - OpenAI, AssemblyAI
4. 📞 **Sip.uz ulash** - Real qo'ng'iroqlar
5. 🚀 **Deploy** - Production server

**Omad! 🚀**
