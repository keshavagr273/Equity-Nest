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

    const dispatch = useDispatch<any>();

    useEffect(() => {
      getReq().then((data) => {
        dispatch(validateUser(data));
        setLoading(false);
      }).catch((error) => {
        console.error('Error validating:', error);
        setLoading(false);
      });
    }, [dispatch, pathname]);

    if (loading) {
      return <Loader />;
    }

    return <Component {...props} isAuthenticated={isSignedIn} />;
  };

  return Inner;
};

export default WithAuth;
