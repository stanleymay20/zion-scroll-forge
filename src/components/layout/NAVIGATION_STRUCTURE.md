# Navigation Structure Diagram

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐  ┌──────────────────────────────────────┐   │
│  │              │  │                                        │   │
│  │  SIDEBAR     │  │         MAIN CONTENT AREA             │   │
│  │  (256px)     │  │                                        │   │
│  │              │  │  ┌──────────────────────────────┐     │   │
│  │ ┌──────────┐ │  │  │ Breadcrumbs                  │     │   │
│  │ │  Logo    │ │  │  └──────────────────────────────┘     │   │
│  │ │  Title   │ │  │                                        │   │
│  │ └──────────┘ │  │  ┌──────────────────────────────┐     │   │
│  │              │  │  │                              │     │   │
│  │ ┌──────────┐ │  │  │  Page Title & Description    │     │   │
│  │ │ Profile  │ │  │  │                              │     │   │
│  │ │ Notif    │ │  │  │  [Action Buttons]            │     │   │
│  │ └──────────┘ │  │  │                              │     │   │
│  │              │  │  └──────────────────────────────┘     │   │
│  │ ▼ Overview   │  │                                        │   │
│  │   Dashboard  │  │  ┌──────────────────────────────┐     │   │
│  │   Courses    │  │  │                              │     │   │
│  │   Calendar   │  │  │                              │     │   │
│  │              │  │  │      Page Content            │     │   │
│  │ ▼ Learning   │  │  │                              │     │   │
│  │   Catalog    │  │  │                              │     │   │
│  │   AI Tutors  │  │  │                              │     │   │
│  │   XR Class   │  │  │                              │     │   │
│  │   Labs       │  │  └──────────────────────────────┘     │   │
│  │   Assess     │  │                                        │   │
│  │   Groups     │  │                                        │   │
│  │              │  │                                        │   │
│  │ ▼ Spiritual  │  │                                        │   │
│  │   Devotion   │  │                                        │   │
│  │   Prayer     │  │                                        │   │
│  │   Scripture  │  │                                        │   │
│  │   Requests   │  │                                        │   │
│  │   Mentor     │  │                                        │   │
│  │              │  │                                        │   │
│  │ ... more     │  │                                        │   │
│  │              │  │                                        │   │
│  │ ┌──────────┐ │  │                                        │   │
│  │ │ AI Sess  │ │  │                                        │   │
│  │ │ Settings │ │  │                                        │   │
│  │ └──────────┘ │  │                                        │   │
│  │              │  │                                        │   │
│  └──────────────┘  └──────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (<1024px)

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────┐     │
│  │ Logo    [Notif] [Menu]         │     │  ← Top Header (Fixed)
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ Breadcrumbs                    │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │                                │     │
│  │  Page Title & Description      │     │
│  │                                │     │
│  │  [Action Buttons]              │     │
│  │                                │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │                                │     │
│  │                                │     │
│  │                                │     │
│  │      Page Content              │     │
│  │      (Scrollable)              │     │
│  │                                │     │
│  │                                │     │
│  │                                │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ [Home] [Courses] [AI] [Comm]   │     │  ← Bottom Tab Bar (Fixed)
│  │              [More]             │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## Hamburger Menu (Mobile)

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────┐     │
│  │ Menu                    [X]    │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  [Avatar]  John Doe            │     │
│  │            john@email.com      │     │
│  │            Student | 650 SC    │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  [Icon] Dashboard              │     │
│  │  [Icon] My Courses             │     │
│  │  [Icon] AI Tutors              │     │
│  │  [Icon] Study Groups           │     │
│  │  [Icon] Spiritual Formation    │     │
│  │  [Icon] Community Feed         │     │
│  │  [Icon] ScrollGold Wallet      │     │
│  │  [Icon] Achievements           │     │
│  │  [Icon] Transcript             │     │
│  │  [Icon] Settings               │     │
│  │                                │     │
│  │  (Scrollable list)             │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  [Bot Icon] Start AI Session   │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## User Profile Dropdown

```
┌─────────────────────────────────┐
│  John Doe                       │
│  john@email.com                 │
│  Student          650 SC        │
├─────────────────────────────────┤
│  [Icon] Profile                 │
│  [Icon] Transcript              │
│  [Icon] ScrollGold Wallet       │
│  [Icon] Achievements            │
│  [Icon] Spiritual Formation     │
├─────────────────────────────────┤
│  [Icon] Settings                │
│  [Icon] Admin Dashboard *       │
├─────────────────────────────────┤
│  [Icon] Sign Out                │
└─────────────────────────────────┘

* Only visible for Faculty/Admin
```

## Notification Dropdown

```
┌─────────────────────────────────┐
│  Notifications      [View All]  │
├─────────────────────────────────┤
│  [New] New AI Tutor Features    │
│  Experience enhanced video...   │
│  2 hours ago              [•]   │
├─────────────────────────────────┤
│  [Update] ScrollGold Rewards    │
│  Earn 50% more ScrollGolds...   │
│  1 day ago                      │
├─────────────────────────────────┤
│  Course Progress Update         │
│  You completed Module 3...      │
│  2 days ago                     │
├─────────────────────────────────┤
│  Prayer Request Answered        │
│  Your prayer has been...        │
│  3 days ago                     │
├─────────────────────────────────┤
│  New Study Group Invitation     │
│  You've been invited to...      │
│  5 days ago                     │
└─────────────────────────────────┘

[•] = Unread indicator
```

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Good morning, John                                             │
│  Continue your transformative journey in Christ-centered...     │
│  [Browse Courses] [Start AI Session]                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ⭐ Daily Acknowledgment                                    │ │
│  │ "Jesus Christ is Lord over my studies..."                 │ │
│  │ [✓ Acknowledge Christ as Lord]                            │ │
│  └───────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Courses  │ │ScrollGold│ │ Prayers  │ │ Progress │         │
│  │    3     │ │   650    │ │    12    │ │   75%    │         │
│  │ 3 active │ │Live bal. │ │5 answered│ │All cours.│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌────────────────────────┐  │
│  │ Quick Actions               │  │ Continue Learning      │  │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐│  │ Sacred AI Engineering  │  │
│  │ │Brow││AI  ││Stud││Devo││  │ ████████░░ 75%         │  │
│  │ │se  ││Sess││y Gr││tion││  │ [Continue]             │  │
│  │ └────┘ └────┘ └────┘ └────┘│  │                        │  │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐│  │ Prophetic Law          │  │
│  │ │XR  ││Pray││Wall││Feed││  │ ████░░░░░░ 40%         │  │
│  │ │Clas││er  ││et  ││    ││  │ [Continue]             │  │
│  │ └────┘ └────┘ └────┘ └────┘│  │                        │  │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐│  ├────────────────────────┤
│  │ │Tran││Achi││Cale││Asse││  │ Recommended for You    │  │
│  │ │scri││eve ││ndar││ss  ││  │ • Scroll Economy       │  │
│  │ └────┘ └────┘ └────┘ └────┘│  │ • Edenic Science       │  │
│  └─────────────────────────────┘  │ • Scroll Theology      │  │
│  ┌─────────────────────────────┐  ├────────────────────────┤
│  │ Recent Activity             │  │ Learning Goals         │  │
│  │ • Progress in Sacred AI...  │  │ Complete 3 courses     │  │
│  │ • Completed Module 3        │  │ ████░░ 33%             │  │
│  │ • Earned 50 ScrollGolds     │  │                        │  │
│  │ • Joined Study Group        │  │ Earn 1000 ScrollGolds  │  │
│  │ • Prayer Request Answered   │  │ ████████░░ 65%         │  │
│  └─────────────────────────────┘  └────────────────────────┘  │
│  ┌─────────────────────────────┐                              │
│  │ 📢 Announcements            │                              │
│  │ [New] New AI Tutor Features │                              │
│  │ [Update] ScrollGold Rewards │                              │
│  └─────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Hierarchy

```
ScrollUniversity
├── Overview
│   ├── Dashboard
│   ├── My Courses
│   └── Calendar
├── Learning
│   ├── Course Catalog
│   ├── AI Tutors
│   ├── XR Classrooms
│   ├── Virtual Labs
│   ├── Assessments
│   └── Study Groups
├── Spiritual Formation
│   ├── Daily Devotion
│   ├── Prayer Journal
│   ├── Scripture Memory
│   ├── Prayer Requests
│   └── Spiritual Mentor
├── Community
│   ├── Community Feed
│   ├── Messaging
│   ├── Fellowship Rooms
│   └── Testimonies
├── ScrollGold Economy
│   ├── My Wallet
│   ├── Earn ScrollGold
│   ├── Redemption Store
│   └── Leaderboard
├── Academic Progress
│   ├── Transcript
│   ├── Degree Audit
│   ├── Achievements
│   └── Scholarships
├── Faculty Tools (Faculty/Admin)
│   ├── Faculty Dashboard
│   ├── Course Management
│   ├── Gradebook
│   └── Faculty Analytics
└── Administration (Admin)
    ├── Admin Dashboard
    ├── Admissions Review
    ├── Analytics
    ├── Content Generation
    ├── Institutions
    └── System Status
```

## Component Hierarchy

```
App
└── MainLayout
    ├── MainNavigation (Desktop)
    │   ├── Logo & Title
    │   ├── User Profile Dropdown
    │   ├── Notification Bell
    │   ├── Navigation Sections
    │   │   ├── Overview
    │   │   ├── Learning
    │   │   ├── Spiritual Formation
    │   │   ├── Community
    │   │   ├── ScrollGold Economy
    │   │   ├── Academic Progress
    │   │   ├── Faculty Tools (conditional)
    │   │   └── Administration (conditional)
    │   └── Quick Actions
    ├── MobileNavigation (Mobile)
    │   ├── Top Header
    │   │   ├── Logo
    │   │   ├── Notification Bell
    │   │   └── Hamburger Menu
    │   ├── Bottom Tab Bar
    │   │   ├── Dashboard
    │   │   ├── Courses
    │   │   ├── AI Tutors
    │   │   ├── Community
    │   │   └── More
    │   └── Hamburger Drawer
    │       ├── User Profile
    │       ├── Full Navigation
    │       └── Quick Actions
    └── Content Area
        ├── Breadcrumbs
        └── Page Content
            └── EnhancedDashboard
                ├── Christ Lordship Card
                ├── Quick Stats
                ├── Quick Actions
                ├── Recent Activity
                ├── Announcements
                └── Personalized Content
                    ├── Continue Learning
                    ├── Recommended Courses
                    ├── Upcoming Events
                    ├── Learning Goals
                    └── Recent Achievements
```

## State Flow

```
User Authentication
        ↓
    Get User Role
        ↓
Filter Navigation Items
        ↓
Render Navigation
        ↓
User Clicks Item
        ↓
Update Active Route
        ↓
Generate Breadcrumbs
        ↓
Render Page Content
        ↓
Fetch Page Data
        ↓
Display Content
```

## Data Flow

```
Backend API
    ↓
React Query
    ↓
Custom Hooks
    ↓
Components
    ↓
UI Display
```

Example:
```
/api/dashboard
    ↓
useDashboard()
    ↓
EnhancedDashboard
    ↓
Quick Stats Cards
```
