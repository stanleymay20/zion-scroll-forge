/**
 * Student Roster Component
 * Student roster with communication tools
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Mail,
  MessageSquare,
  Phone,
  User,
  TrendingUp,
  AlertCircle,
  Search,
  Send,
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import type { StudentRosterEntry, CommunicationMessage } from '@/types/faculty';

interface StudentRosterProps {
  courseId: string;
}

const StudentRoster: React.FC<StudentRosterProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [filteredRoster, setFilteredRoster] = useState<StudentRosterEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageForm, setMessageForm] = useState<Partial<CommunicationMessage>>({
    type: 'email',
    priority: 'normal',
  });

  useEffect(() => {
    loadRoster();
  }, [courseId]);

  useEffect(() => {
    filterRoster();
  }, [roster, searchTerm]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getStudentRoster(courseId);
      setRoster(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  const filterRoster = () => {
    if (!searchTerm) {
      setFilteredRoster(roster);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = roster.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
    );
    setFilteredRoster(filtered);
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

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.message) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await facultyService.sendMessage(courseId, {
        ...messageForm,
        recipients: Array.from(selectedStudents),
      } as CommunicationMessage);
      
      setShowMessageDialog(false);
      setMessageForm({ type: 'email', priority: 'normal' });
      setSelectedStudents(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const getStatusColor = (status: StudentRosterEntry['status']) => {
    switch (status) {
      case 'excelling':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student roster...</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>
                {roster.length} student{roster.length !== 1 ? 's' : ''} enrolled
              </CardDescription>
            </div>
            {selectedStudents.size > 0 && (
              <Button onClick={() => setShowMessageDialog(true)}>
                <Send className="h-4 w-4 mr-2" />
                Message Selected ({selectedStudents.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Student List */}
          <div className="space-y-4">
            {filteredRoster.map((student) => (
              <div
                key={student.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={(checked) =>
                      handleSelectStudent(student.id, checked as boolean)
                    }
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="text-lg font-semibold">{student.progress}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Grade</div>
                        <div className="text-lg font-semibold">
                          {student.overallGrade.toFixed(1)}% ({student.letterGrade})
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Attendance</div>
                        <div className="text-lg font-semibold">{student.attendance}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Participation</div>
                        <div className="text-lg font-semibold">{student.participation}%</div>
                      </div>
                    </div>

                    {/* Spiritual Growth Metrics */}
                    <div className="bg-accent p-3 rounded-lg mb-4">
                      <div className="text-sm font-medium mb-2">Spiritual Growth</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Devotions</div>
                          <div className="font-medium">
                            {student.spiritualGrowth.devotionCompletion}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Prayer Journal</div>
                          <div className="font-medium">
                            {student.spiritualGrowth.prayerJournalEntries} entries
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Scripture Memory</div>
                          <div className="font-medium">
                            {student.spiritualGrowth.scriptureMemoryProgress}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Overall Score</div>
                          <div className="font-medium">
                            {student.spiritualGrowth.overallScore}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Last active: {new Date(student.lastActive).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRoster.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to Students</DialogTitle>
            <DialogDescription>
              Sending to {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Message Type</label>
                <Select
                  value={messageForm.type}
                  onValueChange={(value) =>
                    setMessageForm({ ...messageForm, type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={messageForm.priority}
                  onValueChange={(value) =>
                    setMessageForm({ ...messageForm, priority: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                placeholder="Message subject..."
                value={messageForm.subject || ''}
                onChange={(e) =>
                  setMessageForm({ ...messageForm, subject: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Type your message..."
                rows={6}
                value={messageForm.message || ''}
                onChange={(e) =>
                  setMessageForm({ ...messageForm, message: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentRoster;
