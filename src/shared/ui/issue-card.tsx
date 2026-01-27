import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const riskLevelVariants = cva("", {
  variants: {
    riskLevel: {
      high: "text-[var(--color-coral-text)]",
      medium: "text-[var(--color-yellow-text)]",
      low: "text-[var(--color-green-text)]",
    },
  },
});

export type IssueCardRiskLevel = "high" | "medium" | "low";

const RISK_LABELS: Record<IssueCardRiskLevel, string> = {
  high: "위험도 높음",
  medium: "위험도 중간",
  low: "위험도 낮음",
};

export interface IssueCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof riskLevelVariants> {
  timestamp?: string;
  title: string;
  subtitle?: string;
  detectedCount?: number | string;
  riskLevel: IssueCardRiskLevel;
}

const IssueCard = React.forwardRef<HTMLDivElement, IssueCardProps>(
  (
    {
      timestamp,
      title,
      subtitle,
      detectedCount,
      riskLevel,
      className,
      ...props
    },
    ref,
  ) => {
    const countText =
      typeof detectedCount === "number"
        ? `검출된 개인정보 ${detectedCount}건`
        : detectedCount;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1 rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] p-2.5 min-w-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            {timestamp != null ? (
              <p className="text-[13px] leading-tight text-[var(--color-text-light-gray)]">
                {timestamp}
              </p>
            ) : null}
            <p className="text-[14px] leading-snug font-regular text-[var(--color-sidebar-hover-text)] break-words whitespace-normal">
              {title}
            </p>
          </div>
          <div className="shrink-0 text-right flex flex-col gap-0.5">
            {countText != null ? (
              <p className="text-[12px] leading-tight text-[var(--color-text-light-gray)]">
                {countText}
              </p>
            ) : null}
            <p
              className={cn(
                "text-[14px] leading-snug font-semibold",
                riskLevelVariants({ riskLevel }),
              )}
            >
              {RISK_LABELS[riskLevel]}
            </p>
          </div>
        </div>

        {subtitle != null ? (
          <p className="text-[12px] leading-snug text-[var(--color-text-light-gray)] break-words whitespace-normal">
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  },
);
IssueCard.displayName = "IssueCard";

export { IssueCard, riskLevelVariants, RISK_LABELS };
