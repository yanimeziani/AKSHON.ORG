## 2024-05-23 - Lazy Loading Heavy Modals
**Learning:** Heavy modal components (`GetEdgeJourney`, `CryptoPayment`) that are initially hidden but imported statically increase the initial bundle size significantly. Using `next/dynamic` with `ssr: false` effectively splits these into separate chunks.
**Action:** Always check `app/` and `components/` for heavy interactive components (especially modals) that are statically imported but conditionally rendered. Apply `next/dynamic` to them.
**Pattern:** To prevent "pop-in" delay when the user clicks to open the modal, add `onMouseEnter={() => import('...')}` to the trigger button to prefetch the chunk. This combines the benefits of lazy loading (small initial bundle) with instant interaction.
