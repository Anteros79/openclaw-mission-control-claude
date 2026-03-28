import { Panel } from "@/components/ui/panel";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
};

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <Panel className="flex flex-col items-center justify-center py-16 text-center">
    {icon ? <div className="mb-4 text-white/25">{icon}</div> : null}
    <p className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.1em] text-white/50">
      {title}
    </p>
    {description ? (
      <p className="mt-2 max-w-md text-sm text-white/35">{description}</p>
    ) : null}
  </Panel>
);
