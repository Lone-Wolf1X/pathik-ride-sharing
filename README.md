# 🚖 Pathik — Nepal's Premium Ride-Sharing App

> **"Pathik" (पथिक)** — A traveler on the path. Built for Nepal, by Nepal.

---

## 🚀 Quick Start (One Command)

```bash
bash start.sh
```

This opens **both** the backend and mobile app in separate terminal windows automatically.

---

## 📁 Project Structure

```
Pathik/
├── 📱 pathik-mobile/       React Native (Expo) — Android & iOS App
├── ⚙️  pathik-backend/      NestJS — REST API + WebSocket Server
├── 🌐 pathik-website/      Official Landing Page
├── start.sh                One-click launcher
└── README.md               This file
```

---

## 🛠️ Manual Start

### Step 1 — Backend (Terminal 1)
```bash
cd pathik-backend
npm run start:dev
```
✅ Server runs at → `http://localhost:3000`

### Step 2 — Mobile App (Terminal 2)
```bash
cd pathik-mobile
npm start
```
✅ Scan the QR code with **Expo Go** on your phone (Android / iOS)

### Step 3 — Website (optional)
```bash
open pathik-website/index.html
```

---

## 🧪 Testing Credentials

| Service | Detail |
|---|---|
| **PostgreSQL** | User: `postgres` / Password: `123` / DB: `pathik_db` |
| **Khalti Sandbox** | Phone: `9800000000` / MPIN: `1111` / OTP: `987654` |
| **API Base URL** | `http://localhost:3000` |

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/auth/login` | Phone number se login |
| PATCH | `/auth/role/:userId` | Customer ↔ Rider switch |
| POST | `/rides/request` | Nai ride request |
| PATCH | `/rides/start/:id` | Trip start karo |
| PATCH | `/rides/complete/:id` | Trip complete karo |
| POST | `/payments/initiate` | Khalti payment shuru karo |
| POST | `/payments/verify` | Payment verify karo |

---

## 🗺️ Tech Stack

| Layer | Technology |
|---|---|
| 📱 Mobile | React Native (Expo), Mapbox, Socket.io |
| ⚙️  Backend | NestJS, TypeORM, PostgreSQL |
| 🔌 Real-time | Socket.io WebSockets |
| 💳 Payment | Khalti (Sandbox + Production) |
| 🗺️  Maps | Mapbox (Offline Nepal Support) |

---

## 🎨 Brand

- **Primary Color**: `#FF8C00` (Light Orange)
- **Font**: System Default (Inter-inspired)
- **Theme**: "Pathik Sunrise" — warm, premium, Nepali

---

*Built with ❤️ for Nepal*
