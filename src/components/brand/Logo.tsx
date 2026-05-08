import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { img: string; title: string; sub: string }> = {
  sm: { img: "h-8 w-8", title: "text-base", sub: "text-[8px]" },
  md: { img: "h-10 w-10", title: "text-lg", sub: "text-[9px]" },
  lg: { img: "h-12 w-12", title: "text-xl", sub: "text-[10px]" },
  xl: { img: "h-16 w-16", title: "text-2xl", sub: "text-[11px]" },
};

interface LogoProps {
  size?: Size;
  to?: string | null;
  showWordmark?: boolean;
  className?: string;
  glow?: boolean;
}

export const Logo = ({
  size = "md",
  to = "/",
  showWordmark = true,
  className,
  glow = false,
}: LogoProps) => {
  const s = sizeMap[size];
  const inner = (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className="relative flex-shrink-0">
        {glow && (
          <div className="absolute inset-0 rounded-full blur-md opacity-60 bg-accent/30 pointer-events-none" />
        )}
        <img
          src={scrollLogo}
          alt="ScrollUniversity"
          className={cn(
            "relative object-contain transition-transform duration-300 group-hover:scale-105",
            s.img
          )}
          loading="eager"
          decoding="async"
        />
      </div>
      {showWordmark && (
        <div className="hidden xs:block leading-none">
          <p
            className={cn(
              "font-serif font-bold text-primary tracking-tight leading-none",
              s.title
            )}
          >
            ScrollUniversity
          </p>
          <p
            className={cn(
              "text-accent font-sans tracking-[0.25em] uppercase mt-1 font-semibold",
              s.sub
            )}
          >
            Veritas · Sapientia
          </p>
        </div>
      )}
    </div>
  );
  if (!to) return inner;
  return (
    <Link to={to} aria-label="ScrollUniversity home" className="flex-shrink-0">
      {inner}
    </Link>
  );
};
