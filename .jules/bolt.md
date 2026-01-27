## 2025-10-26 - Static Import Regression
**Learning:** Heavy components (GetEdgeJourney) were intended to be lazy-loaded but were statically imported in multiple locations (Navbar and Page), forcing them into the main bundle.
**Action:** Always grep for component usage globally when optimizing; a single static import anywhere defeats code splitting for that component.
