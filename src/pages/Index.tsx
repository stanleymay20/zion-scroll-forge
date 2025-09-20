import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FacultiesSection } from "@/components/FacultiesSection";
import { ScrollCoinSection } from "@/components/ScrollCoinSection";
import { PrayerSection } from "@/components/PrayerSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FacultiesSection />
        <PrayerSection />
        <ScrollCoinSection />
      </main>
    </div>
  );
};

export default Index;