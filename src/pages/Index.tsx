import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FacultiesSection } from "@/components/FacultiesSection";
import { ScrollGoldSection } from "@/components/ScrollGoldSection";
import { PrayerSection } from "@/components/PrayerSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>ScrollUniversity — The Transcendent AI University</title>
        <meta name="description" content="Where divine revelation meets advanced AI. Train through kingdom-aligned education across 12 Supreme Scroll Faculties at ScrollUniversity." />
        <meta property="og:title" content="ScrollUniversity — The Transcendent AI University" />
        <meta property="og:description" content="Christ-centered higher education powered by AI. Explore courses, earn credentials, and grow spiritually." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://zion-scroll-forge.lovable.app/" />
      </Helmet>
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
