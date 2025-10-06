# Real Telephony Integration - Haqiqiy Telefon Qo'ng'iroqlari

## Remote Serverdagi Real Call Sistema

Remote server (193.149.16.138) da **haqiqiy telefon qo'ng'iroqlari** qilish uchun VoIP sistema bo'lishi kerak.

---

## Variant 1: Asterisk PBX Integration (Tavsiya)

### **1. Asterisk Installation (Remote Server)**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install asterisk asterisk-core-sounds-en

# Start Asterisk
sudo systemctl start asterisk
sudo systemctl enable asterisk
```

### **2. Asterisk Configuration**

**/etc/asterisk/extensions.conf:**

```ini
[outbound-calls]
; Avtomatik qo'ng'iroq qilish
exten => _X.,1,NoOp(Calling ${EXTEN})
same => n,Set(TIMEOUT(absolute)=60)
same => n,Dial(SIP/${EXTEN}@your-sip-provider,30,tTkK)
same => n,NoOp(Dial Status: ${DIALSTATUS})
same => n,GotoIf($["${DIALSTATUS}" = "ANSWER"]?answered)
same => n,GotoIf($["${DIALSTATUS}" = "BUSY"]?busy)
same => n,GotoIf($["${DIALSTATUS}" = "NOANSWER"]?noanswer)
same => n,GotoIf($["${DIALSTATUS}" = "CHANUNAVAIL"]?failed)
same => n,Goto(failed)

same => n(answered),NoOp(Call Answered)
same => n,System(curl -X POST http://YOUR_BACKEND:3000/calls/result -H "Content-Type: application/json" -d '{"sessionId":"${SESSION_ID}","phoneNumber":"${EXTEN}","callStatus":"ANSWERED","callDuration":"${CDR(duration)}"}')
same => n,Hangup()

same => n(busy),NoOp(Call Busy)
same => n,System(curl -X POST http://YOUR_BACKEND:3000/calls/result -H "Content-Type: application/json" -d '{"sessionId":"${SESSION_ID}","phoneNumber":"${EXTEN}","callStatus":"BUSY"}')
same => n,Hangup()

same => n(noanswer),NoOp(No Answer)
same => n,System(curl -X POST http://YOUR_BACKEND:3000/calls/result -H "Content-Type: application/json" -d '{"sessionId":"${SESSION_ID}","phoneNumber":"${EXTEN}","callStatus":"NO_ANSWER"}')
same => n,Hangup()

same => n(failed),NoOp(Call Failed)
same => n,System(curl -X POST http://YOUR_BACKEND:3000/calls/result -H "Content-Type: application/json" -d '{"sessionId":"${SESSION_ID}","phoneNumber":"${EXTEN}","callStatus":"FAILED"}')
same => n,Hangup()
```

### **3. Python Auto Dialer (Remote Server)**

**/usr/src/call/dialer.py:**

```python
#!/usr/bin/env python3
import time
import requests
from asterisk.ami import AMI, SimpleAction

# Asterisk AMI credentials
AMI_HOST = '127.0.0.1'
AMI_PORT = 5038
AMI_USER = 'admin'
AMI_PASS = 'secret'

# Backend URL
BACKEND_URL = 'http://YOUR_BACKEND:3000'

class AutoDialer:
    def __init__(self, session_id):
        self.session_id = session_id
        self.ami = AMI(address=(AMI_HOST, AMI_PORT), username=AMI_USER, secret=AMI_PASS)
        self.ami.connect()

    def originate_call(self, phone_number):
        """
        Real telefon qo'ng'iroq qilish
        """
        print(f"📞 Calling {phone_number}...")

        action = SimpleAction(
            'Originate',
            Channel=f'SIP/{phone_number}@your-sip-provider',
            Context='outbound-calls',
            Exten=phone_number,
            Priority=1,
            Timeout=30000,  # 30 seconds
            CallerID=f'AutoDialer <{phone_number}>',
            Variable=f'SESSION_ID={self.session_id}'
        )

        try:
            response = self.ami.send_action(action)

            if response.success:
                print(f"✅ Call initiated: {phone_number}")
                return True
            else:
                print(f"❌ Call failed: {phone_number} - {response.message}")
                self.report_failed(phone_number)
                return False

        except Exception as e:
            print(f"❌ Error: {e}")
            self.report_failed(phone_number)
            return False

    def report_failed(self, phone_number):
        """Report immediate failure to backend"""
        try:
            requests.post(f'{BACKEND_URL}/calls/result', json={
                'sessionId': self.session_id,
                'phoneNumber': phone_number,
                'callStatus': 'NETWORK_ERROR'
            })
        except Exception as e:
            print(f"Failed to report: {e}")

    def dial_from_file(self, numbers_file='/usr/src/call/numbers.txt'):
        """
        numbers.txt dan raqamlarni o'qib, har biriga qo'ng'iroq qilish
        """
        with open(numbers_file, 'r') as f:
            numbers = [line.strip() for line in f if line.strip()]

        print(f"📋 Total numbers: {len(numbers)}")

        for phone_number in numbers:
            self.originate_call(phone_number)
            time.sleep(2)  # 2 soniya kutish har qo'ng'iroq orasida

        print("✅ All calls completed")

    def close(self):
        self.ami.disconnect()


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 dialer.py <session_id>")
        sys.exit(1)

    session_id = sys.argv[1]
    dialer = AutoDialer(session_id)

    try:
        dialer.dial_from_file()
    finally:
        dialer.close()
```

### **4. Flask Endpoint (Remote Server)**

**/usr/src/call/server.py:**

```python
#!/usr/bin/env python3
from flask import Flask, request, jsonify
import subprocess
import threading
import json

app = Flask(__name__)

current_session_id = None
dialer_process = None

@app.route('/start', methods=['GET', 'POST'])
def start_dialer():
    """
    Backend bu endpointni trigger qiladi
    """
    global current_session_id, dialer_process

    # Session ID ni request dan olish yoki environment dan
    session_id = request.args.get('session_id') or request.json.get('sessionId') if request.is_json else None

    if not session_id:
        return jsonify({
            'status': 'error',
            'message': 'session_id required'
        }), 400

    # Agar dialer allaqachon ishlayotgan bo'lsa
    if dialer_process and dialer_process.poll() is None:
        return jsonify({
            'status': 'ok',
            'message': 'Dialer already running'
        })

    # Yangi dialer jarayonini boshlash
    current_session_id = session_id

    def run_dialer():
        global dialer_process
        dialer_process = subprocess.Popen([
            'python3',
            '/usr/src/call/dialer.py',
            session_id
        ])
        dialer_process.wait()

    thread = threading.Thread(target=run_dialer)
    thread.start()

    return jsonify({
        'status': 'ok',
        'message': 'Dialer started',
        'sessionId': session_id
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Dialer statusini tekshirish"""
    global dialer_process

    if dialer_process is None:
        status = 'idle'
    elif dialer_process.poll() is None:
        status = 'running'
    else:
        status = 'completed'

    return jsonify({
        'status': status,
        'sessionId': current_session_id
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000)
```

---

## Variant 2: FreeSWITCH Integration

### **1. FreeSWITCH Installation**

```bash
# Ubuntu 20.04/22.04
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fsstretch-archive-keyring.asc | apt-key add -
echo "deb https://files.freeswitch.org/repo/deb/debian-release/ buster main" > /etc/apt/sources.list.d/freeswitch.list
apt update
apt install freeswitch-meta-all
```

### **2. Python ESL (Event Socket Library)**

```python
#!/usr/bin/env python3
import ESL
import time
import requests

BACKEND_URL = 'http://YOUR_BACKEND:3000'

class FreeSWITCHDialer:
    def __init__(self, session_id):
        self.session_id = session_id
        self.con = ESL.ESLconnection('127.0.0.1', '8021', 'ClueCon')

        if not self.con.connected():
            raise Exception("Cannot connect to FreeSWITCH")

    def originate_call(self, phone_number):
        """Real telefon qo'ng'iroq"""
        print(f"📞 Calling {phone_number}...")

        # Originate command
        cmd = f"originate {{origination_caller_id_number={phone_number}}}sofia/gateway/your-gateway/{phone_number} &park"

        e = self.con.api('originate', cmd)

        if e:
            result = e.getBody()
            print(f"Result: {result}")

            # Listen for events
            self.listen_for_result(phone_number)

    def listen_for_result(self, phone_number):
        """
        FreeSWITCH event larni eshitish va natijani aniqlash
        """
        # Subscribe to channel events
        self.con.events("plain", "CHANNEL_HANGUP CHANNEL_ANSWER")

        timeout = time.time() + 60  # 60 seconds timeout

        while time.time() < timeout:
            e = self.con.recvEvent()

            if e:
                event_name = e.getHeader("Event-Name")
                call_number = e.getHeader("Caller-Destination-Number")

                if call_number == phone_number:
                    if event_name == "CHANNEL_ANSWER":
                        # Telefon ko'tarildi
                        duration = e.getHeader("variable_duration")
                        self.report_result(phone_number, "ANSWERED", duration)
                        return

                    elif event_name == "CHANNEL_HANGUP":
                        hangup_cause = e.getHeader("Hangup-Cause")

                        if hangup_cause == "NORMAL_CLEARING":
                            self.report_result(phone_number, "ANSWERED")
                        elif hangup_cause == "NO_ANSWER":
                            self.report_result(phone_number, "NO_ANSWER")
                        elif hangup_cause == "USER_BUSY":
                            self.report_result(phone_number, "BUSY")
                        elif hangup_cause == "CALL_REJECTED":
                            self.report_result(phone_number, "REJECTED")
                        else:
                            self.report_result(phone_number, "FAILED")
                        return

    def report_result(self, phone_number, status, duration=None):
        """Natijani backendga yuborish"""
        data = {
            'sessionId': self.session_id,
            'phoneNumber': phone_number,
            'callStatus': status,
            'callDuration': int(duration) if duration else None
        }

        try:
            response = requests.post(f'{BACKEND_URL}/calls/result', json=data)
            print(f"✅ Reported: {phone_number} - {status}")
        except Exception as e:
            print(f"❌ Failed to report: {e}")

    def dial_from_file(self, numbers_file='/usr/src/call/numbers.txt'):
        with open(numbers_file, 'r') as f:
            numbers = [line.strip() for line in f if line.strip()]

        for phone_number in numbers:
            self.originate_call(phone_number)
            time.sleep(3)

if __name__ == '__main__':
    import sys
    session_id = sys.argv[1]
    dialer = FreeSWITCHDialer(session_id)
    dialer.dial_from_file()
```

---

## Variant 3: Cloud Telephony API (Sipuni, Twilio, Plivo)

### **Sipuni API Integration**

```python
#!/usr/bin/env python3
import requests
import time

SIPUNI_API_URL = 'https://sipuni.com/api'
SIPUNI_API_KEY = 'your_api_key'
SIPUNI_USER_ID = '064629'
BACKEND_URL = 'http://YOUR_BACKEND:3000'

class SipuniDialer:
    def __init__(self, session_id):
        self.session_id = session_id

    def make_call(self, phone_number):
        """
        Sipuni orqali real qo'ng'iroq qilish
        """
        print(f"📞 Calling {phone_number} via Sipuni...")

        url = f'{SIPUNI_API_URL}/call'

        payload = {
            'user': SIPUNI_USER_ID,
            'number': phone_number,
            'from': 'your_sipuni_number',
            'apiKey': SIPUNI_API_KEY
        }

        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()

            result = response.json()
            call_id = result.get('callId')

            if call_id:
                # Wait and check call status
                time.sleep(5)
                self.check_call_status(call_id, phone_number)
            else:
                self.report_result(phone_number, 'FAILED')

        except Exception as e:
            print(f"❌ Error: {e}")
            self.report_result(phone_number, 'NETWORK_ERROR')

    def check_call_status(self, call_id, phone_number):
        """
        Qo'ng'iroq statusini tekshirish
        """
        url = f'{SIPUNI_API_URL}/call/{call_id}'

        try:
            response = requests.get(url, params={'apiKey': SIPUNI_API_KEY})
            data = response.json()

            status = data.get('status')
            duration = data.get('duration', 0)

            # Map Sipuni status to our status
            if status == 'ANSWERED':
                call_status = 'ANSWERED'
            elif status == 'NO_ANSWER':
                call_status = 'NO_ANSWER'
            elif status == 'BUSY':
                call_status = 'BUSY'
            else:
                call_status = 'FAILED'

            self.report_result(phone_number, call_status, duration)

        except Exception as e:
            print(f"❌ Status check error: {e}")
            self.report_result(phone_number, 'FAILED')

    def report_result(self, phone_number, status, duration=None):
        """Backend ga natija yuborish"""
        data = {
            'sessionId': self.session_id,
            'phoneNumber': phone_number,
            'callStatus': status,
            'callDuration': duration
        }

        try:
            requests.post(f'{BACKEND_URL}/calls/result', json=data)
            print(f"✅ Reported: {phone_number} - {status}")
        except Exception as e:
            print(f"❌ Report error: {e}")

    def dial_from_file(self, numbers_file='/usr/src/call/numbers.txt'):
        with open(numbers_file, 'r') as f:
            numbers = [line.strip() for line in f if line.strip()]

        for phone_number in numbers:
            self.make_call(phone_number)
            time.sleep(2)

if __name__ == '__main__':
    import sys
    session_id = sys.argv[1]
    dialer = SipuniDialer(session_id)
    dialer.dial_from_file()
```

---

## Backend Integration (Session ID ni Remote Serverga Yuborish)

### **O'zgartirish: call.service.ts**

```typescript
async startProcess(): Promise<any> {
  // ... SSH connection code ...

  // Session ID ni remote commandga qo'shish
  const command = `${REMOTE_COMMAND}?session_id=${session.sessionId}`;

  const result: any = await this.sshRunCommand({
    host: REMOTE_HOST,
    port: REMOTE_PORT,
    username: REMOTE_USER,
    privateKey: PRIVATE_KEY,
    command: command, // curl http://127.0.0.1:3000/start?session_id=session-123
  });

  // ...
}
```

---

## Remote Server Setup Summary

### **1. VoIP Sistema O'rnatish:**
```bash
# Asterisk yoki FreeSWITCH
sudo apt install asterisk
```

### **2. Python Dialer O'rnatish:**
```bash
cd /usr/src/call
pip3 install flask requests asterisk-ami
```

### **3. Flask Server Ishga Tushirish:**
```bash
python3 /usr/src/call/server.py &
```

### **4. Test:**
```bash
# Backend dan trigger
curl "http://193.149.16.138:3000/start?session_id=session-test-123"

# Dialer avtomatik:
# 1. numbers.txt ni o'qiydi
# 2. Har bir raqamga REAL telefon qo'ng'iroq qiladi
# 3. Natijani (ANSWERED/NO_ANSWER/BUSY/FAILED) backendga yuboradi
```

---

## Xulosa

**Haqiqiy telefon qo'ng'iroqlari uchun kerak:**

1. ✅ **VoIP PBX** - Asterisk yoki FreeSWITCH
2. ✅ **SIP Provider** - Telefon qo'ng'iroqlar uchun
3. ✅ **Auto Dialer** - Python script
4. ✅ **Webhook** - Natijalarni backendga yuborish (kerak!)

**Webhook kerak** chunki:
- Remote server **real** qo'ng'iroq qiladi
- Natijani oladi
- Backendga **avtomatik** yuboradi
- Qo'lda kiritish YO'Q!

**Barchasi avtomatik ishlaydi!** 🎉
