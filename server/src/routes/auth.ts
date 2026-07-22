import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signin,
  signup,
  logout,
  validateLogin,
  loginUpstox,
  redirectUpstox,
} from '../controllers/auth';
import isAuthenticate from '../middlewares/isAuth';
import { googleOAuthHandler } from '../googleAuth/googleOAuthHandler';

const router = Router();

// C-4 FIX: Rate limiter for authentication endpoints.
// Limits to 10 requests per IP per 15-minute window to prevent brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: 'Too many login attempts from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// H-5 FIX: Removed the debug middleware that was logging full request headers
// (including Authorization and Cookie values) to the console on every request.

router.get('/validate', isAuthenticate, validateLogin);

// C-4: rate-limited OAuth endpoint
router.get('/oauth/google', authLimiter, googleOAuthHandler);

router.get('/upstox', isAuthenticate, loginUpstox);

// H-2 FIX: Added isAuthenticate middleware to the Upstox redirect callback so
// only authenticated app users can trigger an Upstox token exchange.
router.get('/redirect', isAuthenticate, redirectUpstox);

// C-4: rate-limited login/signup endpoints
router.post('/signin', authLimiter, signin);
router.post('/signup', authLimiter, signup);

router.post('/logout', logout);

export default router;
