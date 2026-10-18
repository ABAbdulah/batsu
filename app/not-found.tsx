import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-page flex-col items-center gap-5 px-gutter py-28 text-center">
      <span className="eyebrow text-mute">404</span>
      <h1 className="font-script text-[72px] leading-none sm:text-[96px]">Lost the thread</h1>
      <p className="max-w-md font-serif text-xl italic text-[#3a3a3a]">
        This page has slipped out of the myth. The pieces are still where you left them.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-4" })}>
        Back to the store
      </Link>
    </section>
  );
}
