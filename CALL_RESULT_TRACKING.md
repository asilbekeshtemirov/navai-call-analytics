# Call Result Tracking - Qo'ng'iroq Natijalarini Aniqlash

## ✅ Ha, Tizim Qo'ng'iroq Natijalarini To'liq Aniqlay Oladi!

Backend har bir telefon qo'ng'irog'i natijasini kuzatish uchun to'liq tizim yaratildi:

---

## 📊 Call Status Turlari

| Status | O'zbekcha | Tavsif |
|--------|-----------|--------|
| `ANSWERED` | Telefon ko'tarildi | Mijoz telefoni ko'tardi |
| `NO_ANSWER` | Javob berilmadi | Telefon jiringladi lekin ko'tarilmadi |
| `BUSY` | Band | Telefon band edi |
| `FAILED` | O'chirilgan/mavjud emas | Raqam o'chirilgan yoki mavjud emas |
| `CONNECTED_TO_OPERATOR` | Operator bilan bog'landi | Operator bilan muvaffaqiyatli gaplashdi |
| `REJECTED` | Rad etildi | Qo'ng'iroq rad etildi |
| `INVALID_NUMBER` | Noto'g'ri raqam | Raqam formati noto'g'ri |
| `NETWORK_ERROR` | Tarmoq xatosi | Tarmoq bilan bog'liq xatolik |

---

## 🔄 Tizim Qanday Ishlaydi?

### **1. Raqamlar Yuklanadi**
```bash
POST /calls/upload
# numbers.xlsx → numbers.txt → Remote Server
```

### **2. Qo'ng'iroqlar Boshlanadi**
```bash
POST /calls/start
# Remote Server: curl http://127.0.0.1:3000/start
# Session yaratiladi: session-1738862891234-abc123
```

### **3. Remote Server Har Bir Qo'ng'iroq Natijasini Yuboradi**

Remote serverdagi call sistema har bir qo'ng'iroqdan keyin webhook chaqirishi kerak:

```bash
POST http://YOUR_BACKEND_URL/calls/result
Content-Type: application/json

{
  "sessionId": "session-1738862891234-abc123",
  "phoneNumber": "+998901234567",
  "callStatus": "ANSWERED",
  "callDuration": 45,
  "operatorName": "Alisher Valijonov",
  "operatorId": "uuid",
  "callStartTime": "2025-10-06T18:30:00.000Z",
  "callEndTime": "2025-10-06T18:30:45.000Z",
  "recordingUrl": "https://recordings.example.com/call-12345.mp3",
  "notes": "Mijoz mahsulot haqida so'radi"
}
```

### **4. Backend Avtomatik Saqlaydi va Statistikani Yangilaydi**

Backend:
- ✅ Call result ni database ga saqlaydi
- ✅ Session statistikasini yangilaydi
- ✅ Dashboard realtime ko'rishi uchun tayyorlaydi

---

## 📡 Webhook Integration (Remote Server Uchun)

Remote serverda (193.149.16.138) qo'ng'iroq tizimasi quyidagilarni qilishi kerak:

### **Python Misol:**

```python
import requests
import json
from datetime import datetime

# Backend URL
BACKEND_URL = "http://YOUR_BACKEND_URL:3000"

def report_call_result(session_id, phone_number, call_status, **kwargs):
    """
    Har bir qo'ng'iroqdan keyin backendga natijani yuborish
    """
    url = f"{BACKEND_URL}/calls/result"

    data = {
        "sessionId": session_id,
        "phoneNumber": phone_number,
        "callStatus": call_status,  # ANSWERED, NO_ANSWER, BUSY, etc.
        "callDuration": kwargs.get('duration'),  # seconds
        "operatorName": kwargs.get('operator_name'),
        "operatorId": kwargs.get('operator_id'),
        "callStartTime": kwargs.get('start_time'),
        "callEndTime": kwargs.get('end_time'),
        "recordingUrl": kwargs.get('recording_url'),
        "notes": kwargs.get('notes'),
    }

    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print(f"✅ Call result reported: {phone_number} - {call_status}")
        return response.json()
    except Exception as e:
        print(f"❌ Error reporting call result: {e}")
        return None


# Misol: Qo'ng'iroq sisteman foydalanish
def make_calls(session_id, numbers_file):
    """
    numbers.txt dan raqamlarni o'qib, har biriga qo'ng'iroq qilish
    """
    with open(numbers_file, 'r') as f:
        numbers = [line.strip() for line in f if line.strip()]

    for phone_number in numbers:
        print(f"📞 Calling {phone_number}...")

        # 1. Qo'ng'iroq qilish (sizning call sistemangiz)
        call_result = your_call_system.make_call(phone_number)

        # 2. Natijani aniqlash
        if call_result.answered:
            status = "ANSWERED"
            if call_result.connected_to_operator:
                status = "CONNECTED_TO_OPERATOR"
        elif call_result.no_answer:
            status = "NO_ANSWER"
        elif call_result.busy:
            status = "BUSY"
        elif call_result.invalid_number:
            status = "INVALID_NUMBER"
        else:
            status = "FAILED"

        # 3. Backendga yuborish
        report_call_result(
            session_id=session_id,
            phone_number=phone_number,
            call_status=status,
            duration=call_result.duration,
            operator_name=call_result.operator_name,
            operator_id=call_result.operator_id,
            start_time=call_result.start_time.isoformat(),
            end_time=call_result.end_time.isoformat(),
            recording_url=call_result.recording_url,
            notes=call_result.notes
        )


# Flask endpoint (remote serverda)
from flask import Flask, request

app = Flask(__name__)

@app.route('/start', methods=['GET', 'POST'])
def start_calls():
    """
    Backend bu endpointni trigger qiladi: curl http://127.0.0.1:3000/start
    """
    # Session ID ni request parametridan olish yoki lokal saqlangan qiymatdan
    session_id = request.args.get('session_id') or get_current_session_id()

    # numbers.txt faylni o'qish
    numbers_file = '/usr/src/call/numbers.txt'

    # Qo'ng'iroqlarni boshlash (background task)
    import threading
    thread = threading.Thread(target=make_calls, args=(session_id, numbers_file))
    thread.start()

    return {"message": "Call process started", "sessionId": session_id}

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000)
```

---

### **Node.js Misol:**

```javascript
const axios = require('axios');
const fs = require('fs');

const BACKEND_URL = 'http://YOUR_BACKEND_URL:3000';

async function reportCallResult(sessionId, phoneNumber, callStatus, options = {}) {
  const url = `${BACKEND_URL}/calls/result`;

  const data = {
    sessionId,
    phoneNumber,
    callStatus,
    callDuration: options.duration,
    operatorName: options.operatorName,
    operatorId: options.operatorId,
    callStartTime: options.startTime,
    callEndTime: options.endTime,
    recordingUrl: options.recordingUrl,
    notes: options.notes,
  };

  // Remove undefined values
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

  try {
    const response = await axios.post(url, data);
    console.log(`✅ Call result reported: ${phoneNumber} - ${callStatus}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error reporting call result: ${error.message}`);
    return null;
  }
}

async function makeCalls(sessionId, numbersFile) {
  const numbers = fs.readFileSync(numbersFile, 'utf-8')
    .split('\n')
    .filter(line => line.trim());

  for (const phoneNumber of numbers) {
    console.log(`📞 Calling ${phoneNumber}...`);

    // 1. Qo'ng'iroq qilish
    const callResult = await yourCallSystem.makeCall(phoneNumber);

    // 2. Natijani aniqlash
    let status = 'FAILED';
    if (callResult.answered) {
      status = callResult.connectedToOperator ? 'CONNECTED_TO_OPERATOR' : 'ANSWERED';
    } else if (callResult.noAnswer) {
      status = 'NO_ANSWER';
    } else if (callResult.busy) {
      status = 'BUSY';
    } else if (callResult.invalidNumber) {
      status = 'INVALID_NUMBER';
    }

    // 3. Backendga yuborish
    await reportCallResult(sessionId, phoneNumber, status, {
      duration: callResult.duration,
      operatorName: callResult.operatorName,
      operatorId: callResult.operatorId,
      startTime: callResult.startTime,
      endTime: callResult.endTime,
      recordingUrl: callResult.recordingUrl,
      notes: callResult.notes,
    });
  }
}

// Express endpoint
const express = require('express');
const app = express();

app.get('/start', (req, res) => {
  const sessionId = req.query.session_id || getCurrentSessionId();
  const numbersFile = '/usr/src/call/numbers.txt';

  // Background task
  makeCalls(sessionId, numbersFile).catch(console.error);

  res.json({ message: 'Call process started', sessionId });
});

app.listen(3000, '127.0.0.1');
```

---

## 📊 Dashboard da Natijalarni Ko'rish

### **1. Session Status + Call Results**

```javascript
// React component
const CallSessionDetails = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Session status
      const sessionRes = await fetch(`/calls/session/${sessionId}`);
      const sessionData = await sessionRes.json();
      setSession(sessionData);

      // Call results
      const resultsRes = await fetch(`/calls/session/${sessionId}/results`);
      const resultsData = await resultsRes.json();
      setResults(resultsData);
    };

    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!session) return <div>Yuklanmoqda...</div>;

  return (
    <div>
      <h2>Session: {session.sessionId}</h2>

      {/* Statistics */}
      <div className="stats">
        <div>Jami: {session.totalNumbers}</div>
        <div>Qayta ishlangan: {session.processedNumbers}</div>
        <div>Ko'tardi: {session.connectedCalls}</div>
        <div>Ko'tarmadi: {session.failedCalls}</div>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div style={{ width: `${session.progressPercentage}%` }}>
          {session.progressPercentage}%
        </div>
      </div>

      {/* Call Results Table */}
      <table>
        <thead>
          <tr>
            <th>Telefon</th>
            <th>Status</th>
            <th>Operator</th>
            <th>Davomiyligi</th>
            <th>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.id}>
              <td>{result.phoneNumber}</td>
              <td>
                <span className={`badge badge-${result.callStatus.toLowerCase()}`}>
                  {result.statusDescription}
                </span>
              </td>
              <td>{result.operatorName || '-'}</td>
              <td>{result.callDuration ? `${result.callDuration}s` : '-'}</td>
              <td>{new Date(result.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 🧪 Test Qilish

### **1. Manual Test (Remote Server Dan)**

```bash
# Session yaratish
SESSION_ID="session-1738862891234-abc123"

# Ko'tardi
curl -X POST http://localhost:3000/calls/result \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "phoneNumber": "+998901234567",
    "callStatus": "ANSWERED",
    "callDuration": 45
  }'

# Javob bermadi
curl -X POST http://localhost:3000/calls/result \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "phoneNumber": "+998909876543",
    "callStatus": "NO_ANSWER"
  }'

# Band
curl -X POST http://localhost:3000/calls/result \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "phoneNumber": "+998971112233",
    "callStatus": "BUSY"
  }'
```

### **2. Session Natijalarini Ko'rish**

```bash
# Session status
curl http://localhost:3000/calls/session/$SESSION_ID

# Call results
curl http://localhost:3000/calls/session/$SESSION_ID/results
```

---

## 📈 Response Misoli

### **Session Status:**

```json
{
  "sessionId": "session-1738862891234-abc123",
  "status": "RUNNING",
  "totalNumbers": 150,
  "processedNumbers": 75,
  "connectedCalls": 60,
  "failedCalls": 15,
  "progressPercentage": 50,
  "statusDescription": "Qayta ishlanmoqda..."
}
```

### **Call Results:**

```json
[
  {
    "id": "uuid",
    "sessionId": "session-1738862891234-abc123",
    "phoneNumber": "+998901234567",
    "callStatus": "ANSWERED",
    "statusDescription": "Telefon ko'tarildi",
    "callDuration": 45,
    "operatorName": "Alisher Valijonov",
    "callStartTime": "2025-10-06T18:30:00.000Z",
    "callEndTime": "2025-10-06T18:30:45.000Z"
  },
  {
    "id": "uuid2",
    "sessionId": "session-1738862891234-abc123",
    "phoneNumber": "+998909876543",
    "callStatus": "NO_ANSWER",
    "statusDescription": "Javob berilmadi",
    "callDuration": null,
    "operatorName": null
  },
  {
    "id": "uuid3",
    "sessionId": "session-1738862891234-abc123",
    "phoneNumber": "+998971112233",
    "callStatus": "BUSY",
    "statusDescription": "Band",
    "callDuration": null
  }
]
```

---

## ✅ Xulosa

**Ha, tizim to'liq qo'ng'iroq natijalarini aniqlay oladi:**

✅ **Telefon ko'tardi** - ANSWERED
✅ **Javob bermadi** - NO_ANSWER
✅ **Band** - BUSY
✅ **O'chirilgan/mavjud emas** - FAILED
✅ **Operator bilan gaplashdi** - CONNECTED_TO_OPERATOR

**Remote server** har bir qo'ng'iroqdan keyin webhook orqali natijani yuborishi kerak:
```
POST http://YOUR_BACKEND_URL/calls/result
```

**Backend avtomatik:**
- Database ga saqlaydi
- Statistikani yangilaydi
- Dashboard realtime ko'radi

**Session ID** orqali barcha qo'ng'iroq natijalarini ko'rish mumkin!
