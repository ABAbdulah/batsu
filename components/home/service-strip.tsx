import { CashIcon, ExchangeIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { servicePoints } from "@/lib/site";

const icons = { cash: CashIcon, exchange: ExchangeIcon, truck: TruckIcon, chat: WhatsAppIcon };

export function ServiceStrip() {
  return (
    <section aria-label="Why shop with Batsu" className="border-y border-line">
      <ul className="mx-auto grid max-w-page grid-cols-2 px-gutter lg:grid-cols-4">
        {servicePoints.map(({ icon, title, detail }) => {
          const Icon = icons[icon];
          return (
            <li key={title} className="flex items-center gap-3.5 px-2 py-5.5">
              <Icon className="size-6.5 shrink-0" />
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase sm:text-xs">{title}</span>
                <span className="text-[13px] font-light text-[#5a5a5a]">{detail}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
