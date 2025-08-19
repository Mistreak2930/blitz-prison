import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const minecraftButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-bold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-blocky hover:shadow-hover hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none",
        destructive: "bg-destructive text-destructive-foreground shadow-blocky hover:shadow-hover hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none",
        outline: "border-2 border-primary bg-card text-foreground shadow-blocky hover:bg-primary hover:text-primary-foreground hover:shadow-hover hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none",
        secondary: "bg-secondary text-secondary-foreground shadow-blocky hover:shadow-hover hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none",
        accent: "bg-accent text-accent-foreground shadow-accent hover:shadow-accent hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground shadow-hover hover:shadow-accent hover:translate-y-[-3px] active:translate-y-[2px] active:shadow-blocky text-lg font-black",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-sm px-8",
        xl: "h-14 rounded-sm px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface MinecraftButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof minecraftButtonVariants> {
  asChild?: boolean
}

const MinecraftButton = React.forwardRef<HTMLButtonElement, MinecraftButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(minecraftButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
MinecraftButton.displayName = "MinecraftButton"

export { MinecraftButton, minecraftButtonVariants }