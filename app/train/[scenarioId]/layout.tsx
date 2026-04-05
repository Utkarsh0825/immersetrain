import type { Viewport } from 'next';

/* iPhone / iOS: edge-to-edge safe areas + dark browser chrome (all iOS browsers use WebKit). */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function TrainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
