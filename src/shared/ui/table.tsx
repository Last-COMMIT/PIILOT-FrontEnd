"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

export type TableColumnAlign = "left" | "center" | "right";

export interface TableColumn<T = Record<string, unknown>> {
  id: string;
  label: string;
  width?: number | string;
  align?: TableColumnAlign;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  columns: TableColumn<T>[];
  data: T[];
  scrollable?: boolean;
  maxBodyHeight?: string;
  width?: number | string;
  selectedRowIndex?: number;
  onRowClick?: (row: T, index: number) => void;
  rowSelectionEnabled?: boolean;
}

const alignClasses: Record<TableColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function getGridTemplate(
  columns: readonly { width?: number | string }[],
): string {
  return columns
    .map((col) => {
      const w = col.width;
      if (typeof w === "number") return `${w}fr`;
      if (typeof w === "string") return w;
      return "1fr";
    })
    .join(" ");
}

function TableInner<T extends Record<string, unknown>>(
  {
    columns,
    data,
    scrollable = true,
    maxBodyHeight,
    width,
    selectedRowIndex,
    onRowClick,
    rowSelectionEnabled = true,
    className,
    style,
    ...props
  }: TableProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const template = React.useMemo(() => getGridTemplate(columns), [columns]);

  const resolvedWidth =
    width != null
      ? typeof width === "number"
        ? `${width}px`
        : width
      : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] text-sm",
        width == null && "w-full",
        className,
      )}
      style={{
        ...(resolvedWidth != null && { width: resolvedWidth }),
        ...style,
      }}
      {...props}
    >
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          scrollable && "overflow-x-auto",
        )}
      >
        <div className={cn("flex min-w-0 flex-col", scrollable && "min-w-max")}>
          <div
            role="table"
            aria-label="데이터 테이블"
            className={cn("flex min-w-0 flex-col", scrollable && "min-w-max")}
          >
            <div role="rowgroup" className="shrink-0">
              <div
                className="grid shrink-0 border-b border-[var(--color-text-light-gray)] bg-[var(--color-sidebar-bg)] font-medium text-white"
                style={{ gridTemplateColumns: template }}
                role="row"
              >
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className={cn(
                      "flex min-w-0 items-center overflow-hidden px-4 py-3",
                      alignClasses[col.align ?? "left"],
                    )}
                    role="columnheader"
                  >
                    <span className="w-full min-w-0 truncate">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={cn(
                "min-h-0 pr-0.5 pl-0",
                maxBodyHeight != null &&
                  "flex-1 overflow-y-auto [scrollbar-gutter:stable]",
              )}
              style={
                maxBodyHeight != null ? { maxHeight: maxBodyHeight } : undefined
              }
              role="rowgroup"
              tabIndex={maxBodyHeight != null ? 0 : undefined}
            >
              {data.map((row, rowIndex) => {
                const selectable = rowSelectionEnabled && onRowClick != null;
                const isActive = selectable && selectedRowIndex === rowIndex;
                return (
                  <div
                    key={rowIndex}
                    className={cn(
                      "grid border-b text-[var(--color-text-muted)] last:border-b-0",
                      isActive
                        ? "border-2 border-[var(--color-mint-border)] bg-[var(--color-mint-bg)]"
                        : "border-b border-[var(--color-content-border)]",
                      selectable && "cursor-pointer",
                    )}
                    style={{ gridTemplateColumns: template }}
                    role="row"
                    tabIndex={selectable ? 0 : undefined}
                    onClick={
                      selectable ? () => onRowClick(row, rowIndex) : undefined
                    }
                    onKeyDown={
                      selectable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onRowClick?.(row, rowIndex);
                            }
                          }
                        : undefined
                    }
                    aria-selected={selectable ? isActive : undefined}
                  >
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[col.id];
                      const content =
                        col.render?.(value, row) ?? (value as React.ReactNode);
                      return (
                        <div
                          key={col.id}
                          className={cn(
                            "flex min-w-0 items-center overflow-hidden px-4 py-3",
                            alignClasses[col.align ?? "left"],
                          )}
                          role="cell"
                        >
                          <span
                            className="w-full min-w-0 truncate"
                            title={
                              typeof content === "string" ? content : undefined
                            }
                          >
                            {content}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Table = React.forwardRef(TableInner) as <
  T extends Record<string, unknown>,
>(
  props: TableProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

(Table as React.ComponentType & { displayName?: string }).displayName = "Table";

export { Table };
