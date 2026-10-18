import { MythHero } from "@/components/home/myth-hero";
import { getHeroPieces } from "@/lib/data/home";

export default function HomePage() {
  return <MythHero pieces={getHeroPieces()} />;
}
