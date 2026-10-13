"use client"

import { useState } from "react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronDownIcon } from "lucide-react"

export function Pattern() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="relative w-full max-w-md gap-6 overflow-visible pb-1">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>3 days remaining in cycle</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            Billing
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent
        className={cn(
          "relative space-y-5 overflow-hidden transition-all duration-500 ease-in-out",
          isOpen ? "max-h-[500px]" : "max-h-48"
        )}
      >
        {/* Usage Details */}
        <div className="bg-muted/60 rounded-lg space-y-3 p-4">
          <div className="text-muted-foreground flex justify-between text-xs font-medium">
            <span>Included Credit</span>
            <span>On-Demand Charges</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>$18.08 / $20</span>
            <span>$0</span>
          </div>
          <Progress value={90} className="h-2" />
        </div>

        {/* Additional Usage Details */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Requests</span>
            <span className="text-muted-foreground">$210.84</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Active CPU</span>
            <span className="text-muted-foreground">$21.95</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Events</span>
            <span className="text-muted-foreground">$21.20</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Storage Usage</span>
            <span className="text-muted-foreground">$20.45</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Bandwidth</span>
            <span className="text-muted-foreground">$0.00</span>
          </div>
        </div>

        {/* Faded background effect for collapsed state */}
        <div
          className={cn(
            "from-background pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-lg bg-linear-to-t to-transparent transition-opacity duration-300",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        />
      </CardContent>

      {/* Toggle button */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <Button
          variant="outline"
          size="icon-sm"
          className="bg-background hover:bg-background rounded-full shadow-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDownIcon aria-hidden="true" className={cn(
            "transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
          <span className="sr-only">Toggle card</span>
        </Button>
      </div>
    </Card>
  )
}

type PaymentItem = { label: string; value: number; color: string }

export function PaymentBreakdownCard({ items }: { items: PaymentItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Répartition des paiements</CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">Modes utilisés aujourd’hui</p>
        </div>
        <CardAction>
          <Button variant="outline" size="sm" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Réduire" : "Détails"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total réparti</span>
          <span className="font-semibold tabular-nums">{total}%</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label="Répartition par mode de paiement">
          {items.map((item) => (
            <div key={item.label} className={item.color} style={{ width: `${item.value}%` }} />
          ))}
        </div>
        <div hidden={!isOpen} className="space-y-3 pt-1">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${item.color}`} />
                {item.label}
              </span>
              <span className="font-semibold tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}