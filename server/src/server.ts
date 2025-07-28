import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './lib/mongodb';
import connectSocket from './lib/socketio';

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Log environment variables to verify .env is being read
console.log('Environment variables loaded:');
// console.log('PORT:', process.env.PORT);
console.log('DB:', process.env.DB ? 'Set' : 'Not set');
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

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
