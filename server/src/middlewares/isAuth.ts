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
  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies.jwtoken;
  
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized: token missing',
    });
  }

  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    const decoded = jwt.verify(token, PRIVATE_KEY);
    req.token = token;
    req.user = decoded;
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
