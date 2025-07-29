import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import useRoutes from './routes';

const app = express();

app.use(helmet());
app.disable('x-powered-by');

const whiteList = [
  'http://localhost:3000',
  'https://equity-nest.vercel.app',
  'https://equitynest.vercel.app',
  'https://equity-nest.netlify.app',
  'https://equitynest.netlify.app',
  process.env.CLIENT_DOMAIN, // Dynamic client domain
].filter((origin): origin is string => Boolean(origin)); // Type guard to ensure only strings

const corsOption = {
  origin: whiteList,
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', useRoutes);

export default app;
