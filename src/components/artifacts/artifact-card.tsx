import Image from "next/image";

import { ArtifactTypeIcon } from "@/components/artifacts/artifact-type-icon";
import { Badge } from "@/components/ui/badge";
import type { MissionArtifact } from "@/types/mission-control";

export const ArtifactCard = ({ artifact }: { artifact: MissionArtifact }) => (
  <div
    id={artifact.id}
    className="group rounded-[24px] border border-white/8 bg-white/5 overflow-hidden"
  >
    {artifact.previewPath ? (
      <div className="relative h-40 overflow-hidden bg-black/40">
        <Image
          src={artifact.previewPath}
          alt={artifact.name}
          fill
          className="object-cover opacity-80 transition group-hover:opacity-100"
        />
      </div>
    ) : (
      <div className="flex h-40 items-center justify-center bg-black/30">
        <ArtifactTypeIcon type={artifact.type} className="h-12 w-12 text-white/20" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArtifactTypeIcon type={artifact.type} className="h-4 w-4 text-white/50" />
          <p className="text-sm text-white">{artifact.name}</p>
        </div>
        <Badge>{artifact.type}</Badge>
      </div>
      <p className="mt-2 text-sm text-white/60">{artifact.summary}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/38">{artifact.usage}</p>
    </div>
  </div>
);
