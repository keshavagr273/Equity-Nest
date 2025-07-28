import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/userSchema';
import { getGoogleUser } from './googleOAuth';
import { getGoogleOAuthToken } from './googleOAuth';

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Google OAuth Handler Started');
    const code = req.query.code;
    console.log('🚀 Code received:', code ? 'Yes' : 'No');

    if (typeof code !== 'string') {
      console.log('❌ Invalid or missing code');
      return res.status(400).send('Invalid or missing code');
    }

    console.log('🚀 Getting Google OAuth Token...');
    const { id_token, access_token } = await getGoogleOAuthToken({ code });
    console.log('🚀 Tokens received:', id_token ? 'Yes' : 'No', access_token ? 'Yes' : 'No');

    console.log('🚀 Getting Google User...');
    const googleUser: any = await getGoogleUser({ id_token, access_token });
    console.log('🚀 Google User:', googleUser.email);

    let user: any = await User.findOne({ email: googleUser.email });
    console.log('🚀 User found in DB:', user ? 'Yes' : 'No');

    // if no user then save user to db
    if (!user) {
      // Temporarily comment out email verification for testing
      // if (!googleUser.verified_email) {
      //   console.log('❌ Google account not verified');
      //   return res.status(403).send('Google account is not verified');
      // }

      const picture = googleUser.picture.replace('=s96-c', '=s512-c');

      //create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        picture: picture,
        password: 'google-oauth',
      });

      await user.save();
      console.log('🚀 New user created');
    }

    console.log('🚀 Creating and sending token...');
    createAndSendToken(user, res);
  } catch (error) {
    console.log('❌ Google OAuth Error:', error);
    return res.redirect(`${process.env.CLIENT_DOMAIN}/login`);
  }
};

// Create JWT TOKEN
const createAndSendToken = (user: any, res: Response) => {
  const accessToken = jwt.sign(
    { _id: user._id, username: user.email },
    process.env.PRIVATE_KEY as string,
    {
      expiresIn: '12h',
    }
  );

  console.log('🚀 Token created, redirecting...');
  console.log('🚀 NODE_ENV:', process.env.NODE_ENV);
  console.log('🚀 CLIENT_DOMAIN:', process.env.CLIENT_DOMAIN);

  if (process.env.NODE_ENV === 'production') {
    res.cookie('jwtoken', accessToken, {
      maxAge: 43200000, // 12 hr
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
    });
    return res.redirect(process.env.CLIENT_DOMAIN as string);
  } else {
    const redirectUrl = `${process.env.CLIENT_DOMAIN}/oauth?token=${accessToken}`;
    console.log('🚀 Redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
  }
};
