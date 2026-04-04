'use client';

import dynamic from 'next/dynamic';
import Nav from '@/components/landing/Nav';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import Industries from '@/components/landing/Industries';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import CustomCursor from '@/components/landing/CustomCursor';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const ScrollScene3D = dynamic(
  () => import('@/components/landing/ScrollScene3D'),
  { ssr: false }
);

export default function LandingPage() {
  const t = useThemeStyles();
  return (
    <main
      className="landing-page"
      style={{
        background: t.bg,
        minHeight: '100vh',
        /* overflow-x:hidden breaks position:sticky for the VR section; clip avoids horizontal bleed without killing sticky */
        overflowX: 'clip',
      }}
    >
      <CustomCursor />
      <Nav />
      <HeroSection />
      <ProblemSection />
      {/* Gradient bridge from page background into dark 3D scene */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(to bottom, ${t.bg}, #060608)`,
          marginBottom: -1,
        }}
      />
      <ScrollScene3D />
      {/* Gradient bridge from dark 3D scene to page background */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(to bottom, #060608, ${t.bg})`,
          marginTop: -1,
        }}
      />
      <HowItWorks />
      <FeaturesGrid />
      <SocialProof />
      <Pricing />
      <Industries />
      <FinalCTA />
      <Footer />
    </main>
  );
}
