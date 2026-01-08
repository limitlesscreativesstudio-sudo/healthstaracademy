import { Phone, Mail, MapPin } from "lucide-react";
import { Facebook, Instagram } from "lucide-react";

const TopInfoBar = () => {
  return (
    <div className="bg-charcoal text-primary-foreground py-2 text-sm">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a 
              href="tel:2093234169" 
              className="flex items-center gap-2 hover:text-cyan transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>(209) 323-4169</span>
            </a>
            <a 
              href="tel:9162088097" 
              className="flex items-center gap-2 hover:text-cyan transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">(916) 208-8097</span>
            </a>
            <a 
              href="mailto:info@healthstaracademy.org" 
              className="flex items-center gap-2 hover:text-cyan transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">info@healthstaracademy.org</span>
              <span className="md:hidden">Email Us</span>
            </a>
            <div className="hidden lg:flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>5250 Claremont Ave, Suite 127, Stockton, CA</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/healthstaracademy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a 
              href="https://www.instagram.com/healthstaracademy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;
