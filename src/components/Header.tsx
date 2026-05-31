import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/healthstar-logo.png";

const ENROLLMENT_LINK = "/pre-qualification";
const PORTAL_LOGIN_LINK = "/portal/teach/login";

const navLinks = [
  { name: "Home", path: "/" },
  { 
    name: "About Us", 
    path: "/about",
    submenu: [
      { name: "About Health Star Academy", path: "/about" },
      { name: "Locations", path: "/locations" },
      { name: "Careers", path: "/careers" },
    ]
  },
  { 
    name: "CNA Program", 
    path: "/programs",
    submenu: [
      { name: "Program Overview", path: "/programs" },
      { name: "Cohorts & Pricing", path: "/programs/cohorts" },
      { name: "Admissions", path: "/programs/admissions" },
      { name: "State Exam Prep", path: "/programs/exam-prep" },
      { name: "Community Resources", path: "/community-resources" },
    ]
  },
  { name: "Blog", path: "/blog" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
    setOpenSubmenu(null);
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
              <div key={link.path} className="relative group">
                {link.submenu ? (
                  <>
                    <button
                      className={cn(
                        "font-body text-sm font-medium transition-colors relative flex items-center gap-1",
                        isActivePath(link.path)
                          ? "text-purple"
                          : "text-charcoal hover:text-purple"
                      )}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4" />
                      {isActivePath(link.path) && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple rounded-full" />
                      )}
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-background rounded-lg shadow-medium border border-border py-2 min-w-[180px]">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.path}
                            to={sublink.path}
                            className={cn(
                              "block px-4 py-2 text-sm transition-colors",
                              location.pathname === sublink.path
                                ? "text-purple bg-purple/5"
                                : "text-charcoal hover:text-purple hover:bg-purple/5"
                            )}
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
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
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="secondary" asChild>
              <Link to={ENROLLMENT_LINK}>Enroll Now</Link>
            </Button>
            <Button variant="gray-outline" asChild>
              <a href={PORTAL_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                LMS Portal
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
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <div key={link.path}>
                    {link.submenu ? (
                      <>
                        <button
                          onClick={() => setOpenSubmenu(openSubmenu === link.path ? null : link.path)}
                          className={cn(
                            "w-full font-body text-base font-medium py-2 transition-colors flex items-center justify-between",
                            isActivePath(link.path)
                              ? "text-purple"
                              : "text-charcoal hover:text-purple"
                          )}
                        >
                          {link.name}
                          <ChevronDown className={cn("h-4 w-4 transition-transform", openSubmenu === link.path && "rotate-180")} />
                        </button>
                        {openSubmenu === link.path && (
                          <div className="pl-4 border-l-2 border-purple/20 ml-2">
                            {link.submenu.map((sublink) => (
                              <Link
                                key={sublink.path}
                                to={sublink.path}
                                className={cn(
                                  "block py-2 text-sm transition-colors",
                                  location.pathname === sublink.path
                                    ? "text-purple"
                                    : "text-gray-dark hover:text-purple"
                                )}
                              >
                                {sublink.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={link.path}
                        className={cn(
                          "font-body text-base font-medium py-2 transition-colors block",
                          location.pathname === link.path
                            ? "text-purple"
                            : "text-charcoal hover:text-purple"
                        )}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button variant="secondary" asChild className="w-full">
                    <Link to={ENROLLMENT_LINK}>Enroll Now</Link>
                  </Button>
                  <Button variant="gray-outline" asChild className="w-full">
                    <a href={PORTAL_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                      LMS Portal
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
