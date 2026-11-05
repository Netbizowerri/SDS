# AGENTS.md

SDS Delivery is a React 19 + Vite + Tailwind v4 app using Firebase Authentication and Cloud Firestore directly from the web client. There is no custom API server or Cloud Functions. Customers can submit delivery requests without signing in; authorized staff manage orders in Firestore. Quotes, payment instructions, payment confirmation, and customer tracking are coordinated offline by SDS staff. `express`, `@google/genai`, `dotenv`, and `tsx` remain declared but unused.

## Commands

```bash
npm run dev      # Vite on http://localhost:3000 (host 0.0.0.0)
npm run lint     # tsc --noEmit
npm run build    # production build -> dist/ (gitignored)
npm run preview  # serve the production build
```

- No test runner, ESLint, or Prettier is configured. Use `npm run lint` and `npm run build` when asked to verify changes.
- Use npm: `node_modules` is npm-installed and `package-lock.json` is current. `bun.lock` also exists; do not regenerate either lockfile.
- `npm run clean` uses `rm -rf`, which fails in PowerShell; delete `dist/` directly if needed.

## Where things live

- `src/main.tsx` -> `src/App.tsx`: all routes. Public pages render under `PublicLayout`; `/rider/*` is the rider app shell; `/admin/*` is the ops console.
- `src/lib/firebase.ts`: Firebase Web SDK initialization from `VITE_FIREBASE_*` environment variables.
- `src/services/firebase/index.ts`: Firestore CRUD and Firebase Authentication services. `src/services/mock/index.ts` is a compatibility re-export.
- `firestore.rules`: public request creation and staff/rider access rules. `firebase.json` and `.firebaserc` configure Firebase CLI for `sdsdelivery-7d4b2`.
- `src/data/mock/seed.ts`: legacy prototype fixtures; these are not copied into Firestore. `src/types/index.ts`: source-of-truth domain types.
- `src/config/business.ts`: currency, timezone, and default business settings.
- `.agents/skills/`: repo-local OpenCode skills, not application code.

## Invariants

- **Money is integer kobo** (`100 kobo = NGN 1`). Never store naira floats; render with `formatNaira()` from `src/lib/utils.ts`. Dates use `Africa/Lagos`.
- **Order transitions are enforced** by `isValidTransition()` in `src/lib/utils.ts` and checked inside services. Do not assign `order.status` directly; use the order or rider services.
- **Staff roles are provisioned by an administrator.** Firebase Auth accounts need a matching `staff/{uid}` Firestore document with `name`, `email`, and `role` (`owner`, `manager`, or `rider`). Rider profiles also need `riderId`. Client-side users cannot create or change staff roles.
- **Firestore rules are the access boundary.** Public users can create validated delivery requests but cannot read orders. Operations staff can manage orders; riders can read and update only assigned deliveries. Add rules when adding collections or queries.
- **Payment confirmation is manual.** Never add client-side payment confirmation. An authorized administrator records a transfer after verifying receipt offline.
- **Customer tracking is offline.** The public tracking page directs customers to dispatch. Do not expose order documents or PII to public reads.
- **Firebase configuration is local.** `.env.local` is ignored by Git. Keep it aligned with `.env.example`; do not commit local environment files.

## Toolchain gotchas

- `@/*` resolves to the repo root, not `src/` (for example `@/src/pages/...`). Most imports are relative; match surrounding style.
- Tailwind v4: no `tailwind.config.js`. Theme tokens live in `src/index.css` via `@import "tailwindcss"` and `@custom-variant dark`.
- `vite.config.ts` intentionally disables HMR/watch when `DISABLE_HMR=true` (AI Studio); do not change that block.
- `.env.example` includes legacy `GEMINI_API_KEY` and `APP_URL` placeholders plus Firebase Web app configuration placeholders.

## Manual verification

- `/demo` describes the current request and dispatch flow. It does not seed data, reset records, or switch accounts.
- Firebase staff accounts are provisioned in Firebase Console; never use demo passwords or let users self-assign roles.
- Routes are not lazy-loaded, so the build is one bundle and Vite may warn about chunk size (expected).
