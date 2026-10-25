// server/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT, attach user to req
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Session expired or token invalid. Please log in again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Require admin role
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' });
  }
  next();
}

// Require admin or staff role
export function requireStaff(req, res, next) {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Staff or administrator access required.' });
  }
  next();
}
