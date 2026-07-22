import { Request, Response } from 'express';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// @ts-ignore
import * as UpstoxClient from 'upstox-js-sdk';
const defaultClient = UpstoxClient.ApiClient.instance;

import User from '../models/userSchema';
import { setAccessToken } from '../util/tokenStore';
import {
  signinValidationRules,
  signupValidationRules,
  validate,
} from '../middlewares/validators';
import { SessionReliabilityTracker } from '../util/sessionMetrics';

//* ************** Interface *************** *//
interface RequestBody {
  email: string;
  password: string;
}

interface UserRequest extends Request {
  user?: string;
}
//* ************** *************** *//

// First time user validation (to check user Signined/loggedIn or not)
export const validateLogin = async (req: UserRequest, res: Response) => {
  try {
    if (req.user) {
      const user = await User.findById((req.user as any)._id);
      if (!user) {
        return res.status(401).json({ isSignedIn: false, message: 'User not found' });
      }
      return res.status(200).json({
        isSignedIn: true,
        message: 'User is logged in.',
        _id: user._id,
        email: user.email,
        name: user.name,
      });
    } else {
      return res.status(401).json({
        isSignedIn: false,
        message: 'Unauthorized, please login',
      });
    }
  } catch (error) {
    console.error('ValidateLogin error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

//* ************** User SignIn *************** *//
export const signin = [
  ...signinValidationRules(),
  validate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body as RequestBody;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'No user found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const sessionId = randomBytes(16).toString('hex');
      const accessToken = jwt.sign(
        { _id: user._id, email: user.email, sessionId },
        process.env.PRIVATE_KEY as string,
        { expiresIn: '12h' }
      );

      // Track session start
      const tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000);
      await SessionReliabilityTracker.createSession(
        user._id.toString(),
        sessionId,
        tokenExpiration,
        req.ip,
        req.headers['user-agent']
      );

      res.cookie('jwtoken', accessToken, {
        maxAge: 43200000, // 12 hr
        httpOnly: true,
        path: '/',
        sameSite: 'none',
        secure: true,
      });

      // H-1 FIX: Token is delivered exclusively via HttpOnly cookie.
      // Removed `token` field from JSON body to prevent XSS-accessible localStorage storage.
      return res.status(200).json({
        message: 'Login Successful',
        isSignedIn: true,
        _id: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error during signin:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
];

//* ************** User Signup *************** *//
export const signup = [
  ...signupValidationRules(),
  validate,
  async (req: Request, res: Response) => {
    // M-2 FIX: Wrapped the entire function body in a single try/catch.
    // Previously, User.findOne() and bcrypt.hash() were outside the try block,
    // meaning database failures would throw unhandled exceptions.
    try {
      const { fullname, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(422).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        name: fullname,
        email: email,
        password: hashedPassword,
      });

      await newUser.save();

      const { id, name, email: userEmail } = newUser;

      const sessionId = randomBytes(16).toString('hex');
      const accessToken = jwt.sign(
        { _id: id, email: email, sessionId },
        process.env.PRIVATE_KEY as string,
        { expiresIn: '12h' }
      );

      // Track session start
      const tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000);
      await SessionReliabilityTracker.createSession(
        id.toString(),
        sessionId,
        tokenExpiration,
        req.ip,
        req.headers['user-agent']
      );

      res.cookie('jwtoken', accessToken, {
        maxAge: 43200000, // 12 hr
        httpOnly: true,
        path: '/',
        sameSite: 'none',
        secure: true,
      });

      // H-1 FIX: Token delivered via HttpOnly cookie only. Removed from JSON body.
      return res.status(200).json({
        message: 'Registration Successful',
        isSignedIn: true,
        _id: id,
        name: name,
        email: userEmail,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
];

// Handle User Logout
export const logout = async (req: any, res: Response) => {
  try {
    const token = req.cookies.jwtoken || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded: any = jwt.verify(token, process.env.PRIVATE_KEY as string);
      if (decoded.sessionId) {
        await SessionReliabilityTracker.endSession(decoded.sessionId, 'logout');
      }
    }
  } catch (error) {
    console.error('Error tracking logout:', error);
  }

  // Match cookie options from when it was set to ensure it clears correctly
  res.clearCookie('jwtoken', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
  });

  return res
    .status(200)
    .json({ isSignedIn: false, message: 'Sign out successfully' });
};

//* ************** UPSTOX AUTH *************** *//
export const loginUpstox = async (req: Request, res: Response) => {
  const loginUrl = `https://api-v2.upstox.com/login/authorization/dialog?response_type=code&client_id=${process.env.UPSTOX_API_KEY}&redirect_uri=${process.env.UPSTOX_REDIRECT_URL}`;
  res.redirect(loginUrl);
};

// Callback after successful Upstox login
export const redirectUpstox = async (req: Request, res: Response) => {
  // H-2 FIX: Validate that `code` is a non-empty string before using it.
  const code = req.query.code;
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const tokenData = {
    code,
    client_id: process.env.UPSTOX_API_KEY,
    client_secret: process.env.UPSTOX_API_SECRET,
    redirect_uri: process.env.UPSTOX_REDIRECT_URL,
    grant_type: 'authorization_code',
  };

  try {
    const response = await axios.post(
      'https://api-v2.upstox.com/login/authorization/token',
      tokenData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Api-Version': '2.0',
        },
      }
    );

    const accessToken = response.data.access_token;

    setAccessToken(accessToken);
    defaultClient.authentications['OAUTH2'].accessToken = accessToken;

    res.json({ message: 'Authenticated with Upstox successfully' });
  } catch (error) {
    console.error('Upstox token exchange error:', error);
    res.status(500).json({ error: 'Error getting Upstox access token' });
  }
};
