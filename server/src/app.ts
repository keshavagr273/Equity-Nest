import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import useRoutes from './routes';

const app = express();

app.use(helmet());
app.disable('x-powered-by');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('🚀 App Request:', req.method, req.path);
  console.log('🚀 App Request URL:', req.url);
  console.log('🚀 App Request Base URL:', req.baseUrl);
  next();
});

const whiteList = [
  'http://localhost:3000',
  'https://equity-nest.vercel.app',
  'https://equitynest.vercel.app',
  'https://equity-nest-mjil.vercel.app',
  process.env.CLIENT_DOMAIN, // Dynamic client domain
].filter((origin): origin is string => Boolean(origin)); // Type guard to ensure only strings

const corsOption = {
  origin: function (origin: string | undefined, callback: any) {
    console.log('🚀 CORS: Request from origin:', origin);
    console.log('🚀 CORS: Whitelist:', whiteList);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('🚀 CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    if (whiteList.indexOf(origin) !== -1) {
      console.log('🚀 CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('🚀 CORS: Blocking origin:', origin);
      console.log('🚀 CORS: Available origins:', whiteList);
      
      // For debugging, allow all origins temporarily
      if (process.env.NODE_ENV === 'production') {
        console.log('🚀 CORS: Temporarily allowing blocked origin for debugging');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
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

export default app;
