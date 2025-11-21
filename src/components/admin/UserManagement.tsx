/**
 * User Management Component
 * Interface for managing users and role assignments
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, UserCog, Ban, CheckCircle, Trash2, Shield } from 'lucide-react';
import adminService from '@/services/adminService';
import type { AdminUser, UserRole, UserManagementFilters } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserManagementFilters>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'role' | 'suspend' | 'delete' | null;
    user: AdminUser | null;
  }>({ type: null, user: null });
  const [actionData, setActionData] = useState<{
    role?: UserRole;
    reason?: string;
  }>({});

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(filters);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!actionDialog.user || !actionData.role || !currentUser) return;

    try {
      await adminService.updateUserRole({
        userId: actionDialog.user.id,
        role: actionData.role,
        assignedBy: currentUser.id,
        assignedAt: new Date(),
        reason: actionData.reason,
      });
      await loadUsers();
      setActionDialog({ type: null, user: null });
      setActionData({});
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleSuspend = async () => {
    if (!actionDialog.user || !actionData.reason) return;

    try {
      await adminService.suspendUser(actionDialog.user.id, actionData.reason);
      await loadUsers();
      setActionDialog({ type: null, user: null });
      setActionData({});
    } catch (err) {
      console.error('Failed to suspend user:', err);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await adminService.activateUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  const handleDelete = async () => {
    if (!actionDialog.user) return;

    try {
      await adminService.deleteUser(actionDialog.user.id);
      await loadUsers();
      setActionDialog({ type: null, user: null });
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, role: value === 'all' ? undefined : (value as UserRole) })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === 'all' ? undefined : (value as 'active' | 'suspended' | 'inactive'),
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>{user.enrollmentCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActionDialog({ type: 'role', user });
                            setActionData({ role: user.role });
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionDialog({ type: 'suspend', user })}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'delete', user })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog
        open={actionDialog.type === 'role'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {actionDialog.user?.firstName} {actionDialog.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Role</Label>
              <Select
                value={actionData.role}
                onValueChange={(value) => setActionData({ ...actionData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={actionData.reason || ''}
                onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                placeholder="Reason for role change..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog
        open={actionDialog.type === 'suspend'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {actionDialog.user?.firstName} {actionDialog.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              placeholder="Reason for suspension..."
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!actionData.reason}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={actionDialog.type === 'delete'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {actionDialog.user?.firstName}{' '}
              {actionDialog.user?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
