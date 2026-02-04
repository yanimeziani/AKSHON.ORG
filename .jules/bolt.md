## 2026-02-04 - Lazy Loading State Guards
**Learning:** Using `next/dynamic` for modals requires a state guard (`hasOpened`) to truly defer loading. Without it, if the modal component is rendered (even with `isOpen={false}`), the chunk is loaded immediately. The guard ensures the dynamic import is only triggered upon user interaction.
**Action:** Always wrap heavy, interactive-only components (like modals) in a `hasOpened` conditional check when using `next/dynamic`.
