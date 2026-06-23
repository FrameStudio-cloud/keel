# Auth System

Keel uses direct REST calls to Supabase Auth API instead of the bundled `supabase.auth` client.

## Why Not GoTrueClient?

The bundled `@supabase/gotrue-js` (GoTrueClient) has a bug where `initialize()` → `_recoverAndRefresh()` hangs indefinitely on page reload in production builds. The code never reaches a network call — it gets stuck in internal state machine logic.

**Fixed by:** Providing an `accessToken` getter to `createClient()`, which causes SupabaseClient to replace `this.auth` with a throwing Proxy. The client becomes auth-unaware — all Supabase queries still work, but `supabase.auth.*` is unavailable.

## Auth Endpoints

All auth operations use `window.fetch` directly:

| Operation | Endpoint | Method |
|---|---|---|
| Login | `/auth/v1/token?grant_type=password` | POST |
| Signup | `/auth/v1/signup` | POST |
| Logout | `/auth/v1/logout` | POST |
| Password Reset | `/auth/v1/recover` | POST |
| Update Password | `/auth/v1/user` | PUT |
| Google OAuth | `/auth/v1/authorize?provider=google&redirect_to=...` | GET |

## Session Storage

Session is stored in `localStorage` under a deterministic key:

```js
const STORAGE_KEY = `sb-${projectRef}-auth-token`
```

Where `projectRef` is extracted from `VITE_SUPABASE_URL`. This replaces the fragile `Object.keys().find()` pattern that silently failed on fresh logins.

**Key functions in `src/lib/supabase.js`:**
- `saveSession(session)` — writes to localStorage
- `getPersistedSession()` — reads from localStorage
- `clearPersistedSession()` — removes from localStorage

## Auth Flow

### Login
1. User submits email/password → `POST /auth/v1/token?grant_type=password`
2. Response includes `access_token`, `refresh_token`, user object
3. `saveSession(response)` stores the tokens
4. `AuthContext` re-reads the stored session → sets user
5. Redirects to `/`

### Google OAuth
1. User clicks "Google" → redirect to `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${origin}/login`
2. Google authenticates → redirects back to `/login#access_token=...`
3. `AuthContext` reads the hash from URL
4. Exchanges `access_token` for user data via `GET /auth/v1/user`
5. `ensureUserRecords()` creates/links user record
6. Removes hash from URL, redirects to `/`
7. 15-second timeout with `Promise.race` prevents OAuth hangs

### Signup
1. User submits email/password → `POST /auth/v1/signup`
2. Session returned → `saveSession(session)`
3. `ensureUserRecords()` creates user + shop + settings rows
4. **Theme defaults to `"light"`** in both signup and SetupWizard
5. Redirects to `/setup`

### Password Reset
1. User submits email → `POST /auth/v1/recover`
2. Supabase sends email with recovery link → `.../login#type=recovery&access_token=...`
3. `AuthContext` detects `type=recovery` in hash
4. Processes same as OAuth (no manual re-login)

## Shop Creation

`ensureUserRecords()` in `AuthContext.jsx`:

1. Checks `users` table by `auth_user_id`
2. If not found, falls back to matching by **email**
3. If email match found: **updates** `auth_user_id` to current user (prevents duplicate shops)
4. If no match: creates new user + shop + settings
5. Slug generation: 5 attempts with 6-char random suffix on collision
6. On failure: `Promise.allSettled` rolls back created rows (deletes shop if user+shop succeeded)

## Token Refresh

Token refresh is deduplicated via a module-level `refreshPromise` mutex. If two components request a refresh simultaneously, only one request is made.
