import { Phone, Mail, MapPin } from "lucide-react";

const TopInfoBar = () => {
  return (
    <div className="bg-charcoal text-primary-foreground py-2 text-sm">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a 
              href="tel:2093234169" 
              className="flex items-center gap-2 hover:text-cyan transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>(209) 323-4169</span>
            </a>
            <a 
              href="mailto:healthstaracademy@gmail.com" 
              className="flex items-center gap-2 hover:text-cyan transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">healthstaracademy@gmail.com</span>
              <span className="md:hidden">Email Us</span>
            </a>
            <div className="hidden lg:flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>5250 Claremont Ave, Suite 127, Stockton, CA</span>
            </div>
          </div>
          <div className="hidden sm:block text-primary-foreground/80">
            Training Sites: Stockton | Lodi | Hayward
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;
