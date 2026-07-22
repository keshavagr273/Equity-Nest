'use client';
import React, { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
} from '@mui/material';
import { Person, TrendingUp } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '@/lib/redux/api/profileApi';
import { signout } from '@/lib/redux/slices/authSlice';

const settings = ['Sign out'];

const Navbar: FC = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { isSignedIn } = useSelector((state: any) => state.auth);

  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle user logout
  const userLogout = async () => {
    try {
      await logout('');

      // H-1 FIX: Removed localStorage.removeItem('jwt') — we no longer store
      // the token in localStorage. Cookie is cleared by the server.

      dispatch(signout({ isSignedIn: false }));
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    // L-4 FIX: Added role="navigation" and aria-label to AppBar for screen readers.
    <AppBar
      component="nav"
      role="navigation"
      aria-label="Main navigation"
      position='fixed'
      sx={{
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
        width: '100vw',
        boxShadow: 'none',
        transition: 'backgroundColor 0.5s',
        zIndex: 10,
      }}
    >
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'space-between',
            }}
          >
            {/* Left items */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp
                aria-hidden="true"
                sx={{
                  height: {
                    xs: '2rem',
                    sm: '2.5rem',
                  },
                  width: '2.5rem',
                }}
              />
              <Link
                href={'/'}
                style={{
                  color: 'white',
                  marginRight: '2rem',
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  EQUITY NEST
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isSignedIn &&
                pathname !== '/signin' &&
                pathname !== '/signup' && (
                  <>
                    <Link href={'/signin'} className='nav_link'>
                      SignIn
                    </Link>
                    <Link href={'/signup'} className='nav_link'>
                      SignUp
                    </Link>
                  </>
                )}

              {isSignedIn && (
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title='Open user menu'>
                    {/* L-4 FIX: Added aria-label, aria-haspopup, and aria-controls
                        to IconButton so screen readers announce the purpose and state. */}
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{ p: 0 }}
                      aria-label="Open user menu"
                      aria-haspopup="true"
                      aria-controls={anchorElUser ? 'menu-appbar' : undefined}
                      aria-expanded={Boolean(anchorElUser)}
                    >
                      <Avatar sx={{ background: 'transparent' }}>
                        <Person
                          sx={{
                            color: 'white',
                          }}
                        />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id='menu-appbar'
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    disableScrollLock={true}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => (
                      <MenuItem
                        key={setting}
                        onClick={setting === 'Sign out' ? userLogout : handleCloseUserMenu}
                      >
                        <Typography textAlign='center'>{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
