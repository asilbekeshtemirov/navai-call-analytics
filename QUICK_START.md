# 🚀 NAVAI ANALYTICS - TEZKOR BOSHLASH

## ⚡ 1. YANGI ORGANIZATSIYA YARATISH (Bir so'rovda!)

Bitta API so'rov orqali yangi kompaniya, filial, bo'lim, admin va sozlamalarni yaratish:

```bash
POST /api/organizations
Authorization: Bearer <SUPERADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Yangi Kompaniya",
  "slug": "yangi-kompaniya",
  "description": "Call center analytics uchun",

  "branchName": "Asosiy filial",
  "branchAddress": "Navoi shahar, Uzbekistan",

  "departmentName": "Call Center",

  "adminFirstName": "Admin",
  "adminLastName": "Adminov",
  "adminPhone": "+998901234567",
  "adminExtCode": "100",
  "adminPassword": "SecurePassword123!"
}
```

### ✅ Natija:
```json
{
  "message": "Organization created successfully",
  "data": {
    "organization": {
      "id": 2,
      "name": "Yangi Kompaniya",
      "slug": "yangi-kompaniya",
      "isActive": true
    },
    "branch": {
      "id": "uuid-branch",
      "name": "Asosiy filial"
    },
    "department": {
      "id": "uuid-dept",
      "name": "Call Center"
    },
    "adminUser": {
      "id": "uuid-admin",
      "firstName": "Admin",
      "phone": "+998901234567",
      "role": "ADMIN"
    }
  }
}
```

### 🎯 Avtomatik yaratiladi:
- ✅ Organizatsiya
- ✅ Filial (Branch)
- ✅ Bo'lim (Department)
- ✅ Admin foydalanuvchi
- ✅ Default sozlamalar (Settings)
- ✅ 5 ta default baholash mezonlari (Criteria)

---

## 👤 2. ADMIN SIFATIDA LOGIN

```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "SecurePassword123!"
}
```

### ✅ Token olish

Keyin barcha so'rovlarda:
```bash
Authorization: Bearer <TOKEN>
```

---

## ⚙️ 3. SIPUNI SOZLAMALARI

```bash
PATCH /api/settings
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "sipuniApiUrl": "https://mutolaaxona.sip.uz/crmapi/v1",
  "sipuniApiKey": "your-api-key",
  "sipuniUserId": "199717",
  "dataSource": "SIPUNI",
  "syncSchedule": "0 23 * * *",
  "autoSyncOnStartup": true
}
```

---

## 👥 4. ISHCHILAR QO'SHISH

```bash
POST /api/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "firstName": "Alisher",
  "lastName": "Navoiy",
  "phone": "+998901234501",
  "extCode": "201",
  "password": "password123",
  "role": "EMPLOYEE",
  "branchId": "uuid-branch",
  "departmentId": "uuid-dept"
}
```

---

## 🔄 5. SYNC QILISH

```bash
POST /api/sipuni/sync-and-process?from=01.10.2025&to=07.10.2025&limit=1000
Authorization: Bearer <ADMIN_TOKEN>
```

---

## 📊 6. STATISTIKA

```bash
GET /api/statistics?type=all&dateFrom=2025-10-01&dateTo=2025-10-07
Authorization: Bearer <TOKEN>
```

---

## 🎯 XULOSA

1. ✅ Bitta API → Organizatsiya yaratish
2. ✅ Login → Token olish
3. ✅ Sipuni sozlash
4. ✅ Userlar qo'shish
5. ✅ Sync qilish
6. ✅ Statistika ko'rish

**To'liq dokumentatsiya:** `API_GUIDE.md`
