# Birlashtirilgan Umumiy Statistika API

## Umumiy ma'lumot

Yangi `/statistics` endpoint barcha statistika turlarini bir joyda olish imkonini beradi. Bu endpoint orqali siz quyidagi ma'lumotlarni olishingiz mumkin:

- Kunlik statistika
- Oylik statistika  
- Umumiy xulosalar
- Barcha ma'lumotlar birga

## Endpoint

```
GET /statistics
```

## Parametrlar

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `type` | enum | Yo'q | Statistika turi: `daily`, `monthly`, `summary`, `all` (default: `all`) |
| `dateFrom` | string | Yo'q | Boshlanish sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |
| `dateTo` | string | Yo'q | Tugash sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |
| `extCode` | string | Yo'q | Extension code bo'yicha filter |

## Foydalanish misollari

### 1. Barcha statistikani olish
```http
GET /statistics
```

### 2. Faqat kunlik ma'lumotlarini olish
```http
GET /statistics?type=daily
```

### 3. Sana oralig'i bo'yicha filter qilish
```http
GET /statistics?dateFrom=2024-01-01&dateTo=2024-01-31
```

### 4. Muayyan kun uchun kunlik statistika
```http
GET /statistics?type=daily&dateFrom=2024-10-03&dateTo=2024-10-03
```

### 5. Bir haftalik ma'lumotlar
```http
GET /statistics?dateFrom=2024-01-15&dateTo=2024-01-21&type=daily
```

### 6. Extension code bilan filter
```http
GET /statistics?extCode=1001&type=daily&dateFrom=2024-01-01&dateTo=2024-01-31
```

### 7. Oylik statistika sana oralig'i bilan
```http
GET /statistics?type=monthly&dateFrom=2024-01-01&dateTo=2024-06-30
```

## Javob formati

```json
{
  "filters": {
    "type": "all",
    "dateFrom": "2024-01-01T00:00:00.000Z",
    "dateTo": "2024-01-31T23:59:59.999Z",
    "extCode": "1001"
  },
  "data": {
    "daily": [
      {
        "date": "2024-01-01",
        "stats": [
          {
            "extCode": "1001",
            "callsCount": 25,
            "totalDuration": 1500,
            "averageScore": 8.5
          }
        ]
      }
    ],
    "monthly": [
      {
        "year": 2024,
        "month": 1,
        "stats": [
          {
            "extCode": "1001",
            "callsCount": 150,
            "totalDuration": 9000,
            "averageScore": 8.2
          }
        ]
      }
    ],
    "summary": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31",
        "daysCount": 31
      },
      "totalCallsInPeriod": 150,
      "totalDurationInPeriod": 9000,
      "averageScoreInPeriod": 8.2,
      "totalCallsThisMonth": 150,
      "totalDurationThisMonth": 9000,
      "averageScoreThisMonth": 8.2
    }
  }
}
```

## Afzalliklari

1. **Bir endpoint** - barcha statistika turlarini bir joydan olish
2. **Moslashuvchan sana filtri** - istalgan sana oralig'ini tanlash
3. **Extension code filtri** - muayyan xodim bo'yicha filter qilish
4. **Optimallashtirgan** - faqat kerakli ma'lumotlarni so'rash mumkin
5. **Kengaytirilishi mumkin** - yangi filter va ma'lumot turlarini qo'shish oson

## Eski endpointlar o'rniga

Eski endpointlar olib tashlandi va ularning o'rniga birlashtirilgan endpoint ishlatiladi:

| O'chirilgan endpoint | Yangi endpoint |
|---------------------|----------------|
| ~~`/statistics/daily?date=2024-01-01&extCode=1001`~~ | `/statistics?type=daily&dateFrom=2024-01-01&dateTo=2024-01-01&extCode=1001` |
| ~~`/statistics/monthly?year=2024&month=1&extCode=1001`~~ | `/statistics?type=monthly&dateFrom=2024-01-01&dateTo=2024-01-31&extCode=1001` |
| ~~`/statistics/summary?extCode=1001`~~ | `/statistics?type=summary&extCode=1001` |

## Xatoliklar

Agar so'rovda xatolik bo'lsa, quyidagi formatda javob qaytariladi:

```json
{
  "statusCode": 400,
  "message": "Unified statistics error: Invalid date format",
  "error": "Bad Request"
}
```

## Qo'shimcha endpointlar

### Manual statistika hisoblash
```http
POST /statistics/calculate
Content-Type: application/json

{
  "date": "2024-01-01"
}
```

Bu endpoint muayyan sana uchun statistikani qayta hisoblash uchun ishlatiladi.
