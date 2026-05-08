# ScrollUniversity Catalog & Access Governance

This is a large reorganization. Below is the plan broken into phases. I'll need your approval before starting (especially because phase 1 is a database migration).

## Phase 1 — Database: Catalog hierarchy + access control

Add governance columns and a centralized access function. Non-destructive (no course deletion, no reseeding).

**Schema additions:**
- `faculties` — already exists (12 Supreme Scroll Faculties); add `slug`, `display_order` if missing.
- `departments` — new table: `id, faculty_id, name, slug, description`.
- `courses` — add columns:
  - `faculty_id uuid` (FK)
  - `department_id uuid` (FK, nullable)
  - `level text` check in (`foundation,intermediate,advanced,capstone`)
  - `visibility text` check in (`public_preview,enrolled_only,role_only,admin_only`) default `public_preview`
  - `career_track text[]`
  - `credits numeric` (if not already)
  - `estimated_duration_hours int`
- `degree_program_courses` — link table (if not already): `degree_program_id, course_id, sequence_order, is_required`.
- `course_prerequisites` — `course_id, prerequisite_course_id` (if missing).

**Access function (SECURITY DEFINER):**
```
public.can_access_course(_user_id uuid, _course_id uuid)
  returns jsonb { access_level, allowed, reason, missing[] }
```
Checks: auth, student lifecycle status, enrollment, prerequisites, holds, course visibility, role override (admin/faculty).

**RLS hardening:**
- `course_modules`, `lessons`, `assignments`, `quizzes`, `assessments`, `module_progress`, `certificates`, `transcripts` → restrict SELECT to `can_access_course(...)` truthy or admin/faculty role.
- `courses` SELECT remains public for catalog cards (only metadata columns).
- Preview-allowed: first module + syllabus stays public.

## Phase 2 — Frontend: Access primitives

- `src/lib/accessControl.ts` — `canAccessCourse`, `getAccessLevel` calling the RPC.
- `src/hooks/useCourseAccess.ts` — React hook wrapping it.
- `src/components/access/LockedCourseCard.tsx` — locked-state UI (reason, prereqs, status, CTA).
- `src/components/routing/` route guards:
  - `PublicRoute`, `AuthenticatedRoute`, `RoleRoute`, `StudentStatusRoute`, `CourseAccessRoute`.
  Each handles redirects per the spec (login/apply, orientation, locked page, access denied).

## Phase 3 — Catalog UI

- `src/pages/Catalog.tsx` (rework existing Courses page) — tabs:
  - Browse by Faculty
  - Browse by Degree Program
  - Browse by Level
  - Browse by Career Track
  - Search & filter sidebar (faculty, level, credits, duration, visibility)
- `src/components/catalog/CourseCard.tsx` — title, faculty, program, level, badges (preview / locked / enrolled), prereqs, duration, credits, Preview + Enroll/Apply buttons.
- `src/components/catalog/FacultyGroup.tsx`, `DegreeProgramGroup.tsx`, `LevelGroup.tsx`, `TrackGroup.tsx`.

## Phase 4 — Course detail & preview

- `src/pages/CoursePreview.tsx` — public-allowed preview view (overview, syllabus, first lesson, outcomes, instructor summary, admission CTA).
- Existing `CourseLearning` page wrapped in `<CourseAccessRoute accessLevel="enrolled">`. If locked → render `<LockedCoursePage>` with reasons from RPC.

## Phase 5 — Route audit & gating

Update `src/App.tsx` route table, applying the right guard per route group:

| Audience | Guard | Routes |
|---|---|---|
| Public | `PublicRoute` | `/`, `/about`, `/programs`, `/courses`, `/course/:id/preview`, `/apply`, `/contact`, `/verify` |
| Applicant | `StudentStatusRoute statuses=['applicant']` | `/application`, `/documents`, `/admissions-messages` |
| Accepted | `StudentStatusRoute statuses=['admitted','enrolled']` | `/orientation`, `/matriculation`, `/identity`, `/admission-letter` |
| Active | `StudentStatusRoute statuses=['active']` | `/dashboard`, `/courses/enrolled`, `/assignments`, `/ai-tutor`, `/progress`, `/certificates` |
| Faculty | `RoleRoute roles=['faculty']` | `/faculty/*` |
| Admissions admin | `RoleRoute roles=['admissions_admin','admin']` | `/admin/admissions/*` |
| Academic admin | `RoleRoute roles=['academic_admin','admin']` | `/admin/curriculum/*` |
| Platform admin | `RoleRoute roles=['admin','superadmin']` | `/admin/launchops`, `/admin/users`, `/admin/billing`, `/admin/system` |

I will *not* invent new pages where none exist — for missing role areas (e.g. admissions review) I'll add a placeholder route that redirects or shows "Coming soon" so the guard infrastructure is in place.

## Phase 6 — Degree path gating

- `src/hooks/useDegreeProgress.ts` — already exists; extend with `getLockedCourses(programId)` returning unlock requirements.
- `src/pages/DegreePath.tsx` — show full sequence with locked/unlocked states, "why locked", "next recommended".

## Phase 7 — Test checklist (delivered as `TESTING_ACCESS_CONTROL.md`)

Manual test checklist covering: anon visitor, applicant, accepted, active student with/without prereqs, faculty, each admin tier.

## Technical details

- All gating enforced **both** in DB (RLS + `can_access_course`) **and** UI guards. UI calls the RPC; RLS is the backstop.
- Existing `useUserRoles` hook + `user_roles` table are reused (no role storage on profiles).
- `lifecycle_status` already exists on `profiles` (`applicant/admitted/enrolled/active/...`) — used by `StudentStatusRoute`.
- No course content is touched. No reseeding. Existing course rows get `faculty_id`/`level`/`visibility` backfilled via best-effort mapping (default `visibility='public_preview'`, `level='foundation'` where unknown — admins can adjust).

## Scope confirmation

Because this spans ~30+ files and a non-trivial migration, I want to confirm before executing. **Approve to proceed**, or tell me to narrow scope (e.g. "do phases 1+2+5 first, defer catalog UI redesign").
