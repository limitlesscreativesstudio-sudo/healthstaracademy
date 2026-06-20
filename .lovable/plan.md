## Diagnosis

The "Failed to fetch" error on `/portal/teach/login` is **not a bug in your code**. It is a known Lovable Preview-environment limitation.

### Evidence
1. **Network trace** shows the request never reaches Supabase — it fails at status 0 inside `window.fetch`, which is wrapped by the preview-only script `https://cdn.gpteng.co/lovable.js`:
   ```
   POST .../auth/v1/token?grant_type=password  → Failed to fetch
   stack: at window.fetch (https://cdn.gpteng.co/lovable.js:30:1476)
          at ZE.signInWithPassword
   ```
2. **Direct curl to the same endpoint succeeds** (returns HTTP 400 `invalid_credentials` as expected for bad creds) — proving the Supabase Auth service, URL, anon key, CORS, and project are all healthy.
3. **Backend status**: Lovable Cloud reports healthy.
4. **Code review**: `AuthContext.tsx` `login()`, `PortalLogin.tsx`, and the auto-generated `src/integrations/supabase/client.ts` are all correct. Request payload in the network log matches what `supabase-js` should send.

### Root cause
The Lovable Preview iframe injects a fetch instrumentation proxy (`lovable.js`) that intermittently fails to forward Supabase Auth POSTs. This is specific to `id-preview--*.lovable.app` URLs. It does **not** affect:
- The published URL (`healthstaracademy.lovable.app`)
- Any custom domain (`healthstaracademy.org`, etc.)
- Real end users

### Verification step (for you, no code needed)
Open the login page on a non-preview URL and sign in:
- https://healthstaracademy.org/portal/teach/login
- https://healthstaracademy.lovable.app/portal/teach/login

Login will work. If it does *not* work there either, we have a different problem and I'll dig further.

## What I will NOT do (these would break things)
- Add CORS headers — CORS is already correct, proven by curl.
- Modify `src/integrations/supabase/client.ts` — auto-generated and correct.
- Override or monkey-patch `window.fetch` — would break other Lovable preview features (HMR, error reporting, network panel).
- Change the auth flow — `signInWithPassword` is used correctly.

## Optional small UX improvement (the only code change on offer)

Add a non-blocking yellow notice on `PortalLogin.tsx` that renders **only when the page is loaded inside the Lovable preview iframe** (detected via `window.location.hostname.includes('id-preview--')`). The notice would say something like:

> ⚠️ Preview mode: sign-in may fail here due to a preview-only network proxy. Open the live site to sign in: healthstaracademy.org/portal/teach/login

This is purely cosmetic — no auth logic, no client config, no fetch changes. Hidden on the published site and custom domains.

## Recommendation
1. Confirm login works on the published/custom-domain URL (expected: yes).
2. Decide whether you want the preview-only warning banner. If yes, switch me to build mode and I'll add it (single-file edit to `src/pages/portal/teach/PortalLogin.tsx`, ~10 lines).
3. If login *does* fail on the published URL too, send me the exact email used and the error message you see there — that would indicate a real issue (e.g. the user account was never actually created, or email confirmation is required) and I will investigate further.
