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
    console.log('🚀 Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('🚀 Google Redirect URI:', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ? 'Set' : 'Not set');
    
    const urlParams = new URLSearchParams(window.location.search);
    const token: string | null = urlParams.get('token');
    
    console.log('🚀 URL Search Params:', window.location.search);
    console.log('🚀 Token from URL:', token ? 'Found' : 'Not found');
    if (token) {
      console.log('🚀 Token length:', token.length);
      console.log('🚀 Token preview:', token.substring(0, 50) + '...');
    }
    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('🚀 Setting cookie and redirecting...');
      console.log('🚀 Token received:', token ? 'Yes' : 'No');
      
      // Set cookie with proper domain settings for deployment
      const cookieOptions = {
        maxAge: 36000,
        path: '/',
        secure: true,
        sameSite: 'none' as const,
      };
      
      // Set cookie without domain specification to let browser handle it
      document.cookie = `jwtoken=${token}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}`;
      
      console.log('🚀 Cookie set, dispatching oauthLogin...');
      console.log('🚀 Dispatching with token:', token.substring(0, 20) + '...');
      
      try {
        dispatch(oauthLogin({ token }));
        console.log('🚀 oauthLogin dispatched successfully');
      } catch (error) {
        console.error('🚀 Error dispatching oauthLogin:', error);
      }
      
      console.log('🚀 Redirecting to home...');
      try {
        router.push('/');
        console.log('🚀 Router push called');
      } catch (error) {
        console.error('🚀 Error with router push:', error);
      }
    } else {
      console.log('🚀 No token found, redirecting to login...');
      router.push('/signin');
    }
  }, [token, dispatch, router]);

  return <Loader />;
}

export default GoogleOAuth;
