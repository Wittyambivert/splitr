# Splitr

A Mobile app that scans receipts with OCR and splits bills among friends and roommates in real time. Built for a hackathon.

## Tech Stack

- **Framework:** React Native via Expo SDK 57
- **OCR:** Google ML Kit (`@react-native-ml-kit/text-recognition`)
- **Backend:** Supabase (Supbase + Auth)
- **State:** Zustand
- **Navigation:** Expo Router v4 (file-based)
- **Styling:** Tailwind CSS v4 via uniwind
- **Notifications:** Expo Push Notifications
- **Payments:** PayPal / Revolut deep links (optional)

## Core Features

- **Receipt Scanning** — Point camera at a receipt; OCR extracts line items, prices, tax, and tip. Confidence scoring flags low-accuracy results. Supports image upload and email forwarding.
- **Bill Splitting** — Equal, itemised, percentage, and custom ratio splits. Tax/tip handled separately. Round-up/down logic for leftover pennies. IOU tracking.
- **Debt Simplification** — Calculates the minimum number of transactions to settle all debts in a group (e.g. 6 people → 3 payments instead of 15). This is a key demo feature.
- **Group & Expense Management** — Named groups, member management, recurring bills, expense categories with analytics, full audit history, receipt photo attachment, locked expenses requiring group approval.
- **Social & Settlement** — Push reminder nudges, in-app payment requests, "Settle up" button, group comments, CSV/PDF export.

## Key Screens

1. **Onboarding / Auth** — Sign up, log in, profile setup
2. **Dashboard** — All groups, total owed / owed to you summary
3. **Group View** — Member list, expense feed, net balances, Settle Up
4. **Add Expense** — Manual entry or scan receipt
5. **Receipt Scanner** — Camera → OCR → item assignment
6. **Split Editor** — Choose split type, assign per-person amounts
7. **Expense Detail** — Full breakdown, receipt photo, comments
8. **Settle Up** — Simplified debt transactions to execute
9. **Analytics** — Spending by category, over time, per person
10. **Settings** — Currency, notifications, payment methods
