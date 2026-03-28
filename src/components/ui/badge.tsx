import { cn } from "@/lib/utils";

type BadgeProps = {
  variant?: "default" | "severity" | "category";
  children: React.ReactNode;
};

const variantClassName: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-white/8 bg-black/20 text-white/60",
  severity: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  category: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
};

export const Badge = ({ variant = "default", children }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]",
      variantClassName[variant]
    )}
  >
    {children}
  </span>
);
