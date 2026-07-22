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

    // M-5 FIX: Removed `pathname` from the dependency array. Previously, every
    // client-side navigation triggered a /validate network request. Now we only
    // validate once on mount (or when auth state is unknown).
    useEffect(() => {
      getReq()
        .then((data) => {
          dispatch(validateUser(data));
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error validating:', error);
          setLoading(false);
        });
    }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
      return <Loader />;
    }

    if (!isSignedIn && !isPublicPage) {
      router.push('/signin');
      // L-5 FIX: Return null instead of <Loader /> during a redirect so there
      // is no flash of the loading spinner during the transition animation.
      return null;
    }

    return <Component {...props} isAuthenticated={isSignedIn} />;
  };

  return Inner;
};

export default WithAuth;
