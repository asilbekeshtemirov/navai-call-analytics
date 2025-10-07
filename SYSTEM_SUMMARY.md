# 🎯 NAVAI ANALYTICS - TIZIM XULOSASI

## ⚡ ASOSIY TUSHUNCHA

```
SUPERADMIN
    └── Organizatsiya yaratadi (bitta API so'rov)
        └── ADMIN avtomatik yaratiladi
            └── ADMIN userlarni frontendda qo'shadi
                ├── MANAGER (statistika ko'radi)
                └── EMPLOYEE (o'z qo'ng'iroqlari)
```

---

## 🔐 ROLE TIZIMI

| Role | Kim? | Nima qiladi? |
|------|------|--------------|
| **SUPERADMIN** | Platforma boshlig'i | Organizatsiya yaratadi |
| **ADMIN** | Organizatsiya boshlig'i | Userlar, sozlamalar, sync |
| **MANAGER** | Bo'lim boshlig'i | Statistika ko'radi |
| **EMPLOYEE** | Ishchi | O'z qo'ng'iroqlari |

---

## 📝 JARAYON

### 1. SUPERADMIN → Organizatsiya yaratadi
```bash
POST /api/organizations
{
  "name": "Yangi Kompaniya",
  "branchName": "Asosiy filial",
  "adminPhone": "+998901234567",
  "adminPassword": "password123"
}
```
✅ Organizatsiya + Branch + Department + ADMIN yaratiladi

### 2. ADMIN → Login qiladi
```bash
POST /api/auth/login
```
✅ Token oladi

### 3. ADMIN → Sipuni sozlaydi
```bash
PATCH /api/settings
```
✅ API credentials

### 4. ADMIN → Userlarni qo'shadi (Frontend)
```bash
POST /api/users
```
✅ MANAGER va EMPLOYEE lar

### 5. ADMIN → Sync qiladi
```bash
POST /api/sipuni/sync-and-process
```
✅ Qo'ng'iroqlar yuklanadi va tahlil qilinadi

### 6. Statistika
```bash
GET /api/statistics
```
✅ Natijalarni ko'rish

---

## 🎨 FRONTEND INTEGRATSIYASI

### User qo'shish formi:
```typescript
// ADMIN faqat ko'radi
if (user.role === 'ADMIN') {
  return (
    <form onSubmit={createUser}>
      <input name="firstName" />
      <input name="lastName" />
      <input name="phone" />
      <input name="extCode" />
      <select name="role">
        <option value="MANAGER">Manager</option>
        <option value="EMPLOYEE">Employee</option>
      </select>
      <button>Qo'shish</button>
    </form>
  );
}
```

---

## ⚙️ ARXITEKTURA

### Database (o'zgarmadi):
- ✅ Multi-tenancy
- ✅ Mavjud struktura
- ✅ Hech qanday migration kerak emas

### API:
- ✅ RESTful
- ✅ Role-based access
- ✅ JWT authentication
- ✅ Swagger docs

### Performance:
- ⚡ 10ms delay
- 🚀 Parallel AI processing
- 📊 1000 qo'ng'iroq ≈ 1-2 minut

---

## 📚 DOKUMENTATSIYA

1. **ROLES_GUIDE.md** - Role tizimi
2. **QUICK_START.md** - Tezkor boshlash
3. **API_GUIDE.md** - To'liq API
4. **SIPUNI_USAGE.md** - Sipuni jarayoni

---

## ✅ TAYYOR!

- 🎯 SUPERADMIN → Organizatsiya yaratadi
- 👤 ADMIN → Userlarni frontendda qo'shadi
- 📊 MANAGER → Statistika ko'radi
- 👨‍💼 EMPLOYEE → O'z qo'ng'iroqlari

**Backend:** http://localhost:3000/api
**Prisma Studio:** http://localhost:5555
