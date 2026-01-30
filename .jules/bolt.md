# Bolt's Journal - CRITICAL LEARNINGS ONLY

## 2025-02-19 - [Lazy Loading Heavy Dependencies]
**Learning:** Static import of components utilizing `lib/firebase.ts` (e.g., `GetEdgeJourney`) triggers immediate initialization of the entire Firebase SDK (Auth, Firestore, Storage), significantly bloating the initial bundle size. Even if the component is conditionally rendered, the bundle is downloaded and parsed.
**Action:** Use `next/dynamic` with `ssr: false` AND a state guard (e.g., `hasOpened`) to ensure the component's code (and its heavy dependencies) is only fetched when the user actually interacts with it. For heavy library logic (like Auth in Navbar), move imports inside `useEffect` or event handlers.
