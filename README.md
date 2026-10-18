# Batsu — Storefront

Custom storefront for **Batsu** (batsuofficial.com), a Lahore clothing label. It replaces the current Shopify store.

- **Build plan:** [docs/BATSU_BUILD_PLAN.md](docs/BATSU_BUILD_PLAN.md). It covers the architecture, phases, stack, motion system, performance budgets and Meta setup.
- **Approved design:** "Batsu Redesign — Editorial" canvas (homepage desktop and mobile, collection, product): https://claude.ai/artifact/BouBatKaFpnX5rEArdS6cL

## Stack (Phase 1)

| Area | Choice |
|---|---|
| Framework and UI | Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS v4 |
| UI components | shadcn/ui building blocks, restyled; our own code for signature components |
| Motion | Motion (`LazyMotion`), CSS scroll-driven animations, View Transitions, Lenis on desktop. GSAP is not in the base bundle. |
| Hosting | Vercel (Pro for production, because Hobby is non-commercial only) |
| Database | Neon Postgres, using the Drizzle ORM |
| Images | Vercel Blob |
| Auth | Better Auth |
| Email | Resend |
| Payments | Cash on delivery plus a Pakistani hosted payment gateway |

## Brand rules

- Use **Batsu's original logo** (the orange S-mark) exactly as it is. Never use a made-up wordmark.
- Colours: orange `#EC5D2F` · charcoal `#3B3B3D` · ink `#0D0D0D` · white `#FFFFFF` · paper `#F6F6F4`
- Fonts: Pinyon Script (script display) · Cormorant Garamond (editorial serif) · Jost (UI). All self-hosted with `next/font`.
- Signature line: *"Every piece carries its own myth."* Every product has a `myth_line`.

## Workflow rules (read before committing)

1. **Push section by section as each one is finished.** Don't hold work back for one big push.
   - Order: project setup and design system → **homepage hero** → the rest of the homepage sections → header/footer/service strip → collection page → product page → cart → checkout → accounts → and so on.
   - As soon as the **hero is pushed**, the owner deploys to Vercel and connects the domain. Work on the next sections carries on in parallel, and every push redeploys automatically.
   - `main` must always build and deploy: run `npm run build` (and lint/typecheck) before every push.
2. **Commit and push only as Abdullah.**
   - Author: `ABAbdulah <ababdullah216@gmail.com>`. Check with `git config user.name` and `git config user.email` before committing.
   - **Do not add `Co-Authored-By` lines or any AI or Claude attribution** to commits, PRs, code comments or docs.
3. **Push only to this repository:** `https://github.com/ABAbdulah/batsu.git`.
   - Run `git remote -v` before every push and confirm `origin` points to this URL.
   - Never add other remotes, push to another repo, or create forks.
4. Use small, descriptive commit messages, one section per commit, for example `feat(home): myth hero with auto-rotating panels`.
5. **Never commit secrets.** Keep `.env*` in `.gitignore`. Real values belong in Vercel environment variables, and `.env.example` lists the variable names only.
6. Keep to the performance budgets (collection pages ≤ 150 KB gzipped JS, home ≤ 180 KB, animation runtime ≤ 40 KB). Every animation must respect `prefers-reduced-motion`.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Until the database lands, the catalogue is a static snapshot of the live Shopify store in `lib/data/catalog.json`. Refresh it with `npm run sync:shopify`. Myth lines live in `lib/data/myths.ts`, and the hero pieces in `lib/data/home.ts`.

## Phases

1. **Customer-facing store** ← current
2. Admin panel (catalogue, images, stock, orders, customers, discounts)
3. Meta Pixel + Conversions API + catalogue feed, then ads
