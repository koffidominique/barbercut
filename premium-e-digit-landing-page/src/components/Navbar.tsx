import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import {
  Code2,
  Menu,
  X,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  onToggleCurrency: (curr: Currency) => void;
  onOpenBriefModal: (initialData?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onToggleCurrency,
  onOpenBriefModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Initialiser le thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services Web', href: '#services' },
    { label: 'Démo En Direct', href: '#live-demo' },
    { label: 'Simulateur Budget', href: '#estimateur' },
    { label: 'Cas Clients CI', href: '#cas-clients' },
    { label: 'Stack Technique', href: '#stack' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'dark:bg-slate-900/95 bg-white/95 backdrop-blur-md border-b dark:border-slate-700 border-slate-200 shadow-xl py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo & Local Tag */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white animate-pulse"></div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-xl font-extrabold tracking-tight font-['Space_Grotesk'] ${isScrolled ? 'dark:text-white text-slate-900' : 'text-white'}`}>
                  E-DIGIT<span className={`${isScrolled ? 'dark:text-blue-400 text-blue-600' : 'text-blue-500'}`}>.</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase bg-blue-500/10 border border-blue-500/20 rounded">
                  CI 🇨🇮
                </span>
              </div>
              <span className={`text-[11px] font-medium hidden sm:inline-block ${isScrolled ? 'dark:text-slate-400 text-slate-500' : 'text-slate-400'}`}>
                Freelance • Cocody Belle Côte
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${isScrolled ? 'dark:bg-slate-800/80 bg-slate-50/80 dark:border-slate-700 border border-slate-200' : 'bg-white/90 border border-slate-200'}`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${isScrolled ? 'dark:text-slate-300 text-slate-600 dark:hover:text-white dark:hover:bg-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency Switcher */}
            <div className={`flex items-center p-1 ${isScrolled ? 'dark:bg-slate-800/80 bg-slate-50/80 dark:border-slate-700 border border-slate-200' : 'bg-slate-900/90 border border-white/10'} rounded-lg text-xs`}>
              <button
                type="button"
                onClick={() => onToggleCurrency('FCFA')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${currency === 'FCFA'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                  : isScrolled ? 'dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                FCFA
              </button>
              <button
                type="button"
                onClick={() => onToggleCurrency('EUR')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${currency === 'EUR'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                  : isScrolled ? 'dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                EUR (€)
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isScrolled
                ? 'dark:text-slate-300 text-slate-600 dark:hover:bg-slate-700 hover:bg-slate-100'
                : 'text-white hover:bg-white/10'
                }`}
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Quick WhatsApp */}
            <a
              href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20je%20souhaite%20construire%20une%20application%20web"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${isScrolled ? 'dark:text-blue-400 text-blue-600 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20' : 'text-blue-400 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'} rounded-lg transition-all`}
              title="Discuter directement sur WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">WhatsApp CI</span>
            </a>

            {/* Primary CTA */}
            <button
              onClick={() => onOpenBriefModal()}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Démarrer un Projet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center p-0.5 bg-slate-900 border border-white/10 rounded-md text-[11px] mr-1">
              <button
                onClick={() => onToggleCurrency(currency === 'FCFA' ? 'EUR' : 'FCFA')}
                className="px-2 py-1 font-bold text-blue-400"
              >
                {currency}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 border border-white/10 rounded-lg focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070b14] border-b border-white/10 px-4 pt-4 pb-6 space-y-3 mt-2 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {/* Theme Toggle for Mobile */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span>Thème :</span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${isDarkTheme ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 bg-slate-800'}`}
                aria-label="Toggle Theme"
              >
                {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span>Devise d'affichage :</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onToggleCurrency('FCFA')}
                  className={`px-3 py-1 rounded text-xs font-bold ${currency === 'FCFA' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  FCFA
                </button>
                <button
                  onClick={() => onToggleCurrency('EUR')}
                  className={`px-3 py-1 rounded text-xs font-bold ${currency === 'EUR' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  EUR (€)
                </button>
              </div>
            </div>

            <a
              href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20je%20souhaite%20construire%20une%20application%20web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contacter sur WhatsApp (+225)</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBriefModal();
              }}
              className="w-full py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Démarrer mon projet web</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};