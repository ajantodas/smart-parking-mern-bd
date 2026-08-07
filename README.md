# Smart Parking BD — MERN Stack Version

Ei project ta original static HTML/CSS/JS "Smart Parking BD" app ke full MERN stack
(MongoDB + Express + React + Node.js) e convert kore banano hoyeche. Real-time slot
sync er jonno Socket.io use kora hoyeche, authentication er jonno JWT + bcrypt.

## 📁 Folder Structure
```
smart-parking-mern/
  server/     -> Express + MongoDB backend (API + Socket.io)
  client/     -> React + Vite frontend
```

## ⚠️ Ja simulate kora hoyeche (guruttopurno)
- **Face liveness AI**: real camera on kore step-by-step (soja takano / hasha /
  matha ghurano) prompt dekhaya hoyeche, kintu eta kono real biometric AI model na —
  UI/UX simulation. Real system e deploy korar age face-api.js ba কোনো cloud
  Face Liveness API (AWS Rekognition, Azure Face) integrate korte hobe.
- **bKash / Nagad / Rocket / Upay payment**: eta demo merchant number e "send money"
  dekhano হয়, কোনো real payment gateway call hoy na. Real payment nite hole
  bKash/Nagad er official Merchant API লাগবে (business verification lagbe).
- **Card payment**: card details শুধু UI তে collect হয়, কোনো real card processor
  (Stripe/SSLCommerz) e connect kora hoyni.

Baki shob feature (auth, real-time slot booking/sync, admin dashboard, auto-expire,
QR ticket, CSV export) fully functional MongoDB er sathe.

---

## 🖥️ VS Code e First to Last Run Kora (Step by Step)

### ধাপ ০: Prerequisites install করুন (একবারই লাগবে)
1. **Node.js** (v18 বা তার উপরে) install করুন: https://nodejs.org (LTS version নিন)
   - Install হয়ে গেলে verify করুন:
     ```
     node -v
     npm -v
     ```
2. **VS Code** install করুন: https://code.visualstudio.com
3. **MongoDB Atlas** (free cloud database) account বানান: https://www.mongodb.com/cloud/atlas/register
   - একটা free (M0) cluster বানান
   - Database Access এ একটা user বানান (username/password মনে রাখবেন)
   - Network Access এ "Allow access from anywhere" (0.0.0.0/0) দিন — শুধু local dev এর জন্য
   - "Connect" → "Drivers" থেকে connection string কপি করুন
     (দেখতে এমন হবে: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`)

### ধাপ ১: Project ফোল্ডার VS Code এ খুলুন
1. Download করা zip file টা extract করুন (যেমন `Desktop\smart-parking-mern`)
2. VS Code খুলুন → File → Open Folder → `smart-parking-mern` ফোল্ডার সিলেক্ট করুন
3. VS Code এর উপরের মেনু থেকে Terminal → New Terminal খুলুন (২টা টার্মিনাল লাগবে —
   একটা backend এর জন্য, একটা frontend এর জন্য)

### ধাপ ২: Backend (server) সেটআপ করুন
Terminal ১ এ:
```bash
cd server
npm install
```
এরপর `server` ফোল্ডারের ভিতরে `.env.example` ফাইলটা কপি করে `.env` নামে নতুন ফাইল বানান
(VS Code এ right-click → Copy, তারপর Paste, তারপর rename করুন `.env`)।

`.env` ফাইলে এগুলো বসান:
```
PORT=5000
MONGO_URI=<আপনার MongoDB Atlas connection string, শেষে /smartParkingBD যোগ করুন>
JWT_SECRET=<যেকোনো লম্বা random string>
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```
উদাহরণ MONGO_URI:
```
mongodb+srv://myuser:mypass123@cluster0.abcde.mongodb.net/smartParkingBD?retryWrites=true&w=majority
```

এখন backend চালু করুন:
```bash
npm run dev
```
টার্মিনালে `✅ MongoDB connected` এবং `🚀 সার্ভার চলছে http://localhost:5000` দেখলে
বুঝবেন backend ঠিকমতো চলছে। প্রথমবার চালু হলে ১২টা parking slot অটোমেটিক তৈরি হবে।

### ধাপ ৩: Frontend (client) সেটআপ করুন
Terminal ২ (নতুন টার্মিনাল খুলুন, backend টার্মিনাল বন্ধ করবেন না) এ:
```bash
cd client
npm install
```
`client` ফোল্ডারে `.env.example` কপি করে `.env` বানান (একইভাবে), ভিতরে থাকবে:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
(লোকাল ডেভে ডিফল্ট ভ্যালু ঠিক আছে, কিছু পরিবর্তন লাগবে না)

এখন frontend চালু করুন:
```bash
npm run dev
```
টার্মিনালে একটা লোকাল লিংক দেখাবে, সাধারণত:
```
http://localhost:5173/
```
এই লিংকে ব্রাউজারে গিয়ে পুরো অ্যাপ দেখতে পাবেন।

### ধাপ ৪: টেস্ট করুন
- Register করে নতুন ইউজার বানান → Booking পেজে গিয়ে স্লট সিলেক্ট করুন
- Face verification স্টেপে ক্যামেরা পারমিশন দিন (ব্রাউজার popup আসবে)
- Payment method সিলেক্ট করে বুকিং কনফার্ম করুন
- দুইটা ব্রাউজার ট্যাব/ডিভাইস দিয়ে একসাথে খুলে দেখুন — একজন বুকিং করলে অন্যজনের
  Live Map/Home page এ রিয়েল-টাইমে স্লট আপডেট হবে (Socket.io দিয়ে)
- Admin পেজে যান, লগইন করুন `admin` / `admin123` দিয়ে (বা .env এ যা সেট করেছেন)

### সবসময় মনে রাখবেন
- দুইটা টার্মিনাল **একসাথে** চালু রাখতে হবে (server আর client) — যেকোনো একটা বন্ধ
  করলে অ্যাপ কাজ করবে না।
- Backend আগে চালু করবেন, তারপর frontend।
- `.env` ফাইল কখনো GitHub এ push করবেন না (এতে password/secret থাকে) —
  `.gitignore` তে এটা এমনিতেই বাদ দেওয়া আছে।

---

## 🔧 সাধারণ সমস্যা ও সমাধান (Troubleshooting)

| সমস্যা | সমাধান |
|---|---|
| `EADDRINUSE: port 5000 already in use` | আগের কোনো `node` process বন্ধ হয়নি। Terminal এ `npx kill-port 5000` চালান, অথবা `.env` এ PORT পরিবর্তন করুন |
| MongoDB connect হচ্ছে না (DNS error) | Atlas এর Network Access এ IP whitelist ঠিক আছে কিনা চেক করুন, বা কম্পিউটারের DNS 8.8.8.8 (Google DNS) এ সেট করুন |
| Frontend এ "Network Error" / booking হচ্ছে না | Backend সার্ভার চালু আছে কিনা চেক করুন, `client/.env` এ VITE_API_URL ঠিক আছে কিনা দেখুন |
| ক্যামেরা চালু হচ্ছে না | ব্রাউজার camera permission দিন; localhost এ HTTPS ছাড়াও camera কাজ করে |
| `npm install` এ error | Node.js version v18+ কিনা চেক করুন (`node -v`) |

---

## 📦 Tech Stack
- **Frontend**: React 18, Vite, React Router, Axios, Socket.io-client, qrcode.react
- **Backend**: Node.js, Express, Mongoose (MongoDB), Socket.io, JWT, bcryptjs
- **Database**: MongoDB Atlas (cloud)
