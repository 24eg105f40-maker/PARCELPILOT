// server/src/server.js
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { autoBootstrapIfEmpty } from './config/bootstrap.js';
import app from './app.js';

const PORT = parseInt(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    await autoBootstrapIfEmpty();
    app.listen(PORT, () => {
      console.log(`🚀 ParcelPilot API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
