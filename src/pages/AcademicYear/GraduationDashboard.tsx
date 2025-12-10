import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  GraduationCap, 
  Users, 
  CheckCircle, 
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useGraduationCandidates, useAcademicYears } from '@/hooks/useAcademicYear';
import { GraduationChecklist } from '@/components/AcademicYear/GraduationChecklist';
import { useUserRoles } from '@/hooks/useUserRoles';
import { format, parseISO } from 'date-fns';

const GraduationDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isStudent } = useUserRoles();
  const { data: candidates = [], isLoading } = useGraduationCandidates();
  const { data: academicYears = [] } = useAcademicYears();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCandidates = candidates.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    pending: candidates.filter((c) => c.status === 'pending').length,
    approved: candidates.filter((c) => c.status === 'approved').length,
    graduated: candidates.filter((c) => c.status === 'graduated').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'graduated':
        return <Badge className="bg-primary/10 text-primary"><GraduationCap className="h-3 w-3 mr-1" /> Graduated</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'deferred':
        return <Badge variant="secondary">Deferred</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/academic-year')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-primary" />
              Graduation Management
            </h1>
            <p className="text-muted-foreground">Track and manage graduation eligibility</p>
          </div>
        </div>
      </div>

      {/* Stats for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.graduated}</p>
                  <p className="text-sm text-muted-foreground">Graduated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={isStudent ? 'my-status' : 'candidates'} className="space-y-6">
        <TabsList>
          {isStudent && (
            <TabsTrigger value="my-status" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              My Status
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="candidates" className="gap-2">
              <Users className="h-4 w-4" />
              All Candidates
            </TabsTrigger>
          )}
        </TabsList>

        {isStudent && (
          <TabsContent value="my-status">
            <GraduationChecklist />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Graduation Candidates</CardTitle>
                    <CardDescription>Review and manage graduation applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search candidates..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Badges */}
                <div className="flex gap-2 mb-4">
                  {['all', 'pending', 'approved', 'graduated', 'denied'].map((status) => (
                    <Badge
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  ))}
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No graduation candidates found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCandidates.map((candidate) => (
                      <div 
                        key={candidate.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">Student ID: {candidate.user_id.slice(0, 8)}...</p>
                            {getStatusBadge(candidate.status)}
                          </div>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Applied: {format(parseISO(candidate.application_date), 'MMM d, yyyy')}</span>
                            {candidate.expected_graduation_date && (
                              <span>Expected: {format(parseISO(candidate.expected_graduation_date), 'MMM yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div className="flex gap-2">
                              {candidate.gpa_requirement_met && <Badge variant="outline" className="text-xs">GPA ✓</Badge>}
                              {candidate.credits_requirement_met && <Badge variant="outline" className="text-xs">Credits ✓</Badge>}
                              {candidate.capstone_completed && <Badge variant="outline" className="text-xs">Capstone ✓</Badge>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default GraduationDashboard;
