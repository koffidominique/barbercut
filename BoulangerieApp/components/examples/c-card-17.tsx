import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBagIcon, ChevronRightIcon } from "lucide-react"

type OrdersOverviewCardProps = {
  count: number
  latestOrder: string
}

export function OrdersOverviewCard({ count, latestOrder }: OrdersOverviewCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="flex flex-col gap-3">
        <div className="bg-primary rounded-md [&_svg]:text-primary-foreground flex size-11 items-center justify-center [&_svg]:size-5">
          <ShoppingBagIcon aria-hidden="true" />
        </div>
        <h3 className="text-foreground text-sm leading-tight font-medium">Commandes du jour</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {count} commandes récentes. Dernière : {latestOrder}.
        </p>
        <a
          href="#orders"
          className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
        >
          Voir les commandes
          <ChevronRightIcon aria-hidden="true" className="size-2.5 shrink-0" />
        </a>
      </CardContent>
    </Card>
  )
}