import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("rounded-md bg-primary/10 relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  )
}

export { Skeleton }
