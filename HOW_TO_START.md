# 🚀 How to Start Pathik

Bhai, app ko start karna bohot easy hai. Maine do tarike setup kiye hain:

### Tarika 1: Auto Start (Recommended)
Root folder (`Pathik`) mein ek script hai jo backend aur mobile app dono ko alag-alag terminal windows mein start kar degi.

Bas terminal mein ye command chalao:
```bash
bash start.sh
```

---

### Tarika 2: Manual Start (Alag-alag)

Agar aap manually start karna chahte hain to do alag terminal windows kholiye:

**Terminal 1 (Backend):**
```bash
cd pathik-backend
npm run start:dev
```
*Backend runs on: http://localhost:3000*

**Terminal 2 (Mobile App):**
```bash
cd pathik-mobile
npm start
```
*QR code scan karke **Expo Go** app mein check karein.*

---

### 🌐 Website
Landing page dekhne ke liye:
```bash
open pathik-website/index.html
```

---

### 🧪 Test Credentials (Khalti Sandbox)
Agar payment test karna ho:
- **Phone:** 9800000000
- **MPIN:** 1111
- **OTP:** 987654
