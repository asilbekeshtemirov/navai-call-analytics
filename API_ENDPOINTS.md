# Navai Analytics API Endpoints

Base URL: `http://localhost:3000`

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 Users (Foydalanuvchilar)

### Get All Users
```http
GET /users
Authorization: Bearer {token}
```

### Create User
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234570",
  "password": "password123",
  "role": "EMPLOYEE",
  "extCode": "101",
  "branchId": "branch-1",
  "departmentId": "dept-1"
}
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer {token}
```

### Update User
```http
PATCH /users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer {token}
```

## 🏢 Branches (Filiallar)

### Get All Branches
```http
GET /branches
Authorization: Bearer {token}
```

### Create Branch
```http
POST /branches
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Main Office",
  "address": "Tashkent, Amir Temur 123"
}
```

### Get Branch by ID
```http
GET /branches/:id
Authorization: Bearer {token}
```

### Update Branch
```http
PATCH /branches/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Branch Name"
}
```

### Delete Branch
```http
DELETE /branches/:id
Authorization: Bearer {token}
```

## 🏬 Departments (Bo'limlar)

### Get All Departments
```http
GET /departments
Authorization: Bearer {token}
```

### Create Department
```http
POST /departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sales Department",
  "branchId": "branch-1"
}
```

### Get Department by ID
```http
GET /departments/:id
Authorization: Bearer {token}
```

### Update Department
```http
PATCH /departments/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Department"
}
```

### Delete Department
```http
DELETE /departments/:id
Authorization: Bearer {token}
```

## 📞 Calls (Qo'ng'iroqlar)

### Get All Calls (with filters)
```http
GET /calls?branchId=branch-1&departmentId=dept-1&employeeId=user-1&status=DONE&dateFrom=2025-01-01&dateTo=2025-12-31
Authorization: Bearer {token}
```

### Get Call by ID
```http
GET /calls/:id
Authorization: Bearer {token}

Response includes:
- Call details
- Employee info
- Transcript segments
- Scores per criteria
- Violations
```

### Get Call Transcript
```http
GET /calls/:id/transcript
Authorization: Bearer {token}

Response:
[
  {
    "id": "...",
    "speaker": "agent",
    "text": "Salom, sizga qanday yordam bera olaman?",
    "startMs": 0,
    "endMs": 3000
  },
  {
    "id": "...",
    "speaker": "customer",
    "text": "Salom, mahsulot haqida ma'lumot olmoqchiman.",
    "startMs": 3500,
    "endMs": 6000
  }
]
```

### Upload Call from URL
```http
POST /calls/upload-from-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com/audio.wav",
  "employeeId": "user-id",
  "sipId": "unique-call-id"
}
```

## 📊 Dashboard

### Get Statistics
```http
GET /dashboard/stats?branchId=branch-1&departmentId=dept-1&dateFrom=2025-01-01&dateTo=2025-12-31
Authorization: Bearer {token}

Response:
{
  "totalCalls": 150,
  "totalDuration": 45000,
  "totalDepartments": 3,
  "totalEmployees": 25
}
```

### Get Calls Over Time
```http
GET /dashboard/calls-over-time?dateFrom=2025-01-01&dateTo=2025-01-31
Authorization: Bearer {token}

Response:
[
  { "date": "2025-01-01", "count": 10 },
  { "date": "2025-01-02", "count": 15 },
  ...
]
```

### Get Top Performers
```http
GET /dashboard/top-performers?limit=10&branchId=branch-1&dateFrom=2025-01-01
Authorization: Bearer {token}

Response:
[
  {
    "employeeId": "...",
    "employeeName": "John Doe",
    "avgScore": 8.5,
    "callCount": 50
  },
  ...
]
```

### Get Violation Statistics
```http
GET /dashboard/violations?departmentId=dept-1&dateFrom=2025-01-01
Authorization: Bearer {token}

Response:
[
  { "type": "Brand not mentioned", "count": 15 },
  { "type": "No follow-up action", "count": 8 },
  ...
]
```

## 📈 Reports (Hisobotlar)

### Generate Report
```http
POST /reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-id",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31"
}

Response:
{
  "id": "report-id",
  "userId": "user-id",
  "dateFrom": "2025-01-01T00:00:00.000Z",
  "dateTo": "2025-01-31T23:59:59.999Z",
  "totalCalls": 50,
  "totalDuration": 15000,
  "avgScore": 8.2,
  "summary": "Report for user ... Total calls: 50. Average score: 8.20.",
  "createdAt": "2025-01-31T12:00:00.000Z"
}
```

## ⚙️ Settings (Sozlamalar)

### Get Settings
```http
GET /settings
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "analyticsStatus": true,
  "scoringMode": "TEN",
  "excludeSeconds": 0,
  "pbxUrl": "https://pbx25732.onpbx.ru",
  "language": "rus",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Update Settings
```http
PATCH /settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "analyticsStatus": false,
  "scoringMode": "HUNDRED",
  "excludeSeconds": 10,
  "pbxUrl": "https://new-pbx.example.com",
  "language": "uz"
}
```

## 📋 Criteria (Kriteriyalar)

### Get All Criteria
```http
GET /criteria
Authorization: Bearer {token}
```

### Create Criteria
```http
POST /criteria
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Приветствие",
  "weight": 1,
  "description": "Оператор приветствует клиента"
}
```

### Update Criteria
```http
PATCH /criteria/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "weight": 2,
  "description": "Updated description"
}
```

### Delete Criteria
```http
DELETE /criteria/:id
Authorization: Bearer {token}
```

## 🏷️ Topics (Mavzular)

### Get All Topics
```http
GET /topics
Authorization: Bearer {token}
```

### Create Topic
```http
POST /topics
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Качество обслуживания"
}
```

## 📝 Prompts

### Get All Prompts
```http
GET /prompts
Authorization: Bearer {token}
```

### Create Prompt
```http
POST /prompts
Authorization: Bearer {token}
Content-Type: application/json

{
  "topicId": "topic-id",
  "text": "Analyze the call quality..."
}
```

## 🔄 Call Status Flow

```
UPLOADED → PROCESSING → DONE
                ↓
              ERROR
```

- **UPLOADED**: Audio fayl yuklandi
- **PROCESSING**: AI tahlil qilyapti
- **DONE**: Tahlil tugallandi
- **ERROR**: Xatolik yuz berdi

## 📊 Scoring Modes

- **TEN**: 10 ballik tizim (0-10)
- **HUNDRED**: 100 ballik tizim (0-100)

## 👤 User Roles

- **ADMIN**: To'liq kirish huquqi
- **MANAGER**: Hisobotlarni ko'rish va tahlil qilish
- **EMPLOYEE**: Faqat o'z qo'ng'iroqlarini ko'rish

## 🔍 Filter Examples

### Filial bo'yicha filtrlash
```http
GET /calls?branchId=branch-1
GET /dashboard/stats?branchId=branch-1
```

### Bo'lim bo'yicha filtrlash
```http
GET /calls?departmentId=dept-1
GET /dashboard/top-performers?departmentId=dept-1
```

### Xodim bo'yicha filtrlash
```http
GET /calls?employeeId=user-1
```

### Sana oralig'i bo'yicha filtrlash
```http
GET /calls?dateFrom=2025-01-01&dateTo=2025-01-31
GET /dashboard/stats?dateFrom=2025-01-01&dateTo=2025-01-31
```

### Status bo'yicha filtrlash
```http
GET /calls?status=DONE
GET /calls?status=PROCESSING
GET /calls?status=ERROR
```

### Kombinatsiyalangan filtrlar
```http
GET /calls?branchId=branch-1&departmentId=dept-1&status=DONE&dateFrom=2025-01-01&dateTo=2025-01-31
```

## 🧪 Test Credentials

```
Admin:
  Phone: +998901234567
  Password: admin123

Employee:
  Phone: +998901234568
  Password: employee123

Manager:
  Phone: +998901234569
  Password: manager123
```

## 📚 Swagger Documentation

Interactive API documentation: http://localhost:3000/api/docs
