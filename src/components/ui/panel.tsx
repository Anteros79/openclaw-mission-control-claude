import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Panel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[30px] border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(84,255,176,0.12),transparent_32%)] after:pointer-events-none after:absolute after:inset-x-5 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-emerald-200/20 after:to-transparent",
      className
    )}
    {...props}
  />
);
