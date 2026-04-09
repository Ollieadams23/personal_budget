# Bug Fixes

This file tracks all bug fixes for the Personal Budget project.


- Fixed: Expense modal event handler now attaches after modal HTML loads, so expenses can be added reliably.
- Fixed: Transfer form event handler now attaches after modal HTML loads, preventing unwanted page refresh and ensuring error alerts display correctly.
- Fixed: Edit Envelopes modal now immediately displays delete buttons for each envelope, and the list updates correctly after deletion.
- Fixed: Duplicate envelope list rendering caused delete buttons to flash and disappear. The issue was due to a duplicate fetchAndRenderEnvelopes event listener at line 150 in src/script.js. The duplicate was commented out, and now only one function handles rendering, so delete buttons persist as expected.the function is still there that addsd del button but the  "item.appendChild(deleteBtn)" is commented out [2026-04-09]

---

Add new entries below as bugs are fixed.
