import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { Menu, X, BookOpen, GraduationCap, Heart, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Faculties", href: "#faculties", icon: GraduationCap },
    { label: "Courses", href: "/courses", isRoute: true, icon: BookOpen },
    { label: "Degrees", href: "/degrees", isRoute: true, icon: Shield },
    { label: "Prayer", href: "#prayer", icon: Heart },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-60 bg-accent/30"}`} />
            <img
              src={scrollLogo}
              alt="ScrollUniversity"
              className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="hidden xs:block">
            <p className="text-lg font-serif font-bold text-primary leading-none tracking-tight">
              ScrollUniversity
            </p>
            <p className="text-[9px] text-accent font-sans tracking-[0.25em] uppercase mt-1 font-semibold">
              Veritas · Sapientia
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.isRoute ? (
              <AuthAwareLink
                key={link.label}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </AuthAwareLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-sans text-sm">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?tab=signup&redirect=/apply">
            <Button size="sm" className="font-sans text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2.5 text-foreground hover:bg-accent/50 rounded-lg transition-colors touch-target"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu — slide down */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-background/98 backdrop-blur-lg border-t border-border/50">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const El = link.isRoute ? AuthAwareLink : "a";
              const props = link.isRoute
                ? { to: link.href, onClick: () => setMobileMenuOpen(false) }
                : { href: link.href, onClick: () => setMobileMenuOpen(false) };
              return (
                <El
                  key={link.label}
                  {...(props as any)}
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary py-3 px-3 rounded-lg hover:bg-primary/5 transition-colors touch-target"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </El>
              );
            })}
            <div className="flex gap-2 pt-3 mt-2 border-t border-border/50">
              <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full font-sans">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?tab=signup&redirect=/apply" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full font-sans">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
