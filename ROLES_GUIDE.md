# 🔐 ROLES VA PERMISSIONS

## 👥 ROLE TIZIMI

```
SUPERADMIN (Platforma administratori)
    └── Organizatsiyalar yaratadi

    ADMIN (Organizatsiya administratori)
        └── Userlarni boshqaradi (CRUD)
            ├── MANAGER (Menejer)
            │   └── Statistika ko'radi
            │
            └── EMPLOYEE (Ishchi)
                └── O'z ma'lumotlarini ko'radi
```

---

## 1️⃣ SUPERADMIN

### Kim?
- Platformaning asosiy administratori
- Barcha organizatsiyalarni ko'radi va boshqaradi

### Huquqlari:
✅ Organizatsiya yaratish/ko'rish
✅ Organizatsiya holatini o'zgartirish (active/inactive)
✅ Barcha organizatsiyalarni ko'rish

### API Endpoints:
```bash
POST /api/organizations           # Yangi organizatsiya yaratish
GET /api/organizations            # Barcha organizatsiyalar
GET /api/organizations/:id        # Bitta organizatsiya
PATCH /api/organizations/:id/status  # Holatni o'zgartirish
```

### Misol - Organizatsiya yaratish:
```bash
POST /api/organizations
Authorization: Bearer <SUPERADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Yangi Kompaniya",
  "slug": "yangi-kompaniya",
  "branchName": "Asosiy filial",
  "branchAddress": "Navoi, Uzbekistan",
  "departmentName": "Call Center",
  "adminFirstName": "Admin",
  "adminLastName": "Adminov",
  "adminPhone": "+998901234567",
  "adminExtCode": "100",
  "adminPassword": "password123"
}
```

**Natija:** Yangi organizatsiya + filial + bo'lim + ADMIN foydalanuvchi yaratiladi.

---

## 2️⃣ ADMIN (Organizatsiya administratori)

### Kim?
- Organizatsiya boshlig'i
- O'z organizatsiyasidagi ishchilarni to'liq boshqaradi

### Huquqlari:
✅ Userlarni yaratish (MANAGER, EMPLOYEE)
✅ Userlarni ko'rish/tahrirlash/o'chirish
✅ User role ni o'zgartirish
✅ Sipuni sozlamalarini boshqarish
✅ Sync qilish (manual)
✅ Barcha statistikalarni ko'rish
✅ Barcha qo'ng'iroqlarni ko'rish
✅ Branch va Department yaratish/boshqarish

❌ Organizatsiya yaratish (faqat SUPERADMIN)

### API Endpoints:
```bash
# User Management
POST /api/users              # Yangi user qo'shish
GET /api/users               # Barcha userlar
GET /api/users/:id           # Bitta user
PATCH /api/users/:id         # User tahrirlash
DELETE /api/users/:id        # User o'chirish
PATCH /api/users/:id/role    # Role o'zgartirish

# Settings
PATCH /api/settings          # Sipuni sozlamalari
GET /api/settings            # Sozlamalarni ko'rish

# Sync
POST /api/sipuni/sync-and-process  # Manual sync

# Statistics
GET /api/statistics          # Umumiy statistika
GET /api/users/:id/statistics  # User statistikasi

# Calls
GET /api/calls               # Qo'ng'iroqlar ro'yxati
GET /api/calls/:id           # Qo'ng'iroq tafsilotlari

# Branch & Department
POST /api/branches           # Filial yaratish
GET /api/branches            # Filiallar ro'yxati
POST /api/departments        # Bo'lim yaratish
GET /api/departments         # Bo'limlar ro'yxati
```

### Misol - User qo'shish:
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

## 3️⃣ MANAGER (Menejer)

### Kim?
- Bo'lim yoki filial boshlig'i
- Ishchilar statistikasini kuzatadi

### Huquqlari:
✅ Barcha statistikalarni ko'rish
✅ Barcha qo'ng'iroqlarni ko'rish
✅ Userlarni ko'rish (faqat ko'rish, tahrirlash yo'q)
✅ Kompaniya statistikasini ko'rish

❌ User yaratish/tahrirlash/o'chirish
❌ Sozlamalar
❌ Sync qilish

### API Endpoints:
```bash
GET /api/users               # Userlar ro'yxati (read-only)
GET /api/statistics          # Statistika
GET /api/users/:id/statistics  # User statistikasi
GET /api/calls               # Qo'ng'iroqlar
GET /api/calls/:id           # Qo'ng'iroq tafsilotlari
GET /api/company/statistics  # Kompaniya statistikasi
GET /api/company/employees/performance  # Ishchilar performance
```

---

## 4️⃣ EMPLOYEE (Ishchi)

### Kim?
- Oddiy ishchi
- Faqat o'z qo'ng'iroqlari va statistikasini ko'radi

### Huquqlari:
✅ O'z statistikasini ko'rish
✅ O'z qo'ng'iroqlarini ko'rish
✅ O'z profili ma'lumotlarini ko'rish

❌ Boshqa userlarni ko'rish
❌ Boshqa qo'ng'iroqlarni ko'rish
❌ Sozlamalar
❌ User management

### API Endpoints:
```bash
GET /api/users/:myId/statistics  # O'z statistikasi
GET /api/calls?employeeId=:myId  # O'z qo'ng'iroqlari
GET /api/users/:myId             # O'z profili
```

---

## 🔄 ROLE WORKFLOW

### 1. SUPERADMIN organizatsiya yaratadi:
```bash
POST /api/organizations
```
**Natija:**
- Organizatsiya ✅
- Branch ✅
- Department ✅
- ADMIN user ✅

### 2. ADMIN login qiladi:
```bash
POST /api/auth/login
{
  "phone": "+998901234567",
  "password": "password123"
}
```

### 3. ADMIN Sipuni sozlaydi:
```bash
PATCH /api/settings
{
  "sipuniApiUrl": "...",
  "sipuniApiKey": "...",
  "sipuniUserId": "..."
}
```

### 4. ADMIN userlarni qo'shadi:
```bash
POST /api/users (MANAGER, EMPLOYEE)
```

### 5. ADMIN sync qiladi:
```bash
POST /api/sipuni/sync-and-process
```

### 6. MANAGER statistika ko'radi:
```bash
GET /api/statistics
GET /api/company/employees/performance
```

### 7. EMPLOYEE o'z qo'ng'iroqlarini ko'radi:
```bash
GET /api/calls?employeeId=:myId
GET /api/users/:myId/statistics
```

---

## 📊 HUQUQLAR JADVALI

| Feature | SUPERADMIN | ADMIN | MANAGER | EMPLOYEE |
|---------|------------|-------|---------|----------|
| **Organizatsiya yaratish** | ✅ | ❌ | ❌ | ❌ |
| **Organizatsiyalarni ko'rish** | ✅ (all) | ❌ | ❌ | ❌ |
| **User yaratish/tahrirlash** | ❌ | ✅ | ❌ | ❌ |
| **Userlarni ko'rish** | ❌ | ✅ | ✅ (read-only) | ❌ (faqat o'zi) |
| **Sipuni sozlamalar** | ❌ | ✅ | ❌ | ❌ |
| **Manual sync** | ❌ | ✅ | ❌ | ❌ |
| **Barcha statistikalar** | ❌ | ✅ | ✅ | ❌ |
| **O'z statistikasi** | - | ✅ | ✅ | ✅ |
| **Barcha qo'ng'iroqlar** | ❌ | ✅ | ✅ | ❌ |
| **O'z qo'ng'iroqlari** | - | ✅ | ✅ | ✅ |
| **Branch/Department** | ❌ | ✅ | ❌ | ❌ |

---

## 🎯 FRONTEND INTEGRATION

### Rolega qarab UI ko'rsatish:

```typescript
const { user } = useAuth();

function Dashboard() {
  return (
    <div>
      {/* SUPERADMIN faqat */}
      {user.role === 'SUPERADMIN' && (
        <button onClick={createOrganization}>
          Yangi Organizatsiya
        </button>
      )}

      {/* ADMIN faqat */}
      {user.role === 'ADMIN' && (
        <>
          <button onClick={createUser}>User Qo'shish</button>
          <button onClick={syncCalls}>Sync Qilish</button>
          <button onClick={editSettings}>Sozlamalar</button>
        </>
      )}

      {/* ADMIN va MANAGER */}
      {['ADMIN', 'MANAGER'].includes(user.role) && (
        <>
          <Statistics />
          <AllCalls />
          <AllUsers />
        </>
      )}

      {/* EMPLOYEE faqat */}
      {user.role === 'EMPLOYEE' && (
        <>
          <MyStatistics userId={user.id} />
          <MyCalls userId={user.id} />
        </>
      )}
    </div>
  );
}
```

---

## 🔒 XAVFSIZLIK

### Token orqali avtomatik:
- JWT tokendan `organizationId` olinadi
- Har bir user faqat o'z organizatsiyasini ko'radi
- Multi-tenancy avtomatik ishlaydi

### Guard orqali himoyalangan:
```typescript
@Roles(UserRole.ADMIN)  // Faqat ADMIN
@Roles(UserRole.ADMIN, UserRole.MANAGER)  // ADMIN yoki MANAGER
```

---

## ✅ XULOSA

1. **SUPERADMIN** → Organizatsiya yaratadi
2. **ADMIN** → Userlarni boshqaradi
3. **MANAGER** → Statistika ko'radi
4. **EMPLOYEE** → O'z ma'lumotlarini ko'radi

**Frontend:** Rolega qarab UI ko'rsating!

**Backend:** Barcha endpoint himoyalangan, xavfsiz!
