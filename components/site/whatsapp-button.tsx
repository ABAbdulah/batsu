import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/site";

// Floating chat button. Product pages pass the piece name so the chat opens with context.
export function WhatsAppButton({ productName }: { productName?: string }) {
  const href = whatsappLink(
    productName ? `Hi Batsu, I have a question about the ${productName}.` : "Hi Batsu, I have a question."
  );
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={productName ? `Ask about the ${productName} on WhatsApp` : "Chat with Batsu on WhatsApp"}
      className="fixed right-4 bottom-4 z-30 flex h-14 items-center gap-2.5 rounded-full bg-whatsapp px-4 text-[13px] font-medium text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)] transition-transform hover:scale-105 motion-reduce:transition-none sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-6" />
      {productName && <span className="hidden pr-1 sm:inline">Ask about this piece</span>}
    </a>
  );
}
