# 🚀 NAVAI ANALYTICS - API QULLANMA

## 📋 BO'LIMLAR
1. [Organizatsiya Yaratish](#1-organizatsiya-yaratish)
2. [Filial va Bo'lim](#2-filial-va-bolim)
3. [Foydalanuvchilar](#3-foydalanuvchilar)
4. [Sipuni Sozlamalari](#4-sipuni-sozlamalari)
5. [Statistika](#5-statistika)
6. [Qo'ng'iroqlar](#6-qungiroqlar)

---

## 🎯 1. ORGANIZATSIYA YARATISH

### Yangi organizatsiya qo'shish
```bash
POST /api/organizations
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Yangi Kompaniya",
  "isActive": true
}
```

**Javob:**
```json
{
  "id": 2,
  "name": "Yangi Kompaniya",
  "isActive": true,
  "createdAt": "2025-10-07T12:00:00Z",
  "updatedAt": "2025-10-07T12:00:00Z"
}
```

---

## 🏢 2. FILIAL VA BO'LIM

### 2.1 Filial yaratish
```bash
POST /api/branches
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Asosiy filial",
  "address": "Navoi shahar, Uzbekistan"
}
```

**Javob:**
```json
{
  "id": "uuid-branch-001",
  "organizationId": 1,
  "name": "Asosiy filial",
  "address": "Navoi shahar, Uzbekistan",
  "createdAt": "2025-10-07T12:00:00Z"
}
```

### 2.2 Filiallar ro'yxati
```bash
GET /api/branches
Authorization: Bearer <TOKEN>
```

### 2.3 Bo'lim yaratish
```bash
POST /api/departments
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "branchId": "uuid-branch-001",
  "name": "Call Center"
}
```

**Javob:**
```json
{
  "id": "uuid-dept-001",
  "branchId": "uuid-branch-001",
  "name": "Call Center",
  "createdAt": "2025-10-07T12:00:00Z"
}
```

### 2.4 Bo'limlar ro'yxati
```bash
GET /api/departments
Authorization: Bearer <TOKEN>
```

---

## 👥 3. FOYDALANUVCHILAR

### 3.1 Yangi foydalanuvchi qo'shish
```bash
POST /api/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "firstName": "Alisher",
  "lastName": "Navoiy",
  "phone": "+998901234567",
  "extCode": "201",
  "password": "password123",
  "role": "EMPLOYEE",
  "branchId": "uuid-branch-001",
  "departmentId": "uuid-dept-001"
}
```

**Javob:**
```json
{
  "id": "uuid-user-001",
  "organizationId": 1,
  "firstName": "Alisher",
  "lastName": "Navoiy",
  "phone": "+998901234567",
  "extCode": "201",
  "role": "EMPLOYEE",
  "branchId": "uuid-branch-001",
  "departmentId": "uuid-dept-001",
  "createdAt": "2025-10-07T12:00:00Z"
}
```

**Role turları:**
- `ADMIN` - Administrator (barcha huquqlar)
- `MANAGER` - Menejer (statistika ko'rish)
- `EMPLOYEE` - Ishchi (faqat o'z ma'lumotlari)

### 3.2 Foydalanuvchilar ro'yxati
```bash
GET /api/users
Authorization: Bearer <TOKEN>
```

**Javob:**
```json
[
  {
    "id": "uuid-user-001",
    "firstName": "Alisher",
    "lastName": "Navoiy",
    "phone": "+998901234567",
    "extCode": "201",
    "role": "EMPLOYEE",
    "branch": {
      "id": "uuid-branch-001",
      "name": "Asosiy filial"
    },
    "department": {
      "id": "uuid-dept-001",
      "name": "Call Center"
    }
  }
]
```

### 3.3 Foydalanuvchini yangilash
```bash
PATCH /api/users/:userId
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "firstName": "Bobur",
  "extCode": "202",
  "departmentId": "uuid-dept-002"
}
```

### 3.4 Foydalanuvchini o'chirish
```bash
DELETE /api/users/:userId
Authorization: Bearer <ADMIN_TOKEN>
```

### 3.5 Role ni o'zgartirish
```bash
PATCH /api/users/:userId/role
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "role": "MANAGER"
}
```

---

## ⚙️ 4. SIPUNI SOZLAMALARI

### 4.1 Sipuni sozlamalarini qo'shish/yangilash
```bash
PATCH /api/settings
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "sipuniApiUrl": "https://mutolaaxona.sip.uz/crmapi/v1",
  "sipuniApiKey": "e1c71b86-14be-4a86-8766-eede384141bb",
  "sipuniUserId": "199717",
  "syncSchedule": "0 23 * * *",
  "autoSyncOnStartup": true,
  "dataSource": "SIPUNI"
}
```

**Parametrlar:**
- `sipuniApiUrl` - Sipuni API manzili
- `sipuniApiKey` - API kaliti
- `sipuniUserId` - Sipuni foydalanuvchi ID
- `syncSchedule` - Cron format (har kuni 23:00 da: `0 23 * * *`)
- `autoSyncOnStartup` - Backend ochilganda avtomatik sync (true/false)
- `dataSource` - Ma'lumot manbai: `SIPUNI` yoki `PBX`

**Cron schedule misollari:**
```bash
"0 23 * * *"      # Har kuni 23:00 da
"*/30 * * * *"    # Har 30 daqiqada
"0 */6 * * *"     # Har 6 soatda
"0 9-18 * * 1-5"  # Ish kunlari 9:00 dan 18:00 gacha har soat
```

### 4.2 Hozirgi sozlamalarni ko'rish
```bash
GET /api/settings
Authorization: Bearer <ADMIN_TOKEN>
```

---

## 🔄 5. QUNGIROQLARNI SYNC QILISH

### 5.1 Manual sync (sana oralig'i bilan)
```bash
POST /api/sipuni/sync-and-process?from=01.10.2025&to=07.10.2025&limit=1000
Authorization: Bearer <ADMIN_TOKEN>
```

**Parametrlar:**
- `from` - Boshlanish sanasi (DD.MM.YYYY format)
- `to` - Tugash sanasi (DD.MM.YYYY format)
- `limit` - Maksimal qo'ng'iroqlar soni (default: 500)

**Javob:**
```json
{
  "success": true,
  "message": "Processed: 67, Skipped: 5, Failed: 2",
  "recordsProcessed": 67
}
```

### 5.2 Sipuni connection test
```bash
GET /api/sipuni/test-connection
Authorization: Bearer <ADMIN_TOKEN>
```

---

## 📊 6. STATISTIKA

### 6.1 Umumiy statistika (sana oralig'i bilan)
```bash
GET /api/statistics?type=all&dateFrom=2025-10-01&dateTo=2025-10-07
Authorization: Bearer <TOKEN>
```

**Parametrlar:**
- `type` - Statistika turi: `daily`, `monthly`, `summary`, `all` (default: all)
- `dateFrom` - Boshlanish sanasi (YYYY-MM-DD)
- `dateTo` - Tugash sanasi (YYYY-MM-DD)
- `extCode` - Extension kod bo'yicha filter (masalan: 201)

**Javob:**
```json
{
  "summary": {
    "totalCalls": 67,
    "avgScore": 7.2,
    "avgDuration": 180,
    "totalDuration": 12060,
    "callsByStatus": {
      "DONE": 35,
      "PROCESSING": 12,
      "UPLOADED": 20
    },
    "callsByDirection": {
      "INCOMING": 45,
      "OUTGOING": 22
    }
  },
  "daily": [
    {
      "date": "2025-10-01",
      "totalCalls": 15,
      "avgScore": 7.5,
      "avgDuration": 175
    },
    {
      "date": "2025-10-02",
      "totalCalls": 18,
      "avgScore": 7.0,
      "avgDuration": 185
    }
  ],
  "monthly": [
    {
      "month": "2025-10",
      "totalCalls": 67,
      "avgScore": 7.2,
      "avgDuration": 180
    }
  ]
}
```

### 6.2 Foydalanuvchi statistikasi
```bash
GET /api/users/:userId/statistics?dateFrom=2025-10-01&dateTo=2025-10-07
Authorization: Bearer <TOKEN>
```

**Javob:**
```json
{
  "user": {
    "id": "uuid-user-001",
    "firstName": "Alisher",
    "lastName": "Navoiy",
    "extCode": "201"
  },
  "summary": {
    "totalCalls": 28,
    "avgScore": 7.8,
    "avgDuration": 190,
    "bestScore": 9.5,
    "worstScore": 5.0
  },
  "daily": [
    {
      "date": "2025-10-01",
      "totalCalls": 8,
      "avgScore": 8.0,
      "avgDuration": 185
    }
  ]
}
```

### 6.3 Statistikani hisoblash (manual trigger)
```bash
POST /api/statistics/calculate
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "date": "2025-10-07"
}
```

---

## 📞 7. QO'NG'IROQLAR

### 7.1 Qo'ng'iroqlar ro'yxati
```bash
GET /api/calls?page=1&limit=20&status=DONE&employeeId=uuid-user-001
Authorization: Bearer <TOKEN>
```

**Parametrlar:**
- `page` - Sahifa raqami (default: 1)
- `limit` - Har sahifada nechta (default: 20)
- `status` - Status filter: `UPLOADED`, `PROCESSING`, `DONE`, `ERROR`
- `employeeId` - Ishchi ID bo'yicha filter
- `dateFrom` - Boshlanish sanasi
- `dateTo` - Tugash sanasi

**Javob:**
```json
{
  "data": [
    {
      "id": "uuid-call-001",
      "externalId": "1759829747.4291",
      "employee": {
        "id": "uuid-user-001",
        "firstName": "Alisher",
        "lastName": "Navoiy",
        "extCode": "201"
      },
      "callerNumber": "998901234567",
      "calleeNumber": "998901234568",
      "direction": "OUTGOING",
      "status": "DONE",
      "durationSec": 107,
      "callDate": "2025-10-07T14:35:47Z",
      "analysis": {
        "overallScore": 7.5,
        "summary": "Qo'ng'iroq yaxshi o'tdi..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 67,
    "totalPages": 4
  }
}
```

### 7.2 Qo'ng'iroq tafsilotlari
```bash
GET /api/calls/:callId
Authorization: Bearer <TOKEN>
```

**Javob:**
```json
{
  "id": "uuid-call-001",
  "externalId": "1759829747.4291",
  "employee": {
    "id": "uuid-user-001",
    "firstName": "Alisher",
    "lastName": "Navoiy",
    "extCode": "201"
  },
  "callerNumber": "998901234567",
  "calleeNumber": "998901234568",
  "direction": "OUTGOING",
  "status": "DONE",
  "durationSec": 107,
  "callDate": "2025-10-07T14:35:47Z",
  "transcript": {
    "fullText": "Assalomu alaykum, paytlarim yaxshimisiz?...",
    "language": "uz",
    "durationSec": 28.72,
    "segments": [
      {
        "start": 0,
        "end": 20.72,
        "text": "Assalomu alaykum..."
      }
    ]
  },
  "analysis": {
    "overallScore": 7.5,
    "summary": "Qo'ng'iroq yaxshi o'tdi, lekin...",
    "criteriaScores": [
      {
        "criteria": {
          "id": "uuid-criteria-001",
          "name": "Salomlashish"
        },
        "score": 9,
        "notes": "Juda yaxshi salomlashdi"
      },
      {
        "criteria": {
          "id": "uuid-criteria-002",
          "name": "Ehtiyojlarni aniqlash"
        },
        "score": 7,
        "notes": "Savollar yetarli emas"
      }
    ],
    "violations": [
      {
        "type": "Mijozning ehtiyojlarini to'liq aniqlamagan",
        "timestampMs": 8000,
        "details": "Timestamp: 00:08"
      }
    ]
  }
}
```

### 7.3 Transkripsiya olish
```bash
GET /api/calls/:callId/transcript
Authorization: Bearer <TOKEN>
```

---

## 🔐 8. AUTENTIFIKATSIYA

### 8.1 Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "password123"
}
```

**Javob:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-user-001",
    "firstName": "Alisher",
    "lastName": "Navoiy",
    "phone": "+998901234567",
    "role": "EMPLOYEE",
    "organizationId": 1
  }
}
```

### 8.2 Token ishlatish
Barcha boshqa API ga murojaat qilganda header ga qo'shing:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📈 9. COMPANY (KOMPANIYA) STATISTIKASI

### 9.1 Ishchilar performance
```bash
GET /api/company/employees/performance?startDate=2025-10-01&endDate=2025-10-07
Authorization: Bearer <MANAGER_TOKEN>
```

**Javob:**
```json
[
  {
    "employee": {
      "id": "uuid-user-001",
      "firstName": "Alisher",
      "lastName": "Navoiy",
      "extCode": "201"
    },
    "totalCalls": 28,
    "avgScore": 7.8,
    "avgDuration": 190,
    "bestScore": 9.5,
    "worstScore": 5.0,
    "rank": 1
  },
  {
    "employee": {
      "id": "uuid-user-002",
      "firstName": "Bobur",
      "lastName": "Mirzo",
      "extCode": "202"
    },
    "totalCalls": 10,
    "avgScore": 6.5,
    "avgDuration": 150,
    "bestScore": 8.0,
    "worstScore": 4.5,
    "rank": 2
  }
]
```

### 9.2 So'nggi qo'ng'iroqlar
```bash
GET /api/company/calls/recent?limit=10
Authorization: Bearer <TOKEN>
```

### 9.3 Kompaniya statistikasi
```bash
GET /api/company/statistics?startDate=2025-10-01&endDate=2025-10-07
Authorization: Bearer <MANAGER_TOKEN>
```

---

## 🎨 10. FRONTEND UCHUN MISOL

### React/Next.js misollar

#### User qo'shish
```typescript
async function createUser(userData: CreateUserDto) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  return response.json();
}

// Ishlatish
const newUser = await createUser({
  firstName: 'Alisher',
  lastName: 'Navoiy',
  phone: '+998901234567',
  extCode: '201',
  password: 'password123',
  role: 'EMPLOYEE',
  branchId: 'uuid-branch-001',
  departmentId: 'uuid-dept-001'
});
```

#### Statistika olish
```typescript
async function getStatistics(dateFrom: string, dateTo: string) {
  const params = new URLSearchParams({
    type: 'all',
    dateFrom,
    dateTo
  });

  const response = await fetch(`/api/statistics?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}

// Ishlatish
const stats = await getStatistics('2025-10-01', '2025-10-07');
console.log(stats.summary.totalCalls); // 67
```

#### Qo'ng'iroqlar ro'yxati
```typescript
async function getCalls(page: number = 1, limit: number = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: 'DONE'
  });

  const response = await fetch(`/api/calls?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}

// Ishlatish
const callsData = await getCalls(1, 20);
console.log(callsData.data); // Qo'ng'iroqlar array
console.log(callsData.pagination); // Pagination ma'lumotlari
```

---

## ⚡ 11. MUHIM ESLATMALAR

### 11.1 Multi-tenancy
- Har bir organizatsiya o'z ma'lumotlarini ko'radi
- Token avtomatik ravishda organizationId ni aniqlaydi
- Admin faqat o'z organizatsiyasidagi userlarni boshqaradi

### 11.2 Roles va Permissions
| Role | Huquqlar |
|------|----------|
| ADMIN | Barcha CRUD operatsiyalar, sozlamalar, sync |
| MANAGER | Statistika ko'rish, qo'ng'iroqlar ro'yxati |
| EMPLOYEE | Faqat o'z qo'ng'iroqlari va statistikasi |

### 11.3 Sync jarayoni
1. Backend ochilganda avtomatik sync boshlanadi (agar `autoSyncOnStartup: true`)
2. Cron schedule bo'yicha avtomatik sync (masalan: har kuni 23:00 da)
3. Manual sync orqali (API endpoint)

### 11.4 Performance
- Har bir qo'ng'iroq 10ms delay bilan qayta ishlanadi
- AI tahlil background da parallel ishlaydi
- 1000 qo'ng'iroq taxminan 1-2 minut ichida qayta ishlanadi

### 11.5 Error handling
- 404 audio errors: Normal, ba'zi qo'ng'iroqlarda audio bo'lmaydi
- 413 STT errors: Audio fayl juda katta (>10MB)
- Unique constraint: Qo'ng'iroq allaqachon mavjud (skip qilinadi)

---

## 📚 12. QOSHIMCHA RESURSLAR

### Swagger Documentation
Backend ishga tushgandan keyin:
```
http://localhost:3000/api
```

### Database Studio (Prisma)
```bash
cd navai-analytics-backend
npx prisma studio
```
Brauzerda ochiladi: `http://localhost:5555`

### Loglarni ko'rish
```bash
cd navai-analytics-backend
npm run start:dev
```

---

## 🎯 QISQACHA JARAYON

1. **Admin login** → Token olish
2. **Branch yaratish** → Filial ID olish
3. **Department yaratish** → Bo'lim ID olish
4. **Sipuni sozlamalari** → API credentials
5. **Userlar qo'shish** → Ishchilar yaratish (extCode bilan)
6. **Sync qilish** → Qo'ng'iroqlarni yuklab olish
7. **Statistika ko'rish** → Natijalarni tahlil qilish

---

✅ **Hammasi tayyor!** Endi frontend orqali sodda va oson foydalanishingiz mumkin.
