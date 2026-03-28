"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  Archive,
  Bot,
  ChevronLeft,
  ChevronRight,
  Database,
  FolderKanban,
  KanbanSquare,
  LayoutGrid,
  LibraryBig,
  MessageSquareMore,
  Radar
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { MissionConnectionState } from "@/stores/mission-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { AssistantDock } from "@/components/assistant-dock";
import type { MissionChatThread } from "@/types/mission-control";

type AppShellProps = {
  activePath?: string;
  activity: {
    chatUnreadCount: number;
    systemAlertCount: number;
  };
  assistantThreads: MissionChatThread[];
  connectionState: MissionConnectionState;
  lastUpdatedAt?: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/chat", label: "Chat", icon: MessageSquareMore },
  { href: "/operations", label: "Operations", icon: KanbanSquare },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/research", label: "Research", icon: LibraryBig },
  { href: "/artifacts", label: "Artifacts", icon: Archive },
  { href: "/systems", label: "Systems", icon: Radar },
  { href: "/sessions", label: "Sessions", icon: Database }
];

const sectionSubPages: Record<string, { href: string; label: string }[]> = {
  "/systems": [
    { href: "/systems", label: "Nodes" },
    { href: "/systems#services", label: "Services" },
    { href: "/systems#cron", label: "Cron" },
    { href: "/systems#alerts", label: "Alerts" },
    { href: "/systems#inventory", label: "Inventory" },
    { href: "/systems#usage", label: "Usage" }
  ],
  "/agents": [
    { href: "/agents", label: "All agents" },
    { href: "/agents#active", label: "Active" },
    { href: "/agents#failed", label: "Failed" }
  ],
  "/research": [
    { href: "/research", label: "All" },
    { href: "/research#summaries", label: "Summaries" },
    { href: "/research#findings", label: "Findings" },
    { href: "/research#comparisons", label: "Comparisons" }
  ],
  "/artifacts": [
    { href: "/artifacts", label: "All" },
    { href: "/artifacts#images", label: "Images" },
    { href: "/artifacts#documents", label: "Documents" },
    { href: "/artifacts#configs", label: "Configs" }
  ]
};

export const AppShell = ({
  activePath = "/",
  activity,
  assistantThreads,
  connectionState,
  lastUpdatedAt,
  children
}: AppShellProps) => {
  const { isCollapsed, toggle } = useSidebarStore();

  const currentPage = useMemo(
    () => navigation.find((item) => item.href === activePath)?.label ?? "Overview",
    [activePath]
  );

  const subPages = useMemo(
    () => sectionSubPages[activePath] ?? [],
    [activePath]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(88,255,174,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,12,9,0.96),_rgba(3,9,11,1))] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(68,255,174,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(68,255,174,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,_rgba(70,255,170,0.32),_transparent_58%)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex lg:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 border-b border-white/10 bg-[linear-gradient(180deg,rgba(6,12,12,0.92),rgba(4,8,10,0.88))] backdrop-blur-xl transition-[width] duration-200 lg:border-b-0 lg:border-r lg:flex lg:flex-col",
            isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
          )}
        >
          {/* Branding */}
          <div
            className={cn(
              "flex items-center gap-3 border-b border-white/6 px-4 py-5",
              isCollapsed && "lg:justify-center lg:px-2"
            )}
          >
            <div className="relative shrink-0 overflow-hidden rounded-2xl border border-emerald-400/35 bg-emerald-300/10 p-1.5 shadow-[0_0_28px_rgba(34,197,94,0.18)]">
              <Image
                src="/brand/phoenixclaw.png"
                alt="PhoenixClaw"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-emerald-300/70">
                  PhoenixClaw
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.14em] leading-tight text-white">
                  Mission Control
                </h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Unified operator console
                </p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav
            aria-label="Primary"
            className={cn("flex-1 space-y-1 px-3 pb-2", isCollapsed && "lg:px-2")}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activePath;
              const chatUnread = item.label === "Chat" ? activity.chatUnreadCount : 0;
              const sysAlerts = item.label === "Systems" ? activity.systemAlertCount : 0;
              const hasBadge = chatUnread > 0 || sysAlerts > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition",
                    isCollapsed && "lg:justify-center lg:px-2",
                    isActive
                      ? "border-emerald-300/55 bg-[linear-gradient(180deg,rgba(84,255,176,0.18),rgba(84,255,176,0.08))] text-white shadow-[0_0_20px_rgba(34,197,94,0.14)]"
                      : "border-white/8 bg-white/4 text-white/72 hover:border-emerald-300/30 hover:bg-white/7"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {!isCollapsed && chatUnread > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-emerald-300/15 px-2 py-0.5 text-xs text-emerald-200">
                      {chatUnread}
                    </span>
                  )}
                  {!isCollapsed && sysAlerts > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">
                      {sysAlerts}
                    </span>
                  )}
                  {isCollapsed && hasBadge && (
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Gateway policy + collapse toggle */}
          <div className={cn("px-3 pb-4", isCollapsed && "lg:px-2")}>
            {!isCollapsed && (
              <div className="mb-3 rounded-[18px] border border-emerald-300/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-200/70">
                  Gateway Policy
                </p>
                <p className="mt-2 text-xs leading-5 text-white/55">
                  All share targets route through Giles. Node-local addresses stay suppressed.
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-300/70 via-cyan-300/70 to-emerald-200/70" />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={toggle}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/45 transition hover:border-white/15 hover:text-white/70",
                isCollapsed && "lg:justify-center"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-3 sm:px-5 lg:pb-8">
          {/* Compact page header */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.12em]">
                {currentPage}
              </h2>
              {subPages.length > 0 && (
                <nav className="flex gap-1" aria-label="Sub-pages">
                  {subPages.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition",
                        sub.href === activePath
                          ? "bg-emerald-300/15 text-emerald-200 border border-emerald-300/30"
                          : "text-white/45 hover:text-white/70 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    connectionState === "live" ? "bg-emerald-400" :
                    connectionState === "loading" ? "bg-amber-400 animate-pulse" :
                    connectionState === "degraded" ? "bg-rose-400" : "bg-white/30"
                  )}
                />
                {connectionState === "live" ? "Giles" : connectionState}
              </span>
              {lastUpdatedAt && (
                <span className="text-white/30">{lastUpdatedAt}</span>
              )}
            </div>
          </div>

          {children}
        </main>

      </div>

      <AssistantDock threads={assistantThreads} unreadCount={activity.chatUnreadCount} />
    </div>
  );
};
