/**
 * Academic Integrity & Quality Page
 * 
 * Public-facing page that transparently communicates ScrollUniversity's
 * academic standards, assessment philosophy, and quality assurance processes.
 * 
 * "The integrity of the upright guides them." — Proverbs 11:3
 */

import React from "react";
import { Shield, BookOpen, Brain, Bot, Scale, GraduationCap, FileCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";

export default function AcademicIntegrity() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 ring-2 ring-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Academic Integrity & Quality
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ScrollUniversity is committed to academic excellence, transparent standards, 
            and authentic learning. This page outlines our quality assurance principles.
          </p>
        </div>

        {/* Institutional Statement */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <GraduationCap className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Institutional Statement</h3>
                <p className="text-muted-foreground">
                  ScrollUniversity is a new educational institution with fully developed 
                  Certificate programs and higher tiers currently in internal development. 
                  We are building our curriculum with intentionality, ensuring every program 
                  meets rigorous quality standards before public launch.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Content Standards */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Content Standards</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Every course in our Certificate programs meets the following content requirements:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <StandardItem
                    title="Module Depth"
                    description="Each module contains substantive, domain-specific content (minimum 500+ characters) with clear explanations and applied examples."
                  />
                  <StandardItem
                    title="Multimedia Resources"
                    description="Every module includes scripted lecture content (video or audio format) to support diverse learning styles."
                  />
                  <StandardItem
                    title="Study Materials"
                    description="Comprehensive study guides accompany each module to reinforce learning objectives."
                  />
                  <StandardItem
                    title="No Placeholder Content"
                    description="All content is original and complete. We do not publish courses with placeholder or template text."
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Assessment Philosophy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Assessment Philosophy</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Our assessment approach combines knowledge verification with applied learning:
                </p>
                
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <Badge variant="outline" className="mt-1">Knowledge</Badge>
                    <div>
                      <h4 className="font-medium">Conceptual Assessments</h4>
                      <p className="text-sm text-muted-foreground">
                        Quizzes and examinations verify comprehension of core concepts, 
                        principles, and domain-specific knowledge.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Badge variant="outline" className="mt-1">Applied</Badge>
                    <div>
                      <h4 className="font-medium">Practical Assessments</h4>
                      <p className="text-sm text-muted-foreground">
                        Capstone projects, case studies, and applied assignments demonstrate 
                        real-world application of learned skills.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Badge variant="outline" className="mt-1">Rubric</Badge>
                    <div>
                      <h4 className="font-medium">Transparent Grading</h4>
                      <p className="text-sm text-muted-foreground">
                        Every assessment includes clear grading criteria and rubrics, 
                        ensuring students understand expectations and evaluation methods.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* AI Usage Disclosure */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">AI Usage Disclosure</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  ScrollUniversity embraces AI as a tool for educational excellence while 
                  maintaining rigorous quality standards:
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">AI-Assisted</Badge>
                    <span className="text-sm">Content creation uses AI assistance for initial drafting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500">Human-Reviewed</Badge>
                    <span className="text-sm">All content undergoes human review for accuracy and quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500">Assessment-Validated</Badge>
                    <span className="text-sm">Quality gates ensure content meets institutional standards</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Our AI tutors provide personalized learning support while maintaining 
                  academic integrity. Students are expected to submit original work for 
                  all graded assessments.
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Academic Honesty */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Academic Honesty Expectations</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  ScrollUniversity upholds the highest standards of academic integrity. 
                  All students are expected to:
                </p>
                
                <ul className="space-y-2">
                  <ExpectationItem text="Submit original work for all graded assessments" />
                  <ExpectationItem text="Properly cite sources and acknowledge external contributions" />
                  <ExpectationItem text="Not share assessment answers or solutions with other students" />
                  <ExpectationItem text="Use AI tools responsibly and in accordance with course guidelines" />
                  <ExpectationItem text="Report any suspected violations of academic integrity" />
                </ul>
                
                <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                  <strong>Consequences:</strong> Violations of academic honesty may result in 
                  grade penalties, course failure, or dismissal from the program, depending 
                  on severity.
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Quality Assurance */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Quality Assurance Process</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Our quality assurance process ensures every program meets institutional standards:
                </p>
                
                <div className="grid gap-3">
                  <QualityStep 
                    number={1} 
                    title="Content Development"
                    description="Subject matter experts develop curriculum with AI assistance"
                  />
                  <QualityStep 
                    number={2} 
                    title="Quality Gate Scan"
                    description="Automated systems scan for placeholder content and incomplete sections"
                  />
                  <QualityStep 
                    number={3} 
                    title="Human Review"
                    description="Academic reviewers verify accuracy, coherence, and pedagogical value"
                  />
                  <QualityStep 
                    number={4} 
                    title="Completion Seal"
                    description="Programs meeting all criteria receive a verifiable completion seal"
                  />
                  <QualityStep 
                    number={5} 
                    title="Continuous Monitoring"
                    description="Seals are automatically revoked if quality criteria are later violated"
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground border-t pt-8">
          <blockquote className="italic mb-4">
            "The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity."
          </blockquote>
          <p>— Proverbs 11:3</p>
          <p className="mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </main>
    </div>
  );
}

function StandardItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ExpectationItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

function QualityStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
