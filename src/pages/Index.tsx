import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedScripts from "@/components/FeaturedScripts";
import StatsSection from "@/components/StatsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturedScripts />
        <StatsSection />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
