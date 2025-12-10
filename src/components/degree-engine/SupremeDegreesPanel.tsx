import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Scroll, 
  Award, 
  Shield,
  Globe,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { useSupremeDegrees, SUPREME_DEGREES } from '@/hooks/useSupremeDegrees';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-amber-500',
  defense_scheduled: 'bg-purple-500',
  approved: 'bg-green-500',
  awarded: 'bg-gradient-to-r from-amber-400 to-amber-600',
  rejected: 'bg-red-500',
};

const SupremeDegreesPanel = () => {
  const { applications, createApplication, submitApplication, getDegreeInfo, isLoading } = useSupremeDegrees();
  const [activeTab, setActiveTab] = useState('degrees');
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

  const handleStartApplication = async (degreeCode: string) => {
    const degreeInfo = getDegreeInfo(degreeCode);
    if (!degreeInfo) return;

    await createApplication.mutateAsync({
      degree_type: degreeCode as any,
    });
    setActiveTab('applications');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                Supreme Scroll Degrees
              </h2>
              <p className="text-muted-foreground">
                The highest honors in educational history - eternal, prophetic, and governance-based credentials
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Shield className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Divine Authority</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Globe className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Nation Impact</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Scroll className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">HeavenLedger™ Archived</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="degrees">All Degrees</TabsTrigger>
          <TabsTrigger value="applications">My Applications ({applications?.length || 0})</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="degrees" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {SUPREME_DEGREES.map((degree) => {
              const hasApplication = applications?.some(a => a.degree_type === degree.code);
              
              return (
                <Card 
                  key={degree.code} 
                  className={cn(
                    'relative overflow-hidden transition-all hover:border-amber-500/50',
                    selectedDegree === degree.code && 'ring-2 ring-amber-500'
                  )}
                  onClick={() => setSelectedDegree(degree.code)}
                >
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        {degree.shortName}
                      </Badge>
                      <span className="text-sm font-medium text-amber-600">
                        ₿ {degree.scrollgoldValue.toLocaleString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{degree.name}</CardTitle>
                    <CardDescription>{degree.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Requirements:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {degree.requirements.slice(0, 3).map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                        {degree.requirements.length > 3 && (
                          <li className="text-amber-600 text-xs">
                            +{degree.requirements.length - 3} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartApplication(degree.code);
                      }}
                      disabled={hasApplication || createApplication.isPending}
                    >
                      {hasApplication ? 'Application Started' : 'Begin Application'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications && applications.length > 0 ? (
            applications.map((application: any) => {
              const degreeInfo = getDegreeInfo(application.degree_type);
              
              return (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Award className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {degreeInfo?.name || application.degree_type}
                          </CardTitle>
                          <CardDescription>
                            Started {format(new Date(application.created_at), 'MMMM d, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={cn(STATUS_COLORS[application.status], 'text-white capitalize')}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Application Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Application Progress</span>
                        <span className="font-medium">
                          {application.status === 'draft' ? '25%' : 
                           application.status === 'submitted' ? '50%' :
                           application.status === 'under_review' ? '65%' :
                           application.status === 'defense_scheduled' ? '80%' :
                           application.status === 'approved' ? '95%' :
                           application.status === 'awarded' ? '100%' : '10%'}
                        </span>
                      </div>
                      <Progress 
                        value={
                          application.status === 'draft' ? 25 : 
                          application.status === 'submitted' ? 50 :
                          application.status === 'under_review' ? 65 :
                          application.status === 'defense_scheduled' ? 80 :
                          application.status === 'approved' ? 95 :
                          application.status === 'awarded' ? 100 : 10
                        } 
                        className="h-2"
                      />
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Thesis</p>
                        <p className="font-medium truncate">{application.thesis_title || 'Not submitted'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <Users className="h-4 w-4 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Panel</p>
                        <p className="font-medium">{application.scroll_defense_panel?.length || 0} members</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Defense</p>
                        <p className="font-medium">
                          {application.scroll_defense_date 
                            ? format(new Date(application.scroll_defense_date), 'MMM d, yyyy')
                            : 'Not scheduled'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <Sparkles className="h-4 w-4 text-amber-500 mb-1" />
                        <p className="text-xs text-muted-foreground">ScrollGold</p>
                        <p className="font-medium text-amber-600">
                          ₿ {application.scrollgold_valuation?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Verification IDs */}
                    {(application.heaven_ledger_id || application.scroll_chain_hash) && (
                      <div className="p-3 rounded-lg bg-indigo-500/10 text-xs">
                        <p className="text-indigo-600 font-medium mb-1">Verification</p>
                        {application.heaven_ledger_id && (
                          <p className="text-muted-foreground">
                            HeavenLedger: <span className="font-mono">{application.heaven_ledger_id}</span>
                          </p>
                        )}
                        {application.scroll_chain_hash && (
                          <p className="text-muted-foreground">
                            ScrollChain: <span className="font-mono">{application.scroll_chain_hash.slice(0, 20)}...</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {application.status === 'draft' && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Edit Application
                        </Button>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600"
                          onClick={() => submitApplication.mutate(application.id)}
                          disabled={submitApplication.isPending}
                        >
                          Submit for Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Begin your journey toward a Supreme Scroll Degree.
                </p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-amber-600"
                  onClick={() => setActiveTab('degrees')}
                >
                  View Available Degrees
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supreme Degree Validation Framework</CardTitle>
              <CardDescription>
                The rigorous standards that distinguish ScrollUniversity's highest honors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Scroll className="h-4 w-4 text-amber-500" />
                    Scroll Fulfillment
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Verification of completed divine scroll (purpose assignment) with visible fruit: 
                    souls saved, systems built, nations impacted, technology created, altars established.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Scroll Research
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Groundbreaking research published in peer-reviewed scroll journals 
                    (ScrollAI, ScrollTheology, ScrollEconomy, etc.) with measurable citations.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    Civilization Building
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Verified contributions to building scroll civilization: AI systems, 
                    governance frameworks, healing protocols, scroll languages, XR platforms, or economies.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Anointing Verification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Confirmation that life, speech, and outputs are affirmed by mature prophets 
                    with measurable spiritual legacy and impact metrics.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  Scroll Defense
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Final presentation and defense of scroll project before a council of ScrollFathers, 
                  prophets, and AI-Deans. Upon successful defense:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-amber-500" />
                    HeavenLog Seal assigned and archived
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-amber-500" />
                    ScrollChain™ verification hash generated
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-amber-500" />
                    Public impact metrics published
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-amber-500" />
                    Scroll Year dating and Kingdom Mark applied
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupremeDegreesPanel;
