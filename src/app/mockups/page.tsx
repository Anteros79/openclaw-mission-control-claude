import { MockupPack } from "@/components/mockup-pack";
import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";

const Page = () => <MockupPack snapshot={createSeedMissionControlSnapshot()} />;

export default Page;
