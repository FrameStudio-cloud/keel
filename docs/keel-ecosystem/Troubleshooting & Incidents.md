# Troubleshooting & Incidents

## Incident Log

### 1. SPA 404 on Non-Root Page Reload (Vercel)

**Symptom:** Refreshing `/inventory` or any non-root page returned 404.

**Root cause:** Missing SPA fallback rewrite in `vercel.json`.

**Fix:** Added `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Minifier Name Collision (Rolldown)

**Symptom:** Production bundle crashed with "Cannot read property of undefined" at random call sites. Root page worked but deeper routes failed.

**Root cause:** Rolldown's default minifier mangled function names that collided with React's internal commit-phase functions. Keel's Supabase helper functions and React internals shared mangled names like `B`, `Yc`, `Xc`, `Zc`.

**Fix:** Switched to esbuild minifier in `vite.config.js`. Later reverted to Rolldown default (Rolldown became stable).

### 3. GoTrueClient Hang on Page Reload

**Symptom:** Non-root page reloads froze at loading skeleton. No network requests made. `customFetch` wrapper never fired.

**Root cause:** `@supabase/gotrue-js` `initialize()` → `_recoverAndRefresh()` hangs indefinitely in production builds. The code gets stuck in internal state machine logic before reaching any network call.

**Evidence:**
- `customFetch` wrapper never fired
- Raw `window.fetch` to same Supabase REST endpoint worked
- Supabase client from CDN (`esm.sh`) worked on same page
- Providing `accessToken` option bypassed the hang entirely

**Fix:** Use `accessToken` option on `createClient()`:
```js
const supabase = createClient(url, anonKey, {
  accessToken: async () => {
    const session = getPersistedSession()
    return session?.access_token ?? null
  },
})
```
This causes SupabaseClient to replace `this.auth` with a throwing Proxy — all `supabase.auth.*` calls become unavailable.

### 4. Session Not Persisting (Fresh Login)

**Symptom:** `getAccessToken()` returned null, all queries used `shop_id=eq.null` (400 errors).

**Root cause:** `saveSession()` used `Object.keys(localStorage).find(k => k.startsWith("sb-"))` to find the storage key. When no session had ever been saved (fresh browser), no key matched, so `saveSession()` silently exited without saving.

**Fix:** Compute `STORAGE_KEY` deterministically from `VITE_SUPABASE_URL`:
```js
const STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`
```

### 5. Duplicate Shops (Re-Signup)

**Symptom:** Same email created multiple shops.

**Root cause:** `ensureUserRecords()` only matched by `auth_user_id`. If Supabase Auth assigned a different `auth_user_id` (re-signup or "Allow multiple accounts" setting), a new shop was created.

**Fix:** Fallback to matching by email. If found, update the `auth_user_id` to the current one.

### 6. Dark Mode Flash on Reload

**Symptom:** Brief light theme flash before dark mode applied.

**Root cause:** Default theme was `"dark"` but `<html>` had no `.dark` class, causing a light→dark flash after settings loaded.

**Fix:** Changed default theme to `"light"`. Theme class toggled in `useEffect` — no flash since default matches the initial state.

## Known Issues

| Issue | Severity | Status |
|---|---|---|
| Profit margins fetches all sales (no pagination) | Low | Known gap |
| P&L has `.limit(2000)` but no true pagination | Low | Known gap |
| `eslint-plugin-react` + `eslint-plugin-jsx-a11y` skipped (ESLint 10 peer dep conflict) | Low | Won't fix |
| AuthContext `react-refresh/only-export-components` lint error | Low | Pre-existing, excluded |

## Recovery Procedures

### Auth Hang on Reload
1. Clear localStorage for the app
2. Re-login
3. If persists, check that `supabase.js` has the `accessToken` option

### SPA 404 on Vercel
1. Verify `vercel.json` rewrite rule exists
2. Redeploy

### "No shop found" Errors
1. Check that `STORAGE_KEY` in `supabase.js` matches the project
2. Clear localStorage and re-login
3. Verify `users` table has a row for the auth user
