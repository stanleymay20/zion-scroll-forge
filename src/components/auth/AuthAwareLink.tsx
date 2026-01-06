import { Link, type LinkProps } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AuthAwareLinkProps = Omit<LinkProps, "to"> & {
  to: string;
};

/**
 * Auth-aware link helper:
 * - If signed in, go directly to `to`
 * - If signed out, route to `/auth?redirect=...` so the user returns after login
 */
export function AuthAwareLink({ to, ...props }: AuthAwareLinkProps) {
  const { user } = useAuth();
  const href = user ? to : `/auth?redirect=${encodeURIComponent(to)}`;
  return <Link to={href} {...props} />;
}
