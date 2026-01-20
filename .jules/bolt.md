## 2025-02-20 - Lazy Loading Heavy Modals
**Learning:** Modals that import heavy dependencies (like Firebase, Framer Motion) should be lazy-loaded using `next/dynamic` with `ssr: false`. However, to preserve exit animations (handled by `AnimatePresence`), the component must remain mounted even after closing.
**Action:** Use a "mounted" state (e.g., `hasInteracted`) to control the *first* render. Once rendered, keep it in the DOM but pass `isOpen={false}` to let the component handle its own exit animation. Prefetch the chunk on hover of the trigger button.
