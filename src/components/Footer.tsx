import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-primary-foreground">
      {/* Final CTA Band */}
      <div className="gradient-hero py-12">
        <div className="container-custom text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Caring Career?
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
            Take the first step toward a meaningful career in healthcare. We're here to guide you every step of the way.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/admissions">
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">H</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary-foreground">
                HealthStar Academy
              </span>
            </Link>
            <p className="text-gray-medium text-sm leading-relaxed mb-6">
              Empowering the next generation of compassionate healthcare professionals through expert training and dedicated support.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-teal transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-teal transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-teal transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-primary-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "CNA Program", path: "/programs" },
                { name: "Admissions", path: "/admissions" },
                { name: "Success Stories", path: "/success-stories" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-medium hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-primary-foreground">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-medium text-sm">
                  1234 Healthcare Blvd, Suite 100<br />
                  City, State 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-teal flex-shrink-0" />
                <a
                  href="tel:5551234325"
                  className="text-gray-medium hover:text-primary-foreground transition-colors text-sm"
                >
                  (555) 123-HEAL
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal flex-shrink-0" />
                <a
                  href="mailto:info@healthstaracademy.com"
                  className="text-gray-medium hover:text-primary-foreground transition-colors text-sm"
                >
                  info@healthstaracademy.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-medium text-sm">
                  Mon-Fri: 9am-6pm<br />
                  Sat: 10am-2pm
                </span>
              </li>
            </ul>
          </div>

          {/* Accreditation */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-primary-foreground">
              Accreditation
            </h3>
            <p className="text-gray-medium text-sm mb-4">
              HealthStar Academy is a state-approved nursing assistant training program.
            </p>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-xs text-gray-medium">
                Licensed by the State Board of Health Education
              </p>
              <p className="text-xs text-gray-medium mt-2">
                Approved for clinical training partnerships
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-medium text-sm">
            © {currentYear} HealthStar Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="#"
              className="text-gray-medium hover:text-primary-foreground transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-gray-medium hover:text-primary-foreground transition-colors text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
