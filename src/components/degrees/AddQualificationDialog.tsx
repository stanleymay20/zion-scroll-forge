import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddQualification } from "@/hooks/useStudentQualifications";
import { PlusCircle, Loader2 } from "lucide-react";

interface AddQualificationDialogProps {
  trigger?: React.ReactNode;
}

export function AddQualificationDialog({ trigger }: AddQualificationDialogProps) {
  const [open, setOpen] = useState(false);
  const addQualification = useAddQualification();
  
  const [formData, setFormData] = useState({
    qualification_type: 'external_degree' as const,
    qualification_name: '',
    level: '',
    institution_name: '',
    field_of_study: '',
    graduation_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addQualification.mutateAsync({
      ...formData,
      graduation_date: formData.graduation_date || undefined,
      institution_name: formData.institution_name || undefined,
      field_of_study: formData.field_of_study || undefined
    });
    
    setOpen(false);
    setFormData({
      qualification_type: 'external_degree',
      qualification_name: '',
      level: '',
      institution_name: '',
      field_of_study: '',
      graduation_date: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Qualification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Prior Qualification</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qualification_type">Qualification Type</Label>
            <Select
              value={formData.qualification_type}
              onValueChange={(v) => setFormData(prev => ({ ...prev, qualification_type: v as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external_degree">External Degree</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(v) => setFormData(prev => ({ ...prev, level: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="diploma">Diploma / Associate</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate / PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification_name">Qualification Name</Label>
            <Input
              id="qualification_name"
              placeholder="e.g., Bachelor of Science in Computer Science"
              value={formData.qualification_name}
              onChange={(e) => setFormData(prev => ({ ...prev, qualification_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution_name">Institution Name</Label>
            <Input
              id="institution_name"
              placeholder="e.g., University of Oxford"
              value={formData.institution_name}
              onChange={(e) => setFormData(prev => ({ ...prev, institution_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of Study</Label>
            <Input
              id="field_of_study"
              placeholder="e.g., Computer Science"
              value={formData.field_of_study}
              onChange={(e) => setFormData(prev => ({ ...prev, field_of_study: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduation_date">Graduation Date</Label>
            <Input
              id="graduation_date"
              type="date"
              value={formData.graduation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, graduation_date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addQualification.isPending}>
              {addQualification.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Qualification
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
