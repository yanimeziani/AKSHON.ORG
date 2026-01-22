## 2024-05-22 - Lazy Loading Modal
**Learning:** Heavy modals like `GetEdgeJourney` can be lazily loaded with `next/dynamic` and `ssr: false`. To prevent immediate fetching on render (which happens if the component is mounted but hidden), use a state guard (e.g., `hasInteracted`) to only render the component after the first user interaction.
**Action:** Apply this pattern to all heavy, initially hidden interactive components.
