import rateLimit from 'express-rate-limit';

const workoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 10, // Maksimal 10 request per IP
  standardHeaders: true, // Kirim info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Jangan pakai `X-RateLimit-*` header
  message: {
    status: 429,
    error: 'Terlalu Banyak Permintaan',
    message: 'Tunggu sebentar sebelum mencoba lagi. Maksimal 10 permintaan per menit.'
  }
});

export default workoutLimiter;
