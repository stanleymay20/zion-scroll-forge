import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award, ExternalLink, Search, Handshake, Globe, Linkedin, MapPin,
  GraduationCap, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errors";

interface AlumniRow {
  id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  current_position: string | null;
  organization: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  primary_degree: string | null;
  graduation_year: number | null;
  available_for_mentorship: boolean;
  public_visibility: boolean;
  cert_number: string | null;
}

const EMPTY_FORM = {
  display_name: "",
  headline: "",
  bio: "",
  location: "",
  current_position: "",
  organization: "",
  linkedin_url: "",
  website_url: "",
  primary_degree: "",
  graduation_year: new Date().getFullYear(),
  available_for_mentorship: false,
  public_visibility: true,
};

export default function AlumniPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState<AlumniRow[]>([]);
  const [myProfile, setMyProfile] = useState<AlumniRow | null>(null);
  const [degreeCert, setDegreeCert] = useState<{ cert_number: string; program_name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [mentorshipOnly, setMentorshipOnly] = useState(false);

  async function refresh() {
    setLoading(true);
    const dirRes = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("public_visibility", true)
      .order("created_at", { ascending: false });
    setAlumni((dirRes.data ?? []) as AlumniRow[]);

    if (user?.id) {
      const [mineRes, certRes] = await Promise.all([
        supabase.from("alumni_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("certificate_verifications")
          .select("cert_number, program_name, issued_at")
          .eq("user_id", user.id)
          .eq("cert_type", "degree")
          .eq("revoked", false)
          .order("issued_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setMyProfile((mineRes.data as AlumniRow) ?? null);
      setDegreeCert((certRes.data as any) ?? null);
      if (mineRes.data) {
        const m = mineRes.data as AlumniRow;
        setForm({
          display_name: m.display_name ?? "",
          headline: m.headline ?? "",
          bio: m.bio ?? "",
          location: m.location ?? "",
          current_position: m.current_position ?? "",
          organization: m.organization ?? "",
          linkedin_url: m.linkedin_url ?? "",
          website_url: m.website_url ?? "",
          primary_degree: m.primary_degree ?? "",
          graduation_year: m.graduation_year ?? new Date().getFullYear(),
          available_for_mentorship: m.available_for_mentorship,
          public_visibility: m.public_visibility,
        });
      } else if (certRes.data) {
        const c = certRes.data as any;
        setForm((f) => ({
          ...f,
          primary_degree: c.program_name ?? "",
          graduation_year: new Date(c.issued_at).getFullYear(),
        }));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alumni.filter((a) => {
      if (mentorshipOnly && !a.available_for_mentorship) return false;
      if (!q) return true;
      return [
        a.display_name, a.headline, a.location, a.organization,
        a.current_position, a.primary_degree,
      ].some((v) => v?.toLowerCase().includes(q));
    });
  }, [alumni, search, mentorshipOnly]);

  async function saveProfile() {
    if (!user?.id) return;
    if (!form.display_name.trim()) {
      toast.error("Please enter your display name.");
      return;
    }
    setSaving(true);
    try {
      // Best-effort: graduated -> alumni transition (ignore if not eligible)
      try {
        await supabase.rpc("transition_student_status", {
          p_user_id: user.id,
          p_new_status: "alumni",
          p_reason: "Joined alumni network",
        });
      } catch { /* status not eligible — that's OK */ }

      const payload = {
        user_id: user.id,
        ...form,
        cert_number: degreeCert?.cert_number ?? myProfile?.cert_number ?? null,
      };
      const { error } = await supabase
        .from("alumni_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Welcome to the Alumni Network.");
      setEditing(false);
      await refresh();
    } catch (e: any) {
      toast.error("Could not save profile", { description: getUserFriendlyError(e) });
    } finally {
      setSaving(false);
    }
  }

  const canJoin = !!user && (!!degreeCert || !!myProfile);

  return (
    <PageTemplate
      title="Alumni Network"
      description="Verified ScrollUniversity graduates — connect, mentor, and stay rooted in the calling."
    >
      <div className="space-y-6">
        {/* Join / Manage card */}
        {user ? (
          canJoin ? (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {myProfile ? "Your Alumni Profile" : "Join the Alumni Network"}
                </CardTitle>
                <CardDescription>
                  {myProfile
                    ? "Update how fellow graduates and prospective students find you."
                    : `You earned ${degreeCert?.program_name}. Add yourself to the public directory.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editing ? (
                  <div className="space-y-3">
                    {myProfile && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{myProfile.display_name}</p>
                        {myProfile.headline && (
                          <p className="text-muted-foreground">{myProfile.headline}</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {myProfile.primary_degree && (
                            <Badge variant="secondary">{myProfile.primary_degree}</Badge>
                          )}
                          {myProfile.available_for_mentorship && (
                            <Badge variant="default">Mentor</Badge>
                          )}
                          {!myProfile.public_visibility && (
                            <Badge variant="outline">Private</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <Button onClick={() => setEditing(true)}>
                      {myProfile ? "Edit Profile" : "Create Alumni Profile"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Display Name *">
                      <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={120} />
                    </Field>
                    <Field label="Headline">
                      <Input placeholder="Founder & ScrollSeer" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={140} />
                    </Field>
                    <Field label="Current Role">
                      <Input value={form.current_position} onChange={(e) => setForm({ ...form, current_position: e.target.value })} maxLength={140} />
                    </Field>
                    <Field label="Organization">
                      <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} maxLength={140} />
                    </Field>
                    <Field label="Location">
                      <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} />
                    </Field>
                    <Field label="Primary Degree">
                      <Input value={form.primary_degree} onChange={(e) => setForm({ ...form, primary_degree: e.target.value })} maxLength={140} />
                    </Field>
                    <Field label="Graduation Year">
                      <Input type="number" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: Number(e.target.value) || 0 })} />
                    </Field>
                    <Field label="LinkedIn URL">
                      <Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} maxLength={300} />
                    </Field>
                    <Field label="Website">
                      <Input placeholder="https://…" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} maxLength={300} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Short Bio</Label>
                      <Textarea rows={3} maxLength={600} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                    </div>
                    <Toggle
                      label="Available to mentor current students"
                      checked={form.available_for_mentorship}
                      onChange={(v) => setForm({ ...form, available_for_mentorship: v })}
                    />
                    <Toggle
                      label="Show me in the public directory"
                      checked={form.public_visibility}
                      onChange={(v) => setForm({ ...form, public_visibility: v })}
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <Button onClick={saveProfile} disabled={saving}>
                        {saving ? "Saving…" : "Save Profile"}
                      </Button>
                      <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Not yet an alum
                </CardTitle>
                <CardDescription>
                  The alumni network is reserved for graduates who hold at least one verified ScrollUniversity degree.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/student-graduation">Go to Graduation Center</Link>
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                Sign in to join the alumni network or update your profile.
              </p>
              <Button asChild className="mt-3"><Link to="/auth">Sign in</Link></Button>
            </CardContent>
          </Card>
        )}

        {/* Search bar */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni by name, role, or degree…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Switch checked={mentorshipOnly} onCheckedChange={setMentorshipOnly} />
              <span>Mentors only</span>
            </label>
          </CardContent>
        </Card>

        {/* Directory */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No alumni match your search yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((a) => (
              <Card key={a.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg text-primary truncate">{a.display_name}</h3>
                      {a.headline && <p className="text-sm text-muted-foreground truncate">{a.headline}</p>}
                    </div>
                    {a.available_for_mentorship && (
                      <Badge className="shrink-0"><Handshake className="h-3 w-3 mr-1" /> Mentor</Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    {(a.current_position || a.organization) && (
                      <p>{[a.current_position, a.organization].filter(Boolean).join(" · ")}</p>
                    )}
                    {a.location && (
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.location}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {a.primary_degree && <Badge variant="secondary">{a.primary_degree}</Badge>}
                    {a.graduation_year && <Badge variant="outline">Class of {a.graduation_year}</Badge>}
                  </div>

                  {a.bio && <p className="text-xs text-foreground/80 line-clamp-3">{a.bio}</p>}

                  <div className="flex items-center gap-2 pt-1">
                    {a.linkedin_url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={a.linkedin_url} target="_blank" rel="noreferrer">
                          <Linkedin className="h-3 w-3 mr-1" /> LinkedIn
                        </a>
                      </Button>
                    )}
                    {a.website_url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={a.website_url} target="_blank" rel="noreferrer">
                          <Globe className="h-3 w-3 mr-1" /> Website
                        </a>
                      </Button>
                    )}
                    {a.cert_number && (
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/verify/${a.cert_number}`}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Verify
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm sm:col-span-1">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
