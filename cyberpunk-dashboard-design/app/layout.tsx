import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })

export const metadata: Metadata = {
  title: "Maison Rivage — Gestion hôtelière",
  description: "Tableau de bord opérationnel pour la gestion de votre hôtel.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${montserrat.className} bg-background text-foreground antialiased selection:bg-primary/30`}>{children}</body>
    </html>
  )
}
