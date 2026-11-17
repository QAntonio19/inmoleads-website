import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Process from "@/components/Process";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import MarqueeRibbon from "@/components/MarqueeRibbon";

const Index = () => {
  const { hash } = useLocation();

  // Arriving from another page via "/#section": scroll once the section is rendered.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <div className="min-h-screen bg-[#ECEDE9] text-[#16181D]">
      <Navigation />
      <Hero />
      <About />
      <Process />
      <Services />
      <MarqueeRibbon />
      <Testimonials />
      <Contact />
      <FAQ />
      <Footer />
      {/* site-wide film grain for material cohesion */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
      />
    </div>
  );
};

export default Index;
