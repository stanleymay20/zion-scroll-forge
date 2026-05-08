## E2E Audit Results

I scanned all 128 pages, 124 internal `<Link>` targets, and every `<Button>` in `src/pages/`.

**Good news:**
- ✅ Every `<Link to="/...">` resolves to a defined route (no broken internal links).
- ✅ Every protected/public page is wrapped by `MainLayout` or `PublicLayout` at the route level — sidebar/breadcrumbs are always present, so there are no truly orphaned pages.
- ✅ `NotFound` (404) already has Home + Back buttons.

**Real issues found:**
1. **`ComingSoonPage`** (used for 10+ routes: `/divine-scorecard`, `/prophetic-checkins`, `/forums`, `/mentorship`, `/projects`, `/marketplace`, `/career-pathways`, `/job-board`, `/research`, `/help`) has a "Join Waitlist for Early Access" button that does nothing and no link back to Dashboard.
2. **141 dead `<Button>` elements** across 30+ pages — buttons with no `onClick`, no `Link` wrapper, no `type="submit"`. Worst offenders: `ScrollCoin`, `ScrollGold`, `ScrollLibrary`, `Forge*`, `ScrollSpecs`, `Agents`, `SpiritualFormation`, `CommunityFeed`.
3. **Pages with no in-page back affordance** beyond the sidebar — fine on desktop, but on mobile detail pages (e.g. `CourseDetail`, `ModuleDetail`, `EventDetail`, `FacultyDetail`, `ScrollLibraryBookReader`) a top-level Back button improves UX.

## Fix Plan (3 phases)

### Phase 1 — Highest impact (do now)
- Rewrite `ComingSoonPage` so the waitlist button captures email → toast confirmation → optionally writes to `notifications` waitlist; add explicit "Back to Dashboard" + "Browse Courses" buttons.
- Add a reusable `<BackButton />` component and drop it into the 5 detail pages above.
- Wire the most-visible dead buttons on `ScrollCoin`, `ScrollGold`, `ScrollGoldWallet`, `ScrollCoinWallet` (Send/Receive/Redeem) to either real flows (Link to existing pages like `/redemption-store`, `/scrollgold-leaderboard`) or a toast: "Available after enrollment / launching soon."

### Phase 2 — Mark or wire remaining dead buttons
- For `ForgeSessions`, `ForgeDashboard`, `ScrollSpecs`, `Agents`, `Messaging`, `CommunityFeed` cosmetic action buttons (like `…` more-menus, share/like icons): add minimal toast handlers so users get feedback instead of silence.
- For pages where the dead button represents a missing feature (e.g. `Testimonies` "Share Testimony", `LearningGoals` "Add Goal", `PrayerJournal` "New Entry"), open a placeholder dialog with "Coming soon" message + email-me-when-ready CTA.

### Phase 3 — Verification
- Run `bun run build` to confirm no TS errors.
- Use the browser tool to spot-check the rebuilt `ComingSoonPage` (`/help`), one fixed detail page, and one wallet page.

## Technical details

- New file `src/components/layout/BackButton.tsx` — uses `useNavigate(-1)` with fallback to a passed `fallbackTo` route.
- `ComingSoonPage` becomes a client component with a small email form (controlled state) writing to a new `waitlist_signups` row via `supabase.from('waitlist_signups').insert(...)` if the table exists, otherwise just toast. To keep this pure-frontend per your last directive, I'll skip the DB write and just `toast.success("You're on the list — we'll email you at launch")`.
- Dead-button toast pattern: `onClick={() => toast.info("This action will be available in the next release")}`.
- I will NOT touch business logic (grading, enrollment, payments, AI tutors).

**Approve and I'll execute Phase 1 + 2 in one pass, then verify in Phase 3.**