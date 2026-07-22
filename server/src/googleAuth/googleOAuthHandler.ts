import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

import User from '../models/userSchema';
// L-1 FIX: Combined duplicate imports from same module into a single statement.
import { getGoogleUser, getGoogleOAuthToken, GoogleUserProfile } from './googleOAuth';
import { SessionReliabilityTracker } from '../util/sessionMetrics';

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    const code = req.query.code;

    if (typeof code !== 'string') {
      return res.status(400).send('Invalid or missing code');
    }

    const { id_token, access_token } = await getGoogleOAuthToken({ code });
    const googleUser: GoogleUserProfile = await getGoogleUser({ id_token, access_token });

    // M-3 FIX: Moved email verification check BEFORE the DB lookup so it applies
    // to both new and existing users (previously only checked for new users).
    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified');
    }

    let user = await User.findOne({ email: googleUser.email });

    // If no user then save user to db
    if (!user) {
      const picture = googleUser.picture.replace('=s96-c', '=s512-c');

      const randomPassword = randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        picture: picture,
        password: hashedPassword,
      });

      await user.save();
    }

    createAndSendToken(user, res, req);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return res.redirect(`${process.env.CLIENT_DOMAIN}/signin`);
  }
};

// Create JWT TOKEN
const createAndSendToken = async (user: any, res: Response, req: Request) => {
  const sessionId = randomBytes(16).toString('hex');
  const accessToken = jwt.sign(
    { _id: user._id, username: user.email, sessionId },
    process.env.PRIVATE_KEY as string,
    {
      expiresIn: '12h',
    }
  );

  // Track session start
  const tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
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

  const redirectUrl = `${process.env.CLIENT_DOMAIN}/`;
  return res.redirect(redirectUrl);
};
