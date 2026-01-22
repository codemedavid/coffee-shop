# Coffee Ordering App PRD (Planning)

## 1. Overview
A mobile coffee ordering app inspired by Zus Coffee, built with React Native. Users can browse menu, customize drinks, place pickup/delivery orders, earn rewards, and manage their profile. This document defines features and a granular task breakdown. Each task is testable and includes sample seed data.

## 2. Goals
- Fast, reliable ordering with clear customization options.
- Support pickup and delivery flows.
- Provide loyalty/rewards and promo functionality.
- Track order status and history.

## 3. Non-Goals (initial)
- Multi-brand marketplace.
- In-app chat support.
- Subscription plans.
- Live driver map tracking (later phase).

## 4. Personas
- Guest user: browses menu, can place first-time order.
- Registered user: saved addresses, payment methods, rewards.
- Barista/Store staff: views and updates order status (phase 2).

## 5. Core Features & Task Breakdown

### 5.1 Onboarding & Authentication
**Scope**: Email/phone login, OTP, basic profile.

Tasks:
1. Define auth screens (welcome, login, OTP, register, forgot).
   - Test: UI renders all fields and states.
   - Seed: `seedUserGuest`, `seedUserNew`.
2. Implement input validation rules (email/phone format, password policy).
   - Test: invalid inputs blocked; error messages shown.
3. Implement OTP flow (request OTP, verify OTP, resend timer).
   - Test: OTP request creates token, verification accepts valid token, rejects invalid.
   - Seed: `seedOtpValid`, `seedOtpExpired`, `seedOtpRateLimited`.
4. Add auth session persistence (remembered login).
   - Test: app restores session on relaunch.
   - Seed: `seedSessionActive`, `seedSessionExpired`.
5. Create user profile after successful auth (name, birthday, preferences).
   - Test: profile saved and returned on app load.
   - Seed: `seedUserRegistered`.
6. Add guest-to-registered conversion flow.
   - Test: guest cart preserved after sign-up.
   - Seed: `seedCartItemsGuest`.

### 5.2 Home & Menu Browsing
**Scope**: categories, featured items, search, store selection.

Tasks:
1. Build home screen layout (banner, featured, categories).
   - Test: sections render with seeded data.
   - Seed: `seedBanners`, `seedFeaturedItems`.
2. Implement store selector (nearest, favorites, recently used).
   - Test: changing store updates menu availability and hours.
   - Seed: `seedStores`, `seedStoreAvailability`, `seedStoreHours`.
3. Create menu category list and items list view.
   - Test: selecting category filters items.
   - Seed: `seedCategories`, `seedMenuItems`.
4. Add search by item name, tags, and category.
   - Test: search returns correct subset; empty state renders.
5. Add item badges (new, popular, promo).
   - Test: badges render from seed metadata.
   - Seed: `seedBadges`.
6. Add favorites (heart) on menu items.
   - Test: toggling favorite persists and reflects in favorites tab.
   - Seed: `seedFavorites`.

### 5.3 Product Detail & Customization
**Scope**: size, temperature, sugar level, add-ons.

Tasks:
1. Build product detail screen with base info, images, allergens.
   - Test: item details match seed data.
   - Seed: `seedMenuItemDetails`.
2. Implement customization options (single-select + multi-select).
   - Test: pricing updates with add-ons; required options enforced.
   - Seed: `seedCustomizations` (size, milk, syrup).
3. Add temperature/ice level controls (where applicable).
   - Test: non-applicable options hidden per item.
   - Seed: `seedCustomizationRules`.
4. Add quantity selector and special instructions.
   - Test: quantity changes total price; text persists in cart.
5. Add "save as favorite" and "reorder" shortcuts from detail.
   - Test: favorite created; reorder adds item with last customizations.
   - Seed: `seedLastOrderItem`.

### 5.4 Cart & Checkout
**Scope**: cart management, fees, promo, payment selection.

Tasks:
1. Create cart state (add, update, remove items).
   - Test: total recalculates and matches item data.
   - Seed: `seedCartItems`, `seedCartItemsGuest`.
2. Support cart grouping by store (prevent cross-store checkout).
   - Test: items from different stores blocked or split.
   - Seed: `seedCartMultiStore`.
3. Implement fee calculation (tax, service, delivery, small order fee).
   - Test: totals equal line-items + fees.
   - Seed: `seedFeeRules`.
4. Add promo and voucher code application.
   - Test: valid promo reduces total, invalid shows error.
   - Seed: `seedPromosValid`, `seedPromosInvalid`, `seedVouchers`.
5. Add tips (delivery tips, optional).
   - Test: tip selection updates total.
   - Seed: `seedTipOptions`.
6. Create checkout screen with pickup/delivery toggle.
   - Test: delivery requires address; pickup requires store selection.
7. Implement pickup time selection (ASAP vs scheduled).
   - Test: scheduled requires valid time slot.
   - Seed: `seedPickupSlots`.
8. Implement payment method selection (card, wallet, COD).
   - Test: default payment persists after selection.
   - Seed: `seedPayments`, `seedWalletBalance`.
9. Add order summary with itemized customizations.
   - Test: summary matches cart content.

### 5.5 Order Placement & Status
**Scope**: order creation, status updates, tracking timeline.

Tasks:
1. Implement order submission API contract (mocked).
   - Test: success creates order with ID and status.
   - Seed: `seedOrderDraft`.
2. Build order confirmation screen.
   - Test: displays order summary and ETA.
3. Create order status timeline (received, preparing, ready, completed).
   - Test: status advances based on seed updates.
   - Seed: `seedOrderStatusUpdates`.
4. Add order history list and detail views.
   - Test: past orders grouped by date and status.
   - Seed: `seedOrderHistory`.
5. Implement re-order from history.
   - Test: reorder recreates cart with previous customizations.
   - Seed: `seedOrderHistory`.
6. Add cancellation policy and cutoff window.
   - Test: cancellation allowed before cutoff, blocked after.
   - Seed: `seedCancelPolicy`.

### 5.6 Rewards & Loyalty
**Scope**: points earning, tier display, redemption.

Tasks:
1. Implement rewards dashboard (points, tier, history).
   - Test: points computed from seed purchases.
   - Seed: `seedRewardsSummary`, `seedRewardsHistory`.
2. Add redemption at checkout (apply points).
   - Test: max redeemable points enforced, total updates.
3. Add rewards earning rules (per ringgit spent, bonus multipliers).
   - Test: points awarded per rule set.
   - Seed: `seedRewardsRules`.

### 5.7 User Profile & Settings
**Scope**: profile, addresses, payment methods.

Tasks:
1. Build profile screen (name, phone, email).
   - Test: edits persist locally.
2. Manage addresses (add/edit/delete, default).
   - Test: default address used for delivery.
   - Seed: `seedAddresses`.
3. Manage saved payment methods.
   - Test: remove method updates selection list.
4. Add preferences (language, marketing opt-in).
   - Test: toggle changes stored preference.
   - Seed: `seedPreferences`.

### 5.8 Notifications
**Scope**: order updates and promos.

Tasks:
1. Create notification inbox screen.
   - Test: displays seeded notifications in reverse chronological order.
   - Seed: `seedNotifications`.
2. Implement push notification hooks (stub).
   - Test: app handles incoming notification payload.
3. Add deep links from notifications to order detail.
   - Test: tapping notification navigates to correct order.
   - Seed: `seedNotificationDeepLinks`.

### 5.9 Static Content
**Scope**: FAQs, terms, privacy.

Tasks:
1. Build static content screens.
   - Test: content loads from local JSON.
   - Seed: `seedFaq`, `seedLegal`.

### 5.10 Favorites & Quick Reorder
**Scope**: favorites list, last order, quick add.

Tasks:
1. Create favorites list screen.
   - Test: list shows saved items with last-used customization.
   - Seed: `seedFavorites`.
2. Add quick add to cart from favorites.
   - Test: default customization rules applied.
3. Add "Order Again" button on home.
   - Test: creates a new cart with last order.
   - Seed: `seedLastOrder`.

### 5.11 Scheduling & Store Hours
**Scope**: store hours, holiday closures, time slots.

Tasks:
1. Implement store hours logic (open/closed banner).
   - Test: closed stores are disabled for pickup.
   - Seed: `seedStoreHours`, `seedStoreClosures`.
2. Implement time slot generation (pickup/delivery).
   - Test: slot list respects prep time and store hours.
   - Seed: `seedTimeSlotRules`, `seedPickupSlots`.

### 5.12 Promos & Vouchers
**Scope**: promo list, voucher wallet, eligibility.

Tasks:
1. Create promo listing screen.
   - Test: shows available and expired promos.
   - Seed: `seedPromosValid`, `seedPromosExpired`.
2. Implement voucher wallet (claimed vouchers).
   - Test: voucher applies only if eligible.
   - Seed: `seedVouchers`, `seedVoucherEligibility`.

### 5.13 Feedback & Ratings
**Scope**: order rating, store feedback.

Tasks:
1. Add post-order rating prompt.
   - Test: rating saved and tied to order.
   - Seed: `seedOrderForRating`.
2. Add feedback form (optional tags + note).
   - Test: form validates required fields if tag selected.
   - Seed: `seedFeedbackTags`.

### 5.14 Referral & Invite (optional)
**Scope**: invite code, referral rewards.

Tasks:
1. Implement referral code generation and share flow (stub).
   - Test: code shows on screen and copies to clipboard.
   - Seed: `seedReferralCode`.
2. Apply referral reward on first order.
   - Test: reward applied only once per referred user.
   - Seed: `seedReferralRules`.

## 6. Data Models (Draft)
- User: id, name, email, phone, verified, tier, points, preferences, referralCode.
- Session: token, userId, expiresAt.
- Store: id, name, address, hours, closures, distance, isPickupEnabled, isDeliveryEnabled.
- Category: id, name, sortOrder.
- MenuItem: id, name, categoryId, basePrice, tags, badge, availability, imageUrls.
- CustomizationOption: id, itemId, type, required, choices, pricingRule.
- CartItem: id, itemId, customizations, qty, unitPrice, notes.
- Cart: id, userId, storeId, items, fees, totals, appliedPromoId.
- Order: id, userId, storeId, items, status, total, ETA, fulfillmentType, scheduledAt.
- Promo: id, code, type, amount, minSpend, expiry, eligibility.
- Voucher: id, title, type, amount, expiry, eligibility.
- PaymentMethod: id, type, token, last4, isDefault.
- Address: id, userId, label, line1, city, postalCode, lat, lng, isDefault.
- RewardsRule: id, pointsPerCurrency, multiplier, validFrom, validTo.
- RewardTransaction: id, points, type, date, orderId.
- Notification: id, title, body, deepLink, createdAt.

## 7. Seed Structure (Use for tests)
Proposed structure in `seeds/`:\n
- `seeds/index.ts` - exports all seed objects for easy test imports.
- `seeds/users.json`
- `seeds/sessions.json`
- `seeds/stores.json`
- `seeds/categories.json`
- `seeds/menu_items.json`
- `seeds/customizations.json`
- `seeds/cart.json`
- `seeds/orders.json`
- `seeds/promos.json`
- `seeds/vouchers.json`
- `seeds/rewards.json`
- `seeds/notifications.json`
- `seeds/addresses.json`
- `seeds/payments.json`

## 8. Sample Seed Data (Use for tests)
Provide as JSON or TS objects. Example entries:

- `seedUserGuest`: { id: null, isGuest: true }
- `seedUserNew`: { id: "u_new", verified: false }
- `seedUserRegistered`: { id: "u_001", name: "Ari", phone: "60123456789", points: 120 }
- `seedSessionActive`: { token: "tok_active", userId: "u_001", expiresAt: "2099-01-01" }
- `seedSessionExpired`: { token: "tok_exp", userId: "u_001", expiresAt: "2000-01-01" }
- `seedStores`: [
  { id: "s_001", name: "Zus SS2", distanceKm: 1.2 },
  { id: "s_002", name: "Zus Bangsar", distanceKm: 4.8 }
]
- `seedStoreHours`: [
  { storeId: "s_001", days: ["Mon","Tue","Wed","Thu","Fri"], open: "08:00", close: "22:00" }
]
- `seedStoreClosures`: [ { storeId: "s_001", date: "2024-12-25", reason: "Holiday" } ]
- `seedCategories`: [ { id: "c_001", name: "Espresso" }, { id: "c_002", name: "Non-Coffee" } ]
- `seedMenuItems`: [
  { id: "m_001", name: "Spanish Latte", categoryId: "c_001", basePrice: 12.9 },
  { id: "m_002", name: "Matcha Latte", categoryId: "c_002", basePrice: 13.9 }
]
- `seedMenuItemDetails`: { id: "m_001", description: "Creamy latte", allergens: ["milk"] }
- `seedCustomizations`: {
  size: ["Small", "Medium", "Large"],
  sugar: ["0%", "25%", "50%", "100%"],
  addons: [ { id: "a_001", name: "Extra Shot", price: 3.0 } ]
}
- `seedCustomizationRules`: { itemId: "m_001", allowIce: true, allowHot: true }
- `seedCartItems`: [
  { itemId: "m_001", qty: 2, customizations: { size: "Medium", sugar: "50%" } }
]
- `seedCartItemsGuest`: [
  { itemId: "m_002", qty: 1, customizations: { size: "Small", sugar: "25%" } }
]
- `seedCartMultiStore`: [
  { itemId: "m_001", storeId: "s_001" },
  { itemId: "m_002", storeId: "s_002" }
]
- `seedFeeRules`: { taxRate: 0.06, deliveryFee: 5.0, smallOrderMin: 20.0, smallOrderFee: 2.0 }
- `seedPromosValid`: [ { code: "ZUS10", type: "percent", amount: 10, minSpend: 20 } ]
- `seedPromosInvalid`: [ { code: "EXPIRED", type: "percent", amount: 15, expiry: "2020-01-01" } ]
- `seedPromosExpired`: [ { code: "OLD5", type: "flat", amount: 5, expiry: "2021-01-01" } ]
- `seedVouchers`: [ { id: "v_001", title: "RM5 Off", type: "flat", amount: 5 } ]
- `seedVoucherEligibility`: { voucherId: "v_001", minSpend: 15.0 }
- `seedTipOptions`: [0, 2, 5, 8]
- `seedPickupSlots`: ["09:30", "10:00", "10:30"]
- `seedTimeSlotRules`: { leadMinutes: 15, intervalMinutes: 30 }
- `seedPayments`: [ { id: "card_001", type: "card", last4: "4242" } ]
- `seedWalletBalance`: { userId: "u_001", balance: 25.0 }
- `seedOrderHistory`: [
  { id: "o_001", status: "completed", total: 25.8, date: "2024-10-01" },
  { id: "o_002", status: "completed", total: 13.9, date: "2024-10-03" }
]
- `seedLastOrder`: { id: "o_002", items: ["m_002"] }
- `seedCancelPolicy`: { cutoffMinutes: 3 }
- `seedRewardsSummary`: { points: 120, tier: "Silver" }
- `seedRewardsRules`: { pointsPerCurrency: 1, multiplier: 1.0 }
- `seedRewardsHistory`: [ { id: "rt_001", points: 10, type: "earn", orderId: "o_001" } ]
- `seedNotifications`: [
  { id: "n_001", title: "Order Ready", body: "Your order is ready." }
]
- `seedNotificationDeepLinks`: [ { id: "n_002", deepLink: "order/o_001" } ]
- `seedAddresses`: [ { id: "a_001", label: "Home", line1: "12 Jalan SS2" } ]
- `seedPreferences`: { marketingOptIn: true, language: "en" }
- `seedOrderForRating`: { id: "o_003", status: "completed" }
- `seedFeedbackTags`: ["Late", "Wrong Item", "Great Service"]
- `seedReferralCode`: { userId: "u_001", code: "ARI123" }
- `seedReferralRules`: { rewardAmount: 5.0, firstOrderOnly: true }

## 9. Testing Strategy (Per Task)
- Unit tests: validators, price calculators, promo logic.
- UI tests: screen rendering with seed data.
- Integration tests: full order flow from product to confirmation.

## 10. Milestones
1. MVP: Onboarding, menu, cart, checkout, order status.
2. V1: Rewards, notifications, profile management.
3. V2: Barista/staff dashboard, advanced personalization.
