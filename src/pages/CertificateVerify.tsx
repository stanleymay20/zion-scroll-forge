import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";

interface CertRecord {
  cert_number: string;
  cert_type: string;
  program_name: string;
  student_name: string;
  student_id_code: string | null;
  issued_at: string;
  seal_hash: string;
  revoked: boolean;
  revoked_reason: string | null;
}

export default function CertificateVerify() {
  const { certNumber } = useParams<{ certNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertRecord | null>(null);

  useEffect(() => {
    (async () => {
      if (!certNumber) return;
      const { data } = await supabase
        .from("certificate_verifications")
        .select("cert_number,cert_type,program_name,student_name,student_id_code,issued_at,seal_hash,revoked,revoked_reason")
        .eq("cert_number", certNumber)
        .maybeSingle();
      setCert(data as CertRecord | null);
      setLoading(false);
    })();
  }, [certNumber]);

  const valid = cert && !cert.revoked;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <Helmet>
        <title>{`Verify ${certNumber} — ScrollUniversity`}</title>
        <meta name="description" content={`Public verification of ScrollUniversity certificate ${certNumber}.`} />
        <link rel="canonical" href={`/verify/${certNumber}`} />
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Link>
        </Button>

        <header className="text-center space-y-3">
          <ShieldCheck className="h-12 w-12 mx-auto text-primary" />
          <h1 className="font-serif text-3xl text-primary">Certificate Verification</h1>
          <p className="text-sm text-muted-foreground font-mono">{certNumber}</p>
        </header>

        {loading ? (
          <Card><CardContent className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>
        ) : !cert ? (
          <Card className="border-destructive">
            <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="text-destructive" /> Not Found</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No certificate matching <strong>{certNumber}</strong> was found in the ScrollUniversity registry.
            </CardContent>
          </Card>
        ) : (
          <Card className={valid ? "border-green-500/40" : "border-destructive"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {valid ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-destructive" />}
                {valid ? "Verified Certificate" : "Revoked Certificate"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Holder" value={cert.student_name} />
              {cert.student_id_code && <Row label="Student ID" value={cert.student_id_code} />}
              <Row label="Program" value={cert.program_name} />
              <Row label="Type" value={<Badge variant="secondary" className="capitalize">{cert.cert_type}</Badge>} />
              <Row label="Issued" value={new Date(cert.issued_at).toLocaleDateString()} />
              <Row label="Issued By" value="ScrollUniversity" />
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Seal hash</p>
                <p className="text-xs font-mono break-all">{cert.seal_hash}</p>
              </div>
              {cert.revoked && cert.revoked_reason && (
                <p className="text-destructive text-xs pt-2">Revocation reason: {cert.revoked_reason}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
