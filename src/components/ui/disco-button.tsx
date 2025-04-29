
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const discoButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/80",
        primary: "bg-primary text-white hover:bg-primary/80",
        secondary: "bg-secondary text-white hover:bg-secondary/80",
        outline: "bg-transparent border border-primary text-primary hover:bg-primary/10",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2 rounded-md",
        lg: "h-11 px-8 rounded-md",
        xl: "h-12 px-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface DiscoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof discoButtonVariants> {
  children: React.ReactNode
}

const DiscoButton = React.forwardRef<HTMLButtonElement, DiscoButtonProps>(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(discoButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DiscoButton.displayName = "DiscoButton"

export { DiscoButton }
