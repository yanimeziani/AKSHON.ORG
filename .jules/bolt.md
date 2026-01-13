## 2024-05-22 - Next.js Dynamic Import with Exit Animations
**Learning:** When using `next/dynamic` to lazy load a modal that uses `AnimatePresence` for exit animations, you cannot simply conditionally render the dynamic component. You must use a state flag (e.g., `hasOpened`) to ensure the component stays mounted (but hidden) after the first load, so that `AnimatePresence` can handle the exit animation when `isOpen` becomes false.
**Action:** Use `const [hasOpened, setHasOpened] = useState(false)` and `{hasOpened && <DynamicComponent ... />}` pattern for lazy-loaded modals.
