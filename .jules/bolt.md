## 2026-01-26 - Deferred Loading of Heavy Modals
**Learning:** Large interactive components (like `GetEdgeJourney`) imported in critical path components (like `Navbar`) can significantly bloat the initial bundle, even if they are conditionally rendered.
**Action:** Use `next/dynamic` with `{ ssr: false }` AND a state-based deferred rendering pattern (`hasOpened && <Component />`) to ensure the code chunk is only requested when the user actually triggers the interaction.
