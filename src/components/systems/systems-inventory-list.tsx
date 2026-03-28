import Link from "next/link";
import { Package } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { MissionInventoryItem } from "@/types/mission-control";

export const SystemsInventoryList = ({ inventory }: { inventory: MissionInventoryItem[] }) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {inventory.map((app) => (
      <div
        key={app.id}
        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
      >
        <Package className="h-4 w-4 text-white/35" />
        <div className="min-w-0 flex-1">
          <Link href={app.href} className="text-sm text-white/75 transition hover:text-white">
            {app.name}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
            {app.kind} · {app.placement}
          </p>
        </div>
        <StatusPill tone={app.status}>{app.status}</StatusPill>
      </div>
    ))}
  </div>
);
