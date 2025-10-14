# Auto-Calling System - Foydalanish Qo'llanmasi

## Umumiy Ma'lumot

Auto-calling tizimi turli xil maqsadlar uchun avtomatik telefon qo'ng'iroqlari qilish imkonini beradi:
- Qarz yig'ish (Debt Collection)
- So'rovnomalar (Survey)
- Xatirlatmalar (Reminder)
- Marketing
- Mijozlarga xizmat (Customer Service)
- Umumiy maqsadlar (General)

## API Endpoints

Barcha endpointlar `/auto-calling` prefixi bilan boshlanadi va autentifikatsiya talab qilinadi (Bearer token).

### Contacts (Kontaktlar) CRUD

#### 1. Yangi Kontakt Yaratish
```http
POST /auto-calling/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567",
  "dateOfBirth": "1990-01-15",
  "customData": {
    "totalDebt": 5000,
    "remainingDebt": 3000,
    "lastPaymentAmount": 2000
  },
  "notes": "Cooperative customer"
}
```

#### 2. Barcha Kontaktlarni Ko'rish
```http
GET /auto-calling/contacts?page=1&limit=50&status=ACTIVE
Authorization: Bearer <token>
```

#### 3. Bitta Kontaktni Ko'rish
```http
GET /auto-calling/contacts/:id
Authorization: Bearer <token>
```

#### 4. Kontaktni Yangilash
```http
PATCH /auto-calling/contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "lastConversationOutcome": "Payment received",
  "notes": "Customer paid in full"
}
```

#### 5. Kontaktni O'chirish
```http
DELETE /auto-calling/contacts/:id
Authorization: Bearer <token>
```

### Excel Fayl Yuklash

Excel fayldan bir vaqtning o'zida ko'plab kontaktlarni yuklash:

```http
POST /auto-calling/contacts/upload-excel
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <excel-file>
```

**Excel fayl formati:**

| firstName | lastName | phone          | dateOfBirth | customData (JSON string)                          | notes              |
|-----------|----------|----------------|-------------|---------------------------------------------------|--------------------|
| John      | Smith    | +998901234567 | 1985-03-15  | {"totalDebt": 5420.50, "remainingDebt": 5170.50} | Cooperative debtor |
| Jane      | Doe      | +998901234568 | 1990-05-20  | {"totalDebt": 3000, "remainingDebt": 3000}       | New customer       |

### Campaigns (Kampaniyalar) CRUD

#### 1. Yangi Kampaniya Yaratish
```http
POST /auto-calling/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Debt Collection Campaign",
  "description": "Calling all debtors with overdue payments",
  "campaignType": "DEBT_COLLECTION",
  "contactIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Campaign Types:**
- `GENERAL` - Umumiy maqsadlar
- `DEBT_COLLECTION` - Qarz yig'ish
- `SURVEY` - So'rovnoma
- `REMINDER` - Xatirlatma
- `MARKETING` - Marketing
- `CUSTOMER_SERVICE` - Mijozlar xizmati

#### 2. Barcha Kampaniyalarni Ko'rish
```http
GET /auto-calling/campaigns?page=1&limit=20&status=RUNNING
Authorization: Bearer <token>
```

#### 3. Bitta Kampaniyani Ko'rish
```http
GET /auto-calling/campaigns/:id
Authorization: Bearer <token>
```

#### 4. Kampaniyaga Kontaktlar Qo'shish
```http
POST /auto-calling/campaigns/:id/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contactIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

#### 5. Kampaniyani O'chirish
```http
DELETE /auto-calling/campaigns/:id
Authorization: Bearer <token>
```

### Kampaniyani Boshqarish

#### Kampaniyani Boshlash (START)
```http
POST /auto-calling/campaigns/:id/start
Authorization: Bearer <token>
```

Bu endpoint kampaniyani ishga tushiradi va avtomatik ravishda barcha kontaktlarga qo'ng'iroq qilishni boshlaydi.

#### Kampaniyani To'xtatish (STOP)
```http
POST /auto-calling/campaigns/:id/stop
Authorization: Bearer <token>
```

Bu endpoint ishlab turgan kampaniyani to'xtatadi.

## WebSocket Real-time Updates

Frontend'da real-time yangilanishlarni olish uchun WebSocket'ga ulanish:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/auto-calling', {
  query: {
    organizationId: '1' // Sizning organization ID'ingiz
  },
  auth: {
    token: 'your-jwt-token'
  }
});

// Campaign yangilanishlarni tinglash
socket.on('campaign-update', (data) => {
  console.log('Campaign update:', data);
  // {
  //   campaignId: 'uuid',
  //   contactId: 'uuid',
  //   status: 'calling' | 'SUCCESS' | 'FAILED',
  //   contact: {...},
  //   outcome: '...',
  //   summary: '...'
  // }
});

// Campaign tugaganda
socket.on('campaign-complete', (data) => {
  console.log('Campaign completed:', data);
  // {
  //   campaignId: 'uuid',
  //   message: 'Campaign completed successfully'
  // }
});

// Kontakt yangilanishlari
socket.on('contact-update', (data) => {
  console.log('Contact update:', data);
});
```

## Database Modellari

### AutoCallContact
Har bir kontakt (user) ma'lumotlari:
- `firstName`, `lastName`, `phone` - asosiy ma'lumotlar
- `customData` (JSON) - qo'shimcha ma'lumotlar (qarz, to'lov tarixi, va boshqalar)
- `isCalled` - qo'ng'iroq qilinganmi
- `status` - ACTIVE, INACTIVE, COMPLETED, DO_NOT_CALL
- `lastConversationOutcome` - oxirgi suhbat natijasi
- `notes` - qo'shimcha eslatmalar

### AutoCallCampaign
Kampaniya (avto-qo'ng'iroq sessiyasi):
- `name`, `description` - kampaniya nomi va tavsifi
- `campaignType` - kampaniya turi
- `status` - PENDING, RUNNING, PAUSED, COMPLETED, FAILED
- `totalContacts`, `calledContacts`, `successfulCalls`, `failedCalls` - statistika

### AutoCallCampaignContact
Kampaniya va kontakt o'rtasidagi bog'lanish:
- `callStatus` - PENDING, CALLING, SUCCESS, FAILED, NO_ANSWER, BUSY, PROMISE_TO_PAY, REFUSED, CALLBACK_REQUESTED
- `conversationOutcome` - suhbat natijasi
- `conversationSummary` - suhbat xulosasi
- `callDuration` - qo'ng'iroq davomiyligi (soniyalarda)
- `recordingUrl` - audio yozuv URL'i

## Misol: To'liq Workflow

### 1. Kontaktlar Yuklash (Excel orqali)
```bash
curl -X POST http://localhost:3000/auto-calling/contacts/upload-excel \
  -H "Authorization: Bearer <token>" \
  -F "file=@contacts.xlsx"
```

### 2. Kampaniya Yaratish
```bash
curl -X POST http://localhost:3000/auto-calling/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "January Debt Collection",
    "campaignType": "DEBT_COLLECTION",
    "description": "Calling debtors for January"
  }'
```

### 3. Kontaktlarni Kampaniyaga Qo'shish
```bash
curl -X POST http://localhost:3000/auto-calling/campaigns/{campaign-id}/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contactIds": ["contact-id-1", "contact-id-2"]
  }'
```

### 4. Kampaniyani Boshlash
```bash
curl -X POST http://localhost:3000/auto-calling/campaigns/{campaign-id}/start \
  -H "Authorization: Bearer <token>"
```

### 5. Real-time Yangilanishlarni Kuzatish
Frontend'da WebSocket orqali yangilanishlarni tinglang (yuqoridagi misolga qarang).

### 6. Kerak Bo'lsa To'xtatish
```bash
curl -X POST http://localhost:3000/auto-calling/campaigns/{campaign-id}/stop \
  -H "Authorization: Bearer <token>"
```

## AI Agent Integration

Hozirda service'da `makeCall` funksiyasi simulatsiya qiladi. Haqiqiy AI agent bilan integratsiya qilish uchun:

1. `src/auto-calling/auto-calling.service.ts` faylida `makeCall` funksiyasini toping
2. Bu funksiyani o'z AI agent API'ngiz bilan almashtiring
3. Masalan:

```typescript
private async makeCall(contact: any): Promise<{
  status: CampaignCallStatus;
  outcome: string;
  summary: string;
  duration: number;
  recordingUrl?: string;
}> {
  // Sizning AI agent API'ngizga so'rov
  const response = await this.httpService.post('https://your-ai-agent-api.com/call', {
    phoneNumber: contact.phone,
    firstName: contact.firstName,
    lastName: contact.lastName,
    customData: contact.customData,
  }).toPromise();

  return {
    status: response.data.success ? CampaignCallStatus.SUCCESS : CampaignCallStatus.FAILED,
    outcome: response.data.outcome,
    summary: response.data.summary,
    duration: response.data.duration,
    recordingUrl: response.data.recordingUrl,
  };
}
```

## Contact Status Turlari

- `ACTIVE` - Faol kontakt, qo'ng'iroq qilish mumkin
- `INACTIVE` - Faol emas
- `COMPLETED` - Maqsadga erishildi (masalan, qarz to'landi)
- `DO_NOT_CALL` - Qo'ng'iroq qilmaslik kerak

## Campaign Call Status Turlari

- `PENDING` - Kutilmoqda
- `CALLING` - Qo'ng'iroq qilinmoqda
- `SUCCESS` - Muvaffaqiyatli
- `FAILED` - Muvaffaqiyatsiz
- `NO_ANSWER` - Javob berilmadi
- `BUSY` - Band
- `PROMISE_TO_PAY` - To'lash va'da berildi
- `REFUSED` - Rad etildi
- `CALLBACK_REQUESTED` - Qayta qo'ng'iroq so'raldi

## Xavfsizlik

Barcha endpointlar JWT autentifikatsiya bilan himoyalangan. Har bir so'rov uchun Bearer token talab qilinadi:

```
Authorization: Bearer <your-jwt-token>
```

Token organizationId ma'lumotini o'z ichiga olishi kerak.
