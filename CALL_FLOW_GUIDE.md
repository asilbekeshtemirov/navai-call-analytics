# Call Start Flow - To'liq Yo'riqnoma

## 🔄 Umumiy Flow

```
[Dashboard] → [Backend API] → [SSH] → [Remote Server 193.149.16.138]
```

---

## 📋 1-Qadam: File Yuklash

### **Endpoint:** `POST /calls/upload`

**Dashboard:**
```javascript
// File upload form
const formData = new FormData();
formData.append('file', selectedFile); // numbers.xlsx yoki numbers.txt

fetch('http://localhost:3000/calls/upload', {
  method: 'POST',
  body: formData
});
```

**Backend Jarayoni:**

1. **File Qabul Qilish**
   - `numbers.xlsx` yoki `numbers.txt` qabul qilinadi
   - Local `./numbers/` papkaga vaqtinchalik saqlanadi

2. **Excel Qayta Ishlash** (agar xlsx bo'lsa)
   ```typescript
   // Excel fayldan raqamlarni o'qish
   const workbook = new ExcelJS.Workbook();
   await workbook.xlsx.readFile(file.path);
   const worksheet = workbook.getWorksheet(1);

   // Birinchi ustundagi barcha raqamlarni olish
   const numbers = [];
   worksheet.eachRow((row) => {
     numbers.push(row.getCell(1).value.toString());
   });

   // numbers.txt yaratish
   fs.writeFileSync('numbers.txt', numbers.join('\n'));
   ```

3. **Remote Serverga Yuklash**
   ```typescript
   // SSH orqali numbers.txt ni remote serverga yuklash
   await sshUploadFile({
     host: '193.149.16.138',
     username: 'root',
     privateKey: PRIVATE_KEY,
     localFilePath: 'numbers.txt',
     remoteFilePath: '/usr/src/call/numbers.txt' // ← Bu fayl REPLACE qilinadi!
   });
   ```

**Response:**
```json
{
  "ok": true,
  "message": "Excel file processed and uploaded successfully.",
  "remotePath": "/usr/src/call/numbers.txt"
}
```

---

## 🚀 2-Qadam: Call Start (Button Click)

### **Endpoint:** `POST /calls/start`

**Dashboard:**
```javascript
// "Start" button bosilganda
document.getElementById('startButton').addEventListener('click', async () => {
  const response = await fetch('http://localhost:3000/calls/start', {
    method: 'POST'
  });

  const result = await response.json();
  console.log(result); // Session info va response
});
```

**Backend Jarayoni:**

1. **Session Yaratish**
   ```typescript
   // Unique session ID yaratish
   const sessionId = `session-${Date.now()}-${random()}`;

   // Database ga session yozish
   await prisma.callSession.create({
     data: { sessionId, status: 'PENDING' }
   });
   ```

2. **Remote Commandni Ishga Tushirish**
   ```typescript
   // SSH orqali remote serverga ulanish
   await sshRunCommand({
     host: '193.149.16.138',
     username: 'root',
     privateKey: PRIVATE_KEY,
     command: 'curl http://127.0.0.1:3000/start' // ← Remote serverdagi local endpoint
   });
   ```

3. **Session Yangilash**
   ```typescript
   // Status update
   await prisma.callSession.update({
     where: { id: session.id },
     data: {
       status: 'COMPLETED',
       remoteResponse: stdout,
       completedAt: new Date()
     }
   });
   ```

**Response:**
```json
{
  "ok": true,
  "message": "Remote process started.",
  "sessionId": "session-1738862891234-abc123",
  "stdout": "Call process initiated successfully",
  "stderr": "",
  "code": 0,
  "signal": null
}
```

---

## 📊 3-Qadam: Status Tekshirish

### **Endpoint:** `GET /calls/session/:sessionId`

**Dashboard:**
```javascript
// Polling yoki websocket bilan status tekshirish
setInterval(async () => {
  const response = await fetch(`http://localhost:3000/calls/session/${sessionId}`);
  const session = await response.json();

  console.log(session.status); // PENDING, RUNNING, COMPLETED, FAILED

  if (session.status === 'COMPLETED') {
    console.log('Call session tugallandi!');
    // UI ni yangilash
  }
}, 5000); // Har 5 sekundda
```

**Response:**
```json
{
  "id": "uuid",
  "sessionId": "session-1738862891234-abc123",
  "status": "COMPLETED",
  "totalNumbers": 0,
  "processedNumbers": 0,
  "connectedCalls": 0,
  "failedCalls": 0,
  "remoteResponse": "Call process initiated successfully",
  "errorMessage": null,
  "startedAt": "2025-10-06T18:30:00Z",
  "completedAt": "2025-10-06T18:30:15Z"
}
```

---

## 🔍 To'liq Test Scenario

### **1. File Upload Test**

```bash
# Excel file yuklash
curl -X POST http://localhost:3000/calls/upload \
  -F "file=@numbers.xlsx"

# Response:
# {
#   "ok": true,
#   "message": "Excel file processed and uploaded successfully.",
#   "remotePath": "/usr/src/call/numbers.txt"
# }
```

**Remote serverda tekshirish:**
```bash
ssh root@193.149.16.138
cat /usr/src/call/numbers.txt

# Natija:
# +998901234567
# +998909876543
# +998971112233
```

---

### **2. Start Process Test**

```bash
# Start buttonni bosgandek
curl -X POST http://localhost:3000/calls/start

# Response:
# {
#   "ok": true,
#   "message": "Remote process started.",
#   "sessionId": "session-1738862891234-abc123",
#   "stdout": "...",
#   "code": 0
# }
```

---

### **3. Status Check Test**

```bash
# Session statusni olish
curl http://localhost:3000/calls/session/session-1738862891234-abc123

# Response:
# {
#   "status": "COMPLETED",
#   "remoteResponse": "...",
#   ...
# }
```

---

## 🎯 Remote Server Requirements

Remote server (193.149.16.138) da quyidagilar bo'lishi kerak:

### **1. Numbers.txt Fayl Joyi**
```bash
/usr/src/call/numbers.txt
```

### **2. Local Endpoint**
Remote serverda quyidagi endpoint ishlashi kerak:
```bash
curl http://127.0.0.1:3000/start
```

Bu endpoint:
- `/usr/src/call/numbers.txt` faylni o'qiydi
- Har bir raqamga call qiladi
- Natijalarni qaytaradi

---

## 🔐 .env Sozlamalar

```bash
# SSH Configuration
REMOTE_HOST=193.149.16.138
REMOTE_PORT=22
REMOTE_USER=root
REMOTE_PATH=/usr/src/call/numbers.txt
REMOTE_COMMAND=curl http://127.0.0.1:3000/start
PRIVATE_KEY_BASE64=LS0tLS1CRUdJTi...

# Recordings yuklash uchun
REMOTE_RECORDINGS_PATH=/usr/src/call/recordings
```

---

## 📈 Dashboard Integration Misol

```javascript
// React/Vue/Angular component

const CallManager = () => {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('idle');

  // 1. File yuklash
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/calls/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.ok) {
      setStatus('uploaded');
      alert('File yuklandi va remote serverga joylashtirildi!');
    }
  };

  // 2. Call start
  const handleStart = async () => {
    const response = await fetch('http://localhost:3000/calls/start', {
      method: 'POST'
    });

    const result = await response.json();
    setSessionId(result.sessionId);
    setStatus('running');

    // Status polling boshlash
    pollStatus(result.sessionId);
  };

  // 3. Status polling
  const pollStatus = (sessionId) => {
    const interval = setInterval(async () => {
      const response = await fetch(`http://localhost:3000/calls/session/${sessionId}`);
      const session = await response.json();

      if (session.status === 'COMPLETED' || session.status === 'FAILED') {
        clearInterval(interval);
        setStatus(session.status.toLowerCase());

        if (session.status === 'COMPLETED') {
          alert('Call session tugallandi!');
        } else {
          alert('Xatolik: ' + session.errorMessage);
        }
      }
    }, 5000);
  };

  return (
    <div>
      <h2>Call Manager</h2>

      {/* File upload */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload File</button>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={status !== 'uploaded'}
      >
        Start Calls
      </button>

      {/* Status */}
      <div>Status: {status}</div>
      {sessionId && <div>Session ID: {sessionId}</div>}
    </div>
  );
};
```

---

## ⚠️ Troubleshooting

### **Muammo 1: File yuklanmayapti**
```bash
# Tekshirish:
npm run start:dev
# Log ichida:
# "Excel file processed and uploaded successfully"
```

**Yechim:**
- PRIVATE_KEY_BASE64 to'g'ri sozlanganini tekshiring
- SSH connection test qiling: `ssh root@193.149.16.138`

### **Muammo 2: Start button ishlamayapti**
```bash
# Remote serverda tekshirish:
ssh root@193.149.16.138
curl http://127.0.0.1:3000/start
```

**Yechim:**
- Remote serverdagi endpoint ishlab turganini tekshiring
- REMOTE_COMMAND to'g'ri sozlanganini tekshiring

### **Muammo 3: Status yangilanmayapti**
```bash
# Database tekshirish:
# PostgreSQL console:
SELECT * FROM call_sessions ORDER BY created_at DESC LIMIT 1;
```

**Yechim:**
- Database migration ishga tushganini tekshiring
- Prisma client generate qilinganini tekshiring

---

## 🎉 Xulosa

**Flow:**
1. 📤 Dashboard → File yuklash → Backend API
2. 🔄 Backend → Excel qayta ishlash → numbers.txt yaratish
3. 📡 Backend → SSH → Remote server (numbers.txt replace)
4. 🚀 Dashboard → Start button → Backend API
5. 📡 Backend → SSH → Remote server (curl http://127.0.0.1:3000/start)
6. 📊 Dashboard → Status polling → Backend API → Database

**Har safar file yuklanganda `/usr/src/call/numbers.txt` to'liq REPLACE qilinadi!** ✅
