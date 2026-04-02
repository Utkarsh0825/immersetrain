import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import IndustryMarquee from '@/components/landing/IndustryMarquee';
import StatsSection from '@/components/landing/StatsSection';
import ProductReveal from '@/components/landing/ProductReveal';
import Industries from '@/components/landing/Industries';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main style={{ background: '#04040f', minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav />
      <Hero />
      <IndustryMarquee />
      <StatsSection />
      <ProductReveal />
      <Industries />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
