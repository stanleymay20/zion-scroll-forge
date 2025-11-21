/**
 * Gradebook Component
 * Comprehensive gradebook with bulk grading tools
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import type { GradebookEntry, BulkGradingRequest } from '@/types/faculty';

interface GradebookProps {
  courseId: string;
}

const Gradebook: React.FC<GradebookProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradebook, setGradebook] = useState<GradebookEntry[]>([]);
  const [filteredGradebook, setFilteredGradebook] = useState<GradebookEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    loadGradebook();
  }, [courseId]);

  useEffect(() => {
    filterGradebook();
  }, [gradebook, searchTerm, statusFilter]);

  const loadGradebook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getGradebook(courseId);
      setGradebook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const filterGradebook = () => {
    let filtered = [...gradebook];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.studentName.toLowerCase().includes(term) ||
          entry.studentEmail.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.status === statusFilter);
    }

    setFilteredGradebook(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredGradebook.map((e) => e.studentId)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedStudents.size === 0) return;

    try {
      // Implementation would depend on the specific bulk action
      console.log('Bulk action:', bulkAction, 'for students:', Array.from(selectedStudents));
      // await facultyService.bulkGrade(courseId, request);
      await loadGradebook();
      setSelectedStudents(new Set());
      setBulkAction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await facultyService.exportGradebook(courseId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradebook-${courseId}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export gradebook');
    }
  };

  const getStatusBadge = (status: GradebookEntry['status']) => {
    const variants = {
      active: 'default',
      at_risk: 'destructive',
      excelling: 'default',
      inactive: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getGradeTrend = (grade: number) => {
    if (grade >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (grade >= 70) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getLetterGradeColor = (letterGrade: string) => {
    if (letterGrade.startsWith('A')) return 'text-green-600';
    if (letterGrade.startsWith('B')) return 'text-blue-600';
    if (letterGrade.startsWith('C')) return 'text-yellow-600';
    if (letterGrade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gradebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gradebook</CardTitle>
              <CardDescription>
                Manage grades and track student performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="excelling">Excelling</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.size > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-accent rounded-lg">
              <CheckSquare className="h-5 w-5" />
              <span className="font-medium">
                {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Bulk action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_reminder">Send Reminder</SelectItem>
                  <SelectItem value="extend_deadline">Extend Deadline</SelectItem>
                  <SelectItem value="export_selected">Export Selected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedStudents(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Gradebook Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredGradebook.length > 0 &&
                        selectedStudents.size === filteredGradebook.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Overall Grade</TableHead>
                  <TableHead className="text-right">Letter Grade</TableHead>
                  <TableHead className="text-right">Participation</TableHead>
                  <TableHead className="text-right">Spiritual Growth</TableHead>
                  <TableHead className="text-right">Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGradebook.map((entry) => (
                  <TableRow key={entry.studentId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.has(entry.studentId)}
                        onCheckedChange={(checked) =>
                          handleSelectStudent(entry.studentId, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.studentEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getGradeTrend(entry.overallGrade)}
                        <span className="font-medium">
                          {entry.overallGrade.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${getLetterGradeColor(entry.letterGrade)}`}>
                        {entry.letterGrade}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.participation}%
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.spiritualGrowth}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(entry.lastActivity).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredGradebook.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                gradebook.reduce((sum, e) => sum + e.overallGrade, 0) /
                gradebook.length
              ).toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (gradebook.filter((e) => e.overallGrade >= 70).length /
                  gradebook.length) *
                100
              ).toFixed(0)}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {gradebook.filter((e) => e.status === 'at_risk').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Excelling Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {gradebook.filter((e) => e.status === 'excelling').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gradebook;
