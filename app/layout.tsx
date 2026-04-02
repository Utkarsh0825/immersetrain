import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ImmerseTrain — 360° Workforce Training Platform',
  description:
    'Train anyone, anywhere, in 360°. Immersive scenario-based learning for every industry. Healthcare, aviation, manufacturing, retail and more.',
  keywords: ['360 VR training', 'workforce learning', 'immersive training', 'employee training', 'VR simulation'],
  openGraph: {
    title: 'ImmerseTrain — 360° Workforce Training Platform',
    description: 'The most affordable immersive training platform. Works in any browser. No headset required.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
