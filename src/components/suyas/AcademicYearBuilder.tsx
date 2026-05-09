/**
 * SUYAS - Academic Year Builder Component
 * Full management of academic years with versioning (draft → published → archived)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calendar, 
  Plus, 
  Pencil, 
  Archive,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errors";

console.info("✝️ SUYAS Academic Year Builder — Structuring the seasons of education");

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  year_type: 'semester' | 'trimester' | 'quarter';
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
  institution_id?: string;
  created_at: string;
  updated_at: string;
}

interface Term {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Fetch academic years
const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as AcademicYear[];
    }
  });
};

// Create academic year
const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (year: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(year)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year created successfully');
    },
    onError: (error: Error) => {
      toast.error("Failed to create academic year", { description: getUserFriendlyError(error) });
    }
  });
};

// Update academic year
const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcademicYear> & { id: string }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year updated successfully');
    },
    onError: (error: Error) => {
      toast.error("Failed to update academic year", { description: getUserFriendlyError(error) });
    }
  });
};

// Fetch terms for an academic year
const useTerms = () => {
  return useQuery({
    queryKey: ['academic-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Term[];
    }
  });
};

export default function AcademicYearBuilder() {
  const { data: years, isLoading: yearsLoading } = useAcademicYears();
  const { data: terms } = useTerms();
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    year_type: 'semester' as 'semester' | 'trimester' | 'quarter',
    is_active: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      year_type: 'semester',
      is_active: false
    });
  };

  const handleCreate = async () => {
    await createYear.mutateAsync(formData);
    setCreateDialogOpen(false);
    resetForm();
  };

  const handlePublish = async (year: AcademicYear) => {
    await updateYear.mutateAsync({ 
      id: year.id, 
      is_active: true 
    });
  };

  const handleArchive = async (year: AcademicYear) => {
    await updateYear.mutateAsync({ 
      id: year.id, 
      is_active: false 
    });
  };

  const getYearStatus = (year: AcademicYear): 'draft' | 'published' | 'archived' => {
    const now = new Date();
    const endDate = new Date(year.end_date);
    
    if (endDate < now && !year.is_active) return 'archived';
    if (year.is_active) return 'published';
    return 'draft';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary"><Archive className="h-3 w-3 mr-1" />Archived</Badge>;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    return differenceInDays(parseISO(endDate), parseISO(startDate));
  };

  if (yearsLoading) {
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
            Academic Year Builder
          </h2>
          <p className="text-muted-foreground">
            Create and manage academic years with full lifecycle control
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Academic Year</DialogTitle>
              <DialogDescription>
                Define a new academic year with terms and key dates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Academic Year Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Academic Year 2025-2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_type">Year Structure</Label>
                <Select
                  value={formData.year_type}
                  onValueChange={(value: 'semester' | 'trimester' | 'quarter') => 
                    setFormData({ ...formData, year_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">Semester (2 terms)</SelectItem>
                    <SelectItem value="trimester">Trimester (3 terms)</SelectItem>
                    <SelectItem value="quarter">Quarter (4 terms)</SelectItem>
                  </SelectContent>
                </Select>
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

              {formData.start_date && formData.end_date && (
                <p className="text-sm text-muted-foreground">
                  Duration: {getDuration(formData.start_date, formData.end_date)} days
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createYear.isPending || !formData.name || !formData.start_date || !formData.end_date}
              >
                {createYear.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Year
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Academic Years List */}
      <div className="space-y-4">
        {years?.map((year) => {
          const status = getYearStatus(year);
          const yearTerms = terms?.filter(t => {
            const termStart = new Date(t.start_date);
            const yearStart = new Date(year.start_date);
            const yearEnd = new Date(year.end_date);
            return termStart >= yearStart && termStart <= yearEnd;
          });

          return (
            <Card key={year.id} className={status === 'published' ? "border-primary/50 bg-primary/5" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3">
                      {year.name}
                      {getStatusBadge(status)}
                    </CardTitle>
                    <CardDescription>
                      {format(parseISO(year.start_date), 'MMM d, yyyy')} - {format(parseISO(year.end_date), 'MMM d, yyyy')}
                      {' · '}
                      {year.year_type.charAt(0).toUpperCase() + year.year_type.slice(1)} System
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'draft' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublish(year)}
                        disabled={updateYear.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    {status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(year)}
                        disabled={updateYear.isPending}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="terms" className="border-none">
                    <AccordionTrigger className="py-2 text-sm">
                      Terms & Semesters ({yearTerms?.length || 0})
                    </AccordionTrigger>
                    <AccordionContent>
                      {yearTerms && yearTerms.length > 0 ? (
                        <div className="grid gap-2">
                          {yearTerms.map(term => (
                            <div 
                              key={term.id} 
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{term.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(parseISO(term.start_date), 'MMM d')} - {format(parseISO(term.end_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                              {term.is_active && (
                                <Badge className="bg-green-500">Active</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No terms configured for this academic year</p>
                          <Button variant="link" size="sm" className="mt-2">
                            Add Terms
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}

        {(!years || years.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No academic years configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "New Academic Year" to create your first academic year.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
