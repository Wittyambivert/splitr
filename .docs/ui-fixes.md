# UI Fixes — Nav & Home Page

## Blank Home Screen

**Root cause:** Two issues combined to produce a blank screen.

1. **Missing `SafeAreaProvider`** — `SafeAreaView` (from `react-native-safe-area-context`) requires a `SafeAreaProvider` ancestor. Without it, the component throws and silently kills its entire subtree. Only the `GradientBackdrop` remained visible because it sits *before* `SafeAreaView` in the tree and uses inline styles.

2. **`return null` on font load** — The root layout returned `null` while fonts loaded. If fonts took too long or errored, the app stayed blank permanently with no feedback.

**Fix (`src/app/_layout.tsx`):**
- Wrapped the app tree with `<SafeAreaProvider>` inside `GestureHandlerRootView`
- Added a branded loading spinner (`ActivityIndicator`) during font load instead of `null`
- Changed splash-screen dismissal to trigger on font *error* too (not just success)

**Fix (`src/app/(tabs)/index.tsx`):**
- Replaced `<SafeAreaView>` with a plain `<ScrollView>`
- Used `useSafeAreaInsets()` hook for manual top padding — more reliable than relying on `SafeAreaView`'s flex behavior
- Removed invalid Tailwind class `bg-gradient-card-blue` from the empty-state Card (not defined in the theme)

---

## Disjointed Tab Bar

**Root cause:** The `tabBarStyle` approach (inline styles on Expo Router's built-in tab bar) conflicts with the framework's internal layout engine. Properties like `flexDirection`, `justifyContent`, and `paddingHorizontal` either get overridden or cause misaligned items.

**Fix (`src/app/(tabs)/_layout.tsx`):**
- Replaced `tabBarStyle` with a fully custom `tabBar` render function
- The custom bar is a floating pill (`absolute`, `bottom-4`, `bg-surface-black`, `rounded-pill`) with proper `flex-row items-center justify-between` layout
- Active tab detection uses `usePathname()` for reliable route matching
- Center "Scan" tab renders as the branded lime CTA with `-translate-y-1` lift
- Each tab is a `Pressable` with 44×44px hit target for accessibility

---

## Gradient Positioning

**Root cause:** `GradientBackdrop` used the CSS shorthand `inset: 0` which is not supported in React Native's style system.

**Fix (`src/components/ui/GradientBackdrop.tsx`):**
- Replaced `inset: 0` with explicit `top: 0, left: 0, right: 0, bottom: 0`
