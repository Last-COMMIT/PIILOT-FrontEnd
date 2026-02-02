import * as React from "react";
import Image from "next/image";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export type ConnectionStatusVariant = "success" | "warning" | "error";

export type ConnectionActionVariant =
  | "default"
  | "detail"
  | "scan"
  | "edit"
  | "delete";

export type ConnectionDbType = "postgresql" | "oracle" | "mysql";

export type ConnectionCardIconSize = "sm" | "md" | "lg" | "xl" | "2xl";

const iconSizeClasses: Record<ConnectionCardIconSize, string> = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "size-20",
  "2xl": "size-24",
};

const DB_ICON_SIZE: Record<ConnectionCardIconSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
  "2xl": 96,
};

const DB_ICON_SRC: Record<ConnectionDbType, string> = {
  postgresql: "/images/postgresql_icon.png",
  oracle: "/images/oracle_icon.png",
  mysql: "/images/mysql_icon.png",
};

const statusColorMap: Record<ConnectionStatusVariant, string> = {
  success: "text-[var(--color-green-text)] bg-[var(--color-green-bg)]",
  warning: "text-[var(--color-yellow-text)] bg-[var(--color-yellow-bg)]",
  error: "text-[var(--color-coral-text)] bg-[var(--color-coral-bg)]",
};

type ActionButtonConfig = {
  colorScheme: "neutral" | "green" | "coral";
  appearance: "outline";
  className?: string;
};
const actionButtonMap: Record<ConnectionActionVariant, ActionButtonConfig> = {
  default: { colorScheme: "neutral", appearance: "outline" },
  detail: { colorScheme: "green", appearance: "outline" },
  scan: {
    colorScheme: "neutral",
    appearance: "outline",
    className:
      "!border-2 !border-[var(--color-yellow-border)] !text-[var(--color-yellow-text)] hover:!bg-[var(--color-yellow-bg)] focus-visible:!ring-[var(--color-yellow-border)]/50",
  },
  edit: { colorScheme: "green", appearance: "outline" },
  delete: { colorScheme: "coral", appearance: "outline" },
};

export interface ConnectionDetailItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ConnectionActionItem {
  label: string;
  variant?: ConnectionActionVariant;
  onClick?: () => void;
  hidden?: boolean;
}

export interface ConnectionCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "content"
> {
  dbType?: ConnectionDbType;
  icon?: React.ReactNode;
  iconSize?: ConnectionCardIconSize;
  title: string;
  subtitle?: string;
  content?: React.ReactNode;
  status?: string;
  statusVariant?: ConnectionStatusVariant;
  details?: ConnectionDetailItem[];
  actions?: ConnectionActionItem[];
}

const ConnectionCard = React.forwardRef<HTMLDivElement, ConnectionCardProps>(
  (
    {
      dbType,
      icon,
      iconSize = "md",
      title,
      subtitle,
      content,
      status,
      statusVariant = "success",
      details = [],
      actions = [],
      className,
      ...props
    },
    ref,
  ) => {
    const displayIcon =
      icon ??
      (dbType != null ? (
        <Image
          src={DB_ICON_SRC[dbType]}
          alt=""
          width={DB_ICON_SIZE[iconSize]}
          height={DB_ICON_SIZE[iconSize]}
          className="shrink-0 object-contain"
          aria-hidden
        />
      ) : null);
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] p-4 flex flex-col gap-4 min-w-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {displayIcon != null ? (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-content-border)]/60 p-2 text-[var(--color-sidebar-hover-text)]",
                  iconSizeClasses[iconSize],
                )}
                aria-hidden
              >
                {displayIcon}
              </div>
            ) : null}
            <div className="min-w-0 flex-1 overflow-hidden space-y-1">
              <h3 className="text-base font-bold text-[var(--color-sidebar-hover-text)] truncate">
                {title}
              </h3>
              {subtitle != null ? (
                <p className="text-sm text-[var(--color-text-light-gray)] truncate">
                  {subtitle}
                </p>
              ) : null}
              {content != null ? (
                <div className="min-w-0 pt-0.5">{content}</div>
              ) : null}
            </div>
          </div>
          {status != null ? (
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
                statusColorMap[statusVariant],
              )}
            >
              {status}
            </span>
          ) : null}
        </div>

        {details.length > 0 ? (
          <div className="flex min-w-0 flex-col gap-y-1 text-sm">
            {details.map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-between gap-4"
              >
                <span className="shrink-0 text-left text-[var(--color-text-light-gray)]">
                  {label}
                </span>
                <span
                  className={cn(
                    "min-w-0 truncate text-right",
                    highlight
                      ? "text-[var(--color-yellow-text)] font-medium"
                      : "text-[var(--color-sidebar-hover-text)]",
                  )}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {actions.length > 0 ? (
          <div className="grid min-w-0 grid-cols-3 gap-2">
            {actions
              .filter((a) => !a.hidden)
              .slice(0, 3)
              .map(({ label, variant = "default", onClick }) => {
                const config = actionButtonMap[variant];
                return (
                  <Button
                    key={label}
                    type="button"
                    size="sm"
                    colorScheme={config.colorScheme}
                    appearance={config.appearance}
                    className={cn("min-w-0", config.className)}
                    onClick={onClick}
                  >
                    {label}
                  </Button>
                );
              })}
          </div>
        ) : null}
      </div>
    );
  },
);
ConnectionCard.displayName = "ConnectionCard";

export { ConnectionCard };
