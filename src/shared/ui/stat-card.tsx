import * as React from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statCardVariants = cva(
  "rounded-xl p-5 flex flex-col gap-4 min-w-0 border",
  {
    variants: {
      colorScheme: {
        default:
          "bg-[var(--color-card-bg)] border-[var(--color-content-border)]",
        mint: "bg-[var(--color-mint-bg)] border-[var(--color-mint-border)]",
        purple:
          "bg-[var(--color-purple-bg)] border-[var(--color-purple-border)]",
        green: "bg-[var(--color-green-bg)] border-[var(--color-green-border)]",
        coral: "bg-[var(--color-coral-bg)] border-[var(--color-coral-border)]",
      },
    },
    defaultVariants: {
      colorScheme: "default",
    },
  },
);

const iconBoxVariants = cva(
  "flex size-10 shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      colorScheme: {
        default:
          "bg-[var(--color-content-border)]/50 text-[var(--color-option-text)]",
        mint: "bg-[var(--color-mint-bg)] text-[var(--color-mint-text)]",
        purple: "bg-[var(--color-purple-bg)] text-[var(--color-purple-text)]",
        green: "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
        coral: "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]",
      },
    },
    defaultVariants: {
      colorScheme: "default",
    },
  },
);

export type StatCardColorScheme = VariantProps<
  typeof statCardVariants
>["colorScheme"];

export interface StatCardProps
  extends
    VariantProps<typeof statCardVariants>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "colorScheme"> {
  title: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  trend?: "up" | "down";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      detail,
      icon,
      trend,
      iconColor,
      iconBgColor,
      colorScheme = "default",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ colorScheme }), className)}
        {...props}
      >
        <div className="flex gap-4 items-start">
          <div className="min-w-0 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] truncate">
              {title}
            </h3>
            <p className="text-2xl font-bold text-white tabular-nums">
              {value}
            </p>
            {detail != null ? (
              <p
                className={cn(
                  "text-sm flex items-center gap-1",
                  trend === "down"
                    ? "text-[var(--color-coral-text)]"
                    : "text-[var(--color-green-text)]",
                )}
              >
                {trend === "up" ? (
                  <ArrowUp className="size-4 shrink-0" aria-hidden />
                ) : trend === "down" ? (
                  <ArrowUp className="size-4 shrink-0 rotate-180" aria-hidden />
                ) : null}
                {detail}
              </p>
            ) : null}
          </div>
          {icon != null ? (
            <div
              className={cn(iconBoxVariants({ colorScheme }), "shrink-0")}
              style={{
                ...(iconColor != null && { color: iconColor }),
                ...(iconBgColor != null && { backgroundColor: iconBgColor }),
              }}
              aria-hidden
            >
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
