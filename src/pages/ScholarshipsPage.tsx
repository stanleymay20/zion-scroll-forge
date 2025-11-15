import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, DollarSign, Calendar, Users } from "lucide-react";

console.info("✝️ Scholarships — Christ governs provision");

const scholarships = [
  {
    id: "1",
    name: "Merit-Based Excellence Scholarship",
    amount: 5000,
    description: "Awarded to students with exceptional academic performance (GPA 3.5+)",
    deadline: "2025-03-31",
    requirements: [
      "Minimum GPA of 3.5",
      "Completed at least 2 courses",
      "Essay submission (500 words)",
      "Active community participation",
    ],
    availableSpots: 10,
    category: "Merit",
  },
  {
    id: "2",
    name: "Ministry Leadership Scholarship",
    amount: 3000,
    description: "Supporting students called to full-time ministry and theological studies",
    deadline: "2025-04-15",
    requirements: [
      "Demonstrated calling to ministry",
      "Letter of recommendation from pastor/mentor",
      "Personal testimony (1000 words)",
      "Enrolled in Theology program",
    ],
    availableSpots: 15,
    category: "Ministry",
  },
  {
    id: "3",
    name: "Financial Need Scholarship",
    amount: 2500,
    description: "Assisting students with demonstrated financial hardship",
    deadline: "2025-05-01",
    requirements: [
      "Financial documentation",
      "Essay on educational goals",
      "Minimum 2.5 GPA",
      "Active enrollment",
    ],
    availableSpots: 25,
    category: "Need-Based",
  },
  {
    id: "4",
    name: "Community Service Award",
    amount: 1500,
    description: "Recognizing students who actively serve their communities",
    deadline: "2025-06-01",
    requirements: [
      "Documentation of 50+ service hours",
      "Letter from community organization",
      "Reflection essay",
      "Good academic standing",
    ],
    availableSpots: 20,
    category: "Service",
  },
  {
    id: "5",
    name: "First-Generation Student Grant",
    amount: 3500,
    description: "Supporting first-generation college students in their educational journey",
    deadline: "2025-04-30",
    requirements: [
      "First in family to attend college",
      "Personal statement",
      "Academic transcript",
      "Financial need documentation",
    ],
    availableSpots: 12,
    category: "First-Gen",
  },
];

export default function ScholarshipsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedScholarship, setSelectedScholarship] = useState<typeof scholarships[0] | null>(null);
  const [essayText, setEssayText] = useState("");

  const applyForScholarship = useMutation({
    mutationFn: async (scholarshipId: string) => {
      toast({ title: "📝 Scholarship application submitted!" });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarship-applications"] });
      setSelectedScholarship(null);
      setEssayText("");
    },
  });

  return (
    <PageTemplate title="Scholarships" description="Financial aid opportunities for students">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Available Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{scholarships.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <p className="text-2xl font-bold">
                  {scholarships.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <p className="text-2xl font-bold">
                  {scholarships.reduce((sum, s) => sum + s.availableSpots, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Scholarships List */}
        <div className="grid gap-4 lg:grid-cols-2">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">{scholarship.category}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${scholarship.amount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{scholarship.description}</p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Requirements:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {scholarship.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(scholarship.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{scholarship.availableSpots} spots</span>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedScholarship(scholarship)}>
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Apply for {scholarship.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Essay (Required)</p>
                          <Textarea
                            value={essayText}
                            onChange={(e) => setEssayText(e.target.value)}
                            placeholder="Write your application essay here..."
                            className="min-h-[200px]"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended length: 500-1000 words
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => applyForScholarship.mutate(scholarship.id)}
                          disabled={!essayText.trim() || applyForScholarship.isPending}
                          className="w-full"
                        >
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Submit Application
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
}
