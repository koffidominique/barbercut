"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "../shared/ThemeToggle";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Mobile menu icons

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md bg-white/80 dark:bg-[#0a0a0a]/80 border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-green-500/5 transition-all duration-300">
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-8 text-primary group-hover:scale-110 transition-transform">
                        <svg
                            className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight text-neutral-900 dark:text-white">
                        {siteConfig.name}
                    </h2>
                </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
                {siteConfig.nav.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="text-sm font-medium px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-all duration-300"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link href="/auth/login" className="hidden sm:flex items-center px-2 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary dark:text-neutral-300">
                    Connexion
                </Link>
                <Link
                    href="/demande-acces"
                    className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-primary hover:bg-emerald-400 text-[#003322] text-sm font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                    <span className="truncate">Demander un accès</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-neutral-900 dark:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-xl rounded-2xl">
                    {siteConfig.nav.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-base font-medium px-4 py-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors dark:text-white/80"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/demande-acces"
                        className="flex items-center justify-center rounded-full h-10 px-5 bg-primary text-[#181811] text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Demander un accès
                    </Link>
                </div>
            )}
        </header>
    );
}
