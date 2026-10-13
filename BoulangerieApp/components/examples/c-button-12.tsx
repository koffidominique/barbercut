import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

type RequestSubmitButtonProps = Omit<ComponentProps<typeof Button>, "children" | "type"> & {
  children: ReactNode
}

export function RequestSubmitButton({ children, ...props }: RequestSubmitButtonProps) {
  return (
    <Button type="submit" {...props}>
      {children}
      <ArrowRightIcon aria-hidden="true" />
    </Button>
  )
}