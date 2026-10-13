"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
        >
            <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// You can also export CheckboxField and CheckboxLabel if they are simple wrappers
// For example, if they are just divs and labels with specific classes.

const CheckboxField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
    className, ...props
}, ref) => (
    <div ref={ref} className={cn("flex items-center space-x-2", className)} {...props} />
));
CheckboxField.displayName = "CheckboxField";

const CheckboxLabel = React.forwardRef<
    React.ElementRef<"label">,
    React.ComponentPropsWithoutRef<"label"> & {
        htmlFor?: string;
    }
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        {...props}
    />
));
CheckboxLabel.displayName = "CheckboxLabel";


export { Checkbox, CheckboxField, CheckboxLabel }