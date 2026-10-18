import Image from "next/image";
import mark from "@/public/brand/batsu-mark-128.png";

// Batsu's original S-mark (public/brand/batsu-mark.png, 493×506), downscaled for the UI.
// Swap for the vector once the client sends it.
export function LogoMark({
  className,
  alt = "Batsu",
  preload,
}: {
  className?: string;
  alt?: string;
  preload?: boolean;
}) {
  return <Image src={mark} alt={alt} className={className} unoptimized preload={preload} />;
}
