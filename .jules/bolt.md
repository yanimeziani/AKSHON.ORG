## 2024-05-22 - Firebase Initialization Bottleneck
**Learning:** `lib/firebase.ts` initializes Firebase SDK immediately on import. Static imports of components using it (like `GetEdgeJourney`) cause immediate initialization, blocking the main thread, even if the component is hidden.
**Action:** Use `next/dynamic` and conditional rendering for any component importing `lib/firebase.ts` that isn't needed immediately.

## 2024-05-22 - Dynamic Import Race Conditions
**Learning:** When using `dynamic` imports inside `useEffect`, ensure to handle component unmounting. If the component unmounts before the import resolves, state updates will cause memory leaks. Use a `isMounted` flag.
**Action:** Always check `isMounted` before setting state in async effects involving dynamic imports.
