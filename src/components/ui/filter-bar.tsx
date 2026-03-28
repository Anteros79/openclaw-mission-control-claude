import { Search } from "lucide-react";

type FilterOption = {
  value: string;
  label: string;
};

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
};

export const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters
}: FilterBarProps) => (
  <div className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,20,19,0.92),rgba(7,12,14,0.9))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(84,255,176,0.14),transparent_28%)] before:content-['']">
    <div className="relative flex flex-1 items-center gap-2 rounded-full border border-white/8 bg-black/24 px-3 py-2 text-white/50">
      <Search className="h-4 w-4" />
      <input
        type="text"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="w-full min-w-[120px] bg-transparent text-sm text-white outline-none placeholder:text-white/35"
      />
    </div>
    {filters?.map((filter) => (
      <select
        key={filter.label}
        value={filter.value}
        onChange={(event) => filter.onChange(event.target.value)}
        aria-label={filter.label}
        className="relative rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/70 outline-none"
      >
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ))}
  </div>
);
