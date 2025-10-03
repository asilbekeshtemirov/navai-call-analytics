# Birlashtirilgan User Statistika API

## Umumiy ma'lumot

Yangi `/users/:id/statistics` endpoint user statistika turlarini bir joyda olish imkonini beradi. Bu endpoint orqali siz quyidagi ma'lumotlarni olishingiz mumkin:

- Kunlik statistika
- Oylik statistika  
- Umumiy xulosalar
- Barcha ma'lumotlar birga

## Endpoint

```
GET /users/:id/statistics
```

## Parametrlar

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `id` | string | Ha | User ID si (URL path da) |
| `type` | enum | Yo'q | Statistika turi: `daily`, `monthly`, `summary`, `all` (default: `all`) |
| `dateFrom` | string | Yo'q | Boshlanish sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |
| `dateTo` | string | Yo'q | Tugash sanasi (ISO 8601: YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss.sssZ) |

## Foydalanish misollari

### 1. Barcha statistikani olish
```http
GET /users/user123/statistics
```

### 2. Faqat kunlik ma'lumotlarini olish
```http
GET /users/user123/statistics?type=daily
```

### 3. Sana oralig'i bo'yicha filter qilish
```http
GET /users/user123/statistics?dateFrom=2024-01-01&dateTo=2024-01-31
```

### 4. Muayyan kun uchun kunlik statistika
```http
GET /users/user123/statistics?type=daily&dateFrom=2024-10-03&dateTo=2024-10-03
```

### 5. Bir haftalik ma'lumotlar
```http
GET /users/user123/statistics?dateFrom=2024-01-15&dateTo=2024-01-21&type=daily
```

### 6. Oylik statistika sana oralig'i bilan
```http
GET /users/user123/statistics?type=monthly&dateFrom=2024-01-01&dateTo=2024-06-30
```

## Javob formati

```json
{
  "user": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "extCode": "1001",
    "role": "EMPLOYEE"
  },
  "filters": {
    "type": "all",
    "dateFrom": "2024-01-01T00:00:00.000Z",
    "dateTo": "2024-01-31T23:59:59.999Z"
  },
  "data": {
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
    "summary": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31",
        "daysCount": 31
      },
      "totalCallsInPeriod": 150,
      "totalDurationInPeriod": 5400,
      "averageScoreInPeriod": 8.5,
      "totalCallsThisMonth": 150,
      "totalDurationThisMonth": 5400,
      "averageScoreThisMonth": 8.5
    }
  }
}
```

## Afzalliklari

1. **Bir endpoint** - barcha user statistika turlarini bir joydan olish
2. **Moslashuvchan sana filtri** - istalgan sana oralig'ini tanlash
3. **Optimallashtirgan** - faqat kerakli ma'lumotlarni so'rash mumkin
4. **User ma'lumotlari** - statistika bilan birga user ma'lumotlari ham qaytariladi
5. **Kengaytirilishi mumkin** - yangi filter va ma'lumot turlarini qo'shish oson

## Eski endpointlar o'rniga

Eski endpointlar olib tashlandi va ularning o'rniga birlashtirilgan endpoint ishlatiladi:

| O'chirilgan endpoint | Yangi endpoint |
|---------------------|----------------|
| ~~`/users/:id/statistics/daily?date=2024-01-01`~~ | `/users/:id/statistics?type=daily&dateFrom=2024-01-01&dateTo=2024-01-01` |
| ~~`/users/:id/statistics/monthly?year=2024&month=1`~~ | `/users/:id/statistics?type=monthly&dateFrom=2024-01-01&dateTo=2024-01-31` |
| ~~`/users/:id/statistics/summary`~~ | `/users/:id/statistics?type=summary` |

## Xatoliklar

Agar so'rovda xatolik bo'lsa, quyidagi formatda javob qaytariladi:

```json
{
  "statusCode": 400,
  "message": "Unified user statistics error: User not found",
  "error": "Bad Request"
}
```

## Ruxsatlar

- **ADMIN** - Barcha userlarning statistikasini ko'rishi mumkin
- **MANAGER** - O'z bo'limi/filialidagi userlarning statistikasini ko'rishi mumkin
