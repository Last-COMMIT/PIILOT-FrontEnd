"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const triggerVariants = cva(
  [
    "flex w-full items-center justify-between gap-2 rounded-md border bg-transparent text-sm text-left transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-offset-0 focus-visible:ring-offset-[var(--color-bg-main)]",
    "aria-expanded:ring-[3px] aria-expanded:border-[var(--color-content-border)] aria-expanded:ring-[var(--color-content-border)]",
  ].join(" "),
  {
    variants: {
      colorScheme: {
        neutral:
          "border-[var(--color-content-border)] text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-content-border)]",
        main: "border-[var(--color-content-border)] text-[var(--color-sidebar-hover-text)] focus-visible:ring-[var(--color-main-bg)]/50 focus-visible:border-[var(--color-main-bg)]",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-4",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      colorScheme: "neutral",
      size: "default",
    },
  },
);

const listClasses = [
  "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] py-1 shadow-lg",
].join(" ");

const optionClasses = [
  "flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-[var(--color-sidebar-hover-text)] outline-none",
  "hover:bg-[var(--color-mint-bg)] focus:bg-[var(--color-mint-bg)]",
  "data-[selected=true]:bg-[var(--color-mint-bg)] data-[selected=true]:text-[var(--color-mint-text)]",
].join(" ");

export type DropdownSize = NonNullable<
  VariantProps<typeof triggerVariants>["size"]
>;
export type DropdownColorScheme = NonNullable<
  VariantProps<typeof triggerVariants>["colorScheme"]
>;

export interface DropdownProps extends VariantProps<typeof triggerVariants> {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

function Dropdown({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  disabled = false,
  colorScheme = "neutral",
  size = "default",
  className,
  triggerClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      handleClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, handleClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
      return;
    }
    if (!isOpen) return;
    const i = options.findIndex((o) => o.value === value);
    if (e.key === "ArrowDown" && i < options.length - 1) {
      e.preventDefault();
      onChange?.(options[i + 1].value);
    }
    if (e.key === "ArrowUp" && i > 0) {
      e.preventDefault();
      onChange?.(options[i - 1].value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={displayLabel}
        className={cn(
          triggerVariants({ colorScheme, size }),
          !isOpen && "hover:bg-[var(--color-sidebar-hover-bg)]",
          triggerClassName,
        )}
        onClick={() => setIsOpen((p) => !p)}
      >
        <span
          className={cn(
            "flex-1 truncate text-left flex items-center gap-2",
            !selectedOption && "text-[var(--color-sidebar-text)]",
          )}
        >
          {selectedOption?.icon}
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 opacity-70 transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-activedescendant={value ? `dropdown-option-${value}` : undefined}
          className={listClasses}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              id={`dropdown-option-${opt.value}`}
              role="option"
              aria-selected={value === opt.value}
              data-selected={value === opt.value ? "true" : "false"}
              className={optionClasses}
              onClick={() => {
                onChange?.(opt.value);
                handleClose();
              }}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

Dropdown.displayName = "Dropdown";

export { Dropdown };
