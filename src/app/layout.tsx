import type { Metadata } from 'next';
import { Playfair_Display, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

const playfair  = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const inter     = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://spindle-amber.vercel.app'),
  title: {
    default:  'Spindle — 5,000 Albums. Infinite Discoveries.',
    template: '%s | Spindle',
  },
  description: 'Discover the greatest albums ever made. Roll the dice on 5,000 RYM all-time chart records across every genre and era.',
  keywords:    ['music discovery', 'album roulette', 'rate your music', 'best albums', 'music recommendations'],
  authors:     [{ name: 'Spindle' }],
  openGraph: {
    type:        'website',
    siteName:    'Spindle',
    title:       'Spindle — 5,000 Albums. Infinite Discoveries.',
    description: 'Discover the greatest albums ever made. Roll the dice on 5,000 RYM all-time chart records.',
    images: [{
      url:    '/api/og',
      width:  1200,
      height: 630,
      alt:    'Spindle — Music Discovery',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Spindle — 5,000 Albums. Infinite Discoveries.',
    description: 'Discover the greatest albums ever made.',
    images:      ['/api/og'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jetbrains.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}