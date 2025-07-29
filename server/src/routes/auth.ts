import { Router } from 'express';
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

// Debug middleware to log all auth requests
router.use((req, res, next) => {
  console.log('🚀 Auth Route:', req.method, req.path);
  console.log('🚀 Auth Route Headers:', req.headers);
  next();
});

router.get('/validate', isAuthenticate, validateLogin);

router.get('/oauth/google', googleOAuthHandler);

router.get('/upstox', loginUpstox);

router.get('/redirect', redirectUpstox);

router.post('/signin', signin);

router.post('/signup', signup);

router.post('/logout', logout);

export default router;
