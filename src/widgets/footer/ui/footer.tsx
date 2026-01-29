"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { FOOTER } from "@/content/footer";

export type FooterVariant = "auth" | "sidebar";

const LINK_KINDS = [
  { label: "개인정보 처리방침", kind: "privacy" as const },
  { label: "이용약관", kind: "terms" as const },
] as const;

export interface FooterProps {
  variant: FooterVariant;
  className?: string;
  /** 로그인/회원가입 푸터에서 클릭 시 모달로 열 때 사용 */
  onOpenTerms?: (kind: "terms" | "privacy") => void;
}

export function Footer({ variant, className, onOpenTerms }: FooterProps) {
  const isAuth = variant === "auth";

  return (
    <footer
      className={cn(
        "shrink-0 text-[var(--color-text-light-gray)]",
        isAuth
          ? "w-full border-t border-white/10 bg-[var(--color-footer-bg)] px-6 py-5 backdrop-blur-sm"
          : "border-t border-[var(--color-sidebar-border)] bg-[var(--color-footer-bg)] px-4 py-4",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-2",
          isAuth
            ? "mx-auto max-w-6xl items-center justify-between gap-8 text-sm"
            : "flex-col text-xs",
        )}
      >
        {isAuth && (
          <div className="shrink-0 whitespace-nowrap text-2xl font-bold tracking-wider">
            <span className="text-[var(--color-main-bg)]">PII</span>
            <span className="text-[var(--color-text-light-gray)]">LOT</span>
          </div>
        )}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1.5 text-left",
            isAuth && "ml-10 flex-1 items-start",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {LINK_KINDS.map((item, i) => (
              <span key={item.kind} className="flex items-center gap-x-2">
                {i > 0 && (
                  <span className="text-[var(--color-text-light-gray)] opacity-70">
                    |
                  </span>
                )}
                {onOpenTerms ? (
                  <button
                    type="button"
                    onClick={() => onOpenTerms(item.kind)}
                    className="cursor-pointer text-white hover:underline hover:text-white/90"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.kind === "terms" ? "/terms" : "/privacy-policy"}
                    className="cursor-pointer text-white hover:underline hover:text-white/90"
                  >
                    {item.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          <div
            className={cn(
              "flex flex-col gap-0.5 text-[inherit]",
              !isAuth && "text-[var(--color-sidebar-text)]",
            )}
          >
            {isAuth ? (
              <>
                <span className="whitespace-nowrap">
                  {FOOTER.company.representative}
                  <span className="mx-1.5 opacity-70">|</span>
                  {FOOTER.company.address}
                  <span className="mx-1.5 opacity-70">|</span>
                  {FOOTER.company.businessNumber}
                </span>
                <span>
                  {FOOTER.contact} {FOOTER.contactHours}
                </span>
              </>
            ) : (
              <>
                <span>{FOOTER.company.representative}</span>
                <span>{FOOTER.company.address}</span>
                <span>{FOOTER.company.businessNumber}</span>
                <span>{FOOTER.contact}</span>
                <span>{FOOTER.contactHours}</span>
              </>
            )}
          </div>
          {isAuth ? (
            <p className="mt-0.5 text-[inherit] opacity-80">
              {FOOTER.copyright}
            </p>
          ) : (
            <div className="mt-0.5 flex flex-col gap-0.5 text-[inherit] opacity-80">
              <span>{FOOTER.copyrightLine1}</span>
              <span>{FOOTER.copyrightLine2}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
