import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './lib/mongodb';
import connectSocket from './lib/socketio';
import { startSessionMonitoring } from './util/sessionMonitoring';

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// H-5 FIX: Removed the full environment variable dump that printed on every
// startup. Logging which variables are present is fine for development, but
// sensitive variable names should not be enumerated in production logs.
// Use a proper health-check endpoint (/api/ping) to verify server state.
if (process.env.NODE_ENV !== 'production') {
  const missing = ['DB', 'PRIVATE_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
                   'GOOGLE_REDIRECT_URI', 'CLIENT_DOMAIN'].filter(
    (k) => !process.env[k]
  );
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
  }
}

(async () => {
  try {
    await connectDB();
    await connectSocket(server);

    // Start session monitoring and scheduled jobs
    startSessionMonitoring();

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
