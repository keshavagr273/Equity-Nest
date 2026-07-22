import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Typography, Button } from '@mui/material';

import { getGoogleOAuthURL } from '../utils/googleAuth';
import googleLogo from '../../../public/signin/google-logo.png';

interface GoogleLoginProps {
  text: string;
}

const GoogleLogin: FC<GoogleLoginProps> = ({ text }) => {
  return (
    <Box>
      {/* L-4 FIX: Added aria-label to the Button so screen readers announce
          the full context ("Sign in with Google") rather than just the text prop. */}
      <Button
        component={Link}
        href={getGoogleOAuthURL()}
        aria-label={`${text} with Google`}
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(144, 202, 249, 0.15)',
          border: '1px solid rgba(144, 202, 249, 0.15)',
          textDecoration: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              height={25}
              width={25}
              src={googleLogo}
              alt='Google logo'
            />
          </Box>

          <Box
            sx={{
              p: 1,
              color: '#FFFFFF',
            }}
          >
            <Typography
              variant='body2'
              sx={{
                height: '100%',
                width: 'auto',
              }}
            >
              {text}
            </Typography>
          </Box>
        </Box>
      </Button>
    </Box>
  );
};

export default GoogleLogin;
