"use client";

import * as React from "react";
import { Plane } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const FLY_STRAIGHT_STYLE = `
@keyframes fly-straight {
  0% {
    transform: translateX(-100%) rotate(30deg);
    opacity: 0;
  }
  50% {
    transform: translateX(0%) rotate(30deg);
    opacity: 1;
  }
  100% {
    transform: translateX(120%) rotate(30deg);
    opacity: 0;
  }
}
.loading-indicator-plane {
  animation: fly-straight 2s linear infinite;
}
`;

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
} as const;

export interface LoadingIndicatorProps {
  /** 로딩 메시지 (없으면 아이콘만) */
  message?: string;
  /** 아이콘 크기 */
  size?: keyof typeof sizeClasses;
  /** 메시지 색상용 className */
  messageClassName?: string;
  /** 컨테이너용 className (중앙 정렬 등) */
  className?: string;
  /** 접근성 라벨 */
  "aria-label"?: string;
}

function LoadingIndicator({
  message,
  size = "lg",
  messageClassName,
  className,
  "aria-label": ariaLabel,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
      role={ariaLabel ? "status" : undefined}
      aria-label={ariaLabel}
    >
      <style>{FLY_STRAIGHT_STYLE}</style>
      <div className="relative flex items-center justify-center min-w-[120px] min-h-[80px]">
        <Plane
          className={cn(
            "text-[var(--color-main-bg)] loading-indicator-plane",
            sizeClasses[size],
          )}
          aria-hidden
        />
      </div>
      {message && (
        <p
          className={cn(
            "text-sm text-[var(--color-text-light-gray)]",
            messageClassName,
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

LoadingIndicator.displayName = "LoadingIndicator";

export { LoadingIndicator };
