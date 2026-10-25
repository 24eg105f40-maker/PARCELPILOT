// server/src/middleware/errorMiddleware.js

// 404 handler
export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
}

// Centralized error handler
export function errorHandler(err, req, res, _next) {
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `A record with this ${field} already exists.` });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for field: ${err.path}` });
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message || 'Something went wrong.';

  if (status === 500) {
    console.error('❌ Server Error:', err);
  }

  res.status(status).json({ message });
}
