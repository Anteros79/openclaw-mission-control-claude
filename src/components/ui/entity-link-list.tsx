import Link from "next/link";

import type { EntityRef } from "@/types/mission-control";

export const EntityLinkList = ({ links }: { links: EntityRef[] }) => (
  <div className="flex flex-wrap gap-2">
    {links.map((link) => (
      <Link
        key={`${link.kind}-${link.id}`}
        href={link.href}
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70 transition hover:border-emerald-300/30 hover:text-white"
      >
        <span className="text-white/35 transition group-hover:text-emerald-200/80">
          {link.kind}
        </span>
        {link.label}
      </Link>
    ))}
  </div>
);
