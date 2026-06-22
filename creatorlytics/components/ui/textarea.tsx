import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border border-cly-border bg-cly-surface px-2.5 py-2 text-sm text-cly-text transition-colors outline-none placeholder:text-cly-text-muted focus-visible:border-cly-brand focus-visible:ring-2 focus-visible:ring-cly-brand/20 disabled:cursor-not-allowed disabled:bg-cly-muted disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
