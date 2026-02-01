import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50 overflow-hidden select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl shadow-[0_2px_8px_-2px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_24px_-4px_rgba(79,70,229,0.45)] hover:brightness-110 active:scale-[0.97] active:shadow-[0_1px_4px_-1px_rgba(79,70,229,0.3)] btn-shine",
        destructive:
          "bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl shadow-[0_2px_8px_-2px_rgba(225,29,72,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)] hover:brightness-110 active:scale-[0.97]",
        outline:
          "border-2 border-blue-200/80 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 active:scale-[0.97] shadow-sm hover:shadow-[0_4px_16px_-4px_rgba(59,130,246,0.2)]",
        secondary:
          "bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200/80 hover:text-slate-900 active:scale-[0.97] shadow-sm",
        ghost:
          "text-slate-600 rounded-xl hover:bg-blue-50/60 hover:text-blue-700 active:scale-[0.97]",
        link:
          "text-blue-600 underline-offset-4 decoration-blue-300/0 hover:decoration-blue-400/100 hover:underline hover:text-blue-700 transition-all",
        glow:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)] hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.65)] hover:brightness-110 active:scale-[0.97] btn-shine animate-glow",
      },
      size: {
        default: "min-h-10 px-5 py-2.5 gap-2",
        sm: "min-h-9 rounded-lg px-3.5 py-2 text-xs gap-1.5",
        lg: "min-h-12 rounded-xl px-8 py-3 text-base gap-2.5",
        xl: "min-h-14 rounded-2xl px-10 py-4 text-base font-bold gap-3",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
