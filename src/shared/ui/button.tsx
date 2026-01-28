import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] aria-invalid:ring-[var(--color-coral-text)]/20 dark:aria-invalid:ring-[var(--color-coral-text)]/40 aria-invalid:border-[var(--color-coral-text)] cursor-pointer";

const buttonVariants = cva(base, {
  variants: {
    colorScheme: {
      main: "",
      mint: "",
      purple: "",
      green: "",
      coral: "",
      neutral: "",
      destructive: "",
      warning: "",
    },
    appearance: {
      solid: "",
      outline: "",
      ghost: "",
      link: "",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-10",
    },
  },
  compoundVariants: [
    {
      colorScheme: "main",
      appearance: "solid",
      class:
        "bg-[var(--color-main-bg)] text-[var(--color-bg-main)] hover:opacity-90 focus-visible:ring-[var(--color-main-bg)]/50",
    },
    {
      colorScheme: "main",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-main-border)] bg-transparent text-[var(--color-main-text)] hover:bg-[var(--color-main-bg)]/15 focus-visible:ring-[var(--color-main-border)]/50",
    },
    {
      colorScheme: "main",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-main-text)] hover:bg-[var(--color-main-bg)]/15 focus-visible:ring-[var(--color-main-bg)]/50",
    },
    {
      colorScheme: "main",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-main-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-main-bg)]/50",
    },
    {
      colorScheme: "mint",
      appearance: "solid",
      class:
        "bg-[var(--color-mint-border)] text-white hover:opacity-90 focus-visible:ring-[var(--color-mint-border)]/50",
    },
    {
      colorScheme: "mint",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-mint-border)] bg-transparent text-[var(--color-mint-text)] hover:bg-[var(--color-mint-bg)] focus-visible:ring-[var(--color-mint-border)]/50",
    },
    {
      colorScheme: "mint",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-mint-text)] hover:bg-[var(--color-mint-bg)] focus-visible:ring-[var(--color-mint-border)]/50",
    },
    {
      colorScheme: "mint",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-mint-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-mint-border)]/50",
    },
    {
      colorScheme: "purple",
      appearance: "solid",
      class:
        "bg-[var(--color-purple-border)] text-white hover:opacity-90 focus-visible:ring-[var(--color-purple-border)]/50",
    },
    {
      colorScheme: "purple",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-purple-border)] bg-transparent text-[var(--color-purple-text)] hover:bg-[var(--color-purple-bg)] focus-visible:ring-[var(--color-purple-border)]/50",
    },
    {
      colorScheme: "purple",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-purple-text)] hover:bg-[var(--color-purple-bg)] focus-visible:ring-[var(--color-purple-border)]/50",
    },
    {
      colorScheme: "purple",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-purple-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-purple-border)]/50",
    },
    {
      colorScheme: "green",
      appearance: "solid",
      class:
        "bg-[var(--color-green-border)] text-white hover:opacity-90 focus-visible:ring-[var(--color-green-border)]/50",
    },
    {
      colorScheme: "green",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-green-border)] bg-transparent text-[var(--color-green-text)] hover:bg-[var(--color-green-bg)] focus-visible:ring-[var(--color-green-border)]/50",
    },
    {
      colorScheme: "green",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-green-text)] hover:bg-[var(--color-green-bg)] focus-visible:ring-[var(--color-green-border)]/50",
    },
    {
      colorScheme: "green",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-green-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-green-border)]/50",
    },
    {
      colorScheme: "coral",
      appearance: "solid",
      class:
        "bg-[var(--color-coral-border)] text-white hover:opacity-90 focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "coral",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-coral-border)] bg-transparent text-[var(--color-coral-text)] hover:bg-[var(--color-coral-bg)] focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "coral",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-coral-text)] hover:bg-[var(--color-coral-bg)] focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "coral",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-coral-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "neutral",
      appearance: "solid",
      class:
        "bg-[var(--color-content-border)] text-[var(--color-sidebar-hover-text)] hover:bg-[var(--color-sidebar-hover-bg)] focus-visible:ring-[var(--color-content-border)]/50",
    },
    {
      colorScheme: "neutral",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-content-border)] bg-transparent text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)] hover:text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-content-border)]/50",
    },
    {
      colorScheme: "neutral",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)] hover:text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-content-border)]/50",
    },
    {
      colorScheme: "neutral",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-sidebar-text)] underline-offset-4 hover:underline hover:text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-content-border)]/50",
    },
    {
      colorScheme: "warning",
      appearance: "solid",
      class:
        "bg-[var(--color-yellow-text)] text-[var(--color-bg-page)] hover:opacity-90 focus-visible:ring-[var(--color-yellow-text)]/50",
    },
    {
      colorScheme: "warning",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-yellow-border)] bg-transparent text-[var(--color-yellow-text)] hover:bg-[var(--color-yellow-bg)] focus-visible:ring-[var(--color-yellow-border)]/50",
    },
    {
      colorScheme: "warning",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-yellow-text)] hover:bg-[var(--color-yellow-bg)] focus-visible:ring-[var(--color-yellow-border)]/50",
    },
    {
      colorScheme: "warning",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-yellow-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-yellow-border)]/50",
    },
    {
      colorScheme: "destructive",
      appearance: "solid",
      class:
        "bg-[var(--color-coral-border)] text-white hover:opacity-90 focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "destructive",
      appearance: "outline",
      class:
        "border-2 border-[var(--color-coral-border)] bg-transparent text-[var(--color-coral-text)] hover:bg-[var(--color-coral-bg)] focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "destructive",
      appearance: "ghost",
      class:
        "bg-transparent text-[var(--color-coral-text)] hover:bg-[var(--color-coral-bg)] focus-visible:ring-[var(--color-coral-border)]/50",
    },
    {
      colorScheme: "destructive",
      appearance: "link",
      class:
        "bg-transparent text-[var(--color-coral-text)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-coral-border)]/50",
    },
  ],
  defaultVariants: {
    colorScheme: "main",
    appearance: "solid",
    size: "default",
  },
});

export type ButtonColorScheme = NonNullable<
  VariantProps<typeof buttonVariants>["colorScheme"]
>;
export type ButtonAppearance = NonNullable<
  VariantProps<typeof buttonVariants>["appearance"]
>;

export type WorkStatus = "진행중" | "해결완료" | "진행시작";

export const WORK_STATUS_BUTTON_PROPS: Record<
  WorkStatus,
  { colorScheme: ButtonColorScheme; appearance: "outline"; size: "sm" }
> = {
  진행중: { colorScheme: "warning", appearance: "outline", size: "sm" },
  해결완료: { colorScheme: "green", appearance: "outline", size: "sm" },
  진행시작: { colorScheme: "coral", appearance: "outline", size: "sm" },
};

function Button({
  className,
  colorScheme = "main",
  appearance = "solid",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-color-scheme={colorScheme}
      data-appearance={appearance}
      data-size={size}
      className={cn(
        buttonVariants({ colorScheme, appearance, size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
