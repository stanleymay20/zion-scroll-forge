/**
 * Quality Gates Component
 * Blocks placeholder content ("Concept 1-1", "Example 2-1", "TBD") from publishing
 * Enforces score >= 90 for publish eligibility
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Play,
  Loader2,
  FileText,
  BookOpen,
  GraduationCap,
  Ban,
  Lock,
  Unlock,
  History,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

console.info("✝️ SUYAS Quality Gates — Ensuring excellence in all content");

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

interface QualityScan {
  id: string;
  quality_score: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  issues: ScanResult[];
  publish_blocked: boolean;
  scanned_at: string;
}

// Fetch quality rules from database
const useQualityRules = () => {
  return useQuery({
    queryKey: ['suyas-quality-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suyas_quality_rules')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as QualityRule[];
    }
  });
};

// Fetch recent quality scans
const useRecentScans = () => {
  return useQuery({
    queryKey: ['suyas-quality-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suyas_quality_scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []).map(scan => ({
        id: scan.id,
        quality_score: scan.quality_score,
        error_count: scan.error_count,
        warning_count: scan.warning_count,
        info_count: scan.info_count,
        issues: (Array.isArray(scan.issues) ? scan.issues : []) as unknown as ScanResult[],
        publish_blocked: scan.publish_blocked,
        scanned_at: scan.scanned_at
      }));
    }
  });
};

const PUBLISH_THRESHOLD = 90;

export default function QualityGates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: rules, isLoading: rulesLoading } = useQualityRules();
  const { data: recentScans } = useRecentScans();
  
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(100);
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState<{ pattern: string; description: string; severity: 'error' | 'warning' | 'info' }>({ pattern: '', description: '', severity: 'error' });

  // Toggle rule active status
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('suyas_quality_rules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suyas-quality-rules'] });
    }
  });

  // Add new rule
  const addRuleMutation = useMutation({
    mutationFn: async (rule: { pattern: string; description: string; severity: 'error' | 'warning' | 'info' }) => {
      const { error } = await supabase
        .from('suyas_quality_rules')
        .insert([{
          pattern: rule.pattern,
          description: rule.description,
          severity: rule.severity,
          created_by: user?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suyas-quality-rules'] });
      setNewRule({ pattern: '', description: '', severity: 'error' });
      setAddRuleOpen(false);
      toast.success('Quality rule added');
    }
  });

  // Delete rule
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suyas_quality_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suyas-quality-rules'] });
      toast.success('Rule removed');
    }
  });

  // Run quality scan across content tables
  const runQualityScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    
    try {
      const results: ScanResult[] = [];
      const activeRules = rules?.filter(r => r.is_active) || [];

      if (activeRules.length === 0) {
        toast.error('No active quality rules to scan');
        setIsScanning(false);
        return;
      }

      // Scan courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description');
      
      courses?.forEach(course => {
        activeRules.forEach(rule => {
          try {
            const regex = new RegExp(rule.pattern, 'gi');
            if (regex.test(course.title || '')) {
              results.push({
                table: 'courses',
                column: 'title',
                record_id: course.id,
                matched_pattern: rule.pattern,
                content_preview: course.title?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
            if (regex.test(course.description || '')) {
              results.push({
                table: 'courses',
                column: 'description',
                record_id: course.id,
                matched_pattern: rule.pattern,
                content_preview: course.description?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
          } catch (e) {
            console.warn(`Invalid regex pattern: ${rule.pattern}`);
          }
        });
      });

      // Scan course modules
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, title, content_md');
      
      modules?.forEach(mod => {
        activeRules.forEach(rule => {
          try {
            const regex = new RegExp(rule.pattern, 'gi');
            if (regex.test(mod.title || '')) {
              results.push({
                table: 'course_modules',
                column: 'title',
                record_id: mod.id,
                matched_pattern: rule.pattern,
                content_preview: mod.title?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
            if (regex.test(mod.content_md || '')) {
              results.push({
                table: 'course_modules',
                column: 'content_md',
                record_id: mod.id,
                matched_pattern: rule.pattern,
                content_preview: mod.content_md?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
          } catch (e) {
            console.warn(`Invalid regex pattern: ${rule.pattern}`);
          }
        });
      });

      // Scan assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, description');
      
      assignments?.forEach(assignment => {
        activeRules.forEach(rule => {
          try {
            const regex = new RegExp(rule.pattern, 'gi');
            if (regex.test(assignment.title || '')) {
              results.push({
                table: 'assignments',
                column: 'title',
                record_id: assignment.id,
                matched_pattern: rule.pattern,
                content_preview: assignment.title?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
            if (regex.test(assignment.description || '')) {
              results.push({
                table: 'assignments',
                column: 'description',
                record_id: assignment.id,
                matched_pattern: rule.pattern,
                content_preview: assignment.description?.substring(0, 100) || '',
                severity: rule.severity as 'error' | 'warning' | 'info'
              });
            }
          } catch (e) {
            console.warn(`Invalid regex pattern: ${rule.pattern}`);
          }
        });
      });

      const errorCount = results.filter(r => r.severity === 'error').length;
      const warningCount = results.filter(r => r.severity === 'warning').length;
      const infoCount = results.filter(r => r.severity === 'info').length;
      const score = Math.max(0, 100 - (errorCount * 5) - (warningCount * 2) - (infoCount * 1));
      const publishBlocked = score < PUBLISH_THRESHOLD;

      // Persist scan result
      await supabase
        .from('suyas_quality_scans')
        .insert([{
          scanned_by: user?.id,
          quality_score: score,
          error_count: errorCount,
          warning_count: warningCount,
          info_count: infoCount,
          issues: JSON.parse(JSON.stringify(results)),
          tables_scanned: ['courses', 'course_modules', 'assignments'],
          rules_applied: activeRules.map(r => ({ pattern: r.pattern, severity: r.severity })),
          publish_blocked: publishBlocked
        }]);

      setScanResults(results);
      setQualityScore(score);
      setLastScanTime(new Date());
      
      queryClient.invalidateQueries({ queryKey: ['suyas-quality-scans'] });

      if (results.length === 0) {
        toast.success('Quality scan complete — no issues found!');
      } else if (publishBlocked) {
        toast.error(`Quality score ${score}% — Publishing BLOCKED (minimum ${PUBLISH_THRESHOLD}% required)`);
      } else {
        toast.warning(`Quality scan found ${results.length} issue(s) — Score: ${score}%`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to run quality scan');
    } finally {
      setIsScanning(false);
    }
  };

  const errorCount = scanResults.filter(r => r.severity === 'error').length;
  const warningCount = scanResults.filter(r => r.severity === 'warning').length;
  const activeRulesCount = rules?.filter(r => r.is_active).length || 0;
  const publishBlocked = qualityScore < PUBLISH_THRESHOLD;

  if (rulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Quality Score + Publish Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={qualityScore >= PUBLISH_THRESHOLD ? "border-green-500/50" : "border-destructive/50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              Quality Score
              {publishBlocked ? (
                <Lock className="h-4 w-4 text-destructive" />
              ) : (
                <Unlock className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={qualityScore} className="h-3" />
              </div>
              <span className={`text-3xl font-bold ${
                qualityScore >= PUBLISH_THRESHOLD ? 'text-green-500' : 'text-destructive'
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

        {/* Publish Status */}
        <Card className={publishBlocked ? "border-destructive bg-destructive/5" : "border-green-500/50 bg-green-500/5"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {publishBlocked ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-destructive">PUBLISHING BLOCKED</h3>
                    <p className="text-sm text-muted-foreground">
                      Quality score must be ≥{PUBLISH_THRESHOLD}% to publish content.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fix {errorCount} error(s) and {warningCount} warning(s) to proceed.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Unlock className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-500">READY TO PUBLISH</h3>
                    <p className="text-sm text-muted-foreground">
                      Content meets quality standards and can be published.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                      ) : result.severity === 'warning' ? (
                        <Badge className="bg-amber-500">Warning</Badge>
                      ) : (
                        <Badge variant="secondary">Info</Badge>
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

      {/* Recent Scans History */}
      {recentScans && recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentScans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {scan.publish_blocked ? (
                      <Lock className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Score: {scan.quality_score}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.error_count} errors, {scan.warning_count} warnings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={scan.publish_blocked ? "destructive" : "secondary"}>
                      {scan.publish_blocked ? "Blocked" : "Passed"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(scan.scanned_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select 
                      value={newRule.severity} 
                      onValueChange={(v: string) => setNewRule({ ...newRule, severity: v as 'error' | 'warning' | 'info' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error (-5 points)</SelectItem>
                        <SelectItem value="warning">Warning (-2 points)</SelectItem>
                        <SelectItem value="info">Info (-1 point)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRuleOpen(false)}>Cancel</Button>
                  <Button onClick={() => addRuleMutation.mutate(newRule)}>Add Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules?.map(rule => (
              <div 
                key={rule.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => toggleRuleMutation.mutate({ id: rule.id, is_active: checked })}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {rule.pattern}
                      </code>
                      <Badge variant={
                        rule.severity === 'error' ? 'destructive' : 
                        rule.severity === 'warning' ? 'secondary' : 'outline'
                      }>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteRuleMutation.mutate(rule.id)}
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
