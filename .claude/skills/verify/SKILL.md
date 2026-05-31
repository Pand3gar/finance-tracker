---
name: verify
description: Launch the dev server and verify that a UI change works correctly in a real browser before reporting done.
---

This project is a React 19 + Vite SPA backed by Supabase. When verifying changes:

1. Run `bun run dev` to start the dev server (port 5173 by default).
2. Open the browser and navigate to the relevant page/feature.
3. Test the golden path of the change.
4. Check for console errors and visual regressions in adjacent areas.
5. If the change touches Supabase (auth, data fetching, RLS), confirm the real data loads correctly — not just the UI skeleton.
6. Report what you observed, not just that you ran the server.

Note: `.env` at the project root must have `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set for Supabase features to work.
