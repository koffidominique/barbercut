import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="flex max-w-md flex-col items-center gap-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Maison Rivage</p>
        <h1 className="text-4xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-muted-foreground">La page demandée n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Retour au tableau de bord
          </Link>
        </Button>
      </section>
    </main>
  )
}
