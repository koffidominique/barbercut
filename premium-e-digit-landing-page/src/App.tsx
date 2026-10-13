import { useState, lazy, Suspense } from 'react';
import { Currency } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { ProblemSection } from './components/ProblemSection';
import { ServicesSection } from './components/ServicesSection';
import { InteractiveLivePreview } from './components/InteractiveLivePreview';
import { ProjectEstimator } from './components/ProjectEstimator';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { TechStackSection } from './components/TechStackSection';
import { BenefitsSection } from './components/BenefitsSection';
import { PricingSection } from './components/PricingSection';
import { ProjectBriefModal } from './components/ProjectBriefModal';
import { MessageSquare } from 'lucide-react';

// Lazy load components that are below the fold
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
const FaqSection = lazy(() => import('./components/FaqSection').then(module => ({ default: module.FaqSection })));
const CtaSection = lazy(() => import('./components/CtaSection').then(module => ({ default: module.CtaSection })));
const Footer = lazy(() => import('./components/Footer').then(module => ({ default: module.Footer })));

const LazyLoadPlaceholder = () => (
  <div className="text-center py-12">
    <p className="text-slate-400">Chargement du contenu...</p>
  </div>
);

export function App() {
  const [currency, setCurrency] = useState<Currency>('FCFA');
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);

  const handleOpenBriefModal = (initialData?: any) => {
    setModalInitialData(initialData || null);
    setIsBriefModalOpen(true);
  };

  const handleScrollToEstimator = () => {
    const el = document.getElementById('estimateur');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForQuote = (serviceTitle: string) => {
    handleOpenBriefModal({ projectType: serviceTitle });
  };

  const handleSelectPlan = (planName: string, priceFCFA: number) => {
    handleOpenBriefModal({
      planName,
      estimatedBudgetFCFA: priceFCFA
    });
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-white dark:text-slate-100 text-slate-800 selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Sticky Navigation */}
      <Navbar
        currency={currency}
        onToggleCurrency={setCurrency}
        onOpenBriefModal={() => handleOpenBriefModal()}
      />

      {/* Main Landing Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          currency={currency}
          onOpenBriefModal={() => handleOpenBriefModal()}
          onScrollToCaseStudy={handleScrollToEstimator}
        />

        {/* Social Proof & Metrics */}
        <SocialProof />

        {/* Problem Section - Les douleurs des PME ivoiriennes */}
        <ProblemSection />

        {/* Services & Digitalisation Solutions */}
        <ServicesSection
          onSelectServiceForQuote={handleSelectServiceForQuote}
        />

        {/* Interactive Live Preview Sandbox */}
        <InteractiveLivePreview
          currency={currency}
          onOpenBriefModal={() => handleOpenBriefModal()}
        />

        {/* Interactive Budget & Timeline Estimator */}
        <ProjectEstimator
          currency={currency}
          onOpenBriefModalWithData={handleOpenBriefModal}
        />

        {/* Real-World Case Studies in Côte d'Ivoire */}
        <CaseStudiesSection
          onOpenBriefModalWithData={handleOpenBriefModal}
        />

        {/* Technology Stack & Architecture for West Africa */}
        <TechStackSection />

        {/* Why Choose E-DIGIT & Comparison */}
        <BenefitsSection />

        {/* Transparent Pricing & Payment Terms */}
        <PricingSection
          currency={currency}
          onToggleCurrency={setCurrency}
          onSelectPlan={handleSelectPlan}
        />

        {/* Lazy Loaded Sections */}
        <Suspense fallback={<LazyLoadPlaceholder />}>
          {/* Client Testimonials */}
          <TestimonialsSection />

          {/* Frequently Asked Questions */}
          <FaqSection
            onOpenBriefModal={() => handleOpenBriefModal()}
          />

          {/* Conversion CTA */}
          <CtaSection
            onOpenBriefModal={() => handleOpenBriefModal()}
          />
        </Suspense>
      </main>

      {/* Footer (also lazy loaded) */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Interactive Project Brief & Quote Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        initialData={modalInitialData}
      />

      {/* Floating Quick WhatsApp Action Button for Côte d'Ivoire */}
      <aside aria-label="Contact rapide WhatsApp" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <a
          href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20je%20souhaite%20des%20informations%20pour%20la%20construction%20d'une%20application%20web"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discuter directement sur WhatsApp avec un ingénieur à Abidjan"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/40 border border-blue-400/30 transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-300 animate-ping" />
          </div>
          <span className="text-xs font-bold hidden sm:inline">
            WhatsApp CI • En ligne
          </span>
        </a>
      </aside>
    </div>
  );
}

export default App;