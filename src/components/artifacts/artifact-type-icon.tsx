import {
  FileImage,
  FileText,
  Image,
  Palette,
  Settings,
  Sparkles,
  SquareAsterisk
} from "lucide-react";

import type { MissionArtifact } from "@/types/mission-control";

const iconMap: Record<MissionArtifact["type"], React.ElementType> = {
  image: Image,
  banner: Palette,
  favicon: SquareAsterisk,
  pdf: FileText,
  markdown: FileText,
  config: Settings,
  "model-output": Sparkles
};

export const ArtifactTypeIcon = ({
  type,
  className = "h-5 w-5"
}: {
  type: MissionArtifact["type"];
  className?: string;
}) => {
  const Icon = iconMap[type] ?? FileImage;
  return <Icon className={className} />;
};
