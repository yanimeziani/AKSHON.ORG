## 2025-01-27 - Lazy Loading Verification
**Learning:** Memory stated `GetEdgeJourney` was lazy-loaded, but code analysis revealed static imports in key files (`page.tsx`, `Navbar.tsx`). Trust code over memory.
**Action:** Always verify `import` statements for heavy components. Use `next/dynamic` with `ssr: false` and interaction guards (`hasInteracted`) for modals that are initially hidden.
