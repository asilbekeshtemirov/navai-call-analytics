# SSH Private Key Sozlash Yo'riqnomasi

## 1. Private Keyni Topish

### Windows:
```
C:\Users\<username>\.ssh\id_rsa
```

### Linux/Mac:
```
~/.ssh/id_rsa
```

**Agar keyi yo'q bo'lsa, yangi yarating:**
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

---

## 2. Public Keyni Remote Serverga Qo'shish

**Birinchi:** Public keyni ko'ring
```bash
# Windows PowerShell
cat $env:USERPROFILE\.ssh\id_rsa.pub

# Linux/Mac
cat ~/.ssh/id_rsa.pub
```

**Ikkinchi:** Remote serverga ulaning va authorized_keys ga qo'shing
```bash
ssh root@193.149.16.138

# Remote serverda:
mkdir -p ~/.ssh
echo "SIZNING_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

**Test qiling:**
```bash
ssh root@193.149.16.138
# Parol so'ramasligi kerak!
```

---

## 3. Private Keyni Base64 ga O'tkazish

**MUHIM:** Butun fayl (BEGIN va END bilan) encode qilinishi kerak!

### Windows PowerShell:
```powershell
# Butun faylni base64 ga o'tkaz
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.ssh\id_rsa"))
```

**Natija (misol):**
```
LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUJsd0FBQUFkemMyZ3RjbgpOaEFBQUFBd0VBQVFBQUFJRUF5TjZWMGFNb0JMWWZwbGQ1...
```

### Linux/Mac:
```bash
# Butun faylni base64 ga o'tkaz (yangi qatorlarsiz)
cat ~/.ssh/id_rsa | base64 -w 0
```

**Yoki (Mac):**
```bash
base64 -i ~/.ssh/id_rsa | tr -d '\n'
```

---

### ✅ To'g'ri - BEGIN/END bilan:
Private key fayli:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
-----END OPENSSH PRIVATE KEY-----
```

Bu butun mazmun base64 ga o'tkaziladi → `.env` ga qo'shiladi

### ❌ Noto'g'ri - Faqat o'rtadagi qism:
```
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
```

Bu **ishlamaydi**!

---

## 4. .env Fayliga Qo'shish

`.env` faylini oching va qo'shing:

```bash
PRIVATE_KEY_BASE64=LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUJsd0FBQUFkemMyZ3RjbgpOaEFBQUFBd0VBQVFBQUFJRUF5TjZWMGFNb0JMWWZwbGQ1...
```

### ✅ TO'G'RI Format:
```bash
PRIVATE_KEY_BASE64=LS0tLS1C...
```
- Qo'shtirnoq YO'Q
- Bitta uzun qator (2000+ belgi)
- Bo'sh joy YO'Q

### ❌ NOTO'G'RI Formatlar:
```bash
# Single quotes ishlatilsa - XATO!
PRIVATE_KEY_BASE64='LS0tLS1C...'

# Double quotes ishlatilsa - XATO!
PRIVATE_KEY_BASE64="LS0tLS1C..."

# Ko'p qatorga bo'linsa - XATO!
PRIVATE_KEY_BASE64=LS0tLS1C...
  ...qolgan qism...
```

---

## 5. Test Qilish

Backend serverini ishga tushiring:
```bash
npm run start:dev
```

**API ni test qiling:**
```bash
# Test upload
curl -X POST http://localhost:3000/calls/upload \
  -F "file=@numbers.xlsx"

# Test start
curl -X POST http://localhost:3000/calls/start
```

**Agar xato bo'lsa:**
- ✅ `SSH authentication failed` → Private key noto'g'ri yoki public key remote serverda yo'q
- ✅ `Connection refused` → SSH server ishlamayapti
- ✅ `PRIVATE_KEY_BASE64 is invalid` → Base64 format noto'g'ri

---

## 6. Xavfsizlik

### ⚠️ MUHIM:

1. **Private keyni hech qachon GitHub ga yuklmang!**

   `.gitignore` faylida:
   ```
   .env
   .env.local
   *.pem
   *.key
   id_rsa
   ```

2. **Faqat .env faylida saqlang**

3. **Production serverda environment variable ishlatilg:**
   ```bash
   export PRIVATE_KEY_BASE64="LS0tLS1CRU..."
   ```

4. **Parol bilan himoyalangan key ishlatilg (tavsiya):**
   ```bash
   ssh-keygen -t rsa -b 4096
   # Enter passphrase: [parolingiz]
   ```

---

## Troubleshooting

### Muammo 1: "Permission denied (publickey)"
**Yechim:**
```bash
# Remote serverda:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Muammo 2: "PRIVATE_KEY_BASE64 is invalid"
**Yechim:** Keyni qayta generate qiling:
```powershell
# Windows PowerShell
$key = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.ssh\id_rsa"))
$key | Set-Clipboard
Write-Host "Copied to clipboard!"
```

### Muammo 3: Key faylini topa olmayapman
**Yechim:**
```bash
# Barcha SSH keylarni ko'rish
ls -la ~/.ssh/

# Yangi key yaratish
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_navai
```

---

## Qo'shimcha: Multiple Keylar

Agar bir nechta SSH key ishlatmoqchi bo'lsangiz:

**.env:**
```bash
PRIVATE_KEY_BASE64=<base64 encoded key>
# Yoki fayl path:
# PRIVATE_KEY_PATH=/path/to/custom_key
```

---

## Yordam Kerakmi?

Agar muammo bo'lsa:
1. Backend loglarni ko'ring: `npm run start:dev`
2. SSH connection test qiling: `ssh -vvv root@193.149.16.138`
3. Private key formatini tekshiring: `file ~/.ssh/id_rsa`
