# Session Status Response Examples

## 📊 Session Status Response Format

### **Endpoint:** `GET /calls/session/:sessionId`

---

## Response Ma'lumotlari:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Database ID (UUID) |
| `sessionId` | string | Unique session identifier |
| `status` | enum | PENDING, RUNNING, COMPLETED, FAILED |
| `totalNumbers` | number | Jami raqamlar soni |
| `processedNumbers` | number | Qayta ishlangan raqamlar soni |
| `connectedCalls` | number | Muvaffaqiyatli qo'ng'iroqlar |
| `failedCalls` | number | Muvaffaqiyatsiz qo'ng'iroqlar |
| `remoteResponse` | string\|null | Remote serverdan qaytgan javob |
| `errorMessage` | string\|null | Xato xabari (agar bo'lsa) |
| `startedAt` | Date | Boshlangan vaqt |
| `completedAt` | Date\|null | Tugagan vaqt |
| `durationSeconds` | number | Davomiyligi (sekundlarda) |
| `progressPercentage` | number | Jarayonning foizi (0-100%) |
| `statusDescription` | string | O'zbekcha status tavsifi |
| `isRunning` | boolean | Hozir ishlab turganmi? |
| `isCompleted` | boolean | Tugaganmi? |
| `hasError` | boolean | Xato bormi? |

---

## 1. PENDING Status (Navbatda)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-1738862891234-abc123",
  "status": "PENDING",
  "totalNumbers": 0,
  "processedNumbers": 0,
  "connectedCalls": 0,
  "failedCalls": 0,
  "remoteResponse": null,
  "errorMessage": null,
  "startedAt": "2025-10-06T18:30:00.000Z",
  "completedAt": null,
  "createdAt": "2025-10-06T18:30:00.000Z",
  "updatedAt": "2025-10-06T18:30:00.000Z",
  "durationSeconds": 2,
  "progressPercentage": 0,
  "statusDescription": "Navbatda...",
  "isRunning": false,
  "isCompleted": false,
  "hasError": false
}
```

---

## 2. RUNNING Status (Ishlab turibdi)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-1738862891234-abc123",
  "status": "RUNNING",
  "totalNumbers": 150,
  "processedNumbers": 75,
  "connectedCalls": 60,
  "failedCalls": 15,
  "remoteResponse": null,
  "errorMessage": null,
  "startedAt": "2025-10-06T18:30:00.000Z",
  "completedAt": null,
  "createdAt": "2025-10-06T18:30:00.000Z",
  "updatedAt": "2025-10-06T18:31:30.000Z",
  "durationSeconds": 90,
  "progressPercentage": 50,
  "statusDescription": "Qayta ishlanmoqda...",
  "isRunning": true,
  "isCompleted": false,
  "hasError": false
}
```

---

## 3. COMPLETED Status (Tugallandi)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-1738862891234-abc123",
  "status": "COMPLETED",
  "totalNumbers": 150,
  "processedNumbers": 150,
  "connectedCalls": 120,
  "failedCalls": 30,
  "remoteResponse": "Call process completed successfully. Total: 150, Connected: 120, Failed: 30",
  "errorMessage": null,
  "startedAt": "2025-10-06T18:30:00.000Z",
  "completedAt": "2025-10-06T18:32:15.000Z",
  "createdAt": "2025-10-06T18:30:00.000Z",
  "updatedAt": "2025-10-06T18:32:15.000Z",
  "durationSeconds": 135,
  "progressPercentage": 100,
  "statusDescription": "Muvaffaqiyatli tugallandi",
  "isRunning": false,
  "isCompleted": true,
  "hasError": false
}
```

---

## 4. FAILED Status (Xatolik)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-1738862891234-abc123",
  "status": "FAILED",
  "totalNumbers": 0,
  "processedNumbers": 0,
  "connectedCalls": 0,
  "failedCalls": 0,
  "remoteResponse": null,
  "errorMessage": "SSH connection error: Connection timeout to 193.149.16.138:22. Check firewall and network",
  "startedAt": "2025-10-06T18:30:00.000Z",
  "completedAt": "2025-10-06T18:30:25.000Z",
  "createdAt": "2025-10-06T18:30:00.000Z",
  "updatedAt": "2025-10-06T18:30:25.000Z",
  "durationSeconds": 25,
  "progressPercentage": 0,
  "statusDescription": "Xatolik yuz berdi",
  "isRunning": false,
  "isCompleted": true,
  "hasError": true
}
```

---

## Dashboard Integration Misollar

### 1. React Component - Real-time Status

```jsx
import { useState, useEffect } from 'react';

const CallSessionStatus = ({ sessionId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/calls/session/${sessionId}`);
        const data = await response.json();
        setStatus(data);
        setLoading(false);
      } catch (error) {
        console.error('Status fetch error:', error);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds if running
    const interval = setInterval(() => {
      if (!status || status.isRunning) {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, status?.isRunning]);

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div className="session-status">
      <h3>Session: {status.sessionId}</h3>

      {/* Status Badge */}
      <div className={`badge badge-${status.status.toLowerCase()}`}>
        {status.statusDescription}
      </div>

      {/* Progress Bar */}
      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${status.progressPercentage}%` }}
        >
          {status.progressPercentage}%
        </div>
      </div>

      {/* Statistics */}
      <div className="stats">
        <div className="stat-item">
          <span>Jami:</span>
          <strong>{status.totalNumbers}</strong>
        </div>
        <div className="stat-item">
          <span>Qayta ishlangan:</span>
          <strong>{status.processedNumbers}</strong>
        </div>
        <div className="stat-item">
          <span>Muvaffaqiyatli:</span>
          <strong className="text-success">{status.connectedCalls}</strong>
        </div>
        <div className="stat-item">
          <span>Muvaffaqiyatsiz:</span>
          <strong className="text-danger">{status.failedCalls}</strong>
        </div>
      </div>

      {/* Duration */}
      <div className="duration">
        <span>Davomiyligi:</span>
        <strong>{status.durationSeconds}s</strong>
      </div>

      {/* Error Message */}
      {status.hasError && (
        <div className="alert alert-danger">
          <strong>Xato:</strong> {status.errorMessage}
        </div>
      )}

      {/* Remote Response */}
      {status.remoteResponse && (
        <div className="remote-response">
          <strong>Server javobi:</strong>
          <pre>{status.remoteResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default CallSessionStatus;
```

---

### 2. Vue Component - Sessions List

```vue
<template>
  <div class="sessions-list">
    <h2>Call Sessions</h2>

    <div v-if="loading">Yuklanmoqda...</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Session ID</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Statistika</th>
          <th>Davomiyligi</th>
          <th>Vaqt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="session in sessions" :key="session.id">
          <td>
            <code>{{ session.sessionId }}</code>
          </td>
          <td>
            <span :class="`badge badge-${session.status.toLowerCase()}`">
              {{ session.statusDescription }}
            </span>
          </td>
          <td>
            <div class="progress-mini">
              <div
                :style="{ width: `${session.progressPercentage}%` }"
                class="progress-bar"
              ></div>
            </div>
            {{ session.progressPercentage }}%
          </td>
          <td>
            <div class="stats-mini">
              <span class="text-muted">{{ session.totalNumbers }}</span> /
              <span class="text-info">{{ session.processedNumbers }}</span> /
              <span class="text-success">{{ session.connectedCalls }}</span> /
              <span class="text-danger">{{ session.failedCalls }}</span>
            </div>
          </td>
          <td>
            {{ session.durationSeconds }}s
          </td>
          <td>
            {{ formatDate(session.startedAt) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sessions: [],
      loading: true,
    };
  },
  async mounted() {
    await this.fetchSessions();

    // Refresh every 5 seconds
    setInterval(this.fetchSessions, 5000);
  },
  methods: {
    async fetchSessions() {
      try {
        const response = await fetch('http://localhost:3000/calls/sessions/all?limit=20');
        this.sessions = await response.json();
        this.loading = false;
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('uz-UZ');
    },
  },
};
</script>
```

---

### 3. Vanilla JavaScript - Polling Status

```javascript
class CallSessionMonitor {
  constructor(sessionId, onUpdate) {
    this.sessionId = sessionId;
    this.onUpdate = onUpdate;
    this.intervalId = null;
  }

  async fetchStatus() {
    try {
      const response = await fetch(`http://localhost:3000/calls/session/${this.sessionId}`);
      const data = await response.json();

      this.onUpdate(data);

      // Stop polling if completed
      if (data.isCompleted) {
        this.stop();
      }

      return data;
    } catch (error) {
      console.error('Status fetch error:', error);
      throw error;
    }
  }

  start(intervalMs = 3000) {
    // Initial fetch
    this.fetchStatus();

    // Start polling
    this.intervalId = setInterval(() => {
      this.fetchStatus();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Usage:
const monitor = new CallSessionMonitor('session-1738862891234-abc123', (status) => {
  console.log('Status updated:', status);

  // Update UI
  document.getElementById('status').textContent = status.statusDescription;
  document.getElementById('progress').style.width = `${status.progressPercentage}%`;
  document.getElementById('progress-text').textContent = `${status.progressPercentage}%`;

  // Show stats
  document.getElementById('total').textContent = status.totalNumbers;
  document.getElementById('processed').textContent = status.processedNumbers;
  document.getElementById('connected').textContent = status.connectedCalls;
  document.getElementById('failed').textContent = status.failedCalls;

  // Show error if exists
  if (status.hasError) {
    document.getElementById('error').textContent = status.errorMessage;
    document.getElementById('error').style.display = 'block';
  }
});

// Start monitoring
monitor.start(3000); // Poll every 3 seconds
```

---

## cURL Test Commands

```bash
# 1. Start a session
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/calls/start)
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"

# 2. Get session status
curl -s "http://localhost:3000/calls/session/$SESSION_ID" | jq

# 3. Poll status every 3 seconds
watch -n 3 "curl -s 'http://localhost:3000/calls/session/$SESSION_ID' | jq '.status, .progressPercentage, .statusDescription'"

# 4. Get all sessions
curl -s "http://localhost:3000/calls/sessions/all?limit=10" | jq
```

---

## Status Color Scheme (Tavsiya)

```css
.badge-pending {
  background-color: #6c757d; /* Gray */
  color: white;
}

.badge-running {
  background-color: #0dcaf0; /* Blue */
  color: white;
  animation: pulse 1.5s infinite;
}

.badge-completed {
  background-color: #198754; /* Green */
  color: white;
}

.badge-failed {
  background-color: #dc3545; /* Red */
  color: white;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## Xulosa

**Session Status API** to'liq ma'lumot beradi:

✅ Real-time progress tracking
✅ O'zbekcha status tavsiflari
✅ To'liq statistika
✅ Xato xabarlari
✅ Davomiyligi va foiz
✅ Polling uchun optimallashtirilgan

**Dashboard integration:**
- Har 3-5 sekundda status tekshiring
- `isCompleted` true bo'lganda polling to'xtating
- Progress bar va statistika ko'rsating
- Xato holatlarda foydalanuvchiga xabar bering
