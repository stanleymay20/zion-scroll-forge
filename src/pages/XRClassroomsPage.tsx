import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, ExternalLink, Calendar } from "lucide-react";
import { useXRClassrooms } from "@/hooks/useXRClassrooms";
import { format } from "date-fns";

console.info("✝️ XR Classrooms — Immersive learning");

export default function XRClassroomsPage() {
  const { data: rooms, isLoading } = useXRClassrooms();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="XR Classrooms"
      description="Immersive virtual learning environments for Kingdom education"
    >
      {!rooms || rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No XR classrooms available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                        {room.title}
                      </CardTitle>
                      <Badge variant="secondary">Virtual</Badge>
                    </div>
                    <CardDescription>
                      {room.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {room.scheduled_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(room.scheduled_time), 'PPp')}</span>
                  </div>
                )}
                {room.room_url && (
                  <Button
                    className="w-full"
                    onClick={() => window.open(room.room_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageTemplate>
  );
}
