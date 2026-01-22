# Progress Log
Started: Thu 22 Jan 2026 15:20:25 PST

## Codebase Patterns
- (add reusable patterns here)

---
## [2026-01-22 15:55:45] - US-004: Auth screens (Welcome/Login/OTP/Register/Forgot)
Thread: 
Run: 20260122-154120-60317 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-154120-60317-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-154120-60317-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 401d488 feat(auth): add onboarding auth screens
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: npm run web -- --port 19006 -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - App.tsx
  - package-lock.json
  - package.json
  - src/screens/auth/AuthLayout.tsx
  - src/screens/auth/ForgotScreen.tsx
  - src/screens/auth/LoginScreen.tsx
  - src/screens/auth/OtpScreen.tsx
  - src/screens/auth/RegisterScreen.tsx
  - src/screens/auth/WelcomeScreen.tsx
  - src/screens/auth/types.ts
- What was implemented: built Welcome/Login/Register/Forgot/OTP screens with required-field error states, wired auth stack to gate Main tabs, and added Expo web deps for browser validation
- **Learnings for future iterations:**
  - Patterns discovered: use native-stack for auth flows and keep auth screen styling centralized in `src/screens/auth/AuthLayout.tsx`
  - Gotchas encountered: Expo web requires `react-dom` and `react-native-web` before browser verification
  - Useful context: dev-browser server binds to port 9222 and needs it free before startup
---
## [2026-01-22 17:02:56] - US-007: Home screen layout
Thread: 
Run: 20260122-165705-74816 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-165705-74816-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-165705-74816-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d37d677 feat(home): add home screen layout
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: CI=1 npm run web -- --port 19007 -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - App.tsx
  - src/screens/home/HomeScreen.tsx
- What was implemented: added the Home tab layout with banner, featured carousel backed by seed data, categories list, and an empty-state message for missing featured items
- **Learnings for future iterations:**
  - Patterns discovered: seed-driven UI sections can derive categories by grouping menu items by categoryId
  - Gotchas encountered: Expo web requires CI=1 to avoid interactive port prompts
  - Useful context: Home screen checks for featured items by badge or classic tags
---
## [2026-01-22 17:56:15] - US-011: Product detail screen
Thread: 
Run: 20260122-173544-90493 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-173544-90493-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-173544-90493-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: ae8c68c feat(menu): add product detail screen
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: CI=1 npm run web -- --port 19010 -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - App.tsx
  - seeds/menu.json
  - src/models/types.ts
  - src/screens/auth/types.ts
  - src/screens/menu/MenuScreen.tsx
  - src/screens/menu/ProductDetailScreen.tsx
- What was implemented: added product detail screen with images, description, allergens, and base price from seeded menu data; wired menu item navigation and a not-found state for missing IDs
- **Learnings for future iterations:**
  - Patterns discovered: root stack routes are more reliable than nested tab stacks for web navigation visibility
  - Gotchas encountered: nested Pressable taps should stop propagation to avoid unintended navigation
  - Useful context: CI=1 is required for Expo web to bypass interactive port prompts
---
## [2026-01-22 18:20:55] - US-013: Quantity + special instructions
Thread: 
Run: 20260122-181114-5416 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-181114-5416-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-181114-5416-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 65baaf7 feat(product-detail): add quantity and notes
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: CI=1 EXPO_DEV_SERVER_PORT=8083 npm run web -- --port 8083 -> PASS
- Files changed:
  - /Users/ynadonaire/Documents/coffee-app/.agents/tasks/prd-coffee.json
  - /Users/ynadonaire/Documents/coffee-app/src/screens/menu/ProductDetailScreen.tsx
  - /Users/ynadonaire/Documents/coffee-app/AGENTS.md
  - /Users/ynadonaire/Documents/coffee-app/.ralph/progress.md
- What was implemented: Added quantity controls with per-item pricing, total updates, and special instructions input on Product Detail; browser verified with screenshot at /Users/ynadonaire/.codex/skills/dev-browser/tmp/us-013-quantity-notes.png.
- **Learnings for future iterations:**
  - Patterns discovered: Expo web runs cleanly on port 8083 with CI=1 when 8081 is occupied.
  - Gotchas encountered: expo start --web prompts for a new port without CI mode.
  - Useful context: Activity logging helper was missing, so manual entries were appended.
---
## [2026-01-22 18:36:48] - US-014: Cart state + UI
Thread: 
Run: 20260122-182414-10178 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-182414-10178-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-182414-10178-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 6e35a3e feat(cart): add cart state and review UI
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - App.tsx
  - src/data/cart.tsx
  - src/screens/auth/types.ts
  - src/screens/cart/CartScreen.tsx
  - src/screens/menu/MenuScreen.tsx
  - src/screens/menu/ProductDetailScreen.tsx
- What was implemented
  - Added cart context with totals and item updates, plus Cart screen UI with quantity/remove controls.
  - Wired add-to-cart flow from Product Detail and cart access from the Menu header.
  - Verified totals update after removal in web UI (screenshots in /Users/ynadonaire/.codex/skills/dev-browser/tmp/).
- **Learnings for future iterations:**
  - Expo web in non-interactive mode needs an explicit port (used `npm run web -- --port 8084`).
  - React Native web Alerts can require explicit dialog handling in automation.
---
## [2026-01-22 23:40:07] - US-015: Fee calculation rules
Thread: 
Run: 20260122-232440-36592 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-232440-36592-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-232440-36592-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 4053cff feat(cart): apply tax and fee totals
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: npm run web -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - src/data/cart.tsx
  - src/screens/cart/CartScreen.tsx
- What was implemented
  - Added fee calculation rules (tax, delivery, small-order) into cart totals and surfaced fee breakdown + total in the cart summary UI.
- **Learnings for future iterations:**
  - Patterns discovered: cart totals derived via useMemo to keep fee math centralized.
  - Gotchas encountered: expo web navigation uses tab role selectors for reliable automation.
  - Useful context: dev-browser server needs persistent background run to avoid page closure errors.
---
## [2026-01-22 23:50:26] - US-016: Promo and voucher application
Thread: 
Run: 20260122-234056-39922 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-234056-39922-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260122-234056-39922-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 7b466d0 feat(cart): apply promo codes
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: npm run web -- --port 19006 -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - .ralph/progress.md
  - seeds/promos.json
  - src/data/cart.tsx
  - src/screens/cart/CartScreen.tsx
- What was implemented
  - Added promo validation and discount math to cart totals with expiry/min spend handling.
  - Built promo/voucher entry UI with applied state, remove action, and discount line item.
  - Seeded an expired promo for negative testing and verified behavior via web UI (screenshots in /Users/ynadonaire/.codex/skills/dev-browser/tmp/).
- **Learnings for future iterations:**
  - Patterns discovered: promo state should live alongside cart totals for consistent recalculation.
  - Gotchas encountered: dev-browser server may report an existing port; rerun if needed.
  - Useful context: expo web stayed stable on port 19006 for UI verification.
---
## [2026-01-23 00:15:27] - US-018: Pickup scheduling slots
Thread: 
Run: 20260123-000818-46699 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260123-000818-46699-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260123-000818-46699-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: ec3619a feat(checkout): add pickup time slots
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - AGENTS.md
  - App.tsx
  - src/screens/auth/types.ts
  - src/screens/cart/CartScreen.tsx
  - src/screens/cart/CheckoutScreen.tsx
- What was implemented
  - Added pickup slot generation based on store hours with a lead time gate, and required selection before checkout.
  - Surfaced pickup time chips in checkout with empty-state messaging when no slots exist.
  - Verified the flow in Expo web; screenshots in /Users/ynadonaire/.codex/skills/dev-browser/tmp/.
- **Learnings for future iterations:**
  - Patterns discovered: reset pickup time when store or fulfillment changes to avoid stale selections.
  - Gotchas encountered: `expo start --web` ignores `--non-interactive`, use `CI=1`.
  - Useful context: dev-browser server was already running on port 9222.
---
## [2026-01-23 01:16:45] - US-023: Rewards dashboard + earning rules
Thread: 
Run: 20260123-010538-59539 (iteration 1)
Run log: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260123-010538-59539-iter-1.log
Run summary: /Users/ynadonaire/Documents/coffee-app/.ralph/runs/run-20260123-010538-59539-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 57adf89 feat(rewards): add rewards dashboard
- Post-commit status: clean
- Verification:
  - Command: npm run lint -> PASS
  - Command: npm run typecheck -> PASS
  - Command: npm test -> PASS
  - Command: CI=1 npm run web -- --port 8084 -> PASS
- Files changed:
  - .agents/tasks/prd-coffee.json
  - App.tsx
  - seeds/reward_transactions.json
  - seeds/rewards_rules.json
  - src/data/seedLoader.ts
  - src/models/types.ts
  - src/screens/rewards/RewardsScreen.tsx
- What was implemented: Added rewards dashboard UI with points, tier progress, earning rate, and activity computed from reward rules and transactions; added rewards seed data and loader support. Browser check screenshot at /Users/ynadonaire/.codex/skills/dev-browser/tmp/rewards.png.
- **Learnings for future iterations:**
  - Patterns discovered: Rewards UI follows existing card-based styling in other screens.
  - Gotchas encountered: Expo web dev server needed explicit --port in CI mode when 8081 was busy.
  - Useful context: Rewards rules and transactions are now seeded for deterministic points calculations.
---
