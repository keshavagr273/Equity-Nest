'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import Loader from '../components/Loader';
import { oauthLogin } from '@/lib/redux/slices/authSlice';

function GoogleOAuth() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const dispatch: any = useDispatch();

  useEffect(() => {
    console.log('🚀 OAuth page loaded');
    console.log('🚀 Current URL:', window.location.href);
    console.log('🚀 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    
    const token: string | null = new URLSearchParams(
      window.location.search
    ).get('token');

    console.log('🚀 Token from URL:', token ? 'Found' : 'Not found');
    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('🚀 Setting cookie and redirecting...');
      // Set cookie with proper domain settings for deployment
      const cookieOptions = {
        maxAge: 36000,
        path: '/',
        secure: true,
        sameSite: 'none' as const,
      };
      
      document.cookie = `jwtoken=${token}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}`;
      
      console.log('🚀 Cookie set, dispatching oauthLogin...');
      dispatch(oauthLogin({ token }));
      
      console.log('🚀 Redirecting to home...');
      router.push('/');
    } else {
      console.log('🚀 No token found, redirecting to login...');
      router.push('/signin');
    }
  }, [token, dispatch, router]);

  return <Loader />;
}

export default GoogleOAuth;
