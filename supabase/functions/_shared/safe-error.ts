/**
 * Shared structured error response helper for ScrollUniversity edge functions.
 *
 * Returns a JSON shape that the client-side parser in src/lib/errors.ts
 * recognizes:
 *   { ok: false, error: { code, message } }
 *
 * Usage:
 *   try { ... }
 *   catch (e) { return safeError(e, "GENERATION_FAILED", "We couldn't generate your content. Please try again.", corsHeaders); }
 */

export type SafeErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "DUPLICATE"
  | "RATE_LIMIT"
  | "EDGE_FUNCTION"
  | "STORAGE"
  | "NETWORK"
  | "UNKNOWN"
  | string;

export interface SafeErrorBody {
  ok: false;
  error: {
    code: SafeErrorCode;
    message: string;
  };
}

export function safeError(
  error: unknown,
  code: SafeErrorCode,
  userMessage: string,
  corsHeaders: Record<string, string> = {},
  status = 400,
): Response {
  // Always log the raw detail server-side
  // eslint-disable-next-line no-console
  console.error(`[edge:${code}]`, error);

  const body: SafeErrorBody = {
    ok: false,
    error: { code, message: userMessage },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function safeOk<T>(
  data: T,
  corsHeaders: Record<string, string> = {},
  status = 200,
): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
