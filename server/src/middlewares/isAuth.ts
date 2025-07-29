import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  token?: string;
  user?: any;
}

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const customLogger = (message: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message);
  }
};

const isAuthenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies.jwtoken;
  
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🚀 isAuth: Token from Authorization header');
  } else if (cookieToken) {
    token = cookieToken;
    console.log('🚀 isAuth: Token from cookie');
  }

  console.log('🚀 isAuth: Starting authentication check...');
  console.log('🚀 isAuth: Authorization header:', authHeader);
  console.log('🚀 isAuth: Cookies received:', req.cookies);
  console.log('🚀 isAuth: Token found:', token ? 'Yes' : 'No');
  if (token) {
    console.log('🚀 isAuth: Token length:', token.length);
    console.log('🚀 isAuth: Token preview:', token.substring(0, 50) + '...');
  }

  if (!token) {
    console.log('🚀 isAuth: No token found');
    if (process.env.NODE_ENV === 'production') {
      return res.end();
    }
    return res.status(401).json({ error: 'No Token, Authorization Failed' });
  }

  if (!PRIVATE_KEY) {
    console.log('🚀 isAuth: PRIVATE_KEY is not set.');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    console.log('🚀 isAuth: Verifying token...');
    const decoded = jwt.verify(token, PRIVATE_KEY);
    console.log('🚀 isAuth: Token verified successfully');
    console.log('🚀 isAuth: Decoded user:', decoded);
    
    req.token = token;
    req.user = decoded;
    next();
  } catch (error) {
    console.log('🚀 isAuth: Token verification failed');
    if (error instanceof jwt.TokenExpiredError) {
      console.log('🚀 isAuth: JWT Token Expired');
      return res
        .status(401)
        .json({ name: 'TokenExpiredError', message: 'jwt expired' });
    }

    console.log('🚀 isAuth: Error details:', error);
    res.status(401).json({
      message: 'Unauthorized: token invalid',
    });
  }
};

export default isAuthenticate;
