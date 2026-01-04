/**
 * Gradebook Component
 * Comprehensive gradebook with bulk grading tools
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import facultyService from '@/services/facultyService';

// Simple gradebook entry type matching v_course_gradebook view
interface SimpleGradebookEntry {
  course_id: string;
  course_title: string;
  user_id: string;
  student_name: string;
  student_email: string;
  progress: number;
  grade: string;
  points_earned: number;
}

interface GradebookProps {
  courseId: string;
}

const Gradebook: React.FC<GradebookProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradebook, setGradebook] = useState<SimpleGradebookEntry[]>([]);
  const [filteredGradebook, setFilteredGradebook] = useState<SimpleGradebookEntry[]>([]);
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
          entry.student_name?.toLowerCase().includes(term) ||
          entry.student_email?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'at_risk') {
        filtered = filtered.filter((e) => e.progress < 50);
      } else if (statusFilter === 'excelling') {
        filtered = filtered.filter((e) => e.progress >= 80);
      }
    }

    setFilteredGradebook(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredGradebook.map((e) => e.user_id)));
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
      console.log('Bulk action:', bulkAction, 'for students:', Array.from(selectedStudents));
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
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
                <SelectItem value="at_risk">At Risk (&lt;50%)</SelectItem>
                <SelectItem value="excelling">Excelling (≥80%)</SelectItem>
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
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGradebook.map((entry, idx) => (
                  <TableRow key={`${entry.user_id}-${idx}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.has(entry.user_id)}
                        onCheckedChange={(checked) =>
                          handleSelectStudent(entry.user_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.student_name || 'Unknown'}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.student_email || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getProgressColor(entry.progress)}>
                        {entry.progress}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.grade || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.points_earned || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredGradebook.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No grades found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradebook.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradebook.length > 0 
                ? (gradebook.reduce((sum, e) => sum + (e.progress || 0), 0) / gradebook.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradebook.length > 0 
                ? (gradebook.reduce((sum, e) => sum + (e.points_earned || 0), 0) / gradebook.length).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gradebook;
