## 2025-05-23 - Lazy Loading Heavy Modals
**Learning:** Heavy interactive components (like `GetEdgeJourney` which imports Firebase) that are initially hidden (modals) should be lazy-loaded using `next/dynamic` combined with an interaction state guard. Statically importing them bloats the critical path bundle with code that isn't immediately needed.
**Action:** Always check if a modal component imports heavy libraries and if so, wrap it in a dynamic import and conditionally render it only after the first user interaction.
