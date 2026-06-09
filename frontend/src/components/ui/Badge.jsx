import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    default: "border-transparent bg-primary-600 text-white shadow hover:bg-primary-700",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50",
    destructive: "border-transparent bg-error text-white shadow hover:bg-error/80",
    outline: "text-foreground",
    success: "border-transparent bg-success/10 text-success hover:bg-success/20",
    warning: "border-transparent bg-warning/10 text-warning hover:bg-warning/20",
    pending: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200",
  }
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div className={cn(badgeVariants.base, badgeVariants.variants[variant], className)} {...props} />
  )
}

export { Badge, badgeVariants }
