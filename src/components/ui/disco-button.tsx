
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const discoButtonVariants = cva(
  "relative overflow-hidden rounded-lg text-sm font-medium transition-colors will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary/50 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black",
        primary: "bg-primary",
        secondary: "bg-secondary",
        outline: "bg-transparent border border-primary",
      },
      size: {
        default: "px-8 py-3",
        sm: "px-4 py-2",
        lg: "px-10 py-4",
        xl: "px-20 py-6",
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
    const bgColor = variant === 'primary' 
      ? 'bg-primary' 
      : variant === 'secondary' 
        ? 'bg-secondary' 
        : variant === 'outline'
          ? 'bg-transparent'
          : 'bg-black';
          
    const textColor = variant === 'outline'
      ? 'text-primary'
      : variant === 'default' || variant === 'primary' || variant === 'secondary'
        ? 'text-white'
        : 'text-white';

    return (
      <button
        className={cn(discoButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <span className={`absolute inset-px z-10 grid place-items-center rounded-lg ${bgColor} ${disabled ? '' : 'bg-gradient-to-t from-neutral-800'} ${textColor}`}>
          {children}
        </span>
        {!disabled && (
          <span 
            aria-hidden 
            className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-700 before:via-primary before:to-amber-400" 
          />
        )}
      </button>
    )
  }
)
DiscoButton.displayName = "DiscoButton"

export { DiscoButton }
