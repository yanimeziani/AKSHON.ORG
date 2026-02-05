## 2024-05-23 - Firebase SDK Initialization Cost
**Learning:** Static imports of components using `lib/firebase.ts` (like `GetEdgeJourney`) trigger immediate Firebase App initialization, even if the component is not rendered. This significantly increases TBT/LCP.
**Action:** Use `next/dynamic` with `ssr: false` AND a conditional state guard (e.g., `hasOpened`) to ensure the chunk is only loaded (and Firebase initialized) upon user interaction.
