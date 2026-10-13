import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Github, Facebook, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] py-12 px-6 lg:px-40 text-neutral-900 dark:text-white transition-colors duration-300">
            <div className="layout-content-container max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex flex-col gap-4 max-w-xs">
                        <div className="flex items-center gap-3">
                            <div className="size-6 text-primary">
                                <svg
                                    className="w-full h-full"
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
                            <span className="text-xl font-bold">{siteConfig.name}</span>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            La solution simple et fiable pour gérer votre boulangerie, vos ventes et votre comptabilité.
                        </p>
                    </div>
                    <div className="flex gap-16 flex-wrap">
                        <div className="flex flex-col gap-3">
                            <h4 className="text-white font-bold mb-1">Product</h4>
                            <Link href="#features" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Features
                            </Link>
                            <Link href="#pricing" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Pricing
                            </Link>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Changelog
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-white font-bold mb-1">Resources</h4>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Documentation
                            </Link>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                API Reference
                            </Link>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Community
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-white font-bold mb-1">Legal</h4>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-neutral-500">© 2025 Boulangerie CI. Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <Link href={siteConfig.links.twitter} className="text-neutral-400 hover:text-primary transition-colors">
                            <span className="sr-only">X (Twitter)</span>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161-.394 2.016 2.664 1.411 1.116-.273-.418-.846-1.121 2.503-3.08-1.558-.008L9.936 9.38 6.425 4.88h3.916l4.246 5.61 5.918 7.822h-3.416l-5.46-7.218zM17.89 19.782h-1.802L5.805 4.098h1.8L17.89 19.782z" />
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-6.306l-5.89-7.702-5.845 7.702H2.179l8.8-10.058L2.3 1.153H8.6l5.271 6.97 5.03-6.97zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                        <Link href={siteConfig.links.github} className="text-neutral-400 hover:text-primary transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-neutral-400 hover:text-primary transition-colors">
                            <span className="sr-only">Facebook</span>
                            <Facebook className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-neutral-400 hover:text-primary transition-colors">
                            <span className="sr-only">Instagram</span>
                            <Instagram className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
