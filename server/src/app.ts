import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import useRoutes from './routes';

const app = express();

// Trust reverse proxy headers (Render, Vercel, Nginx) so express-rate-limit correctly gets client IPs
app.set('trust proxy', 1);

app.use(helmet());
app.disable('x-powered-by');

// Debug middleware removed for cleaner logs

const whiteList = [
  'http://localhost:3000',
  'https://equity-nest.vercel.app',
  'https://equitynest.vercel.app',
  'https://equity-nest-mjil.vercel.app',
  process.env.CLIENT_DOMAIN, // Dynamic client domain
].filter((origin): origin is string => Boolean(origin)); // Type guard to ensure only strings

const corsOption = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', useRoutes);

// Test endpoint to verify server is working
app.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

export default app;
