import Image from "next/image";
import mark from "@/public/brand/batsu-mark.png";

// Batsu's original S-mark, used as supplied (493×506 PNG) until the vector arrives.
export function LogoMark({
  className,
  alt = "Batsu",
  preload,
}: {
  className?: string;
  alt?: string;
  preload?: boolean;
}) {
  return <Image src={mark} alt={alt} className={className} sizes="96px" preload={preload} />;
}
