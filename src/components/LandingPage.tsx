import { useNavigate } from "react-router-dom";
import PricingSection from "@/components/PricingSection";
import { DEMO_TRIP_ID } from "@/models/trip";
import { AiInboxFeature } from "./landing-page/AiInboxFeature";
import { CtaSection } from "./landing-page/CtaSection";
import { HeroSection } from "./landing-page/HeroSection";
import { HowItWorksSection } from "./landing-page/HowItWorksSection";
import { LandingFooter } from "./landing-page/LandingFooter";
import { LandingNav } from "./landing-page/LandingNav";
import { SpatialCanvasFeature } from "./landing-page/SpatialCanvasFeature";
import { TestimonialsSection } from "./landing-page/TestimonialsSection";
import { TripListFeature } from "./landing-page/TripListFeature";
import { TrustStrip } from "./landing-page/TrustStrip";

export default function LandingPage() {
  const navigate = useNavigate();
  const onEnterDemo = () => navigate(`/trips/${DEMO_TRIP_ID}`);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNav onEnterDemo={onEnterDemo} />
      <HeroSection onEnterDemo={onEnterDemo} />
      <TrustStrip />
      <HowItWorksSection />
      <SpatialCanvasFeature onEnterDemo={onEnterDemo} />
      <TripListFeature onEnterDemo={onEnterDemo} />
      <AiInboxFeature onEnterDemo={onEnterDemo} />
      <PricingSection onCtaClick={onEnterDemo} />
      <TestimonialsSection />
      <CtaSection onEnterDemo={onEnterDemo} />
      <LandingFooter />
    </div>
  );
}
