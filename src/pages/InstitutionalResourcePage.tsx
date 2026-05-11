import { Link } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, HelpCircle, MessageSquare, Store, Users, Workflow, Search, ShieldCheck } from "lucide-react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ResourceKind =
  | "divine-scorecard"
  | "prophetic-checkins"
  | "calling-discernment"
  | "forums"
  | "mentorship"
  | "projects"
  | "marketplace"
  | "career-pathways"
  | "job-board"
  | "research"
  | "help";

interface InstitutionalResourcePageProps {
  kind: ResourceKind;
}

const resources: Record<ResourceKind, {
  title: string;
  description: string;
  icon: any;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  status: string;
  cards: Array<{ title: string; body: string; href?: string; label?: string }>;
}> = {
  "divine-scorecard": {
    title: "Divine Scorecard",
    description: "A student formation dashboard that points learners to existing academic, spiritual, and integrity records.",
    icon: ShieldCheck,
    primaryHref: "/dashboard",
    primaryLabel: "Open Dashboard",
    secondaryHref: "/spiritual-formation",
    secondaryLabel: "Spiritual Formation",
    status: "Operational route",
    cards: [
      { title: "Academic progress", body: "Use the dashboard, degree audit, and transcript to view measurable academic progress.", href: "/degree-audit", label: "Degree Audit" },
      { title: "Formation evidence", body: "Spiritual formation, devotion, prayer, and testimony surfaces hold faith-formation evidence.", href: "/spiritual-formation", label: "Formation" },
      { title: "Governance trust", body: "Integrity and Trust Center pages explain the guardrails behind student records.", href: "/academic-integrity", label: "Integrity Policy" },
    ],
  },
  "prophetic-checkins": {
    title: "Prophetic Check-ins",
    description: "A guided pastoral check-in entry point connected to existing prayer, devotion, and spiritual mentor flows.",
    icon: MessageSquare,
    primaryHref: "/prayer-requests",
    primaryLabel: "Submit Prayer Request",
    secondaryHref: "/spiritual-mentor",
    secondaryLabel: "Spiritual Mentor",
    status: "Operational route",
    cards: [
      { title: "Prayer request", body: "Submit a prayer request for pastoral attention and community support.", href: "/prayer-requests", label: "Prayer Requests" },
      { title: "Daily devotion", body: "Continue Christ-centered reflection and discipline.", href: "/daily-devotion", label: "Daily Devotion" },
      { title: "Mentor support", body: "Use the spiritual mentor surface for discipleship-oriented support.", href: "/spiritual-mentor", label: "Mentor" },
    ],
  },
  "calling-discernment": {
    title: "Calling Discernment",
    description: "A practical pathway for connecting gifts, learning profile, goals, and academic direction.",
    icon: Search,
    primaryHref: "/learning-profile",
    primaryLabel: "Start Learning Profile",
    secondaryHref: "/learning-goals",
    secondaryLabel: "Learning Goals",
    status: "Operational route",
    cards: [
      { title: "Learning profile", body: "Capture preferences and learning signals that support advising.", href: "/learning-profile", label: "Profile" },
      { title: "Skills assessment", body: "Assess skills before choosing a path or course load.", href: "/skills-assessment", label: "Skills" },
      { title: "Program catalog", body: "Review degree programs with faculty and curriculum alignment.", href: "/degrees", label: "Degrees" },
    ],
  },
  forums: {
    title: "Discussion Forums",
    description: "Community discussion is routed through the active community and fellowship surfaces.",
    icon: MessageSquare,
    primaryHref: "/community",
    primaryLabel: "Open Community",
    secondaryHref: "/fellowship-rooms",
    secondaryLabel: "Fellowship Rooms",
    status: "Operational route",
    cards: [
      { title: "Community", body: "Join academic and faith-based discussions through the community hub.", href: "/community", label: "Community" },
      { title: "Fellowship", body: "Use fellowship rooms for spiritual community and shared formation.", href: "/fellowship-rooms", label: "Rooms" },
      { title: "Messaging", body: "Direct messaging supports student communication where enabled.", href: "/messaging", label: "Messaging" },
    ],
  },
  mentorship: {
    title: "Mentorship",
    description: "Mentorship is connected to AI tutor guidance, spiritual mentor support, and faculty-facing advising routes.",
    icon: Users,
    primaryHref: "/ai-tutors",
    primaryLabel: "AI Tutor Guidance",
    secondaryHref: "/spiritual-mentor",
    secondaryLabel: "Spiritual Mentor",
    status: "Operational route",
    cards: [
      { title: "Academic tutor", body: "Use text-based AI tutors for academic guidance.", href: "/ai-tutors", label: "Tutors" },
      { title: "Spiritual mentor", body: "Use spiritual mentor workflows for discipleship-oriented support.", href: "/spiritual-mentor", label: "Mentor" },
      { title: "Faculty directory", body: "Find faculty profiles and institutional roles.", href: "/faculty-directory", label: "Faculty" },
    ],
  },
  projects: {
    title: "Collaborative Projects",
    description: "Project work is handled through study groups, assignments, community, and portfolio records.",
    icon: Workflow,
    primaryHref: "/study-groups",
    primaryLabel: "Study Groups",
    secondaryHref: "/assignment-upload",
    secondaryLabel: "Assignments",
    status: "Operational route",
    cards: [
      { title: "Study groups", body: "Coordinate group learning and collaboration.", href: "/study-groups", label: "Groups" },
      { title: "Assignments", body: "Submit academic work through the assignment workflow.", href: "/assignment-upload", label: "Assignments" },
      { title: "Achievements", body: "Track earned achievements and badges.", href: "/achievements", label: "Achievements" },
    ],
  },
  marketplace: {
    title: "Marketplace",
    description: "Marketplace activity is routed through the active redemption and ScrollGold economy pages.",
    icon: Store,
    primaryHref: "/redemption-store",
    primaryLabel: "Redemption Store",
    secondaryHref: "/scrollgold-wallet",
    secondaryLabel: "ScrollGold Wallet",
    status: "Operational route",
    cards: [
      { title: "Redeem", body: "Open the redemption store for available rewards and items.", href: "/redemption-store", label: "Store" },
      { title: "Wallet", body: "View ScrollGold balance and transaction surfaces.", href: "/scrollgold-wallet", label: "Wallet" },
      { title: "Leaderboard", body: "View ScrollGold leaderboard activity.", href: "/scrollgold-leaderboard", label: "Leaderboard" },
    ],
  },
  "career-pathways": {
    title: "Career Pathways",
    description: "Career planning combines degree audit, skills assessment, outcomes, and faculty pathways.",
    icon: BriefcaseBusiness,
    primaryHref: "/skills-assessment",
    primaryLabel: "Assess Skills",
    secondaryHref: "/outcomes",
    secondaryLabel: "Outcomes",
    status: "Operational route",
    cards: [
      { title: "Skills", body: "Assess student skills and readiness signals.", href: "/skills-assessment", label: "Skills" },
      { title: "Outcomes", body: "Review institutional outcomes and trust signals.", href: "/outcomes", label: "Outcomes" },
      { title: "Degree audit", body: "Measure progress toward the assigned academic path.", href: "/degree-audit", label: "Audit" },
    ],
  },
  "job-board": {
    title: "Job Board",
    description: "Employment readiness is currently served through career pathways, outcomes, and portfolio/achievement evidence.",
    icon: BriefcaseBusiness,
    primaryHref: "/career-pathways",
    primaryLabel: "Career Pathways",
    secondaryHref: "/achievements",
    secondaryLabel: "Achievements",
    status: "Operational route",
    cards: [
      { title: "Career pathway", body: "Use career pathways before applying externally.", href: "/career-pathways", label: "Pathways" },
      { title: "Public evidence", body: "Badges and achievements provide student evidence for employers.", href: "/my-badges", label: "Badges" },
      { title: "Outcomes", body: "Review outcomes data and institutional proof points.", href: "/outcomes", label: "Outcomes" },
    ],
  },
  research: {
    title: "Research Hub",
    description: "Research activity is routed through Scroll Library, academic integrity, and faculty/research governance pages.",
    icon: BookOpen,
    primaryHref: "/scroll-library",
    primaryLabel: "Scroll Library",
    secondaryHref: "/academic-integrity",
    secondaryLabel: "Academic Integrity",
    status: "Operational route",
    cards: [
      { title: "Library", body: "Use Scroll Library for reading and study workflows.", href: "/scroll-library", label: "Library" },
      { title: "Integrity", body: "Review academic integrity policies before publishing research.", href: "/academic-integrity", label: "Integrity" },
      { title: "Faculty", body: "Faculty directory supports research credibility and review lineage.", href: "/faculty-directory", label: "Faculty" },
    ],
  },
  help: {
    title: "Help Center",
    description: "A real support routing page for students, applicants, and staff.",
    icon: HelpCircle,
    primaryHref: "mailto:support@scrolluniversity.org?subject=ScrollUniversity%20Support%20Request",
    primaryLabel: "Email Support",
    secondaryHref: "/trust",
    secondaryLabel: "Trust Center",
    status: "Operational route",
    cards: [
      { title: "Student support", body: "For course access, transcript, or program assignment issues, contact support with your student ID.", href: "mailto:support@scrolluniversity.org?subject=Student%20Support%20Request", label: "Email" },
      { title: "Admissions", body: "For application or program assignment questions, contact the Registrar.", href: "mailto:registrar@scrolluniversity.org?subject=Admissions%20or%20Program%20Assignment", label: "Registrar" },
      { title: "Trust", body: "Review policies, verification, and institutional disclosures.", href: "/trust", label: "Trust Center" },
    ],
  },
};

export default function InstitutionalResourcePage({ kind }: InstitutionalResourcePageProps) {
  const resource = resources[kind];
  const Icon = resource.icon;

  return (
    <PageTemplate
      title={resource.title}
      description={resource.description}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <LinkOrAnchor href={resource.primaryHref}>{resource.primaryLabel}</LinkOrAnchor>
          </Button>
          {resource.secondaryHref && resource.secondaryLabel && (
            <Button asChild variant="outline">
              <LinkOrAnchor href={resource.secondaryHref}>{resource.secondaryLabel}</LinkOrAnchor>
            </Button>
          )}
        </div>
      }
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {resource.title}
            <Badge variant="secondary">{resource.status}</Badge>
          </CardTitle>
          <CardDescription>
            This route is connected to working platform surfaces instead of a placeholder page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Use the cards below to navigate to the relevant workflow" disabled />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resource.cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{card.body}</p>
              {card.href && card.label && (
                <Button asChild variant="outline" size="sm">
                  <LinkOrAnchor href={card.href}>{card.label}</LinkOrAnchor>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}

function LinkOrAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("mailto:")) {
    return <a href={href}>{children}</a>;
  }
  return <Link to={href}>{children}</Link>;
}
