# 🔌 API Routes Reference

This document is the companion to [`architecture.md`](./architecture.md). Where that file explains how the pieces fit together, this one is a route-by-route reference: every HTTP endpoint CampusCompass currently exposes, what's required to call it, and where it sends the browser next.

Routes are defined across three router files, all mounted in `app.js`:

| Router file | Mounted at |
|---|---|
| `routes/index.js` | `/` |
| `routes/auth.js` | `/` |
| `routes/profile.js` | `/profile` |

CampusCompass is a server-rendered app (EJS), not a JSON API. Successful `GET` requests render a view; most `POST` requests validate the body and then `res.redirect()` (Express's default, a 302) rather than return JSON.

---

## 📋 Quick Reference

| Method | Route | Guard(s) | Purpose |
|---|---|---|---|
| GET | `/` | `ensureGuest` | Public landing page |
| GET | `/privacy` | — | Privacy & Cookies policy |
| GET | `/terms` | — | Terms & Conditions |
| GET | `/resources` | — (manual guest check) | Curated learning resources |
| GET | `/playlists` | — | Curated YouTube playlists |
| GET | `/register` | `ensureGuest` | Registration form |
| POST | `/register` | `ensureGuest` | Create an account |
| GET | `/login` | `ensureGuest` | Login form |
| POST | `/login` | `ensureGuest` | Authenticate |
| GET | `/logout` | `ensureAuth` | Destroy the session |
| GET | `/auth/:platform` | `ensureGuest` | Mock OAuth consent screen |
| POST | `/auth/:platform` | `ensureGuest` | Mock OAuth callback |
| GET | `/profile/setup` | `ensureAuth`, `ensureProfileIncomplete` | Onboarding form |
| POST | `/profile/setup` | `ensureAuth`, `ensureProfileIncomplete` | Save onboarding profile |
| GET | `/profile` | `ensureAuth`, `ensureProfileComplete` | View/edit own profile |
| POST | `/profile/update` | `ensureAuth`, `ensureProfileComplete` | Save profile edits |
| POST | `/profile/connect` | `ensureAuth`, `ensureProfileComplete` | Link GitHub/LeetCode username |
| POST | `/profile/disconnect` | `ensureAuth`, `ensureProfileComplete` | Unlink GitHub/LeetCode username |
| GET | `/dashboard` | `ensureProfileComplete` | Roadmap progress dashboard |
| GET | `/social` | `ensureProfileComplete` | Community directory |
| GET | `/discussion` | `ensureProfileComplete` | Community discussion page |
| ALL | *(unmatched)* | — | 404 fallback |

> The issue that requested this document called out `/`, `/dashboard`, `/register`, `/login`, `/logout`, and `/profile/setup` specifically. This file covers those in full, plus every other route currently mounted, so the doc actually satisfies "document every implemented route" from the acceptance criteria.

---

## 🔐 Global Behavior

Worth reading before the route list — every route below inherits this.

### Session & login state
Login state lives entirely in `express-session`. A user counts as "logged in" once `req.session.userId` is set (done at the end of a successful register/login/mock-OAuth flow). The cookie lasts 1 day (`maxAge: 1000 * 60 * 60 * 24`), is `httpOnly`, and is `secure` only when `NODE_ENV=production`.

### CSRF protection
`app.js` applies a global check to every `POST`/`PUT`/`DELETE`/`PATCH` request: it must carry a token matching `req.session.csrfToken`, supplied as one of:
- body field `_csrf` (every form in the app already includes this as a hidden input),
- header `x-csrf-token`, or
- query param `_csrf`.

A missing or mismatched token short-circuits with `403 Forbidden: CSRF token validation failed.` before any route handler runs. To keep each entry below short, `_csrf` isn't re-listed as a "required field" per route — assume every `POST` needs it.

### Flash-style messages
Several controllers set `req.session.error` or `req.session.success` immediately before a redirect. The next `GET` reads it, renders it once, and deletes it — so it survives exactly one redirect. The exact strings are quoted below per route since contributors often need to know precisely what the UI will say.

### Route guards
Four middleware functions, all in `routes/middleware.js`:

| Guard | Requires | On failure |
|---|---|---|
| `ensureGuest` | No active session | → `/dashboard` |
| `ensureAuth` | `req.session.userId` is set | → `/login` |
| `ensureProfileComplete` | Logged in **and** `user.isProfileComplete === true`; attaches `req.user` | Not logged in → `/login`; session user no longer exists in the DB → session destroyed, → `/login`; profile incomplete → `/profile/setup` |
| `ensureProfileIncomplete` | Logged in **and** `user.isProfileComplete === false`; attaches `req.user` | Not logged in → `/login`; missing user → `/login`; profile already complete → `/dashboard` |

Routes below just name which guard(s) apply, in the order they run.

### Unmatched routes
Anything that doesn't match a defined route falls through to a catch-all in `app.js`: responds `404` and renders the `landing` view with a generic "the page you are looking for does not exist" message.

---

## 🌐 Public & Marketing Pages
*(`routes/index.js`, mounted at `/`)*

### GET `/`
**Purpose:** Marketing/landing page — the app's home page for anonymous visitors.
**Auth & Session:** `ensureGuest`.
**Request Body:** None.
**Redirect Behavior:** Logged-in users are redirected to `/dashboard` before the handler runs. Guests get no redirect; `landing` is rendered directly.

---

### GET `/privacy`
**Purpose:** Static Privacy & Cookies Policy page.
**Auth & Session:** None — open to guests and logged-in users alike.
**Request Body:** None.
**Redirect Behavior:** None; always renders `privacy`.

---

### GET `/terms`
**Purpose:** Static Terms & Conditions page.
**Auth & Session:** None.
**Request Body:** None.
**Redirect Behavior:** None; always renders `terms`.

---

### GET `/resources`
**Purpose:** Curated external learning resources, aimed at guests.
**Auth & Session:** No shared guard — the handler itself checks `req.session.userId` and redirects logged-in users instead of rendering for them.
**Request Body:** None.
**Redirect Behavior:** Logged-in users → `/dashboard?tab=resources`. Guests: renders `resources`.

---

### GET `/playlists`
**Purpose:** Curated YouTube playlists, organized by career track.
**Auth & Session:** None — renders for guests and logged-in users, with different personalization.
**Request Body:** Query param `track`, one of `web-developer`, `data-scientist`, `software-engineer`, `ai-engineer`, `cloud-engineer`, `cyber-security` (defaults to `web-developer`).
**Redirect Behavior:** None.
**Notes:** If logged in and `profile.careerGoal` is set, it overrides the `track` query param via keyword matching (e.g. a goal containing "cloud" selects `cloud-engineer`) — so a logged-in user with a career goal already set can't override their track via the query string.

---

## 🔑 Authentication
*(`routes/auth.js`, mounted at `/`)*

### GET `/register`
**Purpose:** Renders the registration form.
**Auth & Session:** `ensureGuest`.
**Request Body:** None.
**Redirect Behavior:** None directly; may display a one-time flashed `error` bounced back from a failed `POST /register`.

---

### POST `/register`
**Purpose:** Creates a new account.
**Auth & Session:** `ensureGuest`.
**Request Body:**

| Field | Required | Notes |
|---|---|---|
| `email` | Yes | Checked for uniqueness |
| `password` | Yes | Minimum 6 characters |
| `confirmPassword` | Yes | Must match `password` |

**Redirect Behavior:**
- Any field missing → `"All fields are required"` → `/register`
- `password` under 6 characters → `"Password must be at least 6 characters long"` → `/register`
- `password` ≠ `confirmPassword` → `"Passwords do not match"` → `/register`
- Email already registered → `"An account with this email already exists"` → `/register`
- Success → `req.session.userId` set (no flash message) → `/profile/setup`
- Unexpected error → `"An error occurred during registration. Please try again."` → `/register`

**Notes:** The password is hashed with `bcryptjs` (10 salt rounds) in a model-level `beforeSave` hook — plaintext never reaches the database.

---

### GET `/login`
**Purpose:** Renders the login form.
**Auth & Session:** `ensureGuest`.
**Request Body:** None.
**Redirect Behavior:** None directly; may display a one-time flashed `error` and/or `success` (the latter is used by the mock-OAuth flow below).

---

### POST `/login`
**Purpose:** Authenticates a user and starts a session.
**Auth & Session:** `ensureGuest`.
**Request Body:**

| Field | Required |
|---|---|
| `email` | Yes |
| `password` | Yes |

**Redirect Behavior:**
- Either field missing → `"All fields are required"` → `/login`
- No user with that email → `"Invalid email or password"` → `/login`
- Password doesn't match → `"Invalid email or password"` → `/login` *(same message as above by design — it doesn't reveal whether the email exists)*
- Success → `req.session.userId` set (no flash message) → `/dashboard` if `isProfileComplete`, else `/profile/setup`
- Unexpected error → `"An error occurred during login. Please try again."` → `/login`

---

### GET `/logout`
**Purpose:** Ends the current session.
**Auth & Session:** `ensureAuth`.
**Request Body:** None.
**Redirect Behavior:** Always → `/`, whether or not `req.session.destroy()` succeeds (a failure is only logged server-side).

---

### GET `/auth/:platform`
**Purpose:** Mock OAuth "consent" screen — simulates authorizing CampusCompass via a third-party provider. No real GitHub/LeetCode call is made.
**Auth & Session:** `ensureGuest`.
**Request Body:** URL param `:platform`, must be `github` or `leetcode`.
**Redirect Behavior:** Invalid `:platform` → `"Invalid authentication provider"` → `/login`. Valid → renders `mock-oauth` with a randomly generated suggested username (`github_dev_###` / `leetcode_coder_###`).

---

### POST `/auth/:platform`
**Purpose:** Simulated OAuth callback — signs the user in (creating an account on first use) and links the social username.
**Auth & Session:** `ensureGuest`.
**Request Body:**

| Field | Required |
|---|---|
| `username` | Yes |

**Redirect Behavior:**
- Missing/blank `username` → `"Username is required to mock authorize"` → back to `/auth/:platform`
- Success → finds or creates a user keyed on `<username>@<platform>.com`, signs them in, then:
  - `isProfileComplete` already `true` → `"Welcome back! Authenticated via GitHub"` (or LeetCode) → `/dashboard`
  - otherwise → `"Successfully authenticated via GitHub! Please complete your student profile."` (or LeetCode) → `/profile/setup`
- Unexpected error → `"An error occurred during authentication. Please try again."` → `/login`

**Notes:** Unlike the `GET` handler, this action doesn't itself validate `:platform` against the `github`/`leetcode` whitelist. A different value still creates/signs in a user with a simulated email — it just won't populate a `githubUsername`/`leetcodeUsername` on the profile, since neither branch matches.

---

## 🧑‍🎓 Profile Setup & Management
*(`routes/profile.js`, mounted at `/profile`)*

### GET `/profile/setup`
**Purpose:** Onboarding form collecting the student profile required to use the rest of the app.
**Auth & Session:** `ensureAuth` → `ensureProfileIncomplete`.
**Request Body:** None.
**Redirect Behavior:** Not logged in → `/login`. Profile already complete → `/dashboard`. Otherwise renders `profile-setup`, with a one-time flashed `error` if present.

---

### POST `/profile/setup`
**Purpose:** Saves the onboarding profile and marks it complete.
**Auth & Session:** `ensureAuth` → `ensureProfileIncomplete`.
**Request Body:**

| Field | Required | Notes |
|---|---|---|
| `fullName` | Yes | |
| `collegeName` | Yes | |
| `branch` | Yes | |
| `currentYear` | Yes | Form sends `"1st Year"`–`"4th Year"`; server only checks it's present |
| `careerGoal` | Yes | Form sends one of the six roadmap tracks (see `GET /dashboard` below); server only checks it's present |
| `cgpa` | No | `parseFloat`'d; `null` if omitted |
| `skills` | No | Comma-separated string → trimmed array, empty entries dropped |
| `interests` | No | Comma-separated string → trimmed array, empty entries dropped |
| `dailyStudyHours` | No | `parseInt`'d; `null` if omitted |

**Redirect Behavior:**
- Missing `fullName`/`collegeName`/`branch`/`currentYear`/`careerGoal` → `"Full Name, College, Branch, Year, and Career Goal are required"` → `/profile/setup`
- Session user no longer exists in the DB → `"User not found. Please log in again."` → `/login`
- Success → `isProfileComplete` set to `true`, `"Profile completed successfully! Welcome to your dashboard."` → `/dashboard`
- Unexpected error → `"An error occurred while saving your profile. Please try again."` → `/profile/setup`

**Notes:** Any existing `githubUsername`/`leetcodeUsername` (e.g. from a prior mock-OAuth link) is preserved rather than cleared.

---

### GET `/profile`
**Purpose:** View/edit page for the logged-in user's own profile.
**Auth & Session:** `ensureAuth` → `ensureProfileComplete`.
**Request Body:** None.
**Redirect Behavior:** Renders `profile` with a one-time flashed `error`/`success`. On an unexpected DB error, redirects to `/dashboard` instead of rendering (no flash set in that case).

---

### POST `/profile/update`
**Purpose:** Saves edits to an already-complete profile.
**Auth & Session:** `ensureAuth` → `ensureProfileComplete`.
**Request Body:** Same fields and requiredness as `POST /profile/setup` (`fullName`, `collegeName`, `branch`, `currentYear`, `careerGoal` required; `cgpa`, `skills`, `interests`, `dailyStudyHours` optional). Does not touch `isProfileComplete` (already `true`).
**Redirect Behavior:**
- Missing a required field → `"Full Name, College, Branch, Year, and Career Goal are required"` → `/profile` *(not `/profile/setup`)*
- Session user no longer exists in the DB → `"User not found. Please log in again."` → `/login`
- Success → `"Profile updated successfully!"` → `/profile`
- Unexpected error → `"An error occurred while updating your profile. Please try again."` → `/profile`

---

### POST `/profile/connect`
**Purpose:** Links a GitHub or LeetCode username to the profile, shown on the Community page.
**Auth & Session:** `ensureAuth` → `ensureProfileComplete`.
**Request Body:**

| Field | Required |
|---|---|
| `platform` | Yes — `github` or `leetcode` |
| `username` | Yes |

**Redirect Behavior:** Always → `/social`.
- `platform` or `username` missing → `"Username is required to connect"`
- Session user no longer exists in the DB → `"User not found. Please log in again."` → `/login` *(the one exception that doesn't go to `/social`)*
- `platform` is `github` → sets `githubUsername`, `"GitHub account connected successfully!"`
- `platform` is `leetcode` → sets `leetcodeUsername`, `"LeetCode account connected successfully!"`
- Any other `platform` value → `"Invalid platform"` (profile left unchanged)

---

### POST `/profile/disconnect`
**Purpose:** Removes a linked GitHub or LeetCode username.
**Auth & Session:** `ensureAuth` → `ensureProfileComplete`.
**Request Body:**

| Field | Required |
|---|---|
| `platform` | Yes — `github` or `leetcode` |

**Redirect Behavior:** Always → `/social`.
- `platform` missing → `"Platform is required to disconnect"`
- Session user no longer exists in the DB → `"User not found. Please log in again."` → `/login` *(the one exception that doesn't go to `/social`)*
- `platform` is `github` → clears `githubUsername`, `"GitHub account disconnected."`
- `platform` is `leetcode` → clears `leetcodeUsername`, `"LeetCode account disconnected."`
- Any other `platform` value → `"Invalid platform"`

---

## 📊 Dashboard & Community
*(`routes/index.js`, mounted at `/`)*

### GET `/dashboard`
**Purpose:** Main authenticated home page — the student's career roadmap and computed progress.
**Auth & Session:** `ensureProfileComplete` (attaches `req.user`).
**Request Body:** None.
**Redirect Behavior:** None beyond the guard's own rules; renders `dashboard`.
**Notes:** The roadmap is loaded from `data/roadmaps/*.json`, keyed by `careerGoal`: `Data Scientist`, `Software Engineer`, `Web Developer`, `AI Engineer`, `Cyber Security`, `Cloud Engineer`. A `careerGoal` outside this set has no matching roadmap file. Progress is computed by matching the user's `skills` against each roadmap topic's name/description — it isn't based on explicit, user-marked completion.

---

### GET `/social`
**Purpose:** Community directory listing every user with a completed profile, plus connect/disconnect controls for the current user's own accounts.
**Auth & Session:** `ensureProfileComplete`.
**Request Body:** None.
**Redirect Behavior:** None beyond the guard's own rules; renders `social` with a one-time flashed `error`/`success` (set by `/profile/connect` and `/profile/disconnect`).
**Notes:** The `githubRepos`/`githubStars`/`leetcodeSolved`/`leetcodeRank` shown per student are deterministically generated from a seed (the last character of that user's `_id`), not pulled from any real GitHub/LeetCode API — they're placeholder stats, only shown once that student has connected the corresponding account.

---

### GET `/discussion`
**Purpose:** Community discussion page.
**Auth & Session:** `ensureProfileComplete`.
**Request Body:** None.
**Redirect Behavior:** None beyond the guard's own rules; renders `discussion`.

---

## Scope

This covers every route mounted by `routes/index.js`, `routes/auth.js`, and `routes/profile.js` in `app.js` as of this writing. If you add, remove, or change a route, please update this file in the same PR — that's the point of having it.
