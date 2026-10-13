"use client"

import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, Users, Wallet, Trash2, ChefHat, HandCoins, Store, Truck, ShoppingBasket, BarChart3, Package } from "lucide-react"
import { SignOutButton } from "@/components/shared/SignOutButton";
import { useStatsPanel } from "@/contexts/StatsPanelContext";

const navItems = [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboardIcon aria-hidden="true" />,
    },
    {
        id: "caisse",
        label: "Caisse",
        href: "/caisse",
        icon: <Wallet aria-hidden="true" />,
    },
    {
        id: "catalogue",
        label: "Catalogue",
        href: "/catalogue",
        icon: <Package aria-hidden="true" />,
    },
    {
        id: "ventes",
        label: "Ventes",
        href: "/ventes",
        icon: <ShoppingBasket aria-hidden="true" />,
    },
    {
        id: "pertes",
        label: "Pertes",
        href: "/pertes",
        icon: <Trash2 aria-hidden="true" />,
    },
    {
        id: "recettes",
        label: "Recettes",
        href: "/recettes",
        icon: <ChefHat aria-hidden="true" />,
    },
    {
        id: "credit",
        label: "Crédit",
        href: "/credit",
        icon: <HandCoins aria-hidden="true" />,
    },
    {
        id: "boutiques",
        label: "Boutiques",
        href: "/boutiques",
        icon: <Store aria-hidden="true" />,
    },
    {
        id: "fournisseurs",
        label: "Fournisseurs",
        href: "/fournisseurs",
        icon: <Truck aria-hidden="true" />,
    },
    {
        id: "membres",
        label: "Membres",
        href: "/membres",
        icon: <Users aria-hidden="true" />,
    },
]

export default function DashboardClientLayout({
    children,
    userEmail,
}: {
    children: React.ReactNode;
    userEmail: string;
}) {
    const { setStatsPanelOpen } = useStatsPanel();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-4">
                    <h2 className="text-xl font-bold dark:text-white">Boulangerie CI</h2>
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton render={<Link href={item.href} />}>
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                {/* Onglet Statistiques qui ouvre le panneau latéral */}
                                <SidebarMenuItem key="stats">
                                    <SidebarMenuButton onClick={() => setStatsPanelOpen(true)}>
                                        <BarChart3 aria-hidden="true" />
                                        <span>Statistiques</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarSeparator />
                <SidebarFooter className="p-4">
                    <SignOutButton />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white/90 px-5 backdrop-blur-md dark:border-white/10 dark:bg-[#0a0a0a]/90 md:px-10">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Link href="/dashboard" className="font-black text-neutral-900 dark:text-white">
                            Boulangerie CI <span className="font-medium text-neutral-500">/ Gestion</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden max-w-60 truncate text-sm text-neutral-600 dark:text-neutral-300 sm:block">{userEmail}</span>
                        <SignOutButton />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto focus:outline-none">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}