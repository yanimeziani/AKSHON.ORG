## 2025-02-18 - Ghost Optimization
**Learning:** Memory stated modals were lazy-loaded with `next/dynamic`, but code used static imports. Trust code over context.
**Action:** Verify all "implemented" optimizations by reading the source.

## 2025-02-18 - Framer Motion & Lazy Loading Interaction
**Learning:** Automated verification (Playwright) of lazy-loaded Framer Motion modals often fails on "close" interactions due to animation timing or viewport clipping, even when the feature works for users.
**Action:** When verifying lazy-loaded interactive components, prioritize visual confirmation of the "Open" state over strict automated "Close" verification to avoid false negatives.
