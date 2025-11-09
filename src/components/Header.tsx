import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import scrollLogo from "@/assets/scroll-university-logo.png";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={scrollLogo} alt="ScrollUniversity Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-serif font-semibold text-primary">ScrollUniversity</h1>
            <p className="text-xs text-muted-foreground font-sans">Veritas et Sapientia</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#faculties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Faculties
          </a>
          <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          <a href="#prayer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Prayer Center
          </a>
          <a href="#scrollcoin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ScrollCoin
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-sans">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?tab=signup&redirect=/apply">
            <Button variant="divine" size="sm" className="font-sans">
              Begin Journey
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};