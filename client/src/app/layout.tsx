import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import ThemeRegistry from './components/ThemeRegistry';
import Navbar from './components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Equity Nest - Real-time Stock Trading Platform',
  description: 'A comprehensive stock trading platform with real-time data, charts, and portfolio management.',
  authors: 'Keshav Agrawal',
  keywords: ['stock trading', 'real-time data', 'portfolio management', 'trading platform'],
  openGraph: {
    title: 'Equity Nest - Real-time Stock Trading Platform',
    description: 'A comprehensive stock trading platform with real-time data, charts, and portfolio management.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang='en'>
        <body className={inter.className}>
          <Navbar />
          <ThemeRegistry options={{ key: 'mui' }}>{children}</ThemeRegistry>
          <Analytics />
        </body>
      </html>
    </Providers>
  );
}
