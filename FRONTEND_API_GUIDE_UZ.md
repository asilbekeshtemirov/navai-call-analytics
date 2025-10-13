# 📊 FRONTEND UCHUN API QO'LLANMA (O'ZBEK TILI)

## 🎯 ADMIN DASHBOARD API'LARI

Backend da **barcha kerakli API'lar mavjud**! Frontend ulardan to'g'ri foydalanish kerak.

---

## 1️⃣ UMUMIY STATISTIKA (ASOSIY DASHBOARD)

### **GET** `/company/statistics`

**Maqsad**: Admin dashboard uchun to'liq statistika

**Headers**:
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters**:
```typescript
{
  type?: 'ALL' | 'OVERVIEW' | 'DAILY' | 'MONTHLY' | 'DASHBOARD' | 'SIPUNI',
  dateFrom?: '2025-01-01',  // Sana boshlanishi
  dateTo?: '2025-01-31',    // Sana tugashi
  extCode?: '101',          // Xodim kodi
  employeeId?: 'uuid',      // Xodim ID
  departmentId?: 'uuid',    // Bo'lim ID
  branchId?: 'uuid'         // Filial ID
}
```

**Response Misol** (type=ALL):
```json
{
  "filters": {
    "type": "ALL",
    "dateFrom": "2025-01-01T00:00:00.000Z",
    "dateTo": "2025-01-31T23:59:59.999Z",
    "extCode": null,
    "employeeId": null,
    "departmentId": null,
    "branchId": null
  },
  "data": {
    "overview": {
      "totalEmployees": 25,      // Jami xodimlar
      "totalCalls": 1250,        // Jami qo'ng'iroqlar
      "totalDuration": 45000,    // Jami davomiylik (sekundda)
      "avgScore": 85.5,          // O'rtacha ball
      "period": {
        "from": "2025-01-01",
        "to": "2025-01-31"
      }
    },
    "daily": [
      {
        "date": "2025-01-15",
        "stats": {
          "callsCount": 45,
          "totalDuration": 1800,
          "averageScore": 87.2
        }
      }
      // ... har bir kun uchun
    ],
    "monthly": [
      {
        "year": 2025,
        "month": 1,
        "stats": {
          "callsCount": 1250,
          "totalDuration": 45000,
          "averageScore": 85.5
        }
      }
    ],
    "summary": {
      "totalMetrics": {
        "calls": 1250,
        "employees": 25,
        "duration": 45000,
        "averageScore": 85.5
      },
      "period": {
        "from": "2025-01-01",
        "to": "2025-01-31",
        "daysCount": 31
      }
    }
  }
}
```

---

## 2️⃣ XODIMLAR PERFORMANCE

### **GET** `/company/employees/performance`

**Maqsad**: Barcha xodimlar ishlash ko'rsatkichlari

**Query Parameters**:
```typescript
{
  period?: 'today' | 'week' | 'month'  // Default: 'today'
}
```

**Response**:
```json
[
  {
    "employee": {
      "id": "uuid-1",
      "name": "Alisher Xolmatov",
      "extCode": "101"
    },
    "stats": {
      "totalCalls": 45,        // Jami qo'ng'iroqlar
      "totalDuration": 1800,   // Jami davomiylik (sekundda)
      "avgScore": 92.5         // O'rtacha ball
    }
  },
  {
    "employee": {
      "id": "uuid-2",
      "name": "Nodira Karimova",
      "extCode": "102"
    },
    "stats": {
      "totalCalls": 38,
      "totalDuration": 1500,
      "avgScore": 88.3
    }
  }
  // ... sorted by totalCalls (eng ko'p qo'ng'iroq birinchi)
]
```

---

## 3️⃣ SO'NGGI QO'NG'IROQLAR

### **GET** `/company/calls/recent`

**Maqsad**: Eng so'nggi qo'ng'iroqlar ro'yxati

**Query Parameters**:
```typescript
{
  limit?: 50  // Default: 50
}
```

**Response**:
```json
[
  {
    "id": "call-uuid-1",
    "externalId": "sipuni-123",
    "callDate": "2025-01-15T10:30:00.000Z",
    "durationSec": 180,
    "status": "DONE",
    "analysis": {
      "overallScore": 92,
      "summary": "Mijoz bilan yaxshi muloqot..."
    },
    "employee": {
      "firstName": "Alisher",
      "lastName": "Xolmatov",
      "extCode": "101"
    }
  }
  // ... sorted by callDate desc (yangi birinchi)
]
```

---

## 4️⃣ BARCHA USERLAR (XODIMLAR)

### **GET** `/users`

**Maqsad**: O'z organizatiyadagi barcha userlar

**Response**:
```json
[
  {
    "id": "user-uuid-1",
    "firstName": "Alisher",
    "lastName": "Xolmatov",
    "phone": "+998901234567",
    "extCode": "101",
    "role": "EMPLOYEE",
    "departmentId": "dept-uuid",
    "organizationId": 1,
    "createdAt": "2024-12-01T00:00:00.000Z"
  }
  // ... faqat o'z organizatiyadagi userlar
]
```

---

## 5️⃣ DASHBOARD GRAFIK MA'LUMOTLARI

### **GET** `/dashboard/calls-over-time`

**Maqsad**: Qo'ng'iroqlar vaqt bo'yicha (Line Graph uchun)

**Query Parameters**:
```typescript
{
  dateFrom?: '2025-01-01',
  dateTo?: '2025-01-31',
  employeeId?: 'uuid',
  departmentId?: 'uuid'
}
```

**Response**:
```json
[
  {
    "date": "2025-01-15",
    "count": 45,
    "totalDuration": 1800,
    "averageScore": 87.2
  },
  {
    "date": "2025-01-16",
    "count": 52,
    "totalDuration": 2100,
    "averageScore": 89.5
  }
  // ... har bir kun
]
```

---

## 6️⃣ TOP XODIMLAR

### **GET** `/dashboard/top-performers`

**Maqsad**: Eng yaxshi xodimlar

**Query Parameters**:
```typescript
{
  limit?: 10,              // Default: 10
  dateFrom?: '2025-01-01',
  dateTo?: '2025-01-31'
}
```

**Response**:
```json
[
  {
    "rank": 1,
    "employee": {
      "id": "uuid",
      "name": "Alisher Xolmatov",
      "extCode": "101"
    },
    "metrics": {
      "totalCalls": 45,
      "averageScore": 95.2,
      "totalDuration": 1800
    }
  }
  // ... sorted by averageScore
]
```

---

## 📈 FRONTEND DASHBOARD DIZAYNI

### **Yuqori qism (Overview Cards)**:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ JAMI        │ JAMI        │ JAMI        │ O'RTACHA    │
│ XODIMLAR    │ QO'NG'IROQ  │ DAQIQALAR   │ BALL        │
│             │             │             │             │
│    25       │    1,250    │   750 min   │    85.5     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**API**: `GET /company/statistics?type=OVERVIEW`

---

### **O'rtada (Line Graph - Qo'ng'iroqlar vaqt bo'yicha)**:
```
Qo'ng'iroqlar dinamikasi
┌──────────────────────────────────────────────────────┐
│     •                                         •      │
│        •      •                          •           │
│           •      •                  •                │
│               •     •          •                     │
│                   •    •   •                         │
└──────────────────────────────────────────────────────┘
  01.01  05.01  10.01  15.01  20.01  25.01  31.01
```

**API**: `GET /dashboard/calls-over-time?dateFrom=2025-01-01&dateTo=2025-01-31`

---

### **Chap tomon (Top Xodimlar)**:
```
┌─────────────────────────────────────┐
│ ENG YAXSHI XODIMLAR                 │
├─────────────────────────────────────┤
│ 1. Alisher Xolmatov (101)           │
│    45 qo'ng'iroq • 95.2 ball        │
├─────────────────────────────────────┤
│ 2. Nodira Karimova (102)            │
│    38 qo'ng'iroq • 89.3 ball        │
├─────────────────────────────────────┤
│ 3. Sardor Toshmatov (103)           │
│    35 qo'ng'iroq • 87.8 ball        │
└─────────────────────────────────────┘
```

**API**: `GET /dashboard/top-performers?limit=10`

---

### **O'ng tomon (So'nggi Qo'ng'iroqlar)**:
```
┌─────────────────────────────────────┐
│ SO'NGGI QO'NG'IROQLAR               │
├─────────────────────────────────────┤
│ Alisher X. • 10:30 • 3 min          │
│ Ball: 92 • ✓ Muvaffaqiyatli         │
├─────────────────────────────────────┤
│ Nodira K. • 10:25 • 5 min           │
│ Ball: 88 • ✓ Muvaffaqiyatli         │
├─────────────────────────────────────┤
│ Sardor T. • 10:20 • 4 min           │
│ Ball: 85 • ✓ Muvaffaqiyatli         │
└─────────────────────────────────────┘
```

**API**: `GET /company/calls/recent?limit=10`

---

## 🔍 FILTER TIZIMI

### **Sana filtri**:
```typescript
// Bugun
GET /company/statistics?dateFrom=2025-01-15&dateTo=2025-01-15

// Hafta
GET /company/statistics?dateFrom=2025-01-08&dateTo=2025-01-15

// Oy
GET /company/statistics?dateFrom=2025-01-01&dateTo=2025-01-31

// Custom range
GET /company/statistics?dateFrom=2025-01-01&dateTo=2025-03-31
```

### **Xodim filtri**:
```typescript
// Bitta xodim
GET /company/statistics?employeeId=uuid-123

// Xodim kodi bo'yicha
GET /company/statistics?extCode=101
```

### **Bo'lim filtri**:
```typescript
GET /company/statistics?departmentId=dept-uuid
```

### **Filial filtri**:
```typescript
GET /company/statistics?branchId=branch-uuid
```

---

## 💡 FRONTEND IMPLEMENTATSIYA BO'YICHA TAVSIYALAR

### 1. **State Management** (React Context / Redux):
```typescript
interface DashboardState {
  overview: OverviewData;
  dailyStats: DailyStats[];
  topPerformers: Performer[];
  recentCalls: Call[];
  filters: {
    dateFrom: Date;
    dateTo: Date;
    employeeId?: string;
    departmentId?: string;
  };
  loading: boolean;
  error?: string;
}
```

### 2. **API Service** (Axios):
```typescript
// src/services/api.ts
export const dashboardAPI = {
  getStatistics: (filters: Filters) =>
    axios.get('/company/statistics', { params: filters }),

  getTopPerformers: (limit = 10) =>
    axios.get('/dashboard/top-performers', { params: { limit } }),

  getRecentCalls: (limit = 10) =>
    axios.get('/company/calls/recent', { params: { limit } }),

  getCallsOverTime: (filters: Filters) =>
    axios.get('/dashboard/calls-over-time', { params: filters }),
};
```

### 3. **Auto Refresh**:
```typescript
// Har 30 sekundda yangilansin
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData();
  }, 30000); // 30 sekund

  return () => clearInterval(interval);
}, [filters]);
```

### 4. **Loading States**:
```typescript
{loading ? (
  <div className="yuklash-animatsiyasi">
    <Spinner /> Yuklanmoqda...
  </div>
) : (
  <DashboardContent data={data} />
)}
```

### 5. **O'zbek Tili**:
```typescript
const translations = {
  totalEmployees: "Jami xodimlar",
  totalCalls: "Jami qo'ng'iroqlar",
  totalDuration: "Jami daqiqalar",
  averageScore: "O'rtacha ball",
  today: "Bugun",
  week: "Hafta",
  month: "Oy",
  allTime: "Barcha vaqt",
  topPerformers: "Eng yaxshi xodimlar",
  recentCalls: "So'nggi qo'ng'iroqlar",
  callsDynamics: "Qo'ng'iroqlar dinamikasi",
  filters: "Filterlar",
  dateRange: "Sana oralig'i",
  employee: "Xodim",
  department: "Bo'lim",
  branch: "Filial",
  apply: "Qo'llash",
  reset: "Tozalash"
};
```

---

## 🎨 GRAFIK KUTUBXONALAR

### **Tavsiya etiladi**:
- **Recharts**: Oson, React-friendly, responsive
- **Chart.js** + react-chartjs-2: Kuchli, ko'p turlar
- **Victory**: Zamonaviy, animatsiya

### **Recharts Misol**:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={800} height={400} data={dailyStats}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  <Line
    type="monotone"
    dataKey="count"
    stroke="#8884d8"
    name="Qo'ng'iroqlar"
    strokeWidth={2}
  />
  <Line
    type="monotone"
    dataKey="averageScore"
    stroke="#82ca9d"
    name="O'rtacha ball"
    strokeWidth={2}
  />
</LineChart>
```

---

## ✅ YAKUNIY CHECKLIST

- [ ] Overview Cards (4 ta metrika)
- [ ] Line Graph (qo'ng'iroqlar vaqt bo'yicha)
- [ ] Top Xodimlar (Top 10)
- [ ] So'nggi qo'ng'iroqlar (Last 10)
- [ ] Sana filtri (bugun, hafta, oy, custom)
- [ ] Xodim filtri
- [ ] Bo'lim filtri
- [ ] Filial filtri
- [ ] Auto-refresh (30 sek)
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] O'zbek tili (100%)

---

## 🚀 BOSHLASH

```bash
# Frontend loyhasida
npm install axios recharts

# API client sozlash
# src/services/api.ts yarating
# Yuqoridagi API service kodini qo'shing

# Dashboard component yarating
# src/pages/AdminDashboard.tsx
```

---

**Backend tayyor!** Endi faqat frontend implementatsiya qilish qoldi. Barcha API'lar ishlab turibdi va o'zbek tilidagi ma'lumotlarni qaytaradi! 🎉
