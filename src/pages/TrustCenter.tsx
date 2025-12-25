/**
 * Trust Center Page
 * Public transparency page for Scroll University credibility
 */

import React from 'react';
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileCheck, 
  Users, 
  Building2, 
  Scale, 
  BookOpen,
  GraduationCap,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Target,
  Heart,
  Globe,
  Lock
} from "lucide-react";

console.info("✝️ Trust Center — Building credibility through transparency");

// Legal entity information
const legalEntity = {
  name: "Scroll University Foundation",
  type: "Educational Non-Profit Organization",
  registration: "Registered in the State of Delaware, USA",
  registrationNumber: "EIN: Pending",
  address: "1234 Kingdom Way, Suite 100, Atlanta, GA 30301",
  established: "2024",
  mission: "To provide Christ-centered, kingdom-focused education accessible to believers worldwide through innovative technology and spiritual formation."
};

// Faculty/Leadership
const leadership = [
  {
    name: "Dr. Stanley Mayega",
    title: "Founder & Chancellor",
    credentials: "Ph.D. Theology, M.Div.",
    linkedIn: "https://linkedin.com/in/stanleymayega",
    bio: "Visionary leader with 20+ years in Christian education and ministry."
  },
  {
    name: "Academic Advisory Council",
    title: "Governance Body",
    credentials: "Multi-disciplinary Board",
    linkedIn: null,
    bio: "Oversees curriculum quality, academic standards, and institutional integrity."
  }
];

// Accreditation status
const accreditationStatus = {
  current: "Pre-Accreditation Phase",
  targetBodies: [
    "Association for Biblical Higher Education (ABHE)",
    "Transnational Association of Christian Colleges and Schools (TRACS)"
  ],
  timeline: [
    { phase: "Foundation & Curriculum Development", status: "completed", date: "2024" },
    { phase: "Self-Study Preparation", status: "in-progress", date: "2025" },
    { phase: "Candidacy Application", status: "planned", date: "2026" },
    { phase: "Full Accreditation Review", status: "planned", date: "2027-2028" }
  ]
};

// What we offer vs. what we don't
const offerings = {
  whatWeOffer: [
    "Certificates of Completion for all courses",
    "Digital credentials via blockchain (ScrollBadge NFTs)",
    "Comprehensive spiritual formation curriculum",
    "AI-powered personalized learning",
    "Global community of Christian learners",
    "Project-based portfolio building",
    "Mentorship from experienced believers"
  ],
  whatWeDontOffer: [
    "State-recognized degrees (in progress)",
    "Visa sponsorship for international students",
    "Credit transfer to accredited institutions (yet)",
    "Government financial aid eligibility (yet)",
    "Professional licensure preparation (varies by field)"
  ]
};

// Student protection policies
const policies = [
  {
    title: "Refund Policy",
    icon: Scale,
    summary: "Full refund within 14 days of enrollment. Pro-rated refunds available up to 30 days.",
    link: "/policies/refunds"
  },
  {
    title: "Complaints & Appeals",
    icon: FileCheck,
    summary: "Clear process for academic appeals and grievance resolution within 30 business days.",
    link: "/policies/appeals"
  },
  {
    title: "Data Privacy",
    icon: Lock,
    summary: "GDPR-compliant data handling. Your information is never sold to third parties.",
    link: "/policies/privacy"
  },
  {
    title: "Academic Integrity",
    icon: BookOpen,
    summary: "Strict plagiarism policies with AI-powered detection. Fair process for violations.",
    link: "/policies/academic-integrity"
  },
  {
    title: "Transcript Requests",
    icon: GraduationCap,
    summary: "Official transcripts available within 5 business days. Digital and physical options.",
    link: "/policies/transcripts"
  }
];

export default function TrustCenter() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-12 px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Trust Center</h1>
          <p className="text-xl text-muted-foreground">
            Transparency, integrity, and accountability in everything we do. 
            Here's exactly what Scroll University is—and what it isn't.
          </p>
        </div>

        <Separator />

        {/* Navigation Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl mx-auto">
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="accreditation">Accreditation</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="clarity">What We Are</TabsTrigger>
          </TabsList>

          {/* About Us */}
          <TabsContent value="about" className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Legal Entity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{legalEntity.name}</p>
                    <p className="text-muted-foreground">{legalEntity.type}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Registration:</strong> {legalEntity.registration}</p>
                    <p><strong>Tax ID:</strong> {legalEntity.registrationNumber}</p>
                    <p><strong>Address:</strong> {legalEntity.address}</p>
                    <p><strong>Established:</strong> {legalEntity.established}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {legalEntity.mission}
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="font-semibold">Core Values:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Christ-centered excellence in all things</li>
                      <li>• Biblical integrity without compromise</li>
                      <li>• Global accessibility for all believers</li>
                      <li>• Innovation in service of the Kingdom</li>
                      <li>• Community and spiritual formation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accreditation */}
          <TabsContent value="accreditation" className="mt-8">
            <div className="space-y-8">
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Current Accreditation Status
                  </CardTitle>
                  <CardDescription>
                    We believe in full transparency about our accreditation journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {accreditationStatus.current}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Scroll University is currently in the pre-accreditation phase. This means our certificates 
                    are valuable for personal and professional development, but are not yet recognized by 
                    traditional accrediting bodies or government agencies.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Accreditation Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accreditationStatus.timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`mt-1 rounded-full p-1 ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'in-progress' ? 'bg-blue-500' : 'bg-muted'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : item.status === 'in-progress' ? (
                            <Clock className="h-4 w-4 text-white" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.phase}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Accrediting Bodies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {accreditationStatus.targetBodies.map((body, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{body}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leadership */}
          <TabsContent value="leadership" className="mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {leadership.map((leader, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {leader.name}
                    </CardTitle>
                    <CardDescription>{leader.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary">{leader.credentials}</Badge>
                    <p className="text-muted-foreground">{leader.bio}</p>
                    {leader.linkedIn && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={leader.linkedIn} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          LinkedIn Profile
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Policies */}
          <TabsContent value="policies" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policy, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <policy.icon className="h-5 w-5 text-primary" />
                      {policy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{policy.summary}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Full Policy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* What We Are / Aren't */}
          <TabsContent value="clarity" className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    What We Offer
                  </CardTitle>
                  <CardDescription>
                    These are the verified benefits of Scroll University
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {offerings.whatWeOffer.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    What We Don't Offer (Yet)
                  </CardTitle>
                  <CardDescription>
                    Honest about our current limitations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {offerings.whatWeDontOffer.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Our commitment:</strong> We will never claim recognition, 
                      accreditation, or benefits we don't actually have. As we achieve 
                      each milestone, this page will be updated.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Separator />
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Questions?</h2>
          <p className="text-muted-foreground">
            We're committed to transparency. If you have questions about our institution, 
            accreditation status, or policies, please reach out.
          </p>
          <div className="flex justify-center gap-4">
            <Button>
              Contact Us
            </Button>
            <Button variant="outline">
              View Sample Courses
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
