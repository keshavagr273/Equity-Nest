import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SessionReliabilityTracker } from '../util/sessionMetrics';

interface CustomRequest extends Request {
  token?: string;
  user?: any;
}

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const isAuthenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('🚀 isAuthenticate: Checking token...');
  
  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies.jwtoken;
  
  console.log('🚀 isAuthenticate: authHeader:', authHeader);
  console.log('🚀 isAuthenticate: cookieToken:', cookieToken);
  
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    console.log('🚀 isAuthenticate: No token found, continuing without auth');
    // Allow the request to continue without authentication
    // The controller will handle the logic for unauthenticated users
    return next();
  }

  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    const decoded = jwt.verify(token, PRIVATE_KEY);
    req.token = token;
    req.user = decoded;
    console.log('🚀 isAuthenticate: Token verified, user:', decoded);
    next();
  } catch (error) {
    console.log('🚀 isAuthenticate: Token verification failed:', error);
    
    // Track failed session if it has sessionId
    try {
      const decoded: any = jwt.decode(token);
      if (decoded?.sessionId) {
        await SessionReliabilityTracker.endSession(
          decoded.sessionId,
          'failed',
          error instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token'
        );
      }
    } catch (trackError) {
      console.log('Error tracking failed session:', trackError);
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ name: 'TokenExpiredError', message: 'jwt expired' });
    }

    res.status(401).json({
      message: 'Unauthorized: token invalid',
    });
  }
};

export default isAuthenticate;
