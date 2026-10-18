# Batsu — Store Build Plan

*Prepared 19 Oct 2026 · Status: proposal · Scope: rebuild batsuofficial.com from Shopify (Ella theme) into a custom, fast storefront on Vercel*

Design reference: **Batsu Redesign — Editorial** canvas (homepage, mobile, collection, product page) — https://claude.ai/artifact/BouBatKaFpnX5rEArdS6cL

---

## 0. TL;DR

| Decision | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19, TypeScript, Tailwind v4) | Server-rendered + cached pages = fastest possible storefront; first-class on Vercel |
| Hosting | **Vercel Pro — $20/month** | ⚠️ Vercel's **Hobby (free) plan is non-commercial only**; a store taking orders must be on Pro |
| Database | **Neon Postgres (free plan)** via Vercel Marketplace | Scales to zero when idle and **wakes automatically on the next request** — unlike Supabase free, which pauses the whole project after 7 days and needs a manual restore |
| Images | **Vercel Blob (public store)** | ~100 images ≈ 30–60 MB. Hobby includes 1 GB; on Pro it's billed from the monthly credit — effectively cents |
| Auth | **Better Auth** (email + password, Google, email verification, reset) | Users/sessions live in our own Postgres; no per-user fees |
| Email | **Resend** (free: 3,000/month, 100/day) | Order confirmations, verification, password reset |
| Payments | **Cash on Delivery + one Pakistani gateway** (cards + JazzCash + Easypaisa via hosted checkout, e.g. Safepay) | COD is the norm for PK fashion; hosted checkout keeps card data off our servers |
| Motion | **Motion** (React, via `LazyMotion`) + **CSS scroll-driven animations** + **View Transitions** + **Lenis** (desktop) | One JS animation runtime only; GSAP not in the base bundle (see 3.12) |
| UI components | **shadcn/ui** primitives (restyled) + **own signature components**; selective picks from Skiper UI / Vengeance UI | Copy-in code, no heavy UI kit (see 3.12) |
| Ads | **Meta Pixel + Conversions API + catalog feed** | Needs: Pixel/Dataset ID, CAPI access token, catalog feed URL, (recommended) domain verification |

**No separate backend server is needed.** Vercel Functions (route handlers + server actions) *are* the backend; Neon + Blob are managed services. No Railway/Render.

**Phases**
1. **Phase 1 — Customer-facing store** (this plan's focus): storefront, cart, checkout, accounts, cookies/consent, motion, tracking layer ready.
2. **Phase 2 — Admin panel**: catalogue CRUD, images, stock, collections, orders, customers, discounts, homepage content.
3. **Phase 3 — Meta setup & ads**: Pixel + CAPI live, catalog in Commerce Manager, campaigns.

---

## 1. Brand rules for the build

- **Logo: use Batsu's existing mark exactly as-is** — the orange S-curve with charcoal cut-outs (`IMG_1851-removebg-preview.png` on the current site). Do **not** use the "BATSU ✕" placeholder from the design canvas.
  - Ask the client for the **original vector (SVG/AI/PDF)**. The site only has a 493×506 PNG. If no vector exists, trace it to SVG once (Illustrator Image Trace / vectorizer) and get sign-off.
  - Sampled colours: **Orange `#EC5D2F`**, **Charcoal `#3B3B3D`**. Use `#EC5D2F` as the site accent (replaces the `#FF5A1F` used in mockups).
- Palette: orange `#EC5D2F` · charcoal `#3B3B3D` · ink `#0D0D0D` · white `#FFFFFF` · paper `#F6F6F4`.
- Type: **Pinyon Script** (display/script), **Cormorant Garamond** (editorial serif), **Jost** (UI). Self-hosted via `next/font` (no Google Fonts request at runtime).
- Signature idea: **"Every piece carries its own myth."** Each product gets a one-line myth stored as its own field (`myth_line`) and shown on cards, PDP and in the hero.

---

## 2. Architecture

```
                ┌────────────────────── Vercel (Pro) ──────────────────────┐
 Browser ──────►│ CDN edge cache  ─►  Next.js 16 app                       │
 (Pixel, Lenis, │   • Cached pages (home, collections, products) — "use    │
  Motion, GSAP) │     cache" + cacheTag, revalidated on change             │
                │   • Dynamic: cart, checkout, account (server actions)    │
                │   • Route handlers: /api/payments/webhook, /api/meta/*,  │
                │     /feeds/meta-catalog.xml, /api/auth/*                 │
                └───────┬───────────────┬──────────────────┬───────────────┘
                        │               │                  │
                 Neon Postgres     Vercel Blob        External services
                 (Drizzle ORM)     (product images)   • Resend (email)
                                                      • Payment gateway (hosted checkout + webhook)
                                                      • Meta Graph API (Conversions API)
```

**Why it's fast:** product/collection/home pages are pre-rendered and served from the CDN; the database is only touched when content changes (revalidation), or for cart/checkout/account. Neon's cold start (~hundreds of ms after 5 min idle) therefore never hits a normal page view.

### 2.1 Free-tier reality check (verified Oct 2026)

| Service | Free allowance | Enough for Batsu? | If exceeded |
|---|---|---|---|
| Vercel Hobby | Non-commercial only | ❌ Not allowed for a store | → **Pro $20/mo** (includes usage credit) |
| Vercel Blob (Hobby) | 1 GB storage, 10k simple ops, 2k advanced ops, 10 GB transfer / month | ✅ ~100 images is ~5% of storage | Hobby: Blob blocked for 30 days. Pro: pay-as-you-go ($0.023/GB storage) — pennies |
| Vercel Image Optimization (Hobby) | 5k transformations, 300k cache reads, 100k cache writes / month | ✅ with long cache TTL | Pro: $0.05–0.08 per 1k transformations |
| Neon Free | 0.5 GB storage, 100 CU-hours/project/month, scale-to-zero after 5 min | ✅ catalogue + orders for years fit in 0.5 GB | Upgrade to **Launch** (pay-as-you-go, ~$0.106/CU-hr) — likely < $5/mo |
| Resend Free | 3,000 emails/month, max 100/day | ✅ until ~100 orders/day | Pro $20/mo for 50k |
| Supabase Free (rejected) | Pauses after 7 days idle; manual restore | ❌ risky for a low-traffic admin | — |

> Images: Blob costs depend on stored GB + downloads, **not** on file count, so the "<100 images, changed once a year" pattern is ideal. Upload images **once**, serve them through `next/image` with `minimumCacheTTL` = 31 days so each size is transformed once and then served from cache.

### 2.2 Tech stack

| Layer | Pick | Notes |
|---|---|---|
| UI | Next.js 16 App Router, React 19 Server Components, Tailwind v4 | Client components only for cart, filters, animations |
| Data | Drizzle ORM + `@neondatabase/serverless` driver | Typed schema, SQL migrations in repo |
| Auth | Better Auth (+ admin plugin in Phase 2) | Email/password, Google OAuth, email verification, sessions in Postgres |
| Validation | Zod | Shared between forms and server actions |
| Email | Resend + React Email templates | Order placed, shipped, password reset, verify email |
| Payments | COD + hosted gateway (Safepay or similar) | Gateway posts a **webhook** → mark order paid (never trust the browser redirect) |
| Motion | `motion` (`LazyMotion` + `m`), CSS `animation-timeline: view()`, `lenis`, View Transitions API | All respect `prefers-reduced-motion`; GSAP only if one effect truly needs it, lazy-loaded on that route |
| Components | shadcn/ui (Base UI or Radix primitives) for Sheet, Dialog, Select, RadioGroup, Tabs, Toast (sonner), Carousel (Embla), forms | Restyled to Batsu tokens; heavier shadcn blocks (data tables, charts) only in `/admin` |
| Analytics | Vercel Web Analytics + Speed Insights; Meta Pixel/CAPI | GA4 optional |
| Testing | Playwright (checkout flow), Vitest (pricing/cart logic) | |
| CI/CD | GitHub → Vercel preview per PR → production on `main` | |

---

## 3. Phase 1 — Customer-facing store

### 3.1 Pages & routes (keep Shopify URLs to preserve SEO and existing ad links)

| Route | Page | Rendering |
|---|---|---|
| `/` | Home — "Four pieces. Four myths." hero, new arrivals carousel, editorial band, Modern Myths grid, tees band | Cached |
| `/collections/[handle]` | Collection — editorial header, size filter, sort, 2/3/4 column grid, quick-add | Cached shell + client filters |
| `/collections/all` | All products | Cached |
| `/products/[handle]` | Product — editorial gallery, sticky buy panel, sizes with live stock, "Wear it with" | Cached; stock streamed |
| `/search` | Search (Postgres full-text / `ILIKE`; small catalogue) | Dynamic |
| Cart drawer + `/cart` | Cart | Dynamic |
| `/checkout` → `/checkout/success/[orderId]` | Checkout (guest or logged in) | Dynamic |
| `/account/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth | Dynamic |
| `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses` | Account area | Dynamic, protected |
| `/pages/[policy]` | Shipping, Refund, Privacy, Terms, Contact | Cached |
| `/policies/cookies` | Cookie policy | Cached |
| `sitemap.xml`, `robots.txt`, `/feeds/meta-catalog.xml` | SEO + Meta catalog feed | Cached |

Set **301 redirects** for any old Shopify paths that change (e.g. `/pages/contact` variants, `/account/*`).

### 3.2 Data model (Phase 1 tables; admin uses the same)

```
users, sessions, accounts, verifications        ← Better Auth
addresses(id, user_id, name, phone, line1, line2, city, province, postal, is_default)
collections(id, handle, title, subtitle, description, hero_image, sort_order, is_published)
products(id, handle, title, myth_line, description, details_json, price_pkr, compare_at_pkr,
         status[draft|active|archived], created_at, updated_at)
product_collections(product_id, collection_id, position)
product_images(id, product_id, blob_url, alt, width, height, position, kind[lifestyle|flat|detail])
variants(id, product_id, size, sku, stock, position)
carts(id, user_id NULL, token, updated_at) / cart_items(cart_id, variant_id, qty)
orders(id, number, user_id NULL, email, phone, shipping_address_json, subtotal, shipping_fee,
       discount, total, payment_method[cod|online], payment_status, fulfillment_status,
       tracking_number, courier, meta_event_id, created_at)
order_items(order_id, variant_id, title_snapshot, size_snapshot, price_snapshot, qty)
payments(id, order_id, provider, provider_ref, amount, status, raw_json)
newsletter_subscribers(email, source, consent_at)
discount_codes(code, type, value, starts_at, ends_at, usage_limit, used_count)   ← used in Phase 2
```

Prices stored as **integer PKR**. Order lines keep **snapshots** so later catalogue edits never rewrite past orders.

### 3.3 Accounts — sign-up / login

- Better Auth: **email + password** (with email verification) and **Continue with Google**. Optional: phone OTP later (SMS costs money).
- **Guest checkout stays on** (big conversion factor). After a guest order, offer "Create an account to track this order" with the email prefilled.
- Account area: profile, saved addresses, order history with status timeline (Placed → Confirmed → Shipped [courier + tracking no.] → Delivered).
- Security: rate-limit login/signup (Vercel firewall rules or Upstash-free alternative: a Postgres-backed limiter), Argon2/scrypt hashing (Better Auth default), httpOnly + Secure + SameSite=Lax cookies, CSRF protection on server actions (built in).

### 3.4 Cart & checkout

- **Cart:** anonymous cart keyed by a signed httpOnly cookie (`cart_token`) + `carts` table; merges into the user's cart on login. Cart drawer with optimistic updates (`useOptimistic`), "fly to bag" animation.
- **Stock:** checked on add-to-cart and **re-checked inside a DB transaction at order placement** (decrement `variants.stock`; fail gracefully if sold out).
- **Checkout (single page):** contact (email + phone — PK couriers need phone) → shipping address (province/city dropdowns) → shipping fee rule (flat / free over threshold — confirm with client) → payment:
  - **COD**: order created as `payment_status = pending`, fulfilment `unconfirmed`. Optional WhatsApp/phone confirmation step in admin.
  - **Online**: create order → redirect to gateway hosted page → gateway **webhook** marks paid (verify signature, idempotent). Success page polls order status.
- Emails: order confirmation (customer) + new-order alert (store owner).
- Discount code field (wired fully in Phase 2).

### 3.5 Cookies & consent ("cookie catching")

Pakistan has **no enacted data-protection law yet** (the PDP bill is still pending as of mid-2026), but Meta's terms require a lawful basis, and international/EU visitors trigger GDPR-style rules. Build it properly once:

| Category | Examples | Default |
|---|---|---|
| Strictly necessary | `session`, `cart_token`, CSRF, consent choice | Always on |
| Analytics | Vercel Analytics (cookieless), optional GA4 | Off until accepted (Vercel Analytics can run cookieless) |
| Marketing | Meta Pixel `_fbp`, `_fbc` | Off until accepted |

- Banner: **Accept all / Reject / Customise**, choice stored in a first-party cookie (`consent=v1:analytics:1,marketing:0`) for 6–12 months + logged server-side (optional `consent_logs`).
- Meta Pixel loads with `fbq('consent','revoke')` and switches to `grant` on consent. **Conversions API events are sent only when marketing consent = yes** (keep the rule consistent client + server).
- Capture `fbclid` from ad clicks into a first-party `_fbc` cookie (after consent) so server events match ads better.
- Link to `/policies/cookies`.

### 3.6 Tracking layer (build in Phase 1, switch on in Phase 3)

Create one `track(event, payload)` helper used everywhere. It (a) fires the Pixel in the browser and (b) calls `/api/meta/events` with the **same `event_id`** so Meta deduplicates. Events wired from day one:
`PageView, ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, CompleteRegistration, Lead (newsletter)`.
`Purchase` is sent **server-side from the order/webhook handler** (most reliable), with the browser Pixel firing the same `event_id` on the success page. With no Pixel ID configured, `track()` is a no-op → zero cost until Phase 3.

### 3.7 Motion & animation plan

Principles: **transform + opacity only**, GPU-friendly, lazy-load heavy libs per route, **every effect off under `prefers-reduced-motion`**, never delay the LCP image or text.

| Where | Animation | Tool |
|---|---|---|
| Global | Lenis smooth scroll (desktop only; native on touch) | Lenis |
| Global | Page transitions — fade/slide; **product image morphs from grid card into PDP gallery** | View Transitions API (`next/navigation` + `view-transition-name`) |
| Hero | "Four myths" panel accordion: active panel expands, others desaturate; auto-advance with progress bar; script name **writes in** letter-by-letter | Motion (layout animations) + own split-text helper (no GSAP) |
| Headlines | Line-by-line mask reveal on scroll | CSS scroll-driven animation (0 KB JS), Motion `whileInView` fallback |
| Images | Clip-path "curtain" reveal + slight scale on enter; subtle parallax on editorial bands | CSS scroll-driven animation; Motion `useScroll` for parallax |
| Product cards | Lifestyle → flat-lay crossfade on hover; quick-add bar slide-up | CSS |
| Add to bag | Thumbnail flies to the bag icon; bag count bounces; drawer slides in | Motion |
| Collection | Grid re-flow when filtering/sorting/changing columns (FLIP) | Motion `layout` |
| Marquee | Collection names ticker in the orange band (pauses on hover) | CSS |
| Logo | Batsu S-mark draws itself (SVG stroke) on first load / footer | SVG + Motion |
| Micro | Buttons fill orange on hover; magnetic CTA on desktop; size pill press | CSS / Motion |

**Motion graphics (video/creative):** for the hero/editorial bands and ads, produce short loops (6–10 s, muted) from the shoots — 1080×1920 for Reels/Stories and 1920×1080 for web. Export **AV1/H.264 MP4 ≤ 2–3 MB** with a poster image, `preload="none"`, autoplay only when in view. Tools: After Effects / CapCut / Runway for cut-downs; Lottie only for tiny UI icons if needed.

### 3.8 Performance budget & how we hit it

Targets (mobile, 4G, real-user via Speed Insights): **LCP < 2.0 s · INP < 200 ms · CLS < 0.05 · JS < 150 KB gz on collection pages**.

- Cache Components (`"use cache"` + `cacheTag('product:handle')`) → pages served from CDN; `revalidateTag` from admin in Phase 2.
- `next/image` everywhere: correct `sizes`, AVIF/WebP, `priority` only on the hero/LCP image, blur placeholders stored at upload, trimmed `deviceSizes`, `minimumCacheTTL: 2678400`.
- Fonts via `next/font/local` (subset Latin, `display: swap`, preload only Jost + the hero script).
- Third-party scripts (`next/script`): Pixel `afterInteractive` only after consent; nothing render-blocking.
- Lenis and any animated below-the-fold section are dynamically imported; reduced-motion users never download them. Animation runtime budget ≤ 40 KB gz total.
- Region: put the Neon DB and Vercel Functions in the **same region** (pick the closest available to Pakistan, e.g. Singapore or Mumbai/Frankfurt — test latency), static pages are global anyway.
- Image prep: export product photos at max 2000 px long edge, sRGB, ≤ 500 KB before upload.

### 3.9 SEO

Metadata per page, Product JSON-LD (price, availability, brand), BreadcrumbList, OG images, sitemap, canonical URLs, same handles as Shopify, 301s for changed URLs, alt text from admin, fast pages (Core Web Vitals help ranking).

### 3.10 Migration from Shopify

1. Export products + variants + images (Shopify admin CSV or `/products.json`). Script imports into Neon and **uploads images to Vercel Blob once** (dedupe, resize, store width/height/blur).
2. Export customers (passwords can't be migrated) → send a one-time "Set your password" email after launch.
3. Optionally import past orders for account history.
4. Write myth lines for every product (client + copywriter).
5. Run old and new in parallel on a preview URL → test orders → switch DNS at Vercel → keep Shopify for 2 weeks as fallback → cancel.

### 3.12 UI components & animation libraries — build vs borrow

| Library | What it is | How it ships | Cost | Verdict |
|---|---|---|---|---|
| **shadcn/ui** | Accessible primitives (Radix or Base UI) + Tailwind styling; *"not a component library, it's how you build your own"* | CLI copies source into our repo; we only ship what we add | Free (MIT) | ✅ **Foundation** for functional UI: cart Sheet, mobile menu, size-guide Dialog, size RadioGroup, Select, Tabs, Toast, Embla Carousel, forms. Restyle to Batsu. Heavy blocks (tables, charts) only in admin. |
| **Skiper UI** | 106+ "uncommon" animated shadcn components (image reveal, image cursor trail, drag-and-scroll, dynamic island…) | shadcn registry (`npx shadcn add @skiper-ui/…`), one file each, uses **Motion** | Some free; Premium **$129 one-time** | ✅ **Pick 2–4 effects** (e.g. image reveal, drag-scroll lookbook). Buy Premium only if we use 3+ premium pieces. |
| **Vengeance UI** | 46 animated components / 100+ blocks for marketing sites (flip/morph text, logo marquee, staggered grid, pixel image trail, spotlight navbar) | shadcn registry (`@vengeanceui/…`); says open source | Free (check repo licence) | ✅ **Selective**: morph/flip text, marquee, staggered grid. ❌ Skip loaders (they delay content) and "scene field" backgrounds. |
| **Animmaster Lib** | 300 pro effects (scroll, sliders, hero, 3D, WebGL shaders, page transitions…); ~60% vanilla HTML/JS, 30% React, 10% Next | Google-Drive files, copy-paste, no npm; licence terms unclear | $4.99–$8 one-time | ⚠️ **Reference / inspiration only.** Port 1–2 light effects (e.g. page transition, hover reveal) into our Motion code. **No WebGL/3D/physics on the storefront**: GPU-heavy on low-end Android, and Three.js alone is ~150 KB gz. |

**Decision: hybrid.** shadcn for plumbing, **own code for the signature moments** (myth hero, grid→product image morph, fly-to-bag, quick-add, filters), a few hand-picked registry effects for flourishes. Nothing is installed as a black-box UI kit.

Why: registry components are copied in, so the real weight is the **shared runtime (Motion)** plus a few KB per component. Two runtimes (Motion + GSAP) would roughly double animation JS for no visual gain. Our brand-specific interactions don't exist off the shelf anyway.

**Rules for any borrowed component** (PR checklist):
1. Read the file before merging; delete unused variants/props.
2. Must use our single runtime (Motion `m` inside `LazyMotion`), not bring GSAP/Three/extra deps.
3. Client island only where interactive; below-the-fold → `next/dynamic`.
4. `prefers-reduced-motion` fallback; no cursor/trail effects on touch devices.
5. Animate only `transform`/`opacity`/`clip-path`; no layout thrash.
6. Bundle check with `@next/bundle-analyzer` + Lighthouse CI per PR. Budgets: collection ≤ 150 KB gz JS, home ≤ 180 KB, animation runtime ≤ 40 KB.
7. Licence confirmed for commercial client use (Skiper Premium, Animmaster terms, Vengeance repo).

### 3.11 Phase 1 deliverables checklist

- [ ] Repo, CI, Vercel project (Pro), Neon (dev + prod branches), Blob store, env vars
- [ ] Design tokens + components from the canvas (header with **real logo**, footer, cards, buttons, drawer)
- [ ] Home, Collection, Product, Search, Policies, 404
- [ ] Cart (drawer + page), stock checks
- [ ] Checkout: COD + online gateway + webhook, emails
- [ ] Accounts: signup/login/Google/verify/reset, addresses, orders
- [ ] Cookie consent + `track()` layer
- [ ] Motion system (section 3.7)
- [ ] SEO + redirects + sitemap + catalog feed endpoint
- [ ] Shopify import script + image upload
- [ ] QA: Playwright checkout tests, Lighthouse/Speed Insights pass, real-device testing (low-end Android)
- [ ] Launch + DNS cutover

**Rough effort (1 experienced dev):** 5–7 weeks (design build 2 wks · commerce/auth/checkout 2–3 wks · motion + QA + migration 1–2 wks).

---

## 4. Phase 2 — Admin panel (`/admin`, same app)

Protected by role (`admin`, `staff`) via Better Auth admin plugin; separate layout, no public caching.

| Module | Features |
|---|---|
| Dashboard | Today/7-day orders, revenue, pending COD confirmations, low-stock alerts |
| Products | List/search/filter; create/edit/duplicate/archive; title, **myth line**, description, details (fabric, fit), price, compare-at, sizes + stock per size, SEO fields, collections, status (draft/active) |
| Images | Drag-drop **client-side upload straight to Blob** (no server bandwidth), reorder, set lifestyle/flat/detail, alt text, auto width/height/blur; delete removes the blob |
| Collections | Create/edit, hero image, intro text, manual product ordering |
| Homepage content | Choose the 4 hero "myth" pieces, editorial band image/text, announcement bar text |
| Orders | List + filters, detail, status changes (confirm COD → shipped with courier + tracking no. → delivered / returned / cancelled), print invoice/packing slip, customer email on each status change |
| Customers | List, order history, notes |
| Discounts | Codes (% / fixed / free shipping), dates, limits |
| Settings | Shipping fees, free-shipping threshold, store email, Meta IDs (Phase 3) |

Every save calls `revalidateTag(...)` so the live store updates within seconds while staying fully cached. Optional later: courier API integration (TCS / Leopards / PostEx / Trax) for auto-booking and tracking links.

**Rough effort:** 3–4 weeks.

---

## 5. Phase 3 — Meta (Facebook + Instagram) setup & ads

### 5.1 What you actually need from the client / Meta

| Item | Where | Used for |
|---|---|---|
| **Meta Business Portfolio** (Business Manager) with FB Page + Instagram linked | business.facebook.com | Owns everything below |
| **Ad account** + payment method | Business settings | Running ads |
| **Pixel / Dataset ID** | Events Manager → Data sources | Browser Pixel + CAPI target |
| **Conversions API access token** | Events Manager → Pixel → Settings → Conversions API → *Generate access token* | Server-side events (`/api/meta/events`) |
| **Test event code** | Events Manager → Test events | Verifying before going live |
| **Domain verification** (recommended) | Business settings → Brand safety → Domains → DNS TXT record (add in Vercel DNS) | Ownership; recommended by Meta |
| **Product catalog** | Commerce Manager → Catalog → Data sources → **scheduled feed** = `https://batsuofficial.com/feeds/meta-catalog.xml` (daily) | Advantage+ catalog / dynamic retargeting ads |

So yes — for tracking it's essentially **Pixel ID + CAPI access token** (stored as Vercel env vars `META_PIXEL_ID`, `META_CAPI_TOKEN`), plus the **catalog feed** for product ads.

> Since 2025 Meta no longer requires you to configure/rank 8 events under Aggregated Event Measurement; it's handled automatically. Domain verification is still recommended.

### 5.2 Implementation details

- **Deduplication:** browser and server send the same `event_name` + `event_id`.
- **User data (server):** SHA-256 hashed email, phone (E.164, +92…), first/last name, city, country; unhashed `client_ip_address`, `client_user_agent`, `fbp`, `fbc` → higher Event Match Quality.
- **Ecommerce params:** `content_ids` (= catalog `id`, use the **variant SKU or product ID consistently**), `content_type: product`, `value`, `currency: PKR`, `num_items`.
- **Catalog feed fields:** `id, title, description, availability, condition, price ("5890 PKR"), link, image_link, brand ("Batsu")` + `item_group_id` (groups sizes), `size`, `additional_image_link`, `product_type`. IDs must match `content_ids`, and price/availability must match the site or Meta can reject ads.
- "Order tracking" for Meta = the `Purchase` event (with value). Customer-facing order tracking = account order page + courier tracking number (Phase 2).
- Respect consent (section 3.5).

### 5.3 Ads playbook (starter)

1. **Week 0:** Pixel + CAPI live for 1–2 weeks to collect data; Event Match Quality ≥ 6; catalog approved.
2. **Prospecting:** one **Advantage+ Sales** campaign (broad, PK), 3–5 creatives: the myth-led motion loops (Reels 9:16), carousel of a collection, one founder/brand story. Optimise for **Purchase**.
3. **Retargeting:** **Advantage+ catalog ads** to ViewContent / AddToCart in the last 14 days, excluding purchasers.
4. **Creative angle:** "Every piece carries its own myth" — one myth per ad, product reveal, price.
5. **Budget rule of thumb:** enough to reach ~50 purchases/week per ad set to exit learning; don't edit for 3–4 days after changes.
6. **Measure:** ROAS from Meta + real orders in admin; COD orders → track **confirmed/delivered** rate, not just placed.

**Rough effort:** 1–2 weeks setup, then ongoing optimisation.

---

## 5A. Analytics — visitors, product clicks, signed-in customers

| Question | Answer | Tool |
|---|---|---|
| How many people visited, which pages, from where (country, device, referrer, Instagram/Facebook) | ✅ Yes | **Vercel Web Analytics** — cookieless; on Pro billed at **$0.03 per 1,000 events** from the monthly credit (≈ $1.50 for 50k page views). 12-month reporting window. |
| Which product was clicked/viewed most, how many times, add-to-cart counts, conversion per product | ✅ Yes | **Own `events` table in Postgres** (`product_view`, `product_click`, `add_to_cart`, `checkout_started`, `purchase` with product id, timestamp, anonymous session id, user id if signed in) → **admin dashboard** "Top products", "Viewed but not bought", funnel. Optionally Vercel custom events (Pro; 2 properties per event). |
| Emails / profiles of customers who signed in | ✅ Yes — they're our own users | `users`, `addresses`, `orders` tables → **Admin → Customers** (name, email, phone, addresses, order history, signup date, last seen, products they viewed). |
| Emails of anonymous visitors | ❌ No (and shouldn't) | Only counts. Capture emails ethically via newsletter signup / checkout / account creation. |
| Deeper funnels, session replays (optional) | Optional | **PostHog free tier** (~1M events + ~5k replays / month). Watch: identified-user events cost more beyond the free tier. |

Notes:
- Product events are written in a non-blocking way (`navigator.sendBeacon` → `/api/events` → batched insert) so tracking never slows the page.
- Retention: keep raw events 12 months, keep daily per-product aggregates forever (tiny).
- Disclose analytics in the privacy policy; marketing tracking (Meta) still follows cookie consent (section 3.5). First-party product counts are treated as necessary/analytics.
- Phase 1 collects the events; Phase 2 admin shows the dashboards.

## 5B. Hosting alternative — Railway (evaluated)

Railway pricing (official): **Hobby $5/month includes $5 of usage**; bill = subscription + usage above the included amount. Usage: **RAM $10/GB-month, CPU $20/vCPU-month, volume $0.15/GB-month, egress $0.05/GB**. Always-on containers are billed for RAM 24/7 even with no traffic.

| Option | Monthly | Verdict |
|---|---|---|
| **A. Vercel Pro + Neon free + Vercel Blob** (this plan) | ~$20 | ✅ Recommended — global CDN, image optimisation, previews, DB that wakes on demand, client owns the account |
| B. Vercel Pro + Railway Postgres | ~$20 + $1–3 | No benefit over Neon free |
| C. Everything on Railway (Next.js + Postgres + bucket/volume for images) + Cloudflare free CDN in front | ~$5–8 extra on an existing Hobby bill | Cheapest, but Next.js caching/image optimisation and CDN must be configured manually; slower for images unless Cloudflare is tuned; mixes a client's store into a personal account |

**Important:** Vercel Hobby can't be used commercially regardless of where the database lives — moving only the DB to Railway does not remove the need for Vercel Pro.

## 5C. Lessons from driftpk.com (competitor teardown, Oct 2026)

Drift is a custom **Next.js on Vercel** store (static pages served from the Mumbai edge, cache HIT) with **Supabase** for data and image storage, its own `/admin`, and `/order/` tracking. It uses Motion + Lenis + Zustand + Lucide, Vercel Analytics, Meta Pixel **and TikTok Pixel**, and ~270 KB gzipped JS. It's the same kind of build we're planning, so it shows the approach works in the PK market.

**Adopt (added to scope):**
- [ ] **Service strip + product-page bullets:** Cash on delivery · 7-day exchanges · Delivery 2–7 days · Nationwide · WhatsApp support (confirm Batsu's real policy values).
- [ ] **Floating WhatsApp button** with a prefilled message that includes the product name on product pages.
- [ ] **Guest order tracking page** (`/order/[number]` + phone/email check), no account needed.
- [ ] **Drop countdown + "Notify me"** with **members get 24h early access**. This fits Batsu's "next myth" idea and drives account signups.
- [ ] **Separate desktop and mobile hero images** (landscape and portrait crops) set in admin.
- [ ] **Store settings editable in admin:** announcement bar messages, support hours, WhatsApp number, social links.
- [ ] CTA with the price in it ("Add to bag · Rs. 5,890"), plus "Tax included" and sale price/strike/% display support.
- [ ] Category filter tabs on homepage product rows; a shoppable lookbook (looks → products).
- [ ] **TikTok Pixel + Events API** alongside Meta (TikTok is big in PK), behind the same consent and `track()` layer.
- [ ] Images converted to WebP on upload.

**Do better than Drift:**
- Reviews/UGC (they have none) → product reviews + an Instagram/UGC strip (Phase 2).
- Product JSON-LD/structured data (they have none on product pages).
- Lighter JS (target < 150 KB on collection pages vs their ~270 KB).
- Brand storytelling (myth lines, editorial layouts) instead of a generic minimal-streetwear template; avoid a permanent "20% off everything" that cheapens the brand.
- Resize uploads (they upload 3840 px / ~600 KB originals; we cap at 2000 px).
- Fill in social links (their Instagram/TikTok fields are empty) and keep category names consistent.

## 6. Monthly running costs (estimate)

| Item | Cost |
|---|---|
| Vercel Pro | $20 / month (includes usage credit; Blob + image optimisation for ~100 images fit in it) |
| Neon Postgres | $0 (free) → ~$0–5 if upgraded |
| Vercel Blob | ≈ $0 (within credit) |
| Resend | $0 until >100 emails/day |
| Domain | existing (renewal as usual) |
| Payment gateway | per-transaction % (negotiate) |
| Meta ads | ad spend only |
| Shopify | **cancelled after cutover** (saves the current subscription + app fees) |

---

## 7. Open questions for the client

1. Original **logo vector** files (SVG/AI)?
2. Shipping fee rules, free-shipping threshold, delivery cities, courier used?
3. Which payment gateway / do they already have a merchant account (cards, JazzCash, Easypaisa)? Keep COD?
4. Exchange/return policy text, size guide per category, model sizes.
5. A myth line for every product (we draft, they approve).
6. Access: Shopify admin (export), domain DNS, Meta Business Portfolio.
7. Shoot more **landscape** campaign images + short video loops (hero and ads need wide, high-res assets; current banners are ~570 px).

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Running a store on Vercel Hobby breaks ToS / limits | Use Pro from launch |
| Neon cold start on first request after idle | Storefront is cached; DB only on cart/checkout; acceptable (~sub-second) |
| Overselling with low stock | Transactional stock decrement at order time |
| Payment marked paid by spoofed redirect | Only the signed webhook changes `payment_status` |
| Heavy animation slows phones | Performance budget, lazy-loaded libs, reduced-motion fallback, test on low-end Android |
| Losing SEO/ad links at migration | Keep Shopify URL structure + 301s |
| Email daily cap (100/day) on Resend free | Monitor; upgrade when orders grow |

---

### Sources (checked Oct 2026)

- [Vercel Blob pricing (official)](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel Image Optimization limits & pricing (official — includes "Hobby teams are restricted to non-commercial personal use only")](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Vercel free tier limits 2026](https://deploywise.dev/blog/vercel-free-tier-limits-2026) · [Vercel pricing 2026 explained](https://temps.sh/blog/vercel-pricing-2026-pro-plan-explained) · [Vercel plans (vogels docs)](https://docs.it.apps.vogels.com/docs/vercel/reference/pricing)
- [Neon pricing](https://neon.com/pricing) · [Neon free plan limits & quotas](https://neon.com/faqs/free-plan-limits-and-quotas) · [Neon scale-to-zero FAQ](https://neon.com/faqs/databases-automatically-scale-serverless-environments)
- [Supabase pricing 2026 guide](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/) · [Supabase free tier limits 2026](https://automationatlas.io/answers/supabase-free-tier-limits-2026/)
- [Resend free tier 2026](https://automationatlas.io/answers/resend-free-tier-explained-2026/) · [Resend pricing 2026](https://www.usecarly.com/blog/resend-pricing/)
- [Better Auth vs Clerk vs NextAuth (MakerKit)](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk) · [Better Auth vs Auth.js](https://guptadeepak.com/compare/betterauth-vs-authjs/)
- [Next.js 16 Cache Components explained](https://webkul.com/blog/next-js-16-cache-components-explained/) · [next16-commerce example](https://gittrend.io/repo/aurorascharff/next16-commerce)
- [Meta Conversions API setup guide 2026](https://piotrlitwa.com/articles/en/meta-conversions-api-setup-guide.html) · [Pixel + CAPI deduplication](https://www.relevantaudience.com/facebook-ads/meta-pixel-and-conversions-api-guide/) · [CAPI setup steps](https://datanostro.com/en/docs/platform-connectors/meta-capi-setup/)
- [Meta AEM changes (Jon Loomer)](https://www.jonloomer.com/meta-announces-big-changes-to-website-conversion-campaigns/) · [AEM isn't going away, it's changing](https://www.jonloomer.com/qvt/aggregated-event-measurement-isnt-going-away/)
- [Meta product feed specifications](https://adtribes.io/facebook-product-feed-specifications/) · [Facebook catalog feed optimisation](https://wisepim.com/guides/product-feed-optimization/facebook-catalog) · [Meta Commerce Manager docs (Linkrunner)](https://docs.linkrunner.io/ecommerce-manager/meta-commerce-manager.md)
- [Accepting JazzCash payments on your website 2026 (Simpaisa)](https://www.simpaisa.com/blogs/how-to-accept-jazzcash-payments-on-your-website-step-by-step-2026/) · [Safepay WooCommerce gateway](https://ecosire.com/es/apps/woocommerce/woo-safepay-pk-gateway) · [XPay Pakistan](https://www.indiehackers.com/product/xpay-pakistan)
- [Data privacy in Pakistan without a PDP Act (2026)](https://commoner-law.com/pakistan/data-privacy-digital-rights/data-privacy-without-pdp-act) · [Chambers — Pakistan data protection 2026](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/pakistan) · [Tribune: Pakistan can no longer wait for a PDP law](https://tribune.com.pk/story/2625470/pakistan-can-no-longer-wait-for-personal-data-protection-law)

- [Railway plans & usage pricing (official)](https://docs.railway.com/reference/pricing/plans) · [Vercel Web Analytics pricing (official)](https://vercel.com/docs/analytics/limits-and-pricing)
- [PostHog pricing overview](https://schematichq.com/blog/posthog-pricing) · [Analytics free tier comparison 2026](https://agentdeals.dev/analytics-free-tier-comparison-2026) · [PostHog free tier real cost](https://ripples.sh/blog/posthog-free-tier-real-cost)

- [Skiper UI](https://skiper-ui.com) · [Skiper UI on Tailkits](https://tailkits.com/components/skiper-ui/) · [Vengeance UI](https://www.vengenceui.com/) · [Vengence UI on UIUX Showcase](https://uiuxshowcase.com/resources/vengence-ui/) · [Animmaster Lib](https://animmasterlib.dev/) · [Animmaster on Abduzeedo](https://www.abduzeedo.com/animmaster-studio-releases-high-performance-ui-animation-library) · [shadcn/ui docs](https://ui.shadcn.com/docs) · [What is shadcn/ui (SSOJet)](https://ssojet.com/blog/what-is-shadcn-ui) · [shadcn animation libraries](https://shadcnstudio.com/blog/shadcn-animation-library)

*Verify gateway fees/APIs directly with the provider before integration — public developer docs for PK gateways were thin.*
