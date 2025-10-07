# 🏢 Yangi Kompaniya Qo'shish Bo'yicha Qo'llanma

Bu qo'llanma multi-tenancy tizimiga yangi kompaniya qo'shish jarayonini tushuntiradi.

## 📋 Mavjud Usullar

### Usul 1: API orqali (Tavsiya etiladi) ✅

SUPERADMIN sifatida login qiling va quyidagi endpoint'dan foydalaning:

#### 1. SUPERADMIN bilan login qiling

```bash
POST http://localhost:3000/auth/login

Body:
{
  "phone": "+998900000000",
  "password": "superadmin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

#### 2. Yangi kompaniya yarating

```bash
POST http://localhost:3000/organizations
Authorization: Bearer {access_token}

Body:
{
  "name": "My Company",
  "slug": "my-company",
  "description": "Company description",
  "branchName": "Main Office",
  "branchAddress": "Tashkent, Uzbekistan",
  "departmentName": "Sales Department",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminPhone": "+998901234567",
  "adminExtCode": "100",
  "adminPassword": "admin123"
}

Response:
{
  "message": "Organization created successfully",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "My Company",
      "slug": "my-company",
      ...
    },
    "branch": { ... },
    "department": { ... },
    "adminUser": { ... }
  }
}
```

#### 3. Boshqa SUPERADMIN API'lar

**Barcha kompaniyalarni ko'rish:**
```bash
GET http://localhost:3000/organizations
Authorization: Bearer {access_token}
```

**Bitta kompaniyani ko'rish:**
```bash
GET http://localhost:3000/organizations/{id}
Authorization: Bearer {access_token}
```

**Kompaniya holatini o'zgartirish:**
```bash
PATCH http://localhost:3000/organizations/{id}/status
Authorization: Bearer {access_token}

Body:
{
  "isActive": false
}
```

---

### Usul 2: Console Script orqali

Terminal ochib quyidagi buyruqni bajaring:

```bash
cd navai-analytics-backend
node create-organization.js
```

Script sizdan quyidagi ma'lumotlarni so'raydi:

```
🏢 Yangi Kompaniya Yaratish
==================================================

1️⃣  Kompaniya ma'lumotlarini kiriting:

Kompaniya nomi: My Company
Slug (URL uchun, masalan: company-name): my-company
Tavsif (ixtiyoriy): My company description

2️⃣  Filial ma'lumotlarini kiriting:

Filial nomi: Main Branch
Manzil: Tashkent, Uzbekistan

3️⃣  Bo'lim ma'lumotlarini kiriting:

Bo'lim nomi: Sales Department

4️⃣  Admin foydalanuvchi ma'lumotlarini kiriting:

Ism: John
Familiya: Doe
Telefon raqam (+998XXXXXXXXX): +998901234567
Ichki raqam (ext code): 100
Parol: admin123

🔄 Kompaniya yaratilmoqda...
```

---

## 📊 Avtomatik Yaratiluvchi Ma'lumotlar

Har bir yangi kompaniya uchun avtomatik yaratiladi:

### 1. Standart Sozlamalar (Settings)
```javascript
{
  analyticsStatus: true,
  scoringMode: 'TEN',
  excludeSeconds: 0,
  language: 'uz'
}
```

### 2. Standart Baholash Mezonlari (5 ta)
- ✅ Приветствие (og'irligi: 1)
- ✅ Выявление потребностей (og'irligi: 2)
- ✅ Презентация продукта/услуги (og'irligi: 2)
- ✅ Работа с возражениями (og'irligi: 2)
- ✅ Завершение разговора (og'irligi: 1)

### 3. Tuzilma
- ✅ 1 ta filial (branch)
- ✅ 1 ta bo'lim (department)
- ✅ 1 ta ADMIN foydalanuvchi

---

## 🔐 Foydalanuvchi Rollari

### SUPERADMIN 👑
- **Imkoniyatlari:**
  - Yangi kompaniya yaratish
  - Barcha kompaniyalarni ko'rish
  - Kompaniyalarni faollashtirish/o'chirish
- **Login:**
  - Phone: `+998900000000`
  - Password: `superadmin123`

### ADMIN (Har bir kompaniya uchun)
- **Imkoniyatlari:**
  - Faqat o'z kompaniyasi ma'lumotlarini ko'rish
  - O'z kompaniyasida user, branch, criteria boshqarish
  - Qo'ng'iroqlarni ko'rish va boshqarish
- **Login:**
  - Kompaniya yaratilganda belgilangan telefon va parol

### MANAGER
- Qo'ng'iroqlarni ko'rish
- Hisobotlarni ko'rish

### EMPLOYEE
- Faqat o'z qo'ng'iroqlarini ko'rish

---

## 🔒 Ma'lumotlar Izolyatsiyasi

### Avtomatik Filtrlash

Har bir so'rovda avtomatik ravishda organizationId bo'yicha filtrlash amalga oshiriladi:

```typescript
// User login qilganda
JWT Token = {
  sub: "user-id",
  phone: "+998901234567",
  role: "ADMIN",
  organizationId: "company-123"  // ← Bu qo'shiladi
}

// Qo'ng'iroqlarni olish
GET /calls
↓
WHERE organizationId = "company-123"  // ← Avtomatik qo'shiladi
```

### Ma'lumotlar Ajralgan

```
📦 Company A:
   - 10 users
   - 500 calls
   - 5 criteria
   ❌ Company B ma'lumotlarini KO'RA OLMAYDI

📦 Company B:
   - 8 users
   - 300 calls
   - 3 criteria
   ❌ Company A ma'lumotlarini KO'RA OLMAYDI

👑 SUPERADMIN:
   ✅ Barchasini ko'ra oladi
```

---

## 🧪 Test Qilish

### 1. Mavjud Kompaniyalarni Ko'rish

```bash
node simple-test.js
```

Output:
```
🧪 Testing Multi-Tenancy Data Isolation...

Found 3 organizations:

📦 Default Organization (default)
   Users: 12
   Calls: 78

📦 Company B (company-b)
   Users: 1
   Calls: 0

📦 My Company (my-company)
   Users: 1
   Calls: 0
```

### 2. Login Test

```bash
# Company A admin
POST /auth/login
{ "phone": "+998901234567", "password": "admin123" }

# Company B admin
POST /auth/login
{ "phone": "+998901111111", "password": "admin123" }
```

### 3. Ma'lumotlar Izolyatsiyasi Test

Company A admin sifatida:
```bash
GET /calls
# ← Faqat Company A qo'ng'iroqlari qaytadi

GET /users
# ← Faqat Company A userlari qaytadi
```

---

## ⚠️ Muhim Eslatmalar

1. **Slug Unique Bo'lishi Kerak**
   - Har bir kompaniyaning slug'i noyob bo'lishi shart
   - Masalan: `company-a`, `company-b`, `tech-corp`

2. **Telefon Raqam Unique**
   - Bir telefon raqam faqat bitta foydalanuvchiga tegishli
   - Turli kompaniyalarda ham takrorlanmasligi kerak

3. **SUPERADMIN Xavfsizligi**
   - SUPERADMIN parolini o'zgartiring!
   - Production muhitda maxfiy saqlang

4. **Database Backup**
   - Yangi kompaniya qo'shishdan oldin backup oling

---

## 🚀 Keyingi Qadamlar

1. **SUPERADMIN yaratish:**
   ```bash
   node create-superadmin.js
   ```

2. **Serverni ishga tushirish:**
   ```bash
   npm run start:dev
   ```

3. **Yangi kompaniya qo'shish:**
   - API orqali yoki
   - Console script orqali

4. **Test qilish:**
   - Har ikkala account bilan login qiling
   - Ma'lumotlar ajralganligini tekshiring

---

## 📞 Yordamga Muhtojmisiz?

Qo'shimcha savol yoki muammolar bo'lsa:
1. `simple-test.js` ni ishga tushiring
2. Database'ni tekshiring
3. Log fayllarni ko'ring

**Muvaffaqiyat tilaymiz! 🎉**
