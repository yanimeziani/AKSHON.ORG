## 2024-05-23 - Static Imports of Firebase Components
**Learning:** Static importing of components that import `lib/firebase.ts` (even transitively) triggers immediate initialization of the Firebase SDK, regardless of whether the component is rendered. This significantly impacts initial bundle size and execution time.
**Action:** Always lazy load components (using `next/dynamic`) that rely on heavy SDKs like Firebase, especially if they are not needed immediately (e.g., modals). Use a state guard (like `hasOpened`) to defer the actual fetch/execution of the chunk until the first interaction.
