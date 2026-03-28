import Link from "next/link";

import { Panel } from "@/components/ui/panel";

const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Panel className="max-w-md text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200/65">
        Signal lost
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl uppercase tracking-[0.12em]">
        404
      </h2>
      <p className="mt-4 text-sm text-white/60">
        The requested route does not exist on this gateway. Return to the command surface.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-300/12 px-5 py-2.5 text-xs uppercase tracking-[0.24em] text-emerald-100 transition hover:bg-emerald-300/18"
      >
        Return to Overview
      </Link>
    </Panel>
  </div>
);

export default NotFound;
