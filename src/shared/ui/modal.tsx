"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type ModalSize = "narrow" | "wide";

const sizeClasses: Record<ModalSize, string> = {
  narrow: "max-w-md w-full",
  wide: "max-w-4xl w-full",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      footer,
      size = "narrow",
      className,
    },
    ref,
  ) => {
    const panelRef = React.useRef<HTMLDivElement>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    React.useLayoutEffect(() => {
      if (open) closeButtonRef.current?.focus();
    }, [open]);

    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown, true);
      return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [open, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    };

    if (!open) return null;

    const modal = (
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden
          onClick={handleBackdropClick}
        />
        <div
          ref={panelRef}
          className={cn(
            "relative z-10 flex max-h-[90vh] flex-col rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] shadow-xl",
            sizeClasses[size],
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-content-border)] px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-[var(--color-text-light-gray)] transition-colors hover:bg-[var(--color-content-border)]/50 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-content-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-sidebar-bg)] cursor-pointer"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {footer != null ? (
            <div className="shrink-0 border-t border-[var(--color-content-border)] px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(modal, document.body);
  },
);
Modal.displayName = "Modal";

export { Modal };
