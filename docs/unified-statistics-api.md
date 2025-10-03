# Birlashtirilgan Statistika API

## Umumiy ma'lumot

Yangi `/company/statistics` endpoint barcha statistika turlarini bir joyda olish imkonini beradi. Bu endpoint orqali siz quyidagi ma'lumotlarni olishingiz mumkin:

- Company overview statistikasi
- Kunlik statistika
- Oylik statistika  
- Dashboard ma'lumotlari
- Umumiy xulosalar

## Endpoint

```
GET /company/statistics
```

## Parametrlar

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `type` | enum | Yo'q | Statistika turi: `overview`, `daily`, `monthly`, `dashboard`, `all` (default: `all`) |
| `dateFrom` | string | Yo'q | Boshlanish sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |
| `dateTo` | string | Yo'q | Tugash sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |
| `extCode` | string | Yo'q | Xodim extension kodi bo'yicha filter |
| `employeeId` | string | Yo'q | Xodim ID si bo'yicha filter |
| `departmentId` | string | Yo'q | Bo'lim ID si bo'yicha filter |
| `branchId` | string | Yo'q | Filial ID si bo'yicha filter |

## Foydalanish misollari

### 1. Barcha statistikani olish
```http
GET /company/statistics
```

### 2. Faqat overview ma'lumotlarini olish
```http
GET /company/statistics?type=overview
```

### 3. Sana oralig'i bo'yicha filter qilish
```http
GET /company/statistics?dateFrom=2024-01-01&dateTo=2024-01-31
```

### 4. Muayyan xodim uchun statistika
```http
GET /company/statistics?extCode=1001&type=daily
```

### 5. Muayyan bo'lim uchun oylik statistika
```http
GET /company/statistics?departmentId=dept123&type=monthly&dateFrom=2024-01-01&dateTo=2024-03-31
```

### 6. Bir haftalik ma'lumotlar
```http
GET /company/statistics?dateFrom=2024-01-15&dateTo=2024-01-21&type=daily
```

## Javob formati

```json
{
  "filters": {
    "type": "all",
    "dateFrom": "2024-01-01T00:00:00.000Z",
    "dateTo": "2024-01-31T23:59:59.999Z",
    "extCode": null,
    "employeeId": null,
    "departmentId": null,
    "branchId": null
  },
  "data": {
    "overview": {
      "totalEmployees": 50,
      "totalCalls": 1250,
      "totalDuration": 45000,
      "avgScore": 8.5,
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      }
    },
    "daily": [
      {
        "date": "2024-01-01",
        "stats": [...]
      }
    ],
    "monthly": [
      {
        "year": 2024,
        "month": 1,
        "stats": [...]
      }
    ],
    "dashboard": {
      // overview bilan bir xil
    },
    "summary": {
      "totalMetrics": {
        "calls": 1250,
        "employees": 50,
        "duration": 45000,
        "averageScore": 8.5
      },
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31",
        "daysCount": 31
      },
      "appliedFilters": {
        "extCode": null,
        "employeeId": null,
        "departmentId": null,
        "branchId": null
      }
    }
  }
}
```

## Afzalliklari

1. **Bir endpoint** - barcha statistika turlarini bir joydan olish
2. **Moslashuvchan filter** - sana oralig'i, xodim, bo'lim bo'yicha filter
3. **Optimallashtirgan** - faqat kerakli ma'lumotlarni so'rash mumkin
4. **Tushunarli javob** - barcha ma'lumotlar tuzilgan formatda
5. **Kengaytirilishi mumkin** - yangi filter va ma'lumot turlarini qo'shish oson

## Eski endpointlar o'rniga

Eski endpointlar olib tashlandi va ularning o'rniga birlashtirilgan endpoint ishlatiladi:

| O'chirilgan endpoint | Yangi endpoint |
|---------------------|----------------|
| ~~`/company/statistics/overview`~~ | `/company/statistics?type=overview` |
| ~~`/company/statistics/daily?date=2024-01-01`~~ | `/company/statistics?type=daily&dateFrom=2024-01-01&dateTo=2024-01-01` |
| ~~`/company/statistics/monthly?year=2024&month=1`~~ | `/company/statistics?type=monthly&dateFrom=2024-01-01&dateTo=2024-01-31` |
| ~~`/company/dashboard`~~ | `/company/statistics?type=dashboard` |

## Xatoliklar

Agar so'rovda xatolik bo'lsa, quyidagi formatda javob qaytariladi:

```json
{
  "statusCode": 400,
  "message": "Unified statistics error: Invalid date format",
  "error": "Bad Request"
}
```
