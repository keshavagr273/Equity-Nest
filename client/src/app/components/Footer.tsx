import React from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { TrendingUp, GitHub, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      sx={{
        px: 3,
        paddingBottom: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 2,
        }}
      >
        <TrendingUp
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
            letterSpacing: '.1rem',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            EQUITY NEST
          </Typography>
        </Link>
      </Box>
      <hr style={{ border: 'none', height: '1px', backgroundColor: '#333' }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 2,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Box

        >
          <Typography
            variant='body2'
            sx={{
              fontFamily: 'inherit',
              fontWeight: '500',
              pb: {
                xs: 2,
              },
            }}
          >
            © {new Date().getFullYear()} Keshav Agrawal. All rights reserved
          </Typography>
        </Box>

        <Box>
          <Link
            target='_blank'
            href={'https://www.linkedin.com/in/keshav-agrawal-02b4861b0'}
            style={{
              color: 'white',
            }}
          >
            <LinkedIn
              sx={{
                height: '1.5rem',
                width: '1.5rem',
                mx: 1,
              }}
            />
          </Link>
          <Link
            target='_blank'
            href={'https://github.com/keshavagr273'}
            style={{
              color: 'white',
            }}
          >
            <GitHub
              sx={{
                height: '1.5rem',
                width: '1.5rem',
                mx: 1,
              }}
            />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
