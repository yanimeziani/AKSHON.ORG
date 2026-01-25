## 2025-02-18 - Lazy Loading Heavy Modals
**Learning:** `GetEdgeJourney` and `CryptoPayment` are heavy components that are initially hidden. Importing them dynamically with `next/dynamic` and `ssr: false`, guarded by a `hasInteracted` state, significantly reduces initial bundle size without breaking `AnimatePresence` exit animations (as long as the component stays mounted after first load).
**Action:** Apply this pattern to all heavy, initially hidden interactive components (modals, drawers, etc.).
