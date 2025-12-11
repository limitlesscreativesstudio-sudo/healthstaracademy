import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/healthstar-logo.png";

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";
const STUDENT_LOGIN_LINK = "https://b2b0c970-8c97-44e8-bc56-a029b47c90c1.iad.login.instructure.com/?goto=https%3A%2F%2Fb2b0c970-8c97-44e8-bc56-a029b47c90c1.iad.login.instructure.com%2Fam%2Foauth2%2Falpha%2Fauthorize%3Fauthentication_provider%3D79175795-479a-4154-8335-43264065b1fb%26client_id%3Dcanvas-prod-iad%26nonce%3D403e5a2755edd4c40c665dc5c3271f93250931b9c28e46f8%26org_id%3Db2b0c970-8c97-44e8-bc56-a029b47c90c1%26redirect_uri%3Dhttps%3A%2F%2Fsso.canvaslms.com%2Flogin%2Foauth2%2Fcallback%26response_type%3Dcode%26scope%3Dopenid%2520profile%26state%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhYWNfaWQiOjcwMDAwMDAwMDAxNzUyLCJub25jZSI6IjQwM2U1YTI3NTVlZGQ0YzQwYzY2NWRjNWMzMjcxZjkzMjUwOTMxYjljMjhlNDZmOCIsImhvc3QiOiJjYW52YXMuaW5zdHJ1Y3R1cmUuY29tIiwidGFyZ2V0X2F1dGhfcHJvdmlkZXIiOiI3OTE3NTc5NS00NzlhLTQxNTQtODMzNS00MzI2NDA2NWIxZmIiLCJleHAiOjE3NjM4MjU0NTB9.C78jiivDj07cmp0NG17KRNBokyS84zBVicCx-tJvOtg%26target_domain%3Dhttps%3A%2F%2Fcanvas.instructure.com&realm=/alpha";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "CNA Program", path: "/programs" },
  { name: "Admissions", path: "/programs/admissions" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActivePath = (path: string) => {
    if (path === "/programs") {
      return location.pathname === "/programs" || location.pathname.startsWith("/programs/");
    }
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        "fixed top-[40px] left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-background"
      )}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Health Star Academy Logo" 
              className="w-14 h-14 object-contain"
            />
            <span className="font-heading font-bold text-xl text-charcoal hidden sm:block">
              Health Star Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-body text-sm font-medium transition-colors relative",
                  location.pathname === link.path
                    ? "text-purple"
                    : "text-charcoal hover:text-purple"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="secondary" asChild>
              <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Enroll Now</a>
            </Button>
            <Button variant="gray-outline" asChild>
              <a href={STUDENT_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                Student Login
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-charcoal"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-background shadow-medium border-t border-border animate-fade-in">
            <div className="container-custom py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "font-body text-base font-medium py-2 transition-colors",
                      location.pathname === link.path
                        ? "text-purple"
                        : "text-charcoal hover:text-purple"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button variant="secondary" asChild className="w-full">
                    <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Enroll Now</a>
                  </Button>
                  <Button variant="gray-outline" asChild className="w-full">
                    <a href={STUDENT_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                      Student Login
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;