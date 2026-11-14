import Header from '@/components/sections/Header';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import FilmmakerPreviews from '@/components/sections/FilmmakerPreviews';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="flex-1">
      <Header />
      <Hero />
      <HowItWorks />
      <FilmmakerPreviews />
      <Footer />
    </main>
  );
}
