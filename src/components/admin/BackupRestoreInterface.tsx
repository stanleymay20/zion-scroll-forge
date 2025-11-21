/**
 * Backup & Restore Interface Component
 * Interface for managing system backups and restores
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  Calendar,
} from 'lucide-react';
import adminService from '@/services/adminService';
import type { Backup, BackupSchedule, RestoreRequest, RestoreStatus } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';

export const BackupRestoreInterface: React.FC = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupType, setBackupType] = useState<Backup['type']>('full');
  const [restoreOptions, setRestoreOptions] = useState({
    database: true,
    files: true,
    environment: 'production' as 'production' | 'staging' | 'development',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupsData, schedulesData] = await Promise.all([
        adminService.getBackups(),
        adminService.getBackupSchedules(),
      ]);
      setBackups(backupsData);
      setSchedules(schedulesData);
    } catch (err) {
      console.error('Failed to load backup data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await adminService.createBackup(backupType);
      setCreateDialog(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create backup:', err);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup || !user) return;

    try {
      const request: RestoreRequest = {
        backupId: selectedBackup.id,
        targetEnvironment: restoreOptions.environment,
        restoreDatabase: restoreOptions.database,
        restoreFiles: restoreOptions.files,
        requestedBy: user.id,
      };

      await adminService.restoreBackup(request);
      setRestoreDialog(false);
      setSelectedBackup(null);
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
  };

  const handleUpdateSchedule = async (schedule: BackupSchedule) => {
    try {
      await adminService.updateBackupSchedule(schedule);
      await loadData();
    } catch (err) {
      console.error('Failed to update schedule:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Manage system backups and restore operations</CardDescription>
            </div>
            <Button onClick={() => setCreateDialog(true)}>
              <HardDrive className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="backups">
            <TabsList>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>

            {/* Backups List */}
            <TabsContent value="backups">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No backups found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Metadata</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <Badge variant="outline">{backup.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(backup.status)}
                            <Badge className={getStatusColor(backup.status)}>
                              {backup.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatBytes(backup.size)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(backup.startedAt).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{backup.metadata.userCount} users</p>
                            <p>{backup.metadata.courseCount} courses</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {backup.fileUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(backup.fileUrl, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {backup.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBackup(backup);
                                  setRestoreDialog(true);
                                }}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Backup Schedules */}
            <TabsContent value="schedules">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{schedule.type}</Badge>
                              <Badge>{schedule.frequency}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Time: {schedule.time}</p>
                              <p>Retention: {schedule.retention} days</p>
                              <p>
                                Next run: {new Date(schedule.nextRun).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) =>
                              handleUpdateSchedule({ ...schedule, enabled: checked })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a new system backup
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Backup Type</Label>
            <Select value={backupType} onValueChange={(value) => setBackupType(value as Backup['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Backup</SelectItem>
                <SelectItem value="incremental">Incremental Backup</SelectItem>
                <SelectItem value="database">Database Only</SelectItem>
                <SelectItem value="files">Files Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup}>
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Restore system from backup: {selectedBackup?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Environment</Label>
              <Select
                value={restoreOptions.environment}
                onValueChange={(value) =>
                  setRestoreOptions({
                    ...restoreOptions,
                    environment: value as 'production' | 'staging' | 'development',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Restore Database</Label>
              <Switch
                checked={restoreOptions.database}
                onCheckedChange={(checked) =>
                  setRestoreOptions({ ...restoreOptions, database: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Restore Files</Label>
              <Switch
                checked={restoreOptions.files}
                onCheckedChange={(checked) =>
                  setRestoreOptions({ ...restoreOptions, files: checked })
                }
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Warning</p>
                  <p>
                    Restoring a backup will overwrite existing data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestore}>
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
