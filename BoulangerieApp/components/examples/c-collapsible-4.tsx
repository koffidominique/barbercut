import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { ChevronDownIcon } from "lucide-react"

type ProductionItem = { name: string; target: number; done: number }

export function ProductionPlanCollapsible({ items }: { items: ProductionItem[] }) {
  const totalTarget = items.reduce((sum, item) => sum + item.target, 0)
  const totalDone = items.reduce((sum, item) => sum + item.done, 0)
  const completion = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0

  return (
    <Collapsible className="w-full">
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Objectifs de fabrication</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">Progression de la production du jour</p>
          </div>
          <CardAction>
            <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>Détails <ChevronDownIcon aria-hidden="true" className="size-4 transition-transform in-data-open:rotate-180" /></CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span>{totalDone} / {totalTarget} unités</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
          <CollapsibleContent className="space-y-4 pt-2">
            {items.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground tabular-nums">{item.done}/{item.target}</span>
                </div>
                <Progress value={Math.round((item.done / item.target) * 100)} className="h-2" />
              </div>
            ))}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}