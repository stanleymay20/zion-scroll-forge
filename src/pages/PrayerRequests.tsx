import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useSubmitPrayer, usePrayerJournal, useUpdatePrayerStatus } from "@/hooks/useSpiritual";

export default function PrayerRequests() {
  const [prayerText, setPrayerText] = useState("");
  const submitPrayer = useSubmitPrayer();
  const { data: prayers, isLoading } = usePrayerJournal();
  const updateStatus = useUpdatePrayerStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    
    await submitPrayer.mutateAsync(prayerText);
    setPrayerText("");
  };

  const handleStatusChange = async (prayerId: string, status: 'open' | 'answered' | 'in_progress') => {
    await updateStatus.mutateAsync({ prayerId, status });
  };

  return (
    <PageTemplate
      title="Prayer Center"
      description="Submit prayer requests and track answered prayers"
      actions={
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Heart className="h-3 w-3 mr-1" />
            {prayers?.length || 0} Total Prayers
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Prayer Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Submit Prayer Request</span>
              </CardTitle>
              <CardDescription>
                Share your prayer needs with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Type your prayer request here..."
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  className="min-h-[150px]"
                  disabled={submitPrayer.isPending}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!prayerText.trim() || submitPrayer.isPending}
                >
                  {submitPrayer.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Prayer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Prayer Journal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Prayer Journal</CardTitle>
              <CardDescription>Track and celebrate answered prayers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : prayers && prayers.length > 0 ? (
                <div className="space-y-4">
                  {prayers.map((prayer: any) => (
                    <div key={prayer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm flex-1">{prayer.request}</p>
                        <Badge 
                          variant={
                            prayer.status === 'answered' ? 'default' : 
                            prayer.status === 'in_progress' ? 'secondary' : 
                            'outline'
                          }
                          className="ml-2"
                        >
                          {prayer.status === 'answered' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {prayer.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                          {prayer.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(prayer.created_at).toLocaleDateString()}</span>
                        <Select
                          value={prayer.status}
                          onValueChange={(value) => handleStatusChange(prayer.id, value as any)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prayer requests yet</p>
                  <p className="text-sm mt-2">Submit your first prayer to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
