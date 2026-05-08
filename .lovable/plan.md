## Goal
Transform ScrollUniversity from LMS into a true digital institution by adding the **Core 4 Legitimacy Layer**: verifiable certificates, orientation, matriculation, and a complete student lifecycle.

## Phased Build

### Phase 1 — Certificate Verification System
- New table `certificate_verifications` (cert_number, student_id, program, type, issued_at, seal_hash, qr_payload, revoked).
- Edge function `issue-certificate` — generates unique cert number `SU-{YEAR}-{TYPE}-{SEQ}`, computes SHA-256 seal hash, stores row.
- Public route `/verify/:certNumber` (PublicLayout) — looks up cert, shows student name, program, issue date, seal status, "Verified by ScrollUniversity" badge. No auth needed.
- Update existing certificate generators (`CourseCertificate`, transcripts) to:
  - Call `issue-certificate` on first generation
  - Render QR code (using `qrcode.react`) pointing to `/verify/{certNumber}`
  - Show cert number, verification URL, signature block, ScrollUniversity crest
- Cert types: `course`, `program`, `degree`, `transcript`, `seal`.

### Phase 2 — Orientation Module
- New table `orientation_progress` (user_id, step, completed_at).
- New route `/orientation` with 9 steps as a guided wizard:
  1. Welcome video (placeholder hero w/ play CTA)
  2. University mission & 4 pillars
  3. Platform walkthrough (key pages tour)
  4. Academic expectations
  5. AI tutor intro
  6. Degree roadmap (pulled from existing degree engine)
  7. Community guidelines
  8. SUYAS progression explanation
  9. Academic integrity pledge (checkbox)
- Each step writes to `orientation_progress`. Progress bar.
- Final step transitions student `admitted → orientation_complete` and unlocks `enrolled` via `transition_student_status`.
- Add orientation gate: if `lifecycle_status = 'admitted'` and orientation incomplete, dashboard shows "Complete Orientation" CTA banner (non-blocking, but prominent).

### Phase 3 — Matriculation Ceremony
- New route `/matriculation`.
- Triggered after orientation completion.
- Page contents:
  - Acceptance letter card (auto-generated PDF-style view)
  - Student ID & institutional email reveal (call existing `generate_student_identity` if not yet generated)
  - Cohort assignment (read from `launch_settings.cohort_label`)
  - Founder welcome video placeholder
  - **Student Oath** — checkbox + signature input ("I commit to learning with integrity…")
  - On signing: insert `matriculation_records` row, transition to `enrolled`, issue Matriculation Certificate via `issue-certificate`.
- Confetti + share buttons.

### Phase 4 — Lifecycle Status UI
- Add `lifecycle_status` badge to student profile header.
- Visual stepper component showing: Applicant → Accepted → Orientation → Matriculated → Enrolled → Active → Candidate → Graduated → Alumni.
- Render on `/dashboard` and `/student-profile`.

### Phase 5 — Graduation Ceremony Enhancement
- Wire existing `check_graduation_eligibility` into `/graduation` page (or create if missing).
- On confirmed eligibility, allow student to "Walk the Stage" — digital ceremony page with:
  - Degree certificate issuance via `issue-certificate` (type=`degree`)
  - Final transcript generation
  - Alumni status transition
  - Confetti + downloadable diploma PDF.

## Database Migrations
```sql
-- certificate_verifications
CREATE TABLE certificate_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  cert_type text NOT NULL CHECK (cert_type IN ('course','program','degree','transcript','matriculation','seal')),
  entity_id uuid,
  program_name text NOT NULL,
  student_name text NOT NULL,
  student_id_code text,
  issued_at timestamptz DEFAULT now(),
  seal_hash text NOT NULL,
  metadata jsonb DEFAULT '{}',
  revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text
);
-- RLS: public SELECT for verification, only service role INSERT.

-- orientation_progress (user_id, step, completed_at, payload jsonb) - RLS: own rows.

-- matriculation_records (user_id PK, oath_signed_at, signature_text, cohort_label, cert_number) - RLS: own row read, insert via function.
```

## Scope Boundaries
- Reuses existing `transition_student_status`, `generate_student_identity`, `check_graduation_eligibility`, `award_scrollcoins`, `log_suyas_action`.
- No changes to grading, enrollment, payments, or AI tutor business logic.
- All new pages wrapped in MainLayout/PublicLayout. BackButton on every step.
- Mobile-first (390px viewport), Playfair/DM Sans, Burgundy/Ivory/Gold.

## Order of Execution
1. Migrations (cert_verifications, orientation_progress, matriculation_records) — single migration call, await approval.
2. Edge function `issue-certificate` + verification page.
3. Update existing certificate components with QR + cert number.
4. Orientation wizard.
5. Matriculation page.
6. Lifecycle stepper component + dashboard integration.
7. Graduation ceremony page.
8. Verify build + smoke test.
