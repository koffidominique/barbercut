import React from 'react';
import { motion } from "framer-motion";
import { TESTIMONIALS } from '../data/mockData';
import {
  Star,
  Quote,
  ShieldCheck,
  MapPin,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { CarouselScale } from '@/components/ui/carousel-11';

export const TestimonialsSection: React.FC = () => {

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden dark:bg-slate-950 bg-white dark:border-slate-800 border-t border-slate-200">
      {/* Background glow */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retours d'Expérience Vérifiés</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Ce que disent les décideurs{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              qui construisent avec nous
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Fondateurs de startups, directeurs des opérations et CTOs basés à Abidjan partagent leur expérience avec E-DIGIT.
          </p>
        </div>

        {/* Featured Testimonial Carousel Card with shadcn CarouselScale */}
        <div className="max-w-4xl mx-auto">
          <CarouselScale
            items={TESTIMONIALS.map((t) => (
              <motion.div
                key={t.id}
                className="relative rounded-3xl p-8 sm:p-12 dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 backdrop-blur-2xl transform-gpu perspective-[1200px]
                           shadow-[0_15px_50px_rgb(0,0,0,0.11)] hover:shadow-[0_35px_90px_rgb(59,130,246,0.25)] 
                           transition-all duration-500 hover:border-blue-500/60"
                style={{ transformStyle: "preserve-3d" }}>
                <Quote className="absolute top-8 right-8 w-16 h-16 text-blue-500/5 pointer-events-none" />

                <div className="space-y-6">
                  {/* Top rating and tags */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500" />
                      ))}
                      <span className="ml-2 text-xs font-bold text-slate-600">5.0 / 5.0</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
                        {t.projectType}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.impact}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quote text */}
                  <blockquote className="text-lg sm:text-xl dark:text-slate-300 text-slate-700 leading-relaxed font-medium italic">
                    "{t.quote}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="pt-4 dark:border-slate-700 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-blue-500/40 bg-slate-100">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
                          <span>{t.name}</span>
                          <span title="Client Vérifié">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          </span>
                        </h4>
                        <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                          {t.role} — {t.company}
                        </p>
                        <p className="text-[11px] dark:text-slate-500 text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{t.location}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          />
        </div>

        {/* Small Testimonials Grid Overview - avec animations 3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="p-4 rounded-2xl text-left border dark:bg-slate-900 bg-slate-50 dark:border-slate-700 border-slate-200 transform-gpu perspective-[800px]
                         shadow-[0_4px_15px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_35px_rgb(59,130,246,0.15)]
                         transition-all duration-500 hover:border-blue-500/50"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-xs font-bold dark:text-white text-slate-900 truncate">{t.name}</div>
              <div className="text-[11px] dark:text-slate-400 text-slate-600 truncate">{t.company}</div>
              <div className="text-[10px] dark:text-slate-500 text-slate-500 mt-1 truncate">{t.location}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};