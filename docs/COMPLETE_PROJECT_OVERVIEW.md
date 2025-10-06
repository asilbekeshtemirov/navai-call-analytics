# 📊 Navai Call Analytics - To'liq Loyha Hujjati

## 🎯 Loyha Maqsadi

**Navai Call Analytics** - qo'ng'iroqlarni avtomatik tahlil qiluvchi AI-powered sistema.
Bu sistema Sipuni PBX tizimidan qo'ng'iroq yozuvlarini olib, ularni transkripsiya qilib,
sifat kriteriyalari bo'yicha baholab, xodimlar va menejerlar uchun batafsil hisobotlar yaratadi.

---

## 🏗️ Arxitektura va Texnologiyalar

### Backend Stack:
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **Prisma ORM** - Database management
- **JWT** - Authentication
- **Passport** - Auth strategies

### AI/ML Integratsiyalar:
- **Navai STT API** (`https://ai.navai.pro/v1/asr/transcribe`) - Speech-to-Text
- **Google Gemini AI** (`gemini-2.5-flash`) - Call analysis va baholash
- **Sipuni API** - PBX integration

### DevOps:
- **Docker** support
- **Cron Jobs** - Scheduled tasks
- **PM2** ready

---

## 🔐 Foydalanuvchi Rollari va Huquqlari

### 1. **ADMIN** (Superuser)
- Tizimning barcha qismlariga to'liq kirish
- Foydalanuvchilarni boshqarish (CRUD)
- Branch va Department yaratish/o'zgartirish
- Kriteriyalarni sozlash
- Tizim sozlamalarini o'zgartirish
- Barcha hisobotlarni ko'rish

### 2. **MANAGER** (Menejer)
- O'z branch/department dagi qo'ng'iroqlarni ko'rish
- Xodimlar hisobotlarini ko'rish
- Statistikani tahlil qilish
- Qo'ng'iroqlarni filtrlash va izlash

### 3. **EMPLOYEE** (Xodim)
- Faqat o'z qo'ng'iroqlarini ko'rish
- O'z statistikasini ko'rish
- Transkriptlarni o'qish

---

## 📦 Database Strukturasi (Prisma Schema)

### Asosiy Modellar:

#### 1. **User** (Foydalanuvchilar)
```prisma
- id: UUID
- firstName, lastName: String
- phone: String (unique)
- extCode: String (PBX extension code)
- role: ADMIN | MANAGER | EMPLOYEE
- passwordHash: String (bcrypt)
- branchId, departmentId: Foreign keys
- createdAt, updatedAt: DateTime
```

#### 2. **Branch** (Filiallar)
```prisma
- id: UUID
- name: String
- address: String?
- calls: Call[]
- users: User[]
- departments: Department[]
```

#### 3. **Department** (Bo'limlar)
```prisma
- id: UUID
- branchId: Foreign key
- name: String
- calls: Call[]
- users: User[]
```

#### 4. **Call** (Qo'ng'iroqlar) - **Markaziy Model**
```prisma
- id: UUID
- externalId: String (unique) - Sipuni recordId
- employeeId: Foreign key (qo'ng'iroq qabul qilgan xodim)
- managerId: Foreign key? (optional)
- branchId, departmentId: Foreign keys
- fileUrl: String (audio file path)
- status: UPLOADED | PROCESSING | DONE | ERROR
- callerNumber: String (kimdan)
- calleeNumber: String (kimga)
- callDate: DateTime
- durationSec: Int
- transcription: String (to'liq matn)
- analysis: JSON (LLM tahlili)
- segments: TranscriptSegment[] (diarization)
- scores: CallScore[] (kriteriyalar bo'yicha balllar)
- violations: Violation[] (xatolar ro'yxati)
```

#### 5. **TranscriptSegment** (Transkript segmentlari)
```prisma
- id: UUID
- callId: Foreign key
- startMs, endMs: Int (vaqt oralig'i)
- speaker: String (agent | customer)
- text: String (gap matni)
```

#### 6. **Criteria** (Baholash kriteriyalari)
```prisma
- id: UUID
- name: String (unique)
- weight: Int (og'irligi)
- description: String?
- scores: CallScore[]
```

#### 7. **CallScore** (Kriteriya ballari)
```prisma
- id: UUID
- callId: Foreign key
- criteriaId: Foreign key
- score: Int
- notes: String?
@@unique([callId, criteriaId])
```

#### 8. **Violation** (Xatolar/Qoidabuzarliklar)
```prisma
- id: UUID
- callId: Foreign key
- type: String (xato turi)
- timestampMs: Int (qaysi vaqtda)
- details: String?
```

#### 9. **DailyStats & MonthlyStats** (Statistika)
```prisma
DailyStats:
- date: Date
- extCode: String
- callsCount: Int
- totalDuration: Int
- averageScore: Float?
- totalScore: Float

MonthlyStats:
- year, month: Int
- extCode: String
- callsCount: Int
- totalDuration: Int
- averageScore: Float?
- totalScore: Float
```

#### 10. **Setting** (Tizim sozlamalari)
```prisma
- id: Int (default 1, singleton)
- analyticsStatus: Boolean
- scoringMode: TEN | HUNDRED
- excludeSeconds: Int
- pbxUrl: String?
- language: String?
```

---

## 🔄 To'liq Ishlash Jarayoni (End-to-End Flow)

### **1. Sipuni Integratsiyasi va Qo'ng'iroq Yuklab Olish**

#### A. Avtomatik Sync (Har kecha 00:00)
```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async dailySipuniSync()
```

#### B. Manual Sync (API orqali)
```bash
POST /api/sipuni/sync-and-process?limit=100
```

#### Jarayon:

**Qadam 1: Sipuni dan ma'lumotlarni olish**
```
1. API Call: POST https://sipuni.com/api/statistic/export/all
   - Parameters: limit, order, page, user, hash
   - Returns: CSV format (semicolon separated)
   - Columns: Тип, Статус, Время, Схема, Откуда, Куда,
              Кто ответил, Длительность, ID записи, и т.д.

2. Filtering:
   - Faqat "Кто ответил" (answered) bo'sh bo'lmagan
   - Faqat "ID записи" (recordId) mavjud bo'lgan
   - Natija: Answered calls with recordings only
```

**Qadam 2: Database tekshiruvi**
```typescript
// Check if call already exists
const existingCall = await prisma.call.findUnique({
  where: { externalId: recordId }
});

if (existingCall) {
  // Skip - already processed
  continue;
}
```

**Qadam 3: Employee topish**
```typescript
// Find employee by extension code (extCode)
const employee = await prisma.user.findFirst({
  where: { extCode: record.answered } // e.g., "204", "206"
});

if (!employee) {
  // Skip - employee not found
  // Delete downloaded file if exists
  continue;
}
```

**Qadam 4: Audio yozuvni yuklab olish**
```
1. API Call: POST https://sipuni.com/api/statistic/record
   - Parameters: id (recordId), user, hash
   - Response: Binary audio data (MP3)

2. Save to: ./recordings/sipuni_DD.MM.YYYY_HH_mm_ss.mp3

3. File size check:
   - Muvaffaqiyatli: 50KB - 5MB
   - 404 Error: Yozuv mavjud emas
   - 429 Error: Rate limit (retry 2 marta)
```

**Qadam 5: Call record yaratish**
```typescript
const call = await prisma.call.create({
  data: {
    externalId: recordId,        // Sipuni recordId (unique)
    employeeId: employee.id,     // Xodim ID
    branchId: employee.branchId, // Filial ID
    departmentId: employee.departmentId,
    fileUrl: audioFilePath,      // ./recordings/sipuni_...mp3
    status: 'UPLOADED',          // Initial status
    callerNumber: record.from,   // Kimdan
    calleeNumber: record.to,     // Kimga
    callDate: parsedDate,        // DD.MM.YYYY HH:mm:ss
    durationSec: parseInt(record.talkDuration) || 0
  }
});
```

---

### **2. AI Pipeline - Avtomatik Tahlil**

Har bir `UPLOADED` statusdagi qo'ng'iroq uchun:

```typescript
await aiService.processCall(call.id);
```

#### **Step 1: Status yangilash**
```typescript
await prisma.call.update({
  where: { id: callId },
  data: { status: 'PROCESSING' }
});
```

#### **Step 2: Speech-to-Text (STT)**

**API Request:**
```typescript
POST https://ai.navai.pro/v1/asr/transcribe
Content-Type: multipart/form-data

FormData:
  - file: <audio file stream>
  - diarization: true
  - language: uz
```

**API Response:**
```json
{
  "segments": [
    {
      "speaker": "agent",
      "text": "Assalomu alaykum, sizga qanday yordam bera olaman?",
      "start_ms": 0,
      "end_ms": 3500
    },
    {
      "speaker": "customer",
      "text": "Salom, men mahsulot haqida so'ramoqchi edim",
      "start_ms": 3500,
      "end_ms": 6200
    },
    // ... more segments
  ]
}
```

**Database ga saqlash:**
```typescript
// 1. TranscriptSegment yaratish
await prisma.transcriptSegment.createMany({
  data: segments.map(seg => ({
    callId: callId,
    startMs: seg.start_ms,
    endMs: seg.end_ms,
    speaker: seg.speaker, // agent | customer
    text: seg.text
  }))
});

// 2. Full transcript saqlash
const fullTranscript = segments
  .map(s => `[${s.speaker}]: ${s.text}`)
  .join('\n');

await prisma.call.update({
  where: { id: callId },
  data: {
    transcription: fullTranscript,
    durationSec: Math.floor(lastSegment.end_ms / 1000)
  }
});

// 3. Audio faylni o'chirish (transkript tayyor)
fs.unlinkSync(audioFilePath);
```

#### **Step 3: LLM Analysis (Gemini AI)**

**Kriteriyalarni olish:**
```typescript
const criteria = await prisma.criteria.findMany();
// Example criteria:
// - Salom berish (weight: 1)
// - Savollarni tinglash (weight: 2)
// - Aniq javob berish (weight: 2)
// - Xayrlik aytish (weight: 1)
```

**Prompt yaratish:**
```typescript
const prompt = `
You are an expert call quality analyst. Analyze the following call transcript and provide scores based on these criteria:

- Salom berish (weight: 1): Agent qo'ng'iroqni salom bilan boshladi mi?
- Savollarni tinglash (weight: 2): Agent mijozni diqqat bilan tingladimi?
- Aniq javob berish (weight: 2): Agent aniq va tushunarli javob berdimi?
- Xayrlik aytish (weight: 1): Agent qo'ng'iroqni xayrlik bilan yakunladimi?

Transcript:
[agent]: Assalomu alaykum, sizga qanday yordam bera olaman?
[customer]: Salom, men mahsulot haqida so'ramoqchi edim
[agent]: Albatta, qaysi mahsulot haqida bilmoqchisiz?
... (full transcript)

Provide:
1. Overall score (0-10)
2. Score for each criterion (0-10)
3. List of violations/mistakes with timestamps
4. Brief summary of performance

Respond in JSON format:
{
  "overall_score": 8,
  "criterion_scores": {
    "Salom berish": 10,
    "Savollarni tinglash": 8,
    "Aniq javob berish": 7,
    "Xayrlik aytish": 10
  },
  "violations_mistakes": [
    {
      "description": "Agent mijoz gapini to'xtatdi",
      "timestamp": "00:02:30"
    }
  ],
  "summary_of_performance": "Agent umuman yaxshi ishladi..."
}
`;
```

**Gemini API Call:**
```typescript
const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
const response = await model.generateContent(prompt);
const analysisText = response.response.text();
```

**Response parsing va saqlash:**
```typescript
const analysis = JSON.parse(cleanedResponse);

// 1. Analysis JSON sifatida saqlash
await prisma.call.update({
  where: { id: callId },
  data: { analysis: analysis }
});

// 2. CallScore yaratish (har bir kriteriya uchun)
await prisma.callScore.createMany({
  data: analysis.criterion_scores.map(cs => ({
    callId: callId,
    criteriaId: criteriaIdMap[cs.name],
    score: cs.score,
    notes: `Criterion: ${cs.name}`
  }))
});

// 3. Violations yaratish
await prisma.violation.createMany({
  data: analysis.violations_mistakes.map(v => ({
    callId: callId,
    type: v.description,
    timestampMs: parseTimestamp(v.timestamp), // 00:02:30 -> 150000ms
    details: v.details
  }))
});
```

#### **Step 4: Status yakunlash**
```typescript
await prisma.call.update({
  where: { id: callId },
  data: { status: 'DONE' }
});

// Audio fayl o'chiriladi (agar hali mavjud bo'lsa)
if (fs.existsSync(audioFilePath)) {
  fs.unlinkSync(audioFilePath);
}
```

#### **Error Handling:**
```typescript
catch (error) {
  // Update status to ERROR
  await prisma.call.update({
    where: { id: callId },
    data: { status: 'ERROR' }
  });

  // Delete audio file
  if (fs.existsSync(audioFilePath)) {
    fs.unlinkSync(audioFilePath);
  }

  throw error;
}
```

---

## 🌐 API Endpoints (To'liq Ro'yxat)

### **Authentication** (`/api/auth`)

#### 1. **POST /api/auth/register**
```json
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567",
  "extCode": "204",
  "password": "securepass123",
  "role": "EMPLOYEE",
  "branchId": "uuid",
  "departmentId": "uuid"
}

Response:
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567",
  "extCode": "204",
  "role": "EMPLOYEE"
}
```

#### 2. **POST /api/auth/login**
```json
Request:
{
  "phone": "+998901234567",
  "password": "securepass123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE"
  }
}
```

#### 3. **GET /api/auth/profile**
Headers: `Authorization: Bearer <token>`
```json
Response:
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567",
  "extCode": "204",
  "role": "EMPLOYEE",
  "branchId": "uuid",
  "departmentId": "uuid"
}
```

---

### **Calls** (`/api/calls`) - Qo'ng'iroqlar

#### 1. **GET /api/calls** - Barcha qo'ng'iroqlar
Query params:
- `branchId` - Filial bo'yicha filter
- `departmentId` - Bo'lim bo'yicha filter
- `employeeId` - Xodim bo'yicha filter
- `status` - Status bo'yicha (UPLOADED, PROCESSING, DONE, ERROR)
- `dateFrom` - Boshlanish sanasi (YYYY-MM-DD)
- `dateTo` - Tugash sanasi (YYYY-MM-DD)

```bash
GET /api/calls?employeeId=uuid&status=DONE&dateFrom=2025-10-01&dateTo=2025-10-06
```

```json
Response: [
  {
    "id": "uuid",
    "externalId": "1759740347.69905",
    "employee": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "extCode": "204"
    },
    "branch": { "id": "uuid", "name": "Toshkent filiali" },
    "department": { "id": "uuid", "name": "Savdo bo'limi" },
    "status": "DONE",
    "callerNumber": "998901234567",
    "calleeNumber": "998785555505",
    "callDate": "2025-10-06T10:45:47.000Z",
    "durationSec": 120,
    "scores": [
      {
        "score": 8,
        "criteria": {
          "name": "Salom berish",
          "weight": 1
        }
      }
    ],
    "violations": [
      {
        "type": "Agent mijoz gapini to'xtatdi",
        "timestampMs": 45000
      }
    ]
  }
]
```

#### 2. **GET /api/calls/:id** - Bitta qo'ng'iroq (to'liq ma'lumot)
```json
Response:
{
  "id": "uuid",
  "externalId": "1759740347.69905",
  "employee": { "id": "uuid", "firstName": "John", ... },
  "manager": { "id": "uuid", "firstName": "Manager", ... },
  "branch": { "id": "uuid", "name": "Toshkent" },
  "department": { "id": "uuid", "name": "Savdo" },
  "fileUrl": "./recordings/sipuni_06.10.2025_10_45_47.mp3",
  "status": "DONE",
  "callerNumber": "998901234567",
  "calleeNumber": "998785555505",
  "callDate": "2025-10-06T10:45:47.000Z",
  "durationSec": 120,
  "transcription": "[agent]: Assalomu alaykum...\n[customer]: Salom...",
  "analysis": {
    "overall_score": 8,
    "summary": "Agent yaxshi ishladi..."
  },
  "segments": [
    {
      "startMs": 0,
      "endMs": 3500,
      "speaker": "agent",
      "text": "Assalomu alaykum, sizga qanday yordam bera olaman?"
    }
  ],
  "scores": [...],
  "violations": [...]
}
```

#### 3. **GET /api/calls/:id/transcript** - Faqat transkript
```json
Response: [
  {
    "id": "uuid",
    "startMs": 0,
    "endMs": 3500,
    "speaker": "agent",
    "text": "Assalomu alaykum, sizga qanday yordam bera olaman?"
  },
  {
    "id": "uuid",
    "startMs": 3500,
    "endMs": 6200,
    "speaker": "customer",
    "text": "Salom, men mahsulot haqida so'ramoqchi edim"
  }
]
```

---

### **Users** (`/api/users`) - Foydalanuvchilar

#### 1. **GET /api/users** - Barcha foydalanuvchilar
Role: ADMIN, MANAGER

```json
Response: [
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+998901234567",
    "extCode": "204",
    "role": "EMPLOYEE",
    "branch": { "name": "Toshkent" },
    "department": { "name": "Savdo" }
  }
]
```

#### 2. **GET /api/users/:id** - Bitta foydalanuvchi

#### 3. **PUT /api/users/:id** - Foydalanuvchini yangilash
Role: ADMIN

```json
Request:
{
  "firstName": "Updated",
  "extCode": "205",
  "branchId": "new-uuid"
}
```

#### 4. **DELETE /api/users/:id** - Foydalanuvchini o'chirish
Role: ADMIN

---

### **Branches** (`/api/branches`) - Filiallar

#### 1. **GET /api/branches** - Barcha filiallar
#### 2. **POST /api/branches** - Yangi filial yaratish (ADMIN)
```json
{
  "name": "Toshkent filiali",
  "address": "Chilonzor tumani"
}
```
#### 3. **PUT /api/branches/:id** - Yangilash (ADMIN)
#### 4. **DELETE /api/branches/:id** - O'chirish (ADMIN)

---

### **Departments** (`/api/departments`) - Bo'limlar

#### 1. **GET /api/departments** - Barcha bo'limlar
#### 2. **POST /api/departments** - Yangi bo'lim (ADMIN)
```json
{
  "branchId": "uuid",
  "name": "Savdo bo'limi"
}
```
#### 3. **PUT /api/departments/:id** - Yangilash (ADMIN)
#### 4. **DELETE /api/departments/:id** - O'chirish (ADMIN)

---

### **Criteria** (`/api/criteria`) - Baholash kriteriyalari

#### 1. **GET /api/criteria** - Barcha kriteriyalar
```json
Response: [
  {
    "id": "uuid",
    "name": "Salom berish",
    "weight": 1,
    "description": "Agent qo'ng'iroqni salom bilan boshladi mi?"
  },
  {
    "id": "uuid",
    "name": "Savollarni tinglash",
    "weight": 2,
    "description": "Agent mijozni diqqat bilan tingladimi?"
  }
]
```

#### 2. **POST /api/criteria** - Yangi kriteriya (ADMIN)
```json
Request:
{
  "name": "Professional til",
  "weight": 3,
  "description": "Agent professional tilda gaplashdimi?"
}
```

#### 3. **PUT /api/criteria/:id** - Yangilash (ADMIN)
#### 4. **DELETE /api/criteria/:id** - O'chirish (ADMIN)

---

### **Company** (`/api/company`) - Kompaniya statistikasi

#### 1. **GET /api/company/statistics**
Query params:
- `dateFrom`, `dateTo` - Sana oralig'i
- `branchId`, `departmentId` - Filter

```json
Response:
{
  "totalCalls": 150,
  "avgScore": 8.2,
  "totalDuration": 18000, // seconds
  "callsByStatus": {
    "DONE": 120,
    "PROCESSING": 5,
    "ERROR": 2,
    "UPLOADED": 23
  },
  "topEmployees": [
    {
      "employee": { "firstName": "John", "lastName": "Doe" },
      "callCount": 45,
      "avgScore": 9.1
    }
  ],
  "criteriaAverages": [
    {
      "criteria": "Salom berish",
      "avgScore": 9.5
    }
  ]
}
```

#### 2. **GET /api/company/daily-stats**
Kunlik statistika (extCode bo'yicha)

#### 3. **GET /api/company/monthly-stats**
Oylik statistika

---

### **Sipuni** (`/api/sipuni`) - PBX Integration

#### 1. **POST /api/sipuni/sync-and-process?limit=100**
**Manual sync va tahlil** - Eng muhim endpoint!

```json
Response:
{
  "success": true,
  "message": "Processed: 25, Skipped: 10, Failed: 2",
  "recordsProcessed": 25
}
```

#### 2. **GET /api/sipuni/test-connection**
Sipuni API connection test

```json
Response:
{
  "success": true,
  "message": "Sipuni service is initialized and ready",
  "config": {
    "apiUrl": "https://sipuni.com/api",
    "hasApiKey": true,
    "hasUserId": true
  }
}
```

#### 3. **POST /api/sipuni/export-statistics**
Sipuni dan CSV export

#### 4. **GET /api/sipuni/fetch-records?from=06.10.2025&to=06.10.2025**
Sipuni records olish (faqat fetch, process emas)

---

### **AI** (`/api/ai`) - AI Processing

#### 1. **POST /api/ai/process-call/:callId**
Bitta qo'ng'iroqni qayta tahlil qilish

#### 2. **POST /api/ai/process-all-uploaded**
Barcha `UPLOADED` statusdagi qo'ng'iroqlarni tahlil qilish

---

### **Settings** (`/api/settings`) - Tizim sozlamalari

#### 1. **GET /api/settings** - Sozlamalarni olish
```json
Response:
{
  "id": 1,
  "analyticsStatus": true,
  "scoringMode": "TEN",
  "excludeSeconds": 0,
  "pbxUrl": "https://sipuni.com",
  "language": "uz"
}
```

#### 2. **PUT /api/settings** - Sozlamalarni o'zgartirish (ADMIN)
```json
Request:
{
  "scoringMode": "HUNDRED",
  "excludeSeconds": 10
}
```

---

## 📊 Real Use Case - Amaliy Misol

### Scenario: Yangi filial ochildi

**1. Admin tizimga kiradi va filial yaratadi:**
```bash
POST /api/auth/login
POST /api/branches
{
  "name": "Samarqand filiali",
  "address": "Registon ko'chasi"
}
```

**2. Bo'lim yaratadi:**
```bash
POST /api/departments
{
  "branchId": "samarqand-uuid",
  "name": "Savdo bo'limi"
}
```

**3. Xodimlarni ro'yxatdan o'tkazadi:**
```bash
POST /api/auth/register
{
  "firstName": "Aziz",
  "lastName": "Aliyev",
  "phone": "+998901111111",
  "extCode": "301", // PBX extension
  "password": "aziz123",
  "role": "EMPLOYEE",
  "branchId": "samarqand-uuid",
  "departmentId": "savdo-uuid"
}
```

**4. Manager qo'shadi:**
```bash
POST /api/auth/register
{
  "firstName": "Dilshod",
  "lastName": "Toshev",
  "phone": "+998902222222",
  "extCode": "300",
  "password": "dilshod123",
  "role": "MANAGER",
  "branchId": "samarqand-uuid"
}
```

**5. Sipuni PBX da extension kodlar sozlanadi:**
- 301 - Aziz Aliyev (Employee)
- 302 - ... (boshqa xodimlar)
- 300 - Dilshod Toshev (Manager)

**6. Qo'ng'iroqlar avtomatik yoziladi va tahlil qilinadi:**
- **00:00** - Har kecha cron job ishlaydi
- **00:01** - Sipuni dan oxirgi 500 ta qo'ng'iroq tekshiriladi
- **00:02** - Yangi qo'ng'iroqlar yuklab olinadi
- **00:05** - STT orqali transkript yaratiladi
- **00:10** - LLM tahlil qiladi va ball beradi
- **00:15** - Status DONE, audio o'chiriladi

**7. Ertasi kuni Manager hisobotni ko'radi:**
```bash
GET /api/calls?branchId=samarqand-uuid&dateFrom=2025-10-06&dateTo=2025-10-06
```

**Natija:**
- Aziz: 15 ta qo'ng'iroq, o'rtacha ball: 7.8
- Violations: 3 ta (mijoz gapini to'xtatgan)
- Eng yaxshi kriteriya: "Salom berish" (9.5)
- Eng past kriteriya: "Aniq javob berish" (6.2)

**8. Manager Azizga feedback beradi:**
- "Salom berishda zo'r!"
- "Lekin mijoz gapini tinglashda kamchilik bor"
- "Aniq javob berishni yaxshilash kerak"

---

## 🔧 Xatolarni Bartaraf Qilish (Troubleshooting)

### Umumiy Muammolar:

#### 1. **Qo'ng'iroq yuklanmayapti**
- **Sabab:** Employee topilmayapti
- **Yechim:** User jadvalida `extCode` to'g'ri ekanligini tekshiring
```sql
SELECT id, firstName, extCode FROM "User" WHERE extCode = '204';
```

#### 2. **STT ishlamayapti**
- **Sabab:** STT API ishlamayapti yoki audio fayl yo'q
- **Yechim:**
  - `STT_API_URL` to'g'ri sozlanganligini tekshiring
  - Audio fayl mavjudligini tekshiring: `ls recordings/`

#### 3. **LLM ball bermayapti**
- **Sabab:** Gemini API key noto'g'ri yoki criteria yo'q
- **Yechim:**
  - `.env` da `GEMINI_API_KEY` tekshiring
  - Criteria mavjudligini tekshiring:
```sql
SELECT * FROM "Criteria";
```

#### 4. **Duplikat xatolari**
- **Sabab:** Bir xil `externalId` ikki marta yaratilmoqda
- **Yechim:** Sipuni sync before creating check:
```typescript
const existing = await prisma.call.findUnique({
  where: { externalId: recordId }
});
```

#### 5. **Audio fayl o'chirilmayapti**
- **Sabab:** Status `DONE` emas yoki fayl path noto'g'ri
- **Yechim:** Status tekshirish va path:
```sql
SELECT id, externalId, status, fileUrl FROM "Call" WHERE status != 'DONE';
```

---

## 📈 Performance va Optimizatsiya

### Current Performance:
- **Download speed:** 5 parallel downloads
- **Processing speed:** ~10 calls/minute (sequential)
- **STT timeout:** 5 minutes per call
- **LLM timeout:** 30 seconds per call

### Bottlenecks:
1. **STT API** - eng sekin jarayon (1-3 min per call)
2. **Sequential processing** - parallel qilish mumkin
3. **File I/O** - SSD tavsiya etiladi

### Future Optimizations:
- [ ] Bull Queue uchun parallel processing
- [ ] Redis cache for frequently accessed data
- [ ] Audio compression before STT
- [ ] Webhook integration (real-time)

---

## 🚀 Deployment

### Environment Variables (.env):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/navai_analytics"

# JWT
JWT_SECRET="your-super-secret-key-here"

# Sipuni API
SIPUNI_API_URL="https://sipuni.com/api"
SIPUNI_API_KEY="0.tdtbjy193bm"
SIPUNI_USER_ID="064629"

# AI Services
STT_API_URL="https://ai.navai.pro/v1/asr/transcribe"
GEMINI_API_KEY="your-gemini-api-key"

# Server
PORT=3000
NODE_ENV=production
```

### Installation Steps:
```bash
# 1. Clone repository
git clone <repo-url>
cd navai-analytics-backend

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma generate
npx prisma migrate deploy

# 4. Seed initial data (optional)
npm run seed

# 5. Build
npm run build

# 6. Start
npm run start:prod
```

### Docker Deployment:
```bash
docker-compose up -d
```

---

## 🎓 Xulosa

Bu loyha quyidagilarni amalga oshiradi:

✅ **Sipuni PBX** dan avtomatik qo'ng'iroqlarni yuklab olish
✅ **Speech-to-Text** orqali audio → text konversiya
✅ **AI (Gemini)** orqali qo'ng'iroqlarni baholash
✅ **Role-based access** (Admin, Manager, Employee)
✅ **Real-time statistics** va hisobotlar
✅ **Automatic cleanup** - audio fayllar o'chiriladi
✅ **Scheduled jobs** - har kecha avtomatik sync
✅ **RESTful API** - to'liq dokumentatsiyalangan

**Natija:** Kompaniyalar qo'ng'iroq sifatini avtomatik monitoring qilishlari va xodimlarni samarali baholashlari mumkin! 🎯
