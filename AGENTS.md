# AGENTS.md

SDS Delivery is a **frontend-only prototype**: React 19 + Vite + Tailwind v4, with no backend. All orders, quotes, riders, payments, and settings are persisted in `localStorage` by `src/services/mock/index.ts`. `express`, `@google/genai`, `dotenv`, and `tsx` are declared but unused — don't assume a server or API exists.

## Commands

```bash
npm run dev      # Vite on http://localhost:3000 (host 0.0.0.0)
npm run lint     # tsc --noEmit — the only static check
npm run build    # production build -> dist/ (gitignored)
npm run preview  # serve the production build
```

- No test runner, ESLint, or Prettier is configured. Verify changes with `npm run lint && npm run build`.
- Use npm: `node_modules` is npm-installed and `package-lock.json` is current. `bun.lock` also exists; don't regenerate either lockfile.
- `npm run clean` uses `rm -rf`, which fails in PowerShell; delete `dist/` directly if needed.

## Where things live

- `src/main.tsx` → `src/App.tsx`: all routes. Public pages render under `PublicLayout`; `/rider/*` is a mobile app shell; `/admin/*` is the ops console. Register new pages in `App.tsx`.
- `src/services/mock/index.ts`: the entire data layer (`OrdersService`, `QuotesService`, `PaymentsService`, `RidersService`, `EarningsService`, `SettingsService`, `AuthService`). Mutations are localStorage writes wrapped in artificial `delay()`s.
- `src/data/mock/seed.ts`: seed orders/riders/payouts and the quote tokens linked from `/demo`. `src/types/index.ts`: source-of-truth domain types.
- `src/config/business.ts`: `APP_CONFIG` (currency, timezone, `storageKeyPrefix`) and `DEFAULT_BUSINESS_SETTINGS` (some values marked `PLACEHOLDER`).
- `.agents/skills/`: repo-local OpenCode skills (design/motion/prototype), not application code.

## Invariants

- **Money is integer kobo** (`100 kobo = ₦1`). Never store naira floats; render with `formatNaira()` from `src/lib/utils.ts`. Dates are displayed in `Africa/Lagos`.
- **Order status transitions are enforced** by `isValidTransition()` in `src/lib/utils.ts` and checked inside services. Don't assign `order.status` directly; use `OrdersService.updateStatus` or `RidersService.*`.
- **Auth is fake.** Passwords are ignored; `AuthService.getCurrentUser()` falls back to the owner demo user when storage is empty, so `/admin` is reachable unauthenticated and logout doesn't stick. Role checks only hide UI. Don't treat this as real security or "fix" it unprompted.
- **Seed data is sticky.** Data lives under `sds_delivery_v1_*` keys, so seed changes won't appear until localStorage is cleared (`/demo` → Reset Demo Seed Data) or `APP_CONFIG.storageKeyPrefix` is bumped.

## Toolchain gotchas

- `@/*` resolves to the **repo root**, not `src/` (e.g. `@/src/pages/...`). Most imports are relative; match the surrounding style.
- Tailwind v4: no `tailwind.config.js`. Theme tokens live in `src/index.css` via `@import "tailwindcss"` and `@custom-variant dark`.
- `vite.config.ts` intentionally disables HMR/watch when `DISABLE_HMR=true` (AI Studio); don't change that block.
- `.env.example` (`GEMINI_API_KEY`, `APP_URL`) is not read by any current code.

## Manual verification

- `/demo` links to every seeded quote state, tracking lookup, and portal login — use it instead of inventing fixtures.
- Routes are not lazy-loaded, so the build is one bundle and Vite may warn about chunk size (expected).
