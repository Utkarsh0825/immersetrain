import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { CLERK_READY } from '@/lib/clerkReady';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <body>
        {CLERK_READY ? (
          <ClerkProvider>
            <header
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
                padding: '10px 20px',
                background: 'rgba(10,10,10,0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0066FF',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
