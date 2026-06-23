# Site Audit Report
**Date:** June 23, 2026
**Project:** CampusCompass
**Detected stack:** Node.js, Express (4.19.2), EJS (3.1.10), Sequelize ORM (6.37.8), SQLite3 (6.0.1) / PostgreSQL driver (8.22.0), bcryptjs (2.4.3), express-session (1.18.0)
**Detected audience/goal:** College students tracking academic progression, organizing learning roadmaps, and comparing milestones inside a peer social feed.
**Design system maturity:** Partially tokenized — central CSS variables in `style.css` govern colors, borders, and margins, and inline style blocks have been successfully migrated to clean CSS classes.

---

## Anti-Pattern Verdict
Does this look AI-generated? **Partially**
- **Tells Identified:** The landing page layout follows the standard AI design progression (centered hero → 3-column features → testimonials → accordion FAQ → footer). Emojis are used occasionally as decorative icons, and the peer feed features simulated/mocked statistics for GitHub repository counts and LeetCode solved problems.
- **Human-Modified Indicators:** The introduction of custom tools like the day-by-day time-boxed completion calculator, markdown playlist exporter, and fully parameterized database profile operations demonstrate custom development that extends far beyond simple boilerplate code.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3/4 | WCAG AA mostly met; keyboard navigation controls and screen reader attributes have been resolved. |
| 2 | Performance | 3/4 | Instantly loading cookie consent banner mitigates Cumulative Layout Shift (CLS) issues. |
| 3 | Security | 4/4 | CSRF tokens, secure session secrets, and production HTTPS cookie flags are fully active. |
| 4 | Theming & design system | 3/4 | Design variables are centralized; most inline styling blocks have been migrated to classes. |
| 5 | Responsive design | 4/4 | Tap target sizes for disconnect buttons optimized to a minimum of 44x44px for mobile devices. |
| 6 | Anti-patterns | 3/4 | Some layout templates are formulaic, but interactive widgets provide unique value. |
| | **Total** | **20/24** | **Good** |

**Legal & compliance flags:** Privacy Policy [present] · Terms [present] · Cookie consent [present] · GDPR signals [present] · COPPA [n-a]

---

## Executive Summary
CampusCompass is in a highly secure and launch-ready state. The implementation of robust CSRF protection, secure production session handling, and keyboard-accessible buttons addresses all previous P0/P1 issues. The remaining items are primarily polish (P2/P3 severity) related to minor inline style overrides, missing confirmation toast details, and responsive layout styling.

Total findings by severity: P0 [0] · P1 [0] · P2 [1] · P3 [3]

---

## Quick Wins
1. **Interactive Planner Alerts** (P2) — Add a browser alert or non-blocking toast when saving the study plan.
2. **Eliminate Remaining Inline Margins** (P3) — Extract EJS inline margins (`style="margin: 0;"`) to standard styles.
3. **Simulated Auth Banner Warning** (P3) — Add a clear disclaimer on the mock OAuth consent page stating it is for local development.

---

## Findings

### P0 — Blocking
No issues found

### P1 — Major
No issues found

### P2 — Minor

#### Missing Save Plan Visual Confirmation
- **Category:** Usability (Visibility of system status)
- **Location:** `public/js/main.js:275` (inside save plan button click handler)
- **Issue:** Clicking the "Save Plan" button updates `localStorage` and changes the status badge, but does not trigger a visual notification (such as a toast message).
- **User impact:** The user may click the button multiple times, feeling uncertain whether the plan saved successfully.
- **Fix:** Add a non-blocking toast alert or basic browser alert confirming the save action.

### P3 — Polish

#### Ad-Hoc Inline Margin Overrides in Views
- **Category:** Theming & design system
- **Location:** `views/social.ejs:51` and `views/social.ejs:95`
- **Issue:** The social disconnect forms still use inline margins (`style="margin: 0;"`).
- **User impact:** No direct user impact, but it slightly deviates from clean stylesheet standards.
- **Fix:** Add a dedicated class (e.g., `.form-inline-social`) with `margin: 0;` to the stylesheet.

#### Grid Card Heights in Peer Directory
- **Category:** Responsive design
- **Location:** `views/social.ejs:141` (`.students-grid`)
- **Issue:** Cards in the peer directory stretch vertically if one profile has longer text values.
- **User impact:** Creates uneven vertical layouts on tablet and desktop viewports.
- **Fix:** Apply flex alignment or grid container row rules to keep peer cards uniform in height.

#### Mock OAuth Local Development Disclaimer
- **Category:** Usability (Consistency and standards)
- **Location:** `views/mock-oauth.ejs:12`
- **Issue:** While mock authorization is helpful, there is no link or banner directing developers on how to hook up actual production OAuth credentials.
- **User impact:** New developers exploring the repository may not know how to transition the login system to production.
- **Fix:** Include a developer note linking to a setup guide or a comment detailing production OAuth integration steps.

---

## Systemic Patterns
1. **Consolidated Design Tokens**: Inline declarations are almost entirely eliminated, bringing styles to a structured level.
2. **Accessible Form Layouts**: All interactive fields and form controls are backed by semantic elements and explicit label attributes.

---

## Strengths
1. **Secure Session and Cookie Management**: Session configuration automatically enforces secure flags in production mode.
2. **Robust CSRF Shielding**: State-changing POST endpoints are guarded by matching session-level tokens, protecting student accounts.
3. **Semantic Keyboard Accessibility**: Interactive social panel triggers are fully tabbable, focusable, and legible to screen readers.

---

## Recommended Priority Order
1. **Add Save Plan Toast Confirmation**: Simple UX improvement to let users know their planning calculations have been saved locally.
2. **Refactor Remaining Inline Styles**: Remove the final few inline margin properties from social action forms.
3. **Introduce Peer Grid Styling Optimization**: Set consistent alignment guidelines for student grid layouts to polish structural spacing.
