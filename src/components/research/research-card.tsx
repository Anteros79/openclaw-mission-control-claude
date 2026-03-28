import { Badge } from "@/components/ui/badge";
import { EntityLinkList } from "@/components/ui/entity-link-list";
import type { MissionResearchItem } from "@/types/mission-control";

export const ResearchCard = ({ item }: { item: MissionResearchItem }) => (
  <div
    id={item.id}
    className="rounded-[24px] border border-white/8 bg-white/5 p-5"
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-lg text-white">{item.title}</p>
      <Badge variant="category">{item.category}</Badge>
    </div>
    <p className="mt-3 text-sm text-white/68">{item.summary}</p>
    {item.links.length > 0 ? (
      <div className="mt-4">
        <EntityLinkList links={item.links} />
      </div>
    ) : null}
  </div>
);
