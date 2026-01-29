"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

export type TableSectionBadgeVariant =
  | "error"
  | "warning"
  | "success"
  | "plain";

const badgeVariantClasses: Record<TableSectionBadgeVariant, string> = {
  error: "text-[var(--color-coral-text)] bg-[var(--color-coral-bg)]",
  warning: "text-[var(--color-yellow-text)] bg-[var(--color-yellow-bg)]",
  success: "text-[var(--color-green-text)] bg-[var(--color-green-bg)]",
  plain: "text-[var(--color-coral-text)] bg-transparent",
};

export interface TableSectionProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  icon?: React.ReactNode;
  title: string;
  meta?: string;
  /** 헤더 오른쪽에 배치할 액션(예: 버튼). badge보다 우선 표시됩니다. */
  headerAction?: React.ReactNode;
  badge?: React.ReactNode;
  badgeVariant?: TableSectionBadgeVariant;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const TableSection = React.forwardRef<HTMLDivElement, TableSectionProps>(
  (
    {
      icon,
      title,
      meta,
      headerAction,
      badge,
      badgeVariant = "error",
      children,
      footer,
      className,
      ...props
    },
    ref,
  ) => {
    const rightContent =
      headerAction ??
      (badge != null ? (
        <span
          className={cn(
            "shrink-0 self-center text-sm font-semibold",
            badgeVariant !== "plain" && "rounded-md px-2.5 py-1.5 font-medium",
            badgeVariantClasses[badgeVariant],
          )}
        >
          {badge}
        </span>
      ) : null);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden flex flex-col min-w-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-content-border)] p-4 min-h-[72px]">
          <div className="flex items-start gap-3 min-w-0 flex-1 overflow-hidden">
            {icon != null ? (
              <div
                className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-content-border)]/60 p-2 text-[var(--color-sidebar-hover-text)] size-12"
                aria-hidden
              >
                {icon}
              </div>
            ) : null}
            <div className="min-w-0 flex-1 overflow-hidden space-y-1">
              <h3 className="text-base font-bold text-[var(--color-sidebar-hover-text)] truncate">
                {title}
              </h3>
              {meta != null && meta.length > 0 ? (
                <p className="text-sm text-[var(--color-text-light-gray)] truncate">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>
          {rightContent}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
        {footer != null ? (
          <div className="border-t border-[var(--color-content-border)] p-4 min-w-0">
            {footer}
          </div>
        ) : null}
      </div>
    );
  },
);
TableSection.displayName = "TableSection";

export { TableSection };
