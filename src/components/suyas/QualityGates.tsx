/**
 * Quality Gates Component
 * Blocks placeholder content ("Concept 1-1", "Example 2-1", "TBD") from publishing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Play,
  Loader2,
  Search,
  FileText,
  BookOpen,
  GraduationCap,
  Ban
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

console.info("✝️ SUYAS Quality Gates — Ensuring excellence in all content");

// Default blocked patterns
const DEFAULT_BLOCKED_PATTERNS = [
  { pattern: "Concept \\d+-\\d+", description: "Placeholder concept numbering" },
  { pattern: "Example \\d+-\\d+", description: "Placeholder example numbering" },
  { pattern: "TBD", description: "To Be Determined markers" },
  { pattern: "TODO", description: "TODO markers" },
  { pattern: "FIXME", description: "FIXME markers" },
  { pattern: "Lorem ipsum", description: "Placeholder Latin text" },
  { pattern: "placeholder", description: "Generic placeholder text" },
  { pattern: "\\[.*\\]", description: "Bracketed placeholder instructions" },
  { pattern: "Coming soon", description: "Coming soon markers" },
  { pattern: "Under construction", description: "Under construction markers" },
];

interface QualityRule {
  id: string;
  pattern: string;
  description: string;
  is_active: boolean;
  severity: 'error' | 'warning' | 'info';
  created_at: string;
}

interface ScanResult {
  table: string;
  column: string;
  record_id: string;
  matched_pattern: string;
  content_preview: string;
  severity: 'error' | 'warning' | 'info';
}

export default function QualityGates() {
  const [rules, setRules] = useState<QualityRule[]>(
    DEFAULT_BLOCKED_PATTERNS.map((p, i) => ({
      id: `rule-${i}`,
      pattern: p.pattern,
      description: p.description,
      is_active: true,
      severity: 'error' as const,
      created_at: new Date().toISOString()
    }))
  );
  
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({ pattern: '', description: '', severity: 'error' as const });

  // Run quality scan across content tables
  const runQualityScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    
    try {
      const results: ScanResult[] = [];
      const activeRules = rules.filter(r => r.is_active);

      // Scan courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description');
      
      courses?.forEach(course => {
        activeRules.forEach(rule => {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(course.title || '')) {
            results.push({
              table: 'courses',
              column: 'title',
              record_id: course.id,
              matched_pattern: rule.pattern,
              content_preview: course.title?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
          if (regex.test(course.description || '')) {
            results.push({
              table: 'courses',
              column: 'description',
              record_id: course.id,
              matched_pattern: rule.pattern,
              content_preview: course.description?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
        });
      });

      // Scan course modules
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, title, content_md');
      
      modules?.forEach(mod => {
        activeRules.forEach(rule => {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(mod.title || '')) {
            results.push({
              table: 'course_modules',
              column: 'title',
              record_id: mod.id,
              matched_pattern: rule.pattern,
              content_preview: mod.title?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
          if (regex.test(mod.content_md || '')) {
            results.push({
              table: 'course_modules',
              column: 'content_md',
              record_id: mod.id,
              matched_pattern: rule.pattern,
              content_preview: mod.content_md?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
        });
      });

      // Scan assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, description');
      
      assignments?.forEach(assignment => {
        activeRules.forEach(rule => {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(assignment.title || '')) {
            results.push({
              table: 'assignments',
              column: 'title',
              record_id: assignment.id,
              matched_pattern: rule.pattern,
              content_preview: assignment.title?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
          if (regex.test(assignment.description || '')) {
            results.push({
              table: 'assignments',
              column: 'description',
              record_id: assignment.id,
              matched_pattern: rule.pattern,
              content_preview: assignment.description?.substring(0, 100) || '',
              severity: rule.severity
            });
          }
        });
      });

      setScanResults(results);
      setLastScanTime(new Date());
      
      if (results.length === 0) {
        toast.success('Quality scan complete — no issues found!');
      } else {
        toast.warning(`Quality scan found ${results.length} issue(s)`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to run quality scan');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, is_active: !r.is_active } : r
    ));
  };

  const addNewRule = () => {
    if (!newRule.pattern || !newRule.description) return;
    
    setRules(prev => [...prev, {
      id: `rule-${Date.now()}`,
      pattern: newRule.pattern,
      description: newRule.description,
      severity: newRule.severity,
      is_active: true,
      created_at: new Date().toISOString()
    }]);
    
    setNewRule({ pattern: '', description: '', severity: 'error' });
    setAddRuleOpen(false);
    toast.success('Quality rule added');
  };

  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('Rule removed');
  };

  const errorCount = scanResults.filter(r => r.severity === 'error').length;
  const warningCount = scanResults.filter(r => r.severity === 'warning').length;
  const activeRulesCount = rules.filter(r => r.is_active).length;
  const qualityScore = scanResults.length === 0 ? 100 : Math.max(0, 100 - (errorCount * 5) - (warningCount * 2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Quality Gates
          </h2>
          <p className="text-muted-foreground">
            Block placeholder content and ensure publication-ready quality
          </p>
        </div>

        <Button onClick={runQualityScan} disabled={isScanning}>
          {isScanning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Quality Scan
        </Button>
      </div>

      {/* Quality Score */}
      <Card className={qualityScore >= 90 ? "border-green-500/50" : qualityScore >= 70 ? "border-amber-500/50" : "border-destructive/50"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quality Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={qualityScore} className="h-3" />
            </div>
            <span className={`text-3xl font-bold ${
              qualityScore >= 90 ? 'text-green-500' : 
              qualityScore >= 70 ? 'text-amber-500' : 'text-destructive'
            }`}>
              {qualityScore}%
            </span>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{errorCount} Errors</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{warningCount} Warnings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{activeRulesCount} Active Rules</span>
            </div>
          </div>
          {lastScanTime && (
            <p className="text-xs text-muted-foreground mt-2">
              Last scan: {lastScanTime.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Quality Issues Found ({scanResults.length})
            </CardTitle>
            <CardDescription>
              These items contain placeholder content that must be fixed before publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Content Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanResults.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {result.severity === 'error' ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="secondary">Warning</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {result.table}.{result.column}
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {result.matched_pattern}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {result.content_preview}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quality Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quality Rules</CardTitle>
              <CardDescription>
                Patterns that block content from being published
              </CardDescription>
            </div>
            <Dialog open={addRuleOpen} onOpenChange={setAddRuleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Quality Rule</DialogTitle>
                  <DialogDescription>
                    Define a regex pattern to block from content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Pattern (Regex)</Label>
                    <Input
                      placeholder="e.g., Concept \\d+-\\d+"
                      value={newRule.pattern}
                      onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="e.g., Placeholder concept numbering"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRuleOpen(false)}>Cancel</Button>
                  <Button onClick={addNewRule}>Add Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map(rule => (
              <div 
                key={rule.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {rule.pattern}
                    </code>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeRule(rule.id)}
                >
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tables Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Protected Content Tables</CardTitle>
          <CardDescription>
            Quality gates scan these tables for placeholder content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Courses</p>
                <p className="text-sm text-muted-foreground">Title, Description</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Course Modules</p>
                <p className="text-sm text-muted-foreground">Title, Content</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Assignments</p>
                <p className="text-sm text-muted-foreground">Title, Description</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
