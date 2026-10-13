import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
