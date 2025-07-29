import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './lib/mongodb';
import connectSocket from './lib/socketio';

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Debug: Check environment variables
console.log('🔍 Environment Variables Check:');
console.log('PORT:', process.env.PORT || 'Not set (using default 5000)');
console.log('DB:', process.env.DB ? 'Set' : 'Not set');
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Not set');
console.log('CLIENT_DOMAIN:', process.env.CLIENT_DOMAIN ? 'Set' : 'Not set');
console.log('COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('UPSTOX_API_KEY:', process.env.UPSTOX_API_KEY ? 'Set' : 'Not set');
console.log('UPSTOX_REDIRECT_URL:', process.env.UPSTOX_REDIRECT_URL ? 'Set' : 'Not set');
console.log('----------------------------------------');

(async () => {
  try {
    await connectDB();
    await connectSocket(server);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
  });
})();
