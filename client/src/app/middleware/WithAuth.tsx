'use client';
import { useState, useEffect, FC } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';

//* ************** Custom imports *************** *//
import { socket } from './socket';
import { getReq } from '../hooks/axiosapi';
import { validateUser } from '@/lib/redux/slices/authSlice';
import Loader from '../components/Loader';

//* ************** interface *************** *//
export interface WithAuthProps {
  isAuthenticated: boolean;
}
//* ************** *************** *//

const WithAuth = (
  Component: FC<WithAuthProps>,
  isPublicPage: boolean = false
): FC<WithAuthProps> => {
  const Inner: FC<WithAuthProps> = (props: WithAuthProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(pathname.startsWith('/chart/'));

    const { isSignedIn, status } = useSelector((state: any) => state.auth);
    // console.log('🚀 isSignedIn:', isSignedIn);

    const dispatch = useDispatch<any>();

    useEffect(() => {
      console.log('🚀 WithAuth: Checking authentication...');
      console.log('🚀 WithAuth: Current isSignedIn:', isSignedIn);
      console.log('🚀 WithAuth: Current status:', status);
      
      getReq().then((data) => {
        console.log('🚀 WithAuth: Validation response:', data);
        dispatch(validateUser(data));
        setLoading(false);
      });

      // Clean up by disconnecting the socket when the component unmounts
      return () => {
        socket.disconnect();
      };
    }, [dispatch, isPublicPage, isSignedIn, router]);

    if (loading) {
      return <Loader />;
    }

    return <Component {...props} isAuthenticated={isSignedIn} />;
  };

  return Inner;
};

export default WithAuth;
