# SUYAS Quick Start Guide

## Scroll University Year Automation System

SUYAS is the comprehensive academic lifecycle management system for ScrollUniversity. This guide will help you get started quickly.

---

## 🎯 Overview

SUYAS manages the complete academic year lifecycle:

1. **Academic Year Builder** — Create and version academic years (draft → published → archived)
2. **Course Scheduling** — Timetable engine with conflict detection
3. **Student Registry** — Student lifecycle management (applicant → graduated)
4. **Faculty Workload** — Teaching load management and approvals
5. **Deadline Orchestration** — Assignment/exam management with reminders
6. **Quality Gates** — Block placeholder content from publishing
7. **Audit Trail** — Full change history for compliance

---

## 🚀 Getting Started

### Access SUYAS Admin

Navigate to `/admin/suyas` in your ScrollUniversity instance.

### 1. Create an Academic Year

1. Go to **Academic Year** tab
2. Click **New Academic Year**
3. Fill in:
   - Name (e.g., "Academic Year 2025-2026")
   - Year Structure (Semester/Trimester/Quarter)
   - Start and End Dates
4. Click **Create Year** (creates as Draft)
5. Add Terms/Semesters to the year
6. Click **Publish** when ready

### 2. Schedule Courses

1. Go to **Scheduling** tab
2. Select term and course
3. Add class sessions with:
   - Day of week
   - Start/End times
   - Location or Virtual meeting URL
4. System auto-detects conflicts

### 3. Manage Students

1. Go to **Students** tab
2. View student lifecycle stages
3. Apply/remove holds as needed
4. Track graduation progress

### 4. Configure Faculty Workload

1. Go to **Faculty** tab
2. Set maximum teaching hours per faculty
3. Manage course assignments
4. Handle overload approvals

### 5. Set Up Deadlines

1. Go to **Deadlines** tab
2. Create assignments/exams with:
   - Due dates
   - Late policies
   - Attempt limits
3. Configure automated reminders
4. Export to ICS calendar

### 6. Run Quality Checks

1. Go to **Quality** tab
2. Click **Run Quality Scan**
3. Review any placeholder content issues
4. Fix issues before publishing
5. Add custom quality rules as needed

### 7. Review Audit Trail

1. Go to **Audit** tab
2. Filter by date, action type, user
3. View detailed change history
4. Export for compliance reports

---

## 📋 Quality Gates

SUYAS blocks these placeholder patterns by default:

| Pattern | Description |
|---------|-------------|
| `Concept \d+-\d+` | Placeholder concept numbering |
| `Example \d+-\d+` | Placeholder example numbering |
| `TBD` | To Be Determined markers |
| `TODO` | TODO markers |
| `Lorem ipsum` | Placeholder Latin text |
| `[...]` | Bracketed placeholder instructions |
| `Coming soon` | Coming soon markers |

**Add custom rules** via the Quality tab to enforce your own standards.

---

## 🔐 Permissions

| Role | Access Level |
|------|--------------|
| Admin | Full SUYAS access |
| Registrar | Academic Year, Students, Scheduling |
| Faculty | View schedule, Workload |
| Student | View deadlines, Calendar |

---

## 📞 Support

For issues or questions:
- Visit the Trust Center at `/trust`
- Contact: support@scrolluniversity.org

---

*"Train up a child in the way he should go, and when he is old he will not depart from it." — Proverbs 22:6*
