# Splitr — AI Context Document

> This file is intended to be used as a system prompt or context file for any AI assistant or coding agent (e.g. Claude, GPT, Cursor, Copilot) working on the Splitr codebase. It describes the app's purpose, stage, architecture, features, and implementation conventions so the AI can give accurate, relevant assistance without needing repeated explanation.

---

## 1. Project Overview

**App Name:** Splitr
**Platform:** React Native (cross-platform iOS & Android, via Expo)
**Type:** Consumer fintech-adjacent mobile app — expense-splitting and settle-up utility
**Stage:** **Early-stage startup, pre-seed / building toward an MVP demo.** This is not a mature, heavily-staffed codebase — expect a small (possibly solo) founding team, a fast-moving feature set, and some rough edges outside the core differentiator. Prioritize a working, demoable product over exhaustive polish, but see Section 7 for what must never be treated as "good enough for now."
**Purpose:** A mobile app that lets users scan receipts using OCR and fairly split bills, expenses, and fees among friends or roommates in real time.

---

## 2. Tech Stack

| Layer                | Technology                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Framework            | React Native via **Expo** (Expo Router, file-based navigation)    |
| OCR                  | Google ML Kit on-device (`@react-native-ml-kit/text-recognition`) |
| Backend, DB & Auth   | **Supabase** (Postgres + Supabase Auth + Row Level Security)      |
| Realtime             | Supabase Realtime (Postgres change subscriptions)                 |
| Server-state caching | TanStack React Query (wraps Supabase queries)                     |
| Client state         | Zustand                                                           |
| Validation           | Zod (schemas for DB rows, forms, push payloads, deep links)       |
| Styling              | Tailwind via Uniwind (`className`, not `StyleSheet.create`)       |
| Icons                | lucide-react-native (default), expo-symbols (native iOS accents)  |
| Camera / image input | expo-camera, expo-image-picker, expo-image (never core `Image`)   |
| Notifications        | Expo Push Notifications (`expo-notifications`)                    |
| Animation / gesture  | react-native-reanimated + react-native-gesture-handler            |
| Payments             | Nomba, plus deep links to Revolut / PayPal / bank transfer        |
| Export               | CSV / PDF generation                                              |

**Note on migration history:** earlier drafts of this project (and possibly stray comments/docs still in the repo) reference Firebase/Firestore. The project has moved to **Supabase** for backend, auth, and data persistence. Treat any Firebase/Firestore reference found in old docs, comments, or code as legacy and outdated — do not introduce new Firebase code, and flag it if you find it still wired up somewhere real.

---

## 3. Core Features

### 3.1 Receipt Scanning (OCR)

- User points camera at a physical receipt
- OCR extracts line items, quantities, prices, subtotal, tax, and tip
- Confidence scoring flags low-accuracy extractions for manual correction
- Support for digital receipts via email forwarding or image upload
- Multi-receipt merging (e.g. one dinner split across multiple bills)
- Auto-categorisation of items (food, drinks, extras) using AI

### 3.2 Bill Splitting Logic

- **Equal split** — total divided evenly across all members
- **Itemised split** — each person is assigned specific line items
- **Percentage split** — custom ratio per person
- **Custom ratio split** — e.g. for unequal rent contributions
- Tax and tip handled separately from base bill
- Round-up/round-down logic for handling leftover pennies
- IOU tracking — "I'll cover it now, pay me back later"

### 3.3 Debt Simplification Algorithm

- Calculates the **minimum number of transactions** needed to settle all debts within a group
- Example: 6 people with cross-debts resolved in 3 transactions instead of 15
- Core algorithm: net balance per person → greedy settlement (max creditor vs max debtor)
- This is the **core differentiator and headline demo feature** for the startup — it's what makes Splitr worth pitching over a plain "split the bill" app. Highlight it prominently in the UI and treat it as the single most protected piece of logic in the codebase (see Section 7).

### 3.4 Group & Expense Management

- Create named groups (e.g. "Flat 4", "Ibiza Trip")
- Add members by username, email, or phone contact
- Recurring bills with scheduled auto-splits (rent, utilities, subscriptions)
- Expense categories with analytics dashboard (pie/bar charts)
- Full expense history with audit trail
- Receipt photo attached to every expense as proof
- Locked expenses requiring group approval to edit

### 3.5 Social & Settlement

- Nudge/reminder push notifications for unpaid balances
- In-app payment requests via Nomba, Revolut, PayPal, or bank transfer deep links
- "Settle up" button that triggers the debt simplification calculation
- Group comments/notes on each expense
- Export to CSV or PDF for record-keeping

---

## 4. Data Models

Modeled as Supabase/Postgres tables (snake_case columns, `uuid` primary keys, RLS-protected). Shapes below are illustrative — check `supabase/migrations/` or generated `database.types.ts` for the source of truth before assuming a field name.

### `profiles` (mirrors `auth.users`, one row per authenticated user)

```json
{
  "id": "uuid", // matches auth.users.id
  "display_name": "string",
  "email": "string",
  "photo_url": "string",
  "created_at": "timestamptz"
}
```

### `groups`

```json
{
  "id": "uuid",
  "name": "string",
  "currency": "string",
  "created_by": "uuid",
  "created_at": "timestamptz"
}
```

### `group_members` (join table)

```json
{
  "group_id": "uuid",
  "user_id": "uuid",
  "joined_at": "timestamptz"
}
```

### `expenses`

```json
{
  "id": "uuid",
  "group_id": "uuid",
  "title": "string",
  "total_amount": "numeric",
  "currency": "string",
  "category": "string",
  "paid_by": "uuid",
  "receipt_image_url": "string",
  "ocr_items": "jsonb", // [{ name, price, assigned_to: [uid] }]
  "locked": "boolean",
  "created_at": "timestamptz"
}
```

### `expense_splits` (per-member share of an expense)

```json
{
  "expense_id": "uuid",
  "user_id": "uuid",
  "amount": "numeric"
}
```

### `settlements`

```json
{
  "id": "uuid",
  "group_id": "uuid",
  "from_user": "uuid",
  "to_user": "uuid",
  "amount": "numeric",
  "settled_at": "timestamptz"
}
```

RLS policy convention: every table is scoped so a user can only read/write rows belonging to a `group` they're a member of (via `group_members`), plus their own `profiles` row. When writing new queries or migrations, always check that a corresponding RLS policy exists — don't rely on client-side filtering alone.

---

## 5. Key Screens

1. **Onboarding / Auth** — Sign up, log in, profile setup (Supabase Auth)
2. **Dashboard** — All groups, total owed / owed to you summary
3. **Group View** — Member list, expense list, net balances, Settle Up button
4. **Add Expense** — Manual entry or scan receipt
5. **Receipt Scanner** — Camera view → OCR results → item assignment
6. **Split Editor** — Choose split type, assign amounts per person
7. **Expense Detail** — Full breakdown, receipt photo, comments
8. **Settle Up** — Simplified debt transactions to execute
9. **Analytics** — Spending by category, over time, per person
10. **Settings** — Currency, notifications, payment methods

---

## 6. AI Assistant Guidelines

When helping with this codebase, follow these rules:

- **Framework:** Always write React Native code, not React web. Use `View`, `Text`, `Pressable`, not `div`, `button`, etc.
- **Routing:** Expo Router (file-based). Route files under `app/` stay thin — they extract params and render a screen; screen logic lives in `src/features/{feature}/screens/`. Navigate with `useRouter()` / `<Link>`, not a hand-built navigation tree.
- **Expo:** Assume the Expo managed workflow. Use `expo-camera`, `expo-image-picker`, `expo-image`, `expo-notifications`, `expo-font`, `expo-constants` where relevant instead of reaching for a bare-RN or web equivalent.
- **Backend:** Use **Supabase** (Postgres) for all data persistence and auth. Use **Supabase Realtime** channel subscriptions (`supabase.channel(...).on('postgres_changes', ...)`) for live balance/expense updates — this is the direct replacement for the old Firestore `onSnapshot` pattern. Never introduce Firebase/Firestore code.
- **Validation:** Every Supabase row shape, form input, and push-notification payload should have a matching Zod schema, with types derived via `z.infer<>` — don't hand-write parallel TypeScript types.
- **OCR:** Prefer Google ML Kit (`@react-native-ml-kit/text-recognition`) for on-device, offline-capable OCR. Fall back to a cloud API only if accuracy is demonstrably insufficient, and flag that as a deliberate, discussed tradeoff rather than a silent swap.
- **Debt algorithm:** The simplification algorithm lives in `utils/debtSimplifier.ts` (or the equivalent `features/settlements/utils/` location). **Do not rewrite or "simplify" it unless explicitly asked** — it is the startup's core differentiator. Any change here needs test coverage proving the transaction count is still minimal, not just that totals balance.
- **State:** Server state (anything backed by a Supabase query) goes through TanStack React Query with a query-key factory. Global client-only state lives in Zustand stores (`stores/`). Local UI state uses `useState`. Don't duplicate server data into Zustand "just in case."
- **Styling:** Use Tailwind classes via Uniwind (`className`), not `StyleSheet.create()`. Follow the existing design tokens in `shared/styles/tailwind.config.ts` (colors, spacing, type scale) rather than hard-coded hex/px values.
- **TypeScript:** All new files must be TypeScript. Prefer types derived from Zod schemas (`z.infer<>`) or generated Supabase types (`database.types.ts`) over hand-written duplicates in `types/`. Avoid `any`.
- **Testing:** Write Jest (`jest-expo` preset) unit tests for all utility functions, especially splitting logic and the debt simplification algorithm — these are the highest-value tests in the codebase given the startup's differentiator. Mock Supabase at the service layer rather than hitting the network.
- **Performance:** Receipt OCR is async and can be slow — always show a loading state. Paginate expense-list queries (`.range()` in Supabase) rather than fetching a whole group's history at once.
- **Startup-stage judgment call:** when a request is ambiguous or a "proper" solution would take meaningfully longer with little demo-visible benefit, it's fine to note the shortcut being taken and why, and flag what a more robust version would look like later — as long as it doesn't touch the debt algorithm, auth/RLS boundaries, or money math (splits, rounding, settlement amounts), which should be done right the first time even at this stage.

---

## 7. What Must Not Be "Good Enough for Now"

Given the startup stage in Section 1, most of this codebase can move fast and iterate. These specific areas are the exception — get them right even under demo pressure, since bugs here are either a broken pitch or real money handled wrong:

- The debt simplification algorithm's correctness (minimum transactions, balances net to zero)
- Split math and rounding (no lost or duplicated pennies across a group)
- Supabase RLS policies (a user must never be able to read/write another group's data)
- Anything touching real payment deep links or amounts (Nomba)

---

## 8. MVP

For the demo, prioritise in this order:

1. OCR receipt scan → item extraction → itemised split → balance update (end-to-end happy path)
2. Debt simplification visualisation
3. Group creation and member management
4. Push notification for payment reminders
5. Analytics dashboard
6. Multi-currency and recurring bills (stretch goals)
