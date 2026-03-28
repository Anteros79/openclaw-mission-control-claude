import { NodeCard } from "@/components/ui/node-card";
import type { MissionNode } from "@/types/mission-control";

export const SystemsNodeGrid = ({ nodes }: { nodes: MissionNode[] }) => (
  <div className="grid gap-4 lg:grid-cols-3">
    {nodes.map((node) => (
      <NodeCard key={node.id} node={node} />
    ))}
  </div>
);
