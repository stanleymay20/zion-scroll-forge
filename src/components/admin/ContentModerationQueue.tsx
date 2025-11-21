/**
 * Content Moderation Queue Component
 * Interface for reviewing and moderating flagged content
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
import { Flag, CheckCircle, XCircle, AlertTriangle, User, Clock } from 'lucide-react';
import adminService from '@/services/adminService';
import type { ModerationQueueItem, ModerationAction } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';

export const ContentModerationQueue: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'warn_user' | 'suspend_user'>('approve');
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    loadModerationQueue();
  }, []);

  const loadModerationQueue = async () => {
    try {
      setLoading(true);
      const data = await adminService.getModerationQueue();
      setItems(data);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async () => {
    if (!selectedItem || !user) return;

    try {
      const action: ModerationAction = {
        itemId: selectedItem.id,
        action: moderationAction,
        notes: moderationNotes,
        moderatorId: user.id,
      };

      await adminService.moderateContent(action);
      await loadModerationQueue();
      setModerationDialog(false);
      setSelectedItem(null);
      setModerationNotes('');
    } catch (err) {
      console.error('Failed to moderate content:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    return <Flag className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in moderation queue</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>AI Analysis</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="line-clamp-2 max-w-md">{item.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{item.authorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.contentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.flagReason.map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.aiAnalysis && (
                        <div className="text-sm">
                          <Badge className={getSeverityColor(
                            item.aiAnalysis.toxicity > 0.7 ? 'high' :
                            item.aiAnalysis.toxicity > 0.4 ? 'medium' : 'low'
                          )}>
                            {item.aiAnalysis.recommendation}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(item.flaggedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setModerationDialog(true);
                        }}
                      >
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

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog} onOpenChange={setModerationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderate Content</DialogTitle>
            <DialogDescription>
              Review and take action on flagged content
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Content Preview */}
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p>{selectedItem.content}</p>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>By: {selectedItem.authorName}</span>
                  <span>Type: {selectedItem.contentType}</span>
                  <span>Flagged: {new Date(selectedItem.flaggedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Flag Reasons */}
              <div>
                <h4 className="font-semibold mb-2">Flag Reasons</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.flagReason.map((reason, idx) => (
                    <Badge key={idx} variant="secondary">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {selectedItem.aiAnalysis && (
                <div>
                  <h4 className="font-semibold mb-2">AI Analysis</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Toxicity</p>
                      <p className="font-medium">{(selectedItem.aiAnalysis.toxicity * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spam</p>
                      <p className="font-medium">{(selectedItem.aiAnalysis.spam * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recommendation</p>
                      <Badge>{selectedItem.aiAnalysis.recommendation}</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation Action */}
              <div>
                <Label>Moderation Action</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={moderationAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setModerationAction('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={moderationAction === 'reject' ? 'default' : 'outline'}
                    onClick={() => setModerationAction('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant={moderationAction === 'warn_user' ? 'default' : 'outline'}
                    onClick={() => setModerationAction('warn_user')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Warn User
                  </Button>
                  <Button
                    variant={moderationAction === 'suspend_user' ? 'destructive' : 'outline'}
                    onClick={() => setModerationAction('suspend_user')}
                  >
                    Suspend User
                  </Button>
                </div>
              </div>

              {/* Moderation Notes */}
              <div>
                <Label>Moderation Notes</Label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Provide notes for this moderation action..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModerationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleModerate} disabled={!moderationNotes}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
