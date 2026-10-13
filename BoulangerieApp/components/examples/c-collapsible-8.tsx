import {
  Frame,
  FrameHeader,
  FramePanel,
} from "@/components/reui/frame"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRightIcon, CircleDollarSignIcon, ClockIcon } from "lucide-react"

type CreditClient = { name: string; amount: string; due: string }

export function CreditClientCollapsible({ client }: { client: CreditClient }) {
  const initials = client.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")

  return (
    <Frame stacked dense spacing="sm" className="w-full">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full">
          <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="relative size-5">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-foreground text-sm font-medium">
                {client.name}
              </span>
            </div>
            <ChevronRightIcon aria-hidden="true" className="text-muted-foreground size-4 transition-transform in-data-open:rotate-90" />
          </FrameHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <FramePanel>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CircleDollarSignIcon aria-hidden="true" className="text-muted-foreground size-3.5" />
                <span className="text-muted-foreground text-xs">
                  Solde à recouvrer
                </span>
                <span className="text-foreground text-xs font-medium">
                  {client.amount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon aria-hidden="true" className="text-muted-foreground size-3.5" />
                <span className="text-muted-foreground text-xs">
                  Échéance
                </span>
                <span className="text-foreground text-xs font-medium">
                  {client.due}
                </span>
              </div>
            </div>
          </FramePanel>
        </CollapsibleContent>
      </Collapsible>
    </Frame>
  )
}