/**
 * Academic Term Management Component
 * Full CRUD operations for academic terms
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  CheckCircle2,
  Clock,
  BookOpen
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  useAcademicTerms,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
  useSetActiveTerm,
  getTermStatus,
  getTermProgress,
  type AcademicTerm,
  type CreateTermInput,
  type UpdateTermInput,
} from "@/hooks/useAcademicTerms";

console.info("✝️ Academic Term Management — Stewarding the seasons of learning");

export default function AcademicTermManagement() {
  const { data: terms, isLoading } = useAcademicTerms();
  const createTerm = useCreateTerm();
  const updateTerm = useUpdateTerm();
  const deleteTerm = useDeleteTerm();
  const setActiveTerm = useSetActiveTerm();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateTermInput>({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_active: false,
    });
  };

  const handleCreate = async () => {
    await createTerm.mutateAsync(formData);
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingTerm) return;
    await updateTerm.mutateAsync({
      id: editingTerm.id,
      ...formData,
    });
    setEditingTerm(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteTerm.mutateAsync(id);
  };

  const handleSetActive = async (id: string) => {
    await setActiveTerm.mutateAsync(id);
  };

  const openEditDialog = (term: AcademicTerm) => {
    setEditingTerm(term);
    setFormData({
      name: term.name,
      start_date: term.start_date,
      end_date: term.end_date,
      is_active: term.is_active || false,
    });
  };

  const getStatusBadge = (term: AcademicTerm) => {
    const status = getTermStatus(term);
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
      case 'past':
        return <Badge variant="secondary"><BookOpen className="h-3 w-3 mr-1" />Completed</Badge>;
    }
  };

  if (isLoading) {
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
            <Calendar className="h-6 w-6 text-primary" />
            Academic Term Management
          </h2>
          <p className="text-muted-foreground">
            Create, edit, and manage academic terms and semesters
          </p>
        </div>

        {/* Create Term Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Term
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Academic Term</DialogTitle>
              <DialogDescription>
                Add a new academic term or semester to the calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Term Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Fall 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Set as active term</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createTerm.isPending || !formData.name || !formData.start_date || !formData.end_date}
              >
                {createTerm.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Term
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Terms List */}
      <div className="grid gap-4">
        {terms?.map((term) => (
          <Card key={term.id} className={term.is_active ? "border-primary/50 bg-primary/5" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{term.name}</h3>
                    {getStatusBadge(term)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(term.start_date), 'MMM d, yyyy')} - {format(parseISO(term.end_date), 'MMM d, yyyy')}
                  </p>
                  {getTermStatus(term) === 'active' && (
                    <p className="text-xs text-muted-foreground">
                      Progress: {getTermProgress(term)}%
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!term.is_active && getTermStatus(term) !== 'past' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(term.id)}
                      disabled={setActiveTerm.isPending}
                    >
                      Set Active
                    </Button>
                  )}
                  
                  {/* Edit Dialog */}
                  <Dialog open={editingTerm?.id === term.id} onOpenChange={(open) => !open && setEditingTerm(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(term)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Academic Term</DialogTitle>
                        <DialogDescription>
                          Update the term details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Term Name</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-start_date">Start Date</Label>
                            <Input
                              id="edit-start_date"
                              type="date"
                              value={formData.start_date}
                              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-end_date">End Date</Label>
                            <Input
                              id="edit-end_date"
                              type="date"
                              value={formData.end_date}
                              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit-is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label htmlFor="edit-is_active">Active term</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTerm(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateTerm.isPending}>
                          {updateTerm.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Academic Term</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{term.name}"? This action cannot be undone.
                          Any course offerings linked to this term will also be affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(term.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!terms || terms.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No academic terms configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Create Term" to add your first academic term.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}