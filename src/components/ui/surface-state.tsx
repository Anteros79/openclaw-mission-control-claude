import { AlertTriangle, LoaderCircle, SearchX, TriangleAlert } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type SurfaceStateVariant = "degraded" | "empty" | "error" | "loading";

const stateConfig: Record<
  SurfaceStateVariant,
  {
    accent: string;
    icon: typeof LoaderCircle;
  }
> = {
  loading: {
    accent: "text-emerald-200/80",
    icon: LoaderCircle
  },
  degraded: {
    accent: "text-amber-200/80",
    icon: TriangleAlert
  },
  error: {
    accent: "text-rose-200/80",
    icon: AlertTriangle
  },
  empty: {
    accent: "text-white/55",
    icon: SearchX
  }
};

type SurfaceStateProps = {
  variant: SurfaceStateVariant;
  title: string;
  description?: string;
  compact?: boolean;
  action?: React.ReactNode;
};

export const SurfaceState = ({
  variant,
  title,
  description,
  compact = false,
  action
}: SurfaceStateProps) => {
  const Icon = stateConfig[variant].icon;

  return (
    <Panel
      className={cn(
        "border-white/10",
        compact
          ? "flex items-start gap-3 rounded-[24px] px-4 py-4"
          : "flex flex-col items-center justify-center py-16 text-center"
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5",
          compact ? "flex h-10 w-10 items-center justify-center" : "mb-4 flex h-14 w-14 items-center justify-center"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            stateConfig[variant].accent,
            variant === "loading" && "animate-spin"
          )}
        />
      </div>
      <div className={cn(compact ? "min-w-0 flex-1" : "max-w-lg")}>
        <p className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.1em] text-white/82">
          {title}
        </p>
        {description ? (
          <p className={cn("text-sm text-white/48", compact ? "mt-1" : "mt-2")}>{description}</p>
        ) : null}
      </div>
      {action ? <div className={compact ? "shrink-0" : "mt-4"}>{action}</div> : null}
    </Panel>
  );
};
