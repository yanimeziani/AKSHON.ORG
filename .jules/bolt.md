## 2025-01-26 - Lazy Loading with State Guard
**Learning:** Using `next/dynamic` alone for heavy modals is insufficient if they are mounted but hidden (e.g., by Framer Motion). The chunk still loads immediately.
**Action:** Always wrap the dynamic component render with a state guard (e.g., `hasInteracted && <Component />`) to ensure the bundle is only fetched on actual demand.
