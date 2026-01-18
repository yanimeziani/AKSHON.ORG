## 2024-05-23 - Firebase SDK Bundle Bloat
**Learning:** Statically importing components that use the Firebase SDK (like `GetEdgeJourney` using `firebase/firestore`) causes the entire SDK to be included in the initial bundle, even if the component is a modal that is hidden by default.
**Action:** Always use `next/dynamic` with `ssr: false` for heavy components that are not visible on initial load, especially those importing heavy 3rd party libraries.
