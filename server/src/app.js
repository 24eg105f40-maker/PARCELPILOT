// server/src/app.js
import express from 'express';
import cors from 'cors';
import { getConnectionStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ── Separate route handlers for dashboard/activity/reports ───────────────────
import {
  getDashboardStats,
  getActivity,
  getReports,
} from './controllers/shipmentController.js';
import { protect, requireStaff } from './middleware/authMiddleware.js';

const app = express();

// ── Security & parsing ───────────────────────────────────────────────────────
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(u => u.trim().replace(/\/$/, ''));

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.includes('*') ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.includes('vercel.app') ||
      normalizedOrigin.includes('localhost') ||
      normalizedOrigin.includes('127.0.0.1')
    ) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed.`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Health check (available at /api/health and /health) ───────────────────────
const healthCheck = (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ParcelPilot API',
    database: getConnectionStatus(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);

// ── Routes (mounted on both /api and root for flexibility) ───────────────────
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/shipments', shipmentRoutes);
app.use('/shipments', shipmentRoutes);

// Dashboard / activity / reports
app.get('/api/dashboard/stats', protect, requireStaff, getDashboardStats);
app.get('/dashboard/stats', protect, requireStaff, getDashboardStats);

app.get('/api/activity', protect, requireStaff, getActivity);
app.get('/activity', protect, requireStaff, getActivity);

app.get('/api/reports/shipments', protect, requireStaff, getReports);
app.get('/reports/shipments', protect, requireStaff, getReports);

// ── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
