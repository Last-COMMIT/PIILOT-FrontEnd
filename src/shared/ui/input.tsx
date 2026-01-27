import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const inputVariants = cva(
  [
    "flex w-full rounded-md border bg-transparent text-sm transition-colors",
    "placeholder:text-[var(--color-sidebar-text)] placeholder:opacity-60",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-content-border)]/20",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-offset-0 focus-visible:ring-offset-[var(--color-bg-main)]",
    "aria-invalid:border-[var(--color-coral-text)] aria-invalid:focus-visible:ring-[var(--color-coral-text)]/50",
  ].join(" "),
  {
    variants: {
      colorScheme: {
        neutral: "",
        main: "",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-4",
        lg: "h-10 px-4",
      },
    },
    compoundVariants: [
      {
        colorScheme: "neutral",
        class:
          "border-[var(--color-content-border)] text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-content-border)]",
      },
      {
        colorScheme: "main",
        class:
          "border-[var(--color-content-border)] text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-main-bg)]/50 focus-visible:border-[var(--color-main-bg)]",
      },
    ],
    defaultVariants: {
      colorScheme: "neutral",
      size: "default",
    },
  }
)

export type InputColorScheme = NonNullable<
  VariantProps<typeof inputVariants>["colorScheme"]
>
export type InputSize = NonNullable<VariantProps<typeof inputVariants>["size"]>

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, colorScheme, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ colorScheme, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
