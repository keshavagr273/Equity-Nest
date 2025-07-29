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
    
    const token: string | null = new URLSearchParams(
      window.location.search
    ).get('token');

    console.log('🚀 Token from URL:', token ? 'Found' : 'Not found');
    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('🚀 Setting cookie and redirecting...');
      document.cookie = `jwtoken=${token}; max-age=36000; path=/`;
      dispatch(oauthLogin({ token }));
      router.push('/');
    } else {
      console.log('🚀 No token found, redirecting to login...');
      router.push('/signin');
    }
  }, [token, dispatch, router]);

  return <Loader />;
}

export default GoogleOAuth;
