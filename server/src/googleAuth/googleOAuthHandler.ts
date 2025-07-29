import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/userSchema';
import { getGoogleUser } from './googleOAuth';
import { getGoogleOAuthToken } from './googleOAuth';

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    const code = req.query.code;

    if (typeof code !== 'string') {
      return res.status(400).send('Invalid or missing code');
    }

    const { id_token, access_token } = await getGoogleOAuthToken({ code });
    const googleUser: any = await getGoogleUser({ id_token, access_token });

    let user: any = await User.findOne({ email: googleUser.email });

    // if no user then save user to db
    if (!user) {
      // Temporarily comment out email verification for testing
      // if (!googleUser.verified_email) {
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
    }

    createAndSendToken(user, res);
  } catch (error) {
    console.error('Google OAuth Error:', error);
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

  // Always redirect to OAuth page with token in URL for frontend to handle
  const redirectUrl = `${process.env.CLIENT_DOMAIN}/oauth?token=${accessToken}`;
  return res.redirect(redirectUrl);
};
