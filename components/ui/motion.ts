import { Variants } from 'framer-motion'

/* ========================================================================
   Variantes d’animation réutilisables — Barber Cuts
   ======================================================================== */

/* Apparition progressive avec glissement vers le haut */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
}

/* Apparition progressive simple */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

/* Échelle au survol (scale) */
export const scaleHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
}

/* Élévation 3D au survol — ombre prononcée + translation vers le haut */
export const lift3D: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  hover: {
    y: -8,
    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.16)',
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
}

/* Élévation légère des bordures au survol */
export const borderLift: Variants = {
  rest: {
    borderColor: '#e9e6df',
    transition: { duration: 0.2 },
  },
  hover: {
    borderColor: '#bd664a',
    boxShadow: '0 0 0 1px #bd664a',
    transition: { duration: 0.2 },
  },
}

/* Bouton avec scale + ombre */
export const buttonHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)',
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 12px 24px -6px rgba(0,0,0,0.15)',
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
  tap: {
    scale: 0.95,
    boxShadow: '0 2px 6px -2px rgba(0,0,0,0.12)',
    transition: { duration: 0.1 },
  },
}

/* Carte avec élévation 3D */
export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
    borderColor: '#e8e4dc',
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  hover: {
    y: -6,
    boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)',
    borderColor: '#cfcbc2',
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
}

/* Stagger pour les listes */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
}

/* Modal qui s’ouvre avec scale */
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent: Variants = {
  hidden: { scale: 0.9, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: { scale: 0.9, opacity: 0, y: 10, transition: { duration: 0.15 } },
}
