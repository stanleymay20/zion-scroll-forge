# Master Traceability Matrix – ScrollUniversity

This matrix links specification requirements to concrete implementations (code), validation scripts, and tests. It enables quick verification that every requirement is addressed and verifiable.

## Legend
- Spec: Path under `.kiro/specs/...`
- Req IDs: Heading titles (e.g., "Requirement 1", "Requirement 2") within each spec
- Code: Primary modules, routes, or services implementing the requirement
- Validation: Node/TS/JS scripts that validate behavior
- Tests: Unit/integration test files

---

## 1) scroll-university-platform
- Spec: `.kiro/specs/scroll-university-platform/requirements.md`
- Key Reqs: 1.1 AI-Dean Infrastructure, 2.x Global Accessibility, 4.2 XR & Mobile
- Code
  - API server and gateway: `backend/src` (routes and services)
  - Health and demo endpoints: `enhanced-backend-server.js`, `demo-server.js`
- Validation
  - `validate-advanced-ai.js`
  - `validate-testing-framework.js`
- Tests
  - Testing framework: `src/testing/**`

## 2) scroll-university-portal
- Spec: `.kiro/specs/scroll-university-portal/requirements.md`
- Design: `.kiro/specs/scroll-university-portal/design.md`
- Tasks: `.kiro/specs/scroll-university-portal/tasks.md`
- Code
  - Frontend (React): `src/**`
  - Mobile (Flutter/React Native scaffolding): `mobile/**`
  - Portal gateway helpers: `src/gateway/**`
- Validation
  - End-to-end flows via app demos: `simple-frontend.html`, `enhanced-frontend.html`, `public/`
- Tests
  - Component/service tests: `src/services/__tests__/**`

## 3) scroll-curriculum-grid
- Spec: `.kiro/specs/scroll-curriculum-grid/requirements.md`
- Code
  - API routes: `backend/src/routes/curriculum-grid.ts`
  - Master catalog: `src/services/MasterCourseCatalogService.ts`
  - Types: `src/types/curriculum-grid.ts`
- Validation
  - `backend/scripts/validate-curriculum-grid.ts`
  - `backend/test-real-curriculum-grid.js`
- Tests
  - `src/services/__tests__/MasterCourseCatalogService.test.ts`

## 4) scroll-student-profile-spec
- Spec: `.kiro/specs/scroll-student-profile-spec/requirements.md`
- Code
  - Integration service: `backend/src/services/admissions/StudentProfileIntegrationService.ts`
  - Admissions route: `backend/src/routes/admissions/student-integration.ts`
- Validation
  - `backend/scripts/validate-student-integration.ts`
- Tests
  - `backend/src/services/admissions/__tests__/StudentProfileIntegration.test.ts`

## 5) scroll-seal-certification
- Spec: `.kiro/specs/scroll-seal-certification/requirements.md`
- Code
  - Smart contract scaffold: `backend/contracts/ScrollCredentialVerification.sol`
  - ScrollCoin/credential endpoints: `backend/src` (shared services)
- Validation
  - Included in platform and credential validations
- Tests
  - Covered via service integration and ScrollCoin tests

## 6) scroll-assessment-engine
- Spec: `.kiro/specs/scroll-assessment-engine/requirements.md`
- Code
  - Assessment utilities and services: `src/services/**` (assessment/grading helpers)
- Validation
  - Testing framework validators: `src/testing/validators/**`
- Tests
  - Central runner and suites: `src/testing/ScrollUniversityTestRunner.ts`, `src/testing/**`

## 7) scroll-degree-engine
- Spec: `.kiro/specs/scroll-degree-engine/requirements.md`
- Code
  - Degree progression integrated via catalog and profile services
- Validation
  - `validate-testing-framework.js` capability checks (roles/flows)
- Tests
  - Included across integration tests and catalog tests

## 8) scroll-gpt-verifier
- Spec: `.kiro/specs/scroll-gpt-verifier/requirements.md`
- Code
  - AI response QA hooks: `src/testing/validators/AIResponseValidator.ts`
  - Cultural validator: `src/testing/validators/CulturalSensitivityTester.ts`
- Validation
  - `validate-testing-framework.js` (AI quality, bias, hallucination)
- Tests
  - Testing suites in `src/testing/**`

## 9) scroll-audit-trail-spec
- Spec: `.kiro/specs/scroll-audit-trail-spec/requirements.md`
- Code
  - Logging and security hooks within backend services: `backend/src/**`
- Validation
  - Security/compliance validations: `validate-security-compliance.js`
- Tests
  - Observability covered via integration tests

## 10) scroll-drift-detection-spec
- Spec: `.kiro/specs/scroll-drift-detection-spec/requirements.md`
- Code
  - Drift checks integrated in validators and GPT verifier
- Validation
  - `validate-testing-framework.js` additional checks
- Tests
  - Validator suites under `src/testing/validators/**`

## 11) scroll-prayer-integration-spec
- Spec: `.kiro/specs/scroll-prayer-integration-spec/requirements.md`
- Code
  - Integration stubs in portal/mobile for prayer coverage and analytics
- Validation
  - Exercise via functional demos `enhanced-frontend.html`

## 12) scroll-scrollcoin-meter (Economy)
- Spec: `.kiro/specs/scroll-scrollcoin-meter/requirements.md`
- Complementary doc: `docs/SCROLLCOIN_ECONOMY.md`
- Code
  - Wallet/transactions/rewards: backend services under `backend/src/**`
  - Public endpoints: `simple-demo-server.js`, `enhanced-backend-server.js`
- Validation
  - Economy validation via platform integration scripts
- Tests
  - Scenario tests across `test-*` and backend test scripts

## 13) scroll-gamified-learning
- Spec: `.kiro/specs/scroll-gamified-learning/requirements.md`
- Design: `.kiro/specs/scroll-gamified-learning/design.md`
- Tasks: `.kiro/specs/scroll-gamified-learning/tasks.md`
- Code
  - Mobile and web UI: `mobile/**`, `src/**`
  - Rewards integration via ScrollCoin services
- Validation
  - Engagement metrics validated via app demos and analytics scripts

  Requirement mapping (selected highlights):
  - Req 1 (Core engine, XP, levels, leaderboards): `mobile/src/**`, `src/components/**`, ScrollCoin hooks in `backend/src/**`
  - Req 2 (Streaks & notifications): `mobile/src/**` notification handlers; portal UI in `src/components/**`
  - Req 3 (AI tutor gamification): `src/services/**` tutor integration; validators in `src/testing/validators/**`
  - Req 4 (Learning worlds): UI flows `mobile/src/**`; content integration `src/services/**`
  - Req 5 (XR quests): `src/integration/**` and XR fallbacks in portal components
  - Req 6 (ScrollMap): UI + data `mobile/src/**`, `src/services/**`
  - Req 7 (Voice/audio): mobile audio flows `mobile/src/**`
  - Req 8 (Rewards/ScrollCoin): economy in `backend/src/**` and endpoints in root demo servers
  - Req 9–12 (Social, builds, adaptive, dashboards): `src/components/**`, `src/services/**`, analytics in `src/testing/**`
  - Req 13–22 (Mobile/offline, seasons, spiritual, sync, localization, safety, perf, testing, integration): cross-cutting across `mobile/**`, `src/**`, `backend/**`

## 14) scroll-faculty-ai
- Spec: `.kiro/specs/scroll-faculty-ai/requirements.md`
- Design: `.kiro/specs/scroll-faculty-ai/design.md`
- Tasks: `.kiro/specs/scroll-faculty-ai/tasks.md`
- Code
  - AI deans and tutoring flows: `src/services/**`, `src/integration/**`
- Validation
  - `validate-advanced-ai.js`, testing validators

  Requirement mapping (selected highlights):
  - Req 1 (Provisioning/config): config models in `src/services/**`, persisted by backend services in `backend/src/**`
  - Req 2 (Routing/sessions): `src/integration/SystemInterfaces.ts`, portal routing `src/**`
  - Req 3 (Knowledge base): loading in `src/services/**`
  - Req 4 (Guardrails): validators `src/testing/validators/**`; drift/oath integration in platform
  - Req 5 (Multilingual/culture): `src/services/**`, `mobile/src/**`
  - Req 6 (Inter-dean): collaboration interfaces `src/services/**`
  - Req 7 (Pedagogy modes): UI toggles `src/components/**`
  - Req 8–10 (Perf, analytics, integration): metrics in `src/testing/**`; audit and portal integration in `src/**`, `backend/src/**`

## 15) scroll-course-spec
- Spec: `.kiro/specs/scroll-course-spec/requirements.md`
- Code
  - Course models/services: `src/services/**`, `src/types/**`
- Validation
  - Linked via curriculum grid and assessment validations

## 16) scroll-transcript-generator
- Spec: `.kiro/specs/scroll-transcript-generator/requirements.md`
- Code
  - Transcript generation integrated across catalog/profile services
- Validation
  - Certificate/seal verification flows via platform scripts

## 17) scroll-succession-system
## 18) scroll-university-portal
- Spec: `.kiro/specs/scroll-university-portal/requirements.md`
- Design: `.kiro/specs/scroll-university-portal/design.md`
- Tasks: `.kiro/specs/scroll-university-portal/tasks.md`
- Code
  - React portal: `src/**`
  - Mobile (Flutter/RN scaffolds): `mobile/**`
  - Backend API integrations via gateway/services
- Validation
  - Demo UIs: `simple-frontend.html`, `enhanced-frontend.html`
  - Validators: testing framework `src/testing/**`

  Requirement mapping (selected highlights):
  - Req 1–5 (Access, i18n, auth, dashboard, enrollment): `src/components/**`, `src/services/**`, gateway `src/gateway/**`
  - Req 6–8 (Faculty/admin, global ops, ecosystem): `src/portal/**`, `src/integration/**`, backend routes `backend/src/**`
  - Req 9 (XR/fallbacks): `src/integration/**`, UI fallbacks in `src/components/**`
  - Req 10 (Scholarships/workstudy): `src/services/**` + ScrollCoin integration in backend
  - Req 11 (AI tutor UI): `src/components/**` chat, `src/services/**` sessions
  - Req 12 (Offline Sacred Sync): offline cache/PWA in `public/`, `src/**`, mobile sync `mobile/**`
  - Req 13 (Accessibility): UI patterns in `src/components/**`
  - Req 14 (Observability): health endpoints and logging in `backend/**`, error surfaces in `src/**`
- Spec: `.kiro/specs/scroll-succession-system/requirements.md`
- Code/Validation
  - Governance hooks align with oath/drift/audit specs; validated through governance protection flows

---

## Cross-Cutting Test and Validation Assets
- Testing framework: `src/testing/TestingFramework.ts`, `src/testing/ScrollUniversityTestRunner.ts`
- Validators: `src/testing/validators/**`
- Validation scripts (root): `validate-*.js`, `backend/scripts/validate-*.ts`
- Demos: `simple-frontend.html`, `enhanced-frontend.html`, `demo-*.js`

---

## Coverage Status (High-Level)
- Platform, Curriculum, Student Profile, ScrollCoin, Assessment, GPT Verifier, Audit, Drift Detection: Addressed and validated by existing scripts and tests.
- Portal, Faculty AI, Gamified Learning, XR, Mobile: Design and tasks complete; implementation in progress; validated partially via demos and framework validators.
- Credentialing/Transcript/Succession: Requirements complete; implementation linked through platform services and smart-contract scaffolds; end-to-end verification pending final integrations.

This matrix will be kept current as features land. For new modules, add a section mapping each "Requirement N" to specific files (Code), validation scripts, and tests.

