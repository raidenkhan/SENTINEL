import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

export default function HeroPage() {
  return (
    <div className="bg-[hsl(0_0%_8%)] min-h-screen">
      <Navbar />
      <HeroSection />
    </div>
  );
}