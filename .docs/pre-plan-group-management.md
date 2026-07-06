# Pre-Plan: Group Management & Group Page Features

> **Date:** 2026-07-06
> **Plan Source:** `.docs/plan.json` — Steps 1, 2, 3

---

## Plan from plan.json

### Step 1: Create Group
- Plus button on home page → opens modal
- Name input with default "Group 1"
- Creates group → redirects to group page

### Step 2: Group Page
- Show group name + member count
- **Add Members** button → modal with QR code placeholder + copy link
- Member list
- **Scan Bill** button → modal with camera/upload + OCR → creates expense
- **Split Bill** button → modal with amount + split type → computes per-member amounts → creates expense
- **Virtual Wallet** button → modal with mock card (number, expiry, CVV) + copy
- Expenses list (real data)

### Step 3: Creator Indicator
- Star icon beside group creator's name in member list

---

## Files to Change

| File | Action | Scope |
|------|--------|-------|
| `src/app/(tabs)/index.tsx` | Modify | Wire stores, create group modal (~60 lines changed) |
| `src/app/group/[id].tsx` | Rewrite | Full group page + 4 modals (~300 lines new) |
| `src/services/nomba.ts` | Create | Virtual card placeholder (~20 lines) |

---

## Design Decisions

1. **Virtual Wallet** → Static mock data wrapped in `src/services/nomba.ts` for future Nomba API swap
2. **Split Bill** → Real split computation via `calculateSplit()` utility. No "send" functionality — all members see it in-app
3. **QR Code** → Placeholder rectangle only; backend-generated later
4. **Scan Bill** → New modal integrated into group page (image picker + OCR), separate from existing `/(tabs)/scan` camera flow
5. **Ignore gradients** per user instruction — no `GradientBackdrop`

---

## Implementation Order

1. Create `src/services/nomba.ts` (no dependencies)
2. Modify `src/app/(tabs)/index.tsx` (dashboard wiring + create group)
3. Rewrite `src/app/group/[id].tsx` (group page + all modals)
4. Typecheck verification
