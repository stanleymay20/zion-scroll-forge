import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FacultiesSection } from "@/components/FacultiesSection";
import { ScrollGoldSection } from "@/components/ScrollGoldSection";
import { PrayerSection } from "@/components/PrayerSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FacultiesSection />
        <PrayerSection />
        <ScrollGoldSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
