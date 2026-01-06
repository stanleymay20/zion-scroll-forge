import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo - shrinks on mobile */}
        <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 min-w-0">
          <img src={scrollLogo} alt="ScrollUniversity logo" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
          <div className="hidden xs:block min-w-0">
            <p className="text-base sm:text-xl font-serif font-semibold text-primary truncate">ScrollUniversity</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-sans hidden sm:block">Veritas et Sapientia</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <a href="#faculties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Faculties
          </a>
          <AuthAwareLink to="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </AuthAwareLink>
          <a href="#prayer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Prayer Center
          </a>
          <a href="#scrollcoin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ScrollCoin
          </a>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-sans text-xs sm:text-sm px-2 sm:px-3">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?tab=signup&redirect=/apply">
            <Button variant="divine" size="sm" className="font-sans text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              Begin Journey
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-foreground hover:bg-accent rounded-md"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-background border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <a 
              href="#faculties" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Faculties
            </a>
            <AuthAwareLink 
              to="/courses" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </AuthAwareLink>
            <a 
              href="#prayer" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Prayer Center
            </a>
            <a 
              href="#scrollcoin" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              ScrollCoin
            </a>
            <div className="flex flex-col space-y-2 pt-3 border-t border-border">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full font-sans">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?tab=signup&redirect=/apply" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="divine" size="sm" className="w-full font-sans">
                  Begin Journey
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};