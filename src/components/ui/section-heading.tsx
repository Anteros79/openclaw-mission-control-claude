import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action
}: SectionHeadingProps) => (
  <div className="mb-6 flex flex-col gap-4 border-b border-white/6 pb-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-emerald-200/60">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.7rem] uppercase tracking-[0.12em] text-white">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">{description}</p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
