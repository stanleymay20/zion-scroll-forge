import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FN_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/verify-credential`;

export default function VerifyCredential() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ outcome: "error", message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  const valid = result?.outcome === "valid";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Helmet>
        <title>Verify Credential — ScrollUniversity</title>
        <meta name="description" content="Public, employer-facing verification of ScrollUniversity credentials. Enter a credential token to confirm authenticity." />
        <link rel="canonical" href="/verify" />
      </Helmet>
      <header className="text-center space-y-3">
        <ShieldCheck className="h-12 w-12 mx-auto text-primary" />
        <h1 className="font-serif text-4xl text-primary">Verify a Credential</h1>
        <p className="text-muted-foreground">
          Employers and registrars: paste any ScrollUniversity credential token below to confirm authenticity. Every check is logged.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Credential Token</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={verify} className="space-y-4">
            <Input
              placeholder="e.g. 8c1a9b3e-..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
            <Button type="submit" disabled={loading || !token.trim()} className="w-full">
              {loading ? "Verifying…" : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={valid ? "border-success" : "border-destructive"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {valid ? <CheckCircle2 className="text-success" /> : <XCircle className="text-destructive" />}
              {valid ? "Valid Credential" : "Not Found"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {valid ? (
              <>
                <p><strong>Holder:</strong> {result.verified_subject ?? "Confidential"}</p>
                <p><strong>Course:</strong> {result.course_title}</p>
                <p><strong>Type:</strong> <Badge variant="secondary">{result.credential_type}</Badge></p>
                <p><strong>Completion Date:</strong> {result.completion_date && new Date(result.completion_date).toLocaleDateString()}</p>
                <p><strong>Issued By:</strong> {result.issued_by}</p>
                <p className="text-xs text-muted-foreground pt-2">Verified at {result.verified_at}</p>
              </>
            ) : (
              <p>This token does not match any issued ScrollUniversity credential. The attempt has been logged.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
