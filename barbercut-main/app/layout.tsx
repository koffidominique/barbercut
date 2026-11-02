import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SWRegistration } from '@/components/SWRegistration'

export const metadata: Metadata = {
  title: 'Barber Cuts — Gestion de salon',
  description: 'Pilotez votre salon de coiffure, vos rendez-vous et votre vitrine depuis un seul espace.',
  generator: 'Barber Cuts',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Barber Cuts — Gestion de salon',
    description: 'ERP pour barbiers et coiffeurs en Côte d\'Ivoire. Rendez-vous, clients, vitrine, analytics.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Barber Cuts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barber Cuts — Gestion de salon',
    description: 'ERP pour barbiers et coiffeurs en Côte d\'Ivoire.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Barber Cuts" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Barber Cuts" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#202321" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#202321" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" href="/icon-light-32x32.png" />
        <link rel="mask-icon" href="/icon.svg" color="#202321" />
        <link rel="alternate" href="/manifest.json" type="manifest+json" />
      </head>
      <body className="antialiased">
        <SWRegistration />
        {children}
      </body>
    </html>
  )
}
