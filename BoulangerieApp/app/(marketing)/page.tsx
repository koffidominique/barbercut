import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { VideoShowcase } from "@/components/marketing/VideoShowcase";
import { FAQ } from "@/components/marketing/FAQ";
import { Pricing } from "@/components/marketing/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <VideoShowcase />
      <FAQ />
      <Pricing />
    </>
  );
}
