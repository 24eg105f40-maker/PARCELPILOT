// server/src/routes/shipmentRoutes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  listShipments, getShipment, trackShipment,
  createShipment, updateShipment, updateStatus, deleteShipment,
  getDashboardStats, getActivity, getReports,
} from '../controllers/shipmentController.js';
import { protect, requireStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

const trackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: { message: 'Too many tracking requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public tracking (no auth) ────────────────────────────────────────────────
router.get('/track/:trackingId', trackLimiter, trackShipment);

// ── Protected shipment CRUD ──────────────────────────────────────────────────
router.get('/', protect, requireStaff, listShipments);
router.get('/:id', protect, requireStaff, getShipment);
router.post('/', protect, requireStaff, createShipment);
router.patch('/:id', protect, requireStaff, updateShipment);
router.patch('/:id/status', protect, requireStaff, updateStatus);
router.delete('/:id', protect, requireAdmin, deleteShipment);

// ── Dashboard / reporting ────────────────────────────────────────────────────
router.get('/dashboard/stats', protect, requireStaff, getDashboardStats);
router.get('/activity/log', protect, requireStaff, getActivity);
router.get('/reports/data', protect, requireStaff, getReports);

export default router;
