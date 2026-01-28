"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Workflow,
  Database,
  FileText,
  Search,
  Megaphone,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: {
    label: string;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    label: "대시보드",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "연결관리",
    icon: Workflow,
    children: [
      { label: "DB 서버 연결 관리", href: "/db-connection" },
      { label: "파일 서버 연결 관리", href: "/connections/file" },
    ],
  },
  {
    label: "DB 서버 개인정보 관리",
    icon: Database,
    children: [
      { label: "개인정보 목록", href: "/privacy/db/list" },
      { label: "개인정보 이슈", href: "/privacy/db/issues" },
    ],
  },
  {
    label: "파일 서버 개인정보 관리",
    icon: FileText,
    children: [
      { label: "개인정보 목록", href: "/privacy/file/list" },
      { label: "파일정보 이슈", href: "/privacy/file/issues" },
      { label: "AI 자동 마스킹", href: "/privacy/file/masking" },
    ],
  },
  {
    label: "법령/내규 검색",
    href: "/search",
    icon: Search,
  },
  {
    label: "공지사항",
    href: "/notice",
    icon: Megaphone,
  },
  {
    label: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export interface SidebarProps {
  pathname?: string;
}

export function Sidebar({ pathname: pathnameProp }: SidebarProps = {}) {
  const fromRouter = usePathname();
  const pathname =
    pathnameProp !== undefined ? pathnameProp : (fromRouter ?? "");
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const toggleMenu = (menuLabel: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuLabel]: !prev[menuLabel],
    }));
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.children) {
      const hasActiveChild = item.children.some(
        (child) => pathname === child.href,
      );

      if (hasActiveChild) {
        return false;
      }
    }
    if (item.href && pathname === item.href) {
      return true;
    }
    return false;
  };

  const shouldBeOpen = (item: MenuItem): boolean => {
    if (openMenus[item.label] !== undefined) {
      return openMenus[item.label];
    }
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen",
        "w-[var(--sidebar-width)]",
        "bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)]",
        "overflow-y-auto z-10",
      )}
    >
      <div
        className={cn(
          "h-[76px] flex items-center gap-3 px-4",
          "border-b border-[var(--color-sidebar-border)]",
        )}
      >
        <ShieldCheck className="w-10 h-10 text-[var(--color-main-bg)] shrink-0" />

        <div className="flex flex-col justify-center gap-0.5">
          <h2
            className={cn(
              "tracking-wide text-[22px] font-bold leading-tight",
              "font-[var(--font-noto-sans)]",
            )}
          >
            <span className="text-[var(--color-main-bg)]">PII</span>
            <span className="text-white">LOT</span>
          </h2>

          <p
            className={cn(
              "text-[12px] text-[var(--color-sidebar-text)] leading-tight",
              "font-[var(--font-noto-sans)]",
            )}
          >
            AI 개인정보 보호 플랫폼
          </p>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = shouldBeOpen(item);

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left",
                    "text-[var(--color-sidebar-text)]",
                    "hover:bg-[var(--color-main-bg)]/15 hover:text-[var(--color-main-text)]",
                    "transition-colors",
                    active &&
                      "bg-[var(--color-main-bg)]/15 text-[var(--color-main-text)]",
                  )}
                >
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  <span className="text-[15px] font-medium flex-1">
                    {item.label}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                    "text-[var(--color-sidebar-text)]",
                    "hover:bg-[var(--color-main-bg)]/15 hover:text-[var(--color-main-text)]",
                    "transition-colors",
                    active &&
                      "bg-[var(--color-main-bg)]/15 text-[var(--color-main-text)]",
                  )}
                >
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  <span className="text-[15px] font-medium">{item.label}</span>
                </Link>
              )}

              {hasChildren && isOpen && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-[13px]",
                          "text-[var(--color-sidebar-text)]",
                          "hover:bg-[var(--color-main-bg)]/15 hover:text-[var(--color-main-text)]",
                          "transition-colors",
                          childActive &&
                            "bg-[var(--color-main-bg)]/15 text-[var(--color-main-text)] font-medium",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
