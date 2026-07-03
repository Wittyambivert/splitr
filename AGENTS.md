# Splitr — AI Agent Guide (Expo v57)

## 1. First Principles

- **Expo SDK 57** with React Native 0.86, React 19.2.3, TypeScript ~6.0.3
- Read exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code
- **No `tailwind.config.js`** — Tailwind v4 is CSS-first via `@theme` in `src/global.css`
- Use `className` with Tailwind utilities via **uniwind** (configured in `metro.config.js`); never hardcode raw hex/pixel values in components
- All Tailwind theme tokens live in `src/global.css` — `global.css` is imported once at `app/_layout.tsx` route level
- All new files **must** be TypeScript — no `any`, no `// @ts-nocheck`

## 2. Architecture

### File Structure

```
src/
  app/                  # Expo Router v4 (file-based routing)
    (tabs)/             # Main tab navigator group
      _layout.tsx       # Tab bar config
      index.tsx         # Dashboard
      groups.tsx        # Group list
      scan.tsx          # Receipt scanner
      analytics.tsx     # Spending analytics
      settings.tsx      # Profile & preferences
    _layout.tsx         # Root layout (fonts, gesture handler, providers)
    group/[id].tsx      # Group detail + settle up
    expense/new.tsx     # Add expense
    expense/[id].tsx    # Expense detail
  components/
    ui/                 # Design system primitives (Button, Card, Tag, etc.)
  stores/               # Zustand stores
  services/             # Supabase, Auth, OCR, Notification services
  utils/                # Pure functions (debtSimplifier, splitting, formatting)
  types/                # TypeScript interfaces
  theme/                # Design tokens (colors, typography, spacing)
  hooks/                # Custom React hooks
  constants/            # Legacy theme compat (imports from theme/)
assets/                 # Fonts, images, icons
```

### File-based Routing Rules

- `metro.config.js` uses `withUniwindConfig()` to compile Tailwind CSS v4 classes to native styles at build time
- `(tabs)/` is a route group — its `_layout.tsx` renders the custom floating bottom tab bar
- Screens inside `(tabs)/_layout.tsx` get the tab bar automatically
- Screens outside `(tabs)/` (eg `group/[id].tsx`) use `<Stack.Screen>` in root `_layout.tsx` with appropriate `presentation` (`card`, `modal`)
- Use `router.push()`, `router.back()`, and `router.replace()` from `expo-router`
- Use `useLocalSearchParams()` for route params
- Never render a `<Link>` inside `<Tabs>` children — use the `tabBarButton` prop instead

## 3. Design System

### Colors — always use Tailwind classes, never hex values

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-canvas` | `#F2F0F5` | Screen backgrounds |
| `bg-canvas-alt` | `#EDEBF2` | Secondary surfaces, list row backgrounds |
| `text-ink` | `#151316` | Primary text, icons |
| `text-ink-muted` | `#8A8791` | Secondary text, timestamps |
| `text-ink-faint` | `#B7B4BE` | Disabled text, placeholders |
| `bg-surface` | `#FFFFFF` | Cards, sheets |
| `bg-surface-black` | `#0B0A0D` | Bottom nav, modal scrims |
| `bg-brand-lime` | `#C6F24E` | Primary accent, CTA buttons |
| `text-brand-lime-ink` | `#173300` | Text on brand-lime |
| `bg-accent-amber` | `#F4C430` | Swiped badge, streak chips |
| `bg-accent-violet` | `#8B7BD8` | Group icons, info fills |
| `bg-accent-blush` | `#F3B7C3` | Secondary icon fills |
| `bg-pastel-pink` / `text-pastel-pink-ink` | `#F6CBD3` / `#B4425A` | Token badges |
| `bg-pastel-lilac` / `text-pastel-lilac-ink` | `#DCD1F4` / `#5B4A9E` | Token badges |
| `bg-pastel-sky` / `text-pastel-sky-ink` | `#CFE6F9` / `#2E6B96` | Token badges |
| `bg-pastel-mint` / `text-pastel-mint-ink` | `#D6F5D0` / `#2E7D42` | Token badges |
| `text-success` | `#2E7D42` | Positive balances |
| `text-warning` | `#F4C430` | Warnings |
| `text-danger` | `#E2554B` | Negative balances, errors |
| `border-line` | `#E4E1EA` | Hairline dividers |

### Typography — font family classes

| Class | Weight | Usage |
|-------|--------|-------|
| `font-body` | Regular (400) | Default body text |
| `font-medium` | Medium (500) | List row primary labels |
| `font-heading` | Bold (700) | Section titles, buttons, tags |
| `font-display` | ExtraBold (800) | Numerals, hero words |

**Font loading** — fonts must be loaded via `useFonts()` in `app/_layout.tsx` before any screen renders:
```tsx
const [loaded] = useFonts({
  'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
  'PlusJakartaSans-Medium': require('@/assets/fonts/PlusJakartaSans-Medium.ttf'),
  'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  'PlusJakartaSans-ExtraBold': require('@/assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
});
```

### Type Scale

```
Display numbers: 56/60, font-display
H1: 28/34, mixed-weight (font-body + font-display per word)
H2: 20/26, font-heading
H3: 17/22, font-heading
Body: 15/21, font-medium
Body muted: 14/20, text-ink-muted
Caption/eyebrow: 12/16, uppercase, tracking-wide, font-heading
Badge: 11/14, font-heading
```

### Spacing (Tailwind scale)

Base unit 4px — `p-1` = 4px, `p-5` = 20px, `p-6` = 24px, `p-8` = 32px, `p-10` = 40px, `p-12` = 48px

- Screen horizontal padding: `px-5` (20px)
- Section gap: `gap-6` (24px)
- Card inner gap: `gap-3` (12px)
- List row vertical pad: `py-3.5` (14px)

### Radii

```
rounded-xs: 8px    — small chips
rounded-sm: 12px   — nested tiles
rounded-md: 18px   — rows, inputs
rounded-lg: 24px   — standard cards
rounded-xl: 32px   — hero cards, bottom sheet
rounded-pill: 999px — buttons, badges, nav bar
```

### Shadows

```
Cards:    shadow-[0_8px_16px_rgba(21,19,22,0.06)]
Floating: shadow-[0_10px_20px_rgba(21,19,22,0.18)]
Nav bar:  shadow-[0_10px_20px_rgba(21,19,22,0.25)]
```

### Iconography

Use `lucide-react-native` — 20px inline, 22-24px nav, 28-32px inside pastel badges.
Circular icon wrappers: 40-44px `bg-surface` (light) or `bg-surface-black` (dark).

### The Mixed-Weight Headline (signature pattern)

Two `<Text>` nodes, two lines:
```tsx
<Text className="font-body text-[28px] leading-[34px] text-ink">
  Get your <Text className="font-display">split</Text>
</Text>
<Text className="font-body text-[28px] leading-[34px] text-ink">
  Swipe <Text className="font-display">to settle</Text>
</Text>
```
Rules: one bold word per line max, bold = the noun for the screen.

## 4. UI Components (src/components/ui/)

All primitives accept `variant` props — never override styles at call site with ad-hoc hex.

| Component | Variants | Notes |
|-----------|----------|-------|
| `Button` | `primary` / `secondary` / `ghost` | Ghost is icon-only, 44px circle |
| `Tag` | `lime` / `pastel-*` / `amber` / `surface` | Status pill badge |
| `Card` | `hero` / `blob` / `elevated` | Hero has rounded-xl, white bg |
| `ListRow` | — | Takes `leftIcon`, `label`, `right`, `onPress` |
| `AvatarStack` | — | Overlapping circles, +N overflow |
| `StatDisplay` | — | Big numeral + rotated amber badge |
| `BottomNav` | — | Takes tabs array; center tab is CTA |
| `SearchInput` | `dark` / `light` | Dark = black bg + lime border, Light = canvas-alt |
| `BottomSheet` | — | Uses Modal + Reanimated slide-up |
| `IconCircle` | `surface` / `black` | Circular icon button, 44px default |
| `GradientBackdrop` | `frame` / `card-blue` / `card-warm` | Absolute positioned linear gradient |

## 5. State Management (Zustand)

Stores in `src/stores/` — each is a single Zustand `create()` call with actions co-located.

- `auth-store.ts` — user, loading, error
- `group-store.ts` — groups[], CRUD
- `expense-store.ts` — expenses by groupId (Record<string, Expense[]>)
- `settlement-store.ts` — settlements by groupId

**Rules:**
- Use `use<Name>Store((state) => state.field)` for granular re-renders
- Never put computed values in stores — derive in hooks or utils
- Firestore `onSnapshot` listeners subscribe in hooks, write to stores on update
- Don't nest Zustand stores — each is independent

## 6. Services (src/services/)

- `supabase.ts` — singleton Supabase client using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- `auth.ts` — `signIn`, `signUp`, `signOutUser`, `subscribeToAuthChanges` via Supabase Auth
- `ocr.ts` — `scanReceipt(imageUri)` using `@react-native-ml-kit/text-recognition`, returns `OcrResult`
- `notifications.ts` — push token registration, send reminders via Expo push API

**Supabase rules:**
- Use `getSupabaseClient()` lazy singleton — never `createClient()` more than once
- All Supabase reads use real-time `postgres_changes` subscriptions for live updates via RealtimeChannel
- Paginate expense lists with `.limit(20)` and `.range()`
- Use `SupabaseClient.from()` for all queries — never raw SQL
- Auth session is persisted via AsyncStorage; use `onAuthStateChange` for reactive auth

## 7. Debt Simplification Algorithm

Lives in `src/utils/debtSimplifier.ts` — **do not rewrite unless explicitly asked**.

Algorithm: calculate net balance per person → greedy match max creditor with max debtor → produces minimum transactions.

```ts
simplifyDebts(expenses, memberDisplayNames): SimplifiedDebt[]
calculateNetBalancesForMembers(expenses, memberDisplayNames): NetBalance[]
```

## 8. Splitting Logic (src/utils/splitting.ts)

Four split types:
- `equal` — divide total / members, distribute remainder to largest share
- `percentage` — multiply total by each person's percentage
- `custom` — fixed amounts per person
- `itemised` — same as custom (each person assigned specific items)

Always round to 2 decimal places; remainder distribution goes to the largest amount.

```ts
calculateSplit({ totalAmount, memberIds, splitType, percentages?, itemAmounts? }): ExpenseSplit[]
```

## 9. Coding Standards

### React Native — not React web
- Use `View`, `Text`, `Pressable`, `ScrollView`, `TouchableOpacity`
- Never `div`, `span`, `button`, `img`, `p`, `h1`-`h6`
- Use `expo-image` for images, not `<img>` or `<Image>` from RN core

### Styling
- **Use `className` with Tailwind utilities** for all styling
- No `StyleSheet.create()` — use className strings
- No inline `style={}` props unless absolutely necessary (Reanimated animated styles, dynamic values)
- Every color/radius/spacing value must come from a Tailwind utility class — never hardcode hex

### Layout
- `SafeAreaView` from `react-native-safe-area-context` for notches/status bars
- `flex-1`, `flex-row`, `items-center`, `justify-between` pattern for layout
- ScrollView with `showsVerticalScrollIndicator={false}` and bottom padding for tab bar clearance

### TypeScript
- Define all interfaces in `src/types/`, import from `@/types`
- Use `@/` path alias (maps to `src/`)
- Never use `any`, `as any`, `// @ts-ignore`, or `// @ts-nocheck`
- Prefer `interface` over `type` for object shapes

### Performance
- OCR is async + slow — show loading spinner while scanning
- Supabase expense lists: paginate with `.limit(20)` and `.range()`
- Use `useCallback` for Supabase query functions
- Minimize re-renders: select granular Zustand slices, not full stores

### Accessibility
- Minimum touch target: 44×44px for all icon buttons
- Always set `accessibilityLabel` on icon-only buttons
- Provide `accessibilityRole="button"` on all `Pressable` elements
- `text-ink-muted` on `bg-canvas` is AA for text ≥14px only — never below that
- Respect reduced motion: use `AccessibilityInfo.isReduceMotionEnabled()` → fall back to opacity-only transitions

### Animation
- Sheet open: `animate-in slide-in-from-bottom-full duration-300`
- Sheet close: `animate-out slide-out-to-bottom-full duration-200`
- Button press: `active:scale-[0.97] active:opacity-80`
- List entrance: `animate-in fade-in slide-in-from-bottom-2 duration-200`
- Use `react-native-reanimated` for gesture-driven animations (bottom sheet drag)
- Keep motion utilitarian (<300ms) — no decorative animation

## 10. Key Screens Reference

| Screen | Route | File | Purpose |
|--------|-------|------|---------|
| Dashboard | `(tabs)/index` | `(tabs)/index.tsx` | Summary balance, group list, ambient gradient |
| Groups | `(tabs)/groups` | `(tabs)/groups.tsx` | Group cards with balance preview |
| Scanner | `(tabs)/scan` | `(tabs)/scan.tsx` | Camera capture → OCR processing → item list |
| Analytics | `(tabs)/analytics` | `(tabs)/analytics.tsx` | Spending by category bar chart |
| Settings | `(tabs)/settings` | `(tabs)/settings.tsx` | Profile, payment methods, preferences |
| Group | `group/[id]` | `group/[id].tsx` | Member list, expense feed, settle-up button |
| New Expense | `expense/new` | `expense/new.tsx` | Title, amount, split type selector |
| Expense Detail | `expense/[id]` | `expense/[id].tsx` | Full breakdown, receipt, comments |

## 11. Conventions

- **File exports**: Named exports only (`export function Foo()` not `export default`)
- **Imports**: `@/` path alias for all source files (`@/components/ui/Button`, `@/stores`, `@/utils`)
- **Import order**: React → Expo → 3rd party → `@/` internal → local constants
- **Commits**: Every commit must follow **semantic commit messages** (`feat:`, `build:`, `docs:`, `chore:`, `fix:`, `refactor:`). Each new component, hook, service, store, package install, or screen must be committed **individually** — never batch unrelated changes into a single commit.
- **Types**: Every database row gets a TypeScript interface; every API function has typed params and return
- **Error handling**: Wrap async calls in try/catch; surface errors through Zustand store `error` fields
- **Testing**: Jest unit tests for all utils (splitting, debt algorithm, formatting); no UI tests for hackathon

## 12. NPM Packages Available

Core: `expo`, `react`, `react-native`, `expo-router`
UI: `lucide-react-native`, `expo-linear-gradient`
State: `zustand`
Camera: `expo-camera`
OCR: `@react-native-ml-kit/text-recognition`
Backend: `@supabase/supabase-js` (auth, database, real-time)
Styling: `uniwind` + `tailwindcss` + `tw-animate-css` (Tailwind v4 CSS → RN)
Notifications: `expo-notifications`
Fonts: `expo-font`
Animation: `react-native-reanimated`, `react-native-gesture-handler`
Safe area: `react-native-safe-area-context`

## 13. App.json Config

Must use `expo-router` plugin, `typedRoutes: true`, `reactCompiler: true` experiments.
Font assets are loaded from `assets/fonts/` — all 4 PlusJakartaSans weights required.

### Uniwind / Tailwind Config Notes
- `metro.config.js` wraps config with `withUniwindConfig()`, pointing `cssEntryFile` at `./src/global.css`
- `global.css` must contain `@import 'tailwindcss'` and `@import 'uniwind'` at the top
- All theme tokens live in `@theme` block inside `global.css` — no `tailwind.config.js` file
- A `src/uniwind-types.d.ts` file is auto-generated by Metro for full TypeScript intellisense
- Animations use `tw-animate-css` utility classes (paired with Reanimated for gestures)

## 14. Build & Run

```bash
npm start          # Expo dev server
npm run android    # Android emulator/device
npm run ios        # iOS simulator
npm run web        # Web browser
npm run lint       # ESLint
```

Verify with `npx tsc --noEmit` before committing.
