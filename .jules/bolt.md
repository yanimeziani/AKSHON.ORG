## 2024-05-22 - Verification over Memory
**Learning:** Memory stated components were lazy-loaded, but code inspection revealed they were static imports. Always verify the current state of the code before optimizing.
**Action:** Use `list_files` and `read_file` to confirm the presence of optimizations (like `next/dynamic`) rather than assuming they exist based on documentation or memory.

## 2024-05-22 - Deferring Modal Dependencies
**Learning:** For modals that import heavy libraries (like Firebase), simply using `next/dynamic` isn't enough if the component is conditionally rendered in the parent but the condition is part of the dynamic component's props. The chunk might still be preloaded.
**Action:** Use a state guard (e.g., `hasOpened`) in the parent to conditionally render the *dynamic component itself* only after the first interaction. This ensures the heavy chunk is strictly loaded on demand.
