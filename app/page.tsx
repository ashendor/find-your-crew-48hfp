import Header from '@/components/sections/Header';
import Hero from '@/components/sections/Hero';
import MobileFeatures from '@/components/sections/MobileFeatures';
import HowItWorks from '@/components/sections/HowItWorks';
import FilmmakerPreviews from '@/components/sections/FilmmakerPreviews';
import EventBanner from '@/components/sections/EventBanner';
import Footer from '@/components/sections/Footer';
import MobileBottomNav from '@/components/ui/MobileBottomNav';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <MobileFeatures />
        <HowItWorks />
        <FilmmakerPreviews />
        <EventBanner />
        <Footer />
      </main>
      <MobileBottomNav />
    </>
  );
}
