import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary Purple Button
        default: "bg-purple text-primary-foreground hover:bg-purple-dark shadow-soft hover:shadow-medium",
        
        // Secondary Cyan Button (filled)
        secondary: "bg-cyan text-secondary-foreground hover:bg-cyan-dark shadow-soft hover:shadow-medium",
        
        // Purple Outline Button
        "purple-outline": "border-2 border-purple text-purple bg-transparent hover:bg-purple hover:text-primary-foreground",
        
        // Cyan Outline Button
        "cyan-outline": "border-2 border-cyan text-cyan bg-transparent hover:bg-cyan hover:text-secondary-foreground",
        
        // Gray Outline (Tertiary/Login)
        "gray-outline": "border-2 border-charcoal text-charcoal bg-transparent hover:bg-charcoal hover:text-primary-foreground",
        
        // Ghost variant
        ghost: "text-charcoal hover:bg-neutral-light hover:text-charcoal",
        
        // Link variant
        link: "text-purple underline-offset-4 hover:underline",
        
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Outline (generic)
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };