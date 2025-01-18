import * as React from "react"

import { cn } from "@/lib/utils"

const Steps = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-2", className)}
    {...props}
  />
))
Steps.displayName = "Steps"

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-2 w-2 rounded-full",
      active ? "bg-primary" : "bg-muted",
      className
    )}
    {...props}
  />
))
Step.displayName = "Step"

export { Steps, Step }

