# Workout-Planner

# 🏋️‍♂️ Workout Planner

Workout Planner adalah backend aplikasi kebugaran berbasis Node.js yang membantu pengguna membuat rencana latihan yang personal, aman, dan efisien. Proyek ini menggunakan berbagai teknologi modern untuk autentikasi, validasi, integrasi AI, serta pengelolaan data yang aman dan terstruktur.

---

## 📦 Teknologi yang Digunakan

### ⚙️ Runtime & Server
- **express**: Framework web ringan untuk membangun REST API.
- **compression**: Middleware untuk mengompresi respons HTTP.
- **cors**: Mengizinkan permintaan lintas domain (CORS).
- **helmet**: Menambahkan lapisan keamanan HTTP headers.
- **morgan**: Logging HTTP request ke console atau file.
- **pm2**: Process manager untuk menjalankan aplikasi di production.

---

### 🔐 Autentikasi & Keamanan
- **passport & passport-jwt**: Autentikasi berbasis token JWT.
- **jsonwebtoken**: Membuat dan memverifikasi token JWT.
- **bcryptjs**: Enkripsi dan verifikasi password.
- **express-rate-limit**: Membatasi request untuk mencegah brute-force attack.
- **express-xss-sanitizer**: Melindungi dari serangan XSS.
- **joi**: Validasi skema data input.
- **dotenv**: Mengelola variabel lingkungan dari file `.env`.

---

### 🤖 Integrasi AI
- **@google/generative-ai**: Akses ke model AI generatif dari Google.
- **groq-sdk**: SDK untuk menggunakan model AI ultra-cepat dari Groq.

---

### 💾 Database & ORM
- **@prisma/client**: Client ORM untuk query ke database.
- **prisma**: ORM modern untuk mendefinisikan skema database dan migrasi.

---

### 📤 Komunikasi & Email
- **axios**: HTTP client untuk memanggil API eksternal.
- **nodemailer**: Untuk mengirim email seperti verifikasi akun atau reset password.

---

### 📅 Utilitas
- **moment**: Format dan manipulasi tanggal/waktu.
- **http-status**: Kumpulan kode status HTTP dalam bentuk readable.
- **winston**: Logger fleksibel untuk aplikasi Node.js.

---

## 🧪 Pengujian
- **node-mocks-http**: Untuk membuat objek request dan response palsu.
- **faker**: Generate data palsu untuk keperluan testing.

---

## 🧹 Linting & Formatting
- **eslint**: Menjaga kualitas dan konsistensi kode JavaScript.
- **eslint-plugin-prettier** & **eslint-config-prettier**: Integrasi Prettier dengan ESLint.
- **eslint-plugin-jest**: Plugin linting khusus file pengujian.
- **eslint-plugin-security**: Deteksi potensi celah keamanan.
- **prettier**: Format otomatis untuk menjaga gaya penulisan konsisten.
- **lint-staged**: Menjalankan lint hanya pada file yang dimodifikasi.
---

## 🚀 Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Menjalankan server development dengan `nodemon`. |
| `npm start` | Menjalankan server production dengan `pm2`. |
| `npm run vercel-build` | Generate Prisma Client saat deploy ke Vercel. |
| `npm run lint` | Menjalankan linting kode. |
| `npm run lint:fix` | Memperbaiki masalah linting secara otomatis. |
| `npm run prettier` | Mengecek format kode. |
| `npm run prettier:fix` | Memformat ulang kode secara otomatis. |
| `npm run lint-staged` | Menjalankan lint untuk file yang akan di-commit. |

---
