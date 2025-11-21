/**
 * Course Approval Workflow Component
 * Interface for reviewing and approving course submissions
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle, Eye, BookOpen, User, Clock } from 'lucide-react';
import adminService from '@/services/adminService';
import type { CourseApproval, CourseApprovalAction } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';

export const CourseApprovalWorkflow: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseApproval | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_revision'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadPendingCourses();
  }, []);

  const loadPendingCourses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load pending courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedCourse || !user) return;

    try {
      const action: CourseApprovalAction = {
        courseId: selectedCourse.courseId,
        action: reviewAction,
        notes: reviewNotes,
        reviewerId: user.id,
      };

      await adminService.reviewCourse(action);
      await loadPendingCourses();
      setReviewDialog(false);
      setSelectedCourse(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Failed to review course:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Approval Workflow</CardTitle>
          <CardDescription>Review and approve course submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending courses to review</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.courseTitle}</p>
                        <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{course.instructorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{course.content.modules} modules</p>
                        <p>{course.content.lectures} lectures</p>
                        <p>{course.content.assessments} assessments</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getComplianceIcon(course.compliance.spiritualAlignment)}
                          <span className="text-sm">Spiritual</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getComplianceIcon(course.compliance.contentQuality)}
                          <span className="text-sm">Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getComplianceIcon(course.compliance.accessibility)}
                          <span className="text-sm">Accessibility</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(course.submittedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setReviewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Course: {selectedCourse?.courseTitle}</DialogTitle>
            <DialogDescription>
              Submitted by {selectedCourse?.instructorName} on{' '}
              {selectedCourse && new Date(selectedCourse.submittedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Details */}
              <div>
                <h4 className="font-semibold mb-2">Course Content</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Modules</p>
                    <p className="font-medium">{selectedCourse.content.modules}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lectures</p>
                    <p className="font-medium">{selectedCourse.content.lectures}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assessments</p>
                    <p className="font-medium">{selectedCourse.content.assessments}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedCourse.content.duration} hours</p>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div>
                <h4 className="font-semibold mb-2">Compliance Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Spiritual Alignment</span>
                    {getComplianceIcon(selectedCourse.compliance.spiritualAlignment)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Quality</span>
                    {getComplianceIcon(selectedCourse.compliance.contentQuality)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accessibility Standards</span>
                    {getComplianceIcon(selectedCourse.compliance.accessibility)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Technical Requirements</span>
                    {getComplianceIcon(selectedCourse.compliance.technicalRequirements)}
                  </div>
                </div>
              </div>

              {/* Review Action */}
              <div>
                <Label>Review Decision</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={reviewAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'request_revision' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('request_revision')}
                    className="flex-1"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setReviewAction('reject')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide feedback for the instructor..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={!reviewNotes}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
