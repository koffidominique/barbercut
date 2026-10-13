import type { Metadata } from "next";
import { Spline_Sans, Noto_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spline = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline",
  display: "swap",
});

const noto = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${spline.variable} ${noto.variable} font-body bg-background-light dark:bg-background-dark text-neutral-900 dark:text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
