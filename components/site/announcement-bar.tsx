import Link from "next/link";
import { getSettings } from "@/lib/db/queries";

export async function AnnouncementBar() {
  const { text, cta, href } = (await getSettings()).store.announcement;
  return (
    <div className="bg-brand px-4 py-[9px] text-center text-[11px] font-medium tracking-[0.05em] text-ink sm:text-xs sm:tracking-[0.06em]">
      {text} —{" "}
      <Link href={href} className="underline underline-offset-[3px]">
        {cta}
      </Link>
    </div>
  );
}
