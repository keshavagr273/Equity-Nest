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
    const urlParams = new URLSearchParams(window.location.search);
    const token: string | null = urlParams.get('token');
    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      // Store token in localStorage for cross-origin requests
      localStorage.setItem('jwt', token);
      
      try {
        dispatch(oauthLogin({ token }));
        router.push('/');
      } catch (error) {
        console.error('Error during OAuth login:', error);
        router.push('/signin');
      }
    } else {
      router.push('/signin');
    }
  }, [token, dispatch, router]);

  return <Loader />;
}

export default GoogleOAuth;
