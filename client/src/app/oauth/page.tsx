'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Loader from '../components/Loader';

function GoogleOAuth() {
  const router = useRouter();

  useEffect(() => {
    // The backend now sets an HttpOnly cookie and redirects here (or directly to home).
    // We just need to redirect to home. WithAuth will handle the validation.
    router.push('/');
  }, [router]);

  return <Loader />;
}

export default GoogleOAuth;
