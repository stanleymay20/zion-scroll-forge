import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";

const footerLinks = [
  {
    title: "Academics",
    links: [
      { label: "Course Catalog", href: "/courses" },
      { label: "Faculties", href: "/faculties" },
      { label: "Degree Programs", href: "/degrees" },
      { label: "ScrollLibrary", href: "/scroll-library" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Prayer Center", href: "/prayer-requests" },
      { label: "Testimonies", href: "/testimonies" },
      { label: "Study Groups", href: "/study-groups" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Institution",
    links: [
      { label: "Academic Integrity", href: "/academic-integrity" },
      { label: "Trust Center", href: "/trust" },
      { label: "Apply", href: "/apply" },
      { label: "Alumni Portal", href: "/alumni" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={scrollLogo} alt="ScrollUniversity" className="h-8 w-8" />
              <span className="font-serif font-bold text-primary text-sm">ScrollUniversity</span>
            </Link>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed max-w-[200px]">
              The Transcendent AI University. Kingdom-aligned education for global transformation.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-sans font-semibold tracking-wider uppercase text-primary mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground font-sans">
            © {new Date().getFullYear()} ScrollUniversity. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground font-sans flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-accent inline" /> for the Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
};
