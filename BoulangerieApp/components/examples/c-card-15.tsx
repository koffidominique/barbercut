"use client"

import { Badge } from "@/components/reui/badge"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"

type RevenueMetricCardProps = {
  value: string
  delta: number
  comparison: string
}

export function RevenueMetricCard({ value, delta, comparison }: RevenueMetricCardProps) {
  const positive = delta >= 0
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-muted-foreground text-sm font-medium">Chiffre d’affaires</h3>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="-me-1.5"
                  aria-label="More options"
                />
              }
            >
              <MoreHorizontalIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<a href="#orders" />}>Voir les commandes</DropdownMenuItem>
                <DropdownMenuItem render={<a href="#payments" />}>Voir les paiements</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<a href="#production" />}>Voir la production</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground text-2xl font-medium tracking-tight tabular-nums">
              {value}
            </span>
            <Badge variant={positive ? "success-light" : "destructive-light"}>
              {positive ? (
                <ArrowUpIcon aria-hidden="true" />
              ) : (
                <ArrowDownIcon aria-hidden="true" />
              )}
              {delta}%
            </Badge>
          </div>
          <Separator />
          <div className="text-muted-foreground text-xs">
            Comparaison période précédente :{" "}
            <span className="text-foreground font-medium tabular-nums">
              {comparison}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}