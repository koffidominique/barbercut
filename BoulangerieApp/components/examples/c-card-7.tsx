import { Badge } from "@/components/reui/badge"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BellIcon, SparklesIcon, ArrowRightIcon } from "lucide-react"

export function BakeryWorkflowCard() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4">
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src="/illustrations/bakery-dashboard.svg"
            alt="Interface de gestion pour boulangerie"
            width={1000}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-5">
          <Badge variant="outline">
            <BellIcon aria-hidden="true" />
            Gestion du fournil
          </Badge>
          <div className="flex items-center gap-1">
            <SparklesIcon aria-hidden="true" />
            <span className="text-secondary-foreground text-xs font-medium">
              Côte d’Ivoire
            </span>
          </div>
        </div>

        <p className="text-foreground text-sm">
          Suivez ventes, stocks et production dans un espace pensé pour le rythme d’une boulangerie.
        </p>

        <Button render={<Link href="/demande-acces" />}>
          Demander une démo
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}