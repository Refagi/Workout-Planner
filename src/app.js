import express from 'express';
import config from './config/config.js';
import { successHandler, errorHandler } from './config/morgan.js';
import workoutLimiter from './middlewares/limiter.js';
import passport from 'passport';
import { errorConverter, errorHandleres } from './middlewares/error.js';
import { ApiError } from './utils/ApiError.js';
import { jwtStrategy } from './config/passport.js';
import router from './routes/index.js';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging middleware (hanya di non-test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(successHandler);
  app.use(errorHandler);
}

// enable cors
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Metode HTTP yang diizinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
  credentials: true // Izinkan pengiriman cookies atau header Authorization
};

app.use(cors('*'));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Pertimbangkan menghapus di produksi
          'https://cdn.jsdelivr.net',
          'https://code.jquery.com',
          'https://fonts.googleapis.com',
          'https://unpkg.com'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Pertimbangkan menghapus di produksi
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com'
        ],
        connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5500'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"]
      }
    }
  })
);

// Parse JSON dan URL-encoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());

// Gzip compression
app.use(compression());

// Sajikan file statis dari direktori public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', workoutLimiter);
  app.use('/v1/users', workoutLimiter);
  app.use('/v1/plans', workoutLimiter);
  app.use('/v1/goals', workoutLimiter);
}

// Rute untuk halaman auth
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(publicPath, 'auth.html'));
});

app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(publicPath, 'verifyEmail.html'));
});

// Rute API v1
app.use('/v1', router);

// Tangani error 404 untuk rute yang tidak ditemukan
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Convert error ke ApiError
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;
