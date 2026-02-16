import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  imageSrc: string;
  imageAlt: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}

const HeroBanner = forwardRef<HTMLElement, HeroBannerProps>(
  ({ imageSrc, imageAlt, title, subtitle, className }, ref) => {
    return (
      <section ref={ref} className={cn("relative w-full", className)}>
        {/* 16:9 Aspect Ratio Container */}
        <div className="relative w-full aspect-[16/9] max-h-[60vh] overflow-hidden">
          <div className="absolute inset-0 flex">
            {/* Image Side - Left Half */}
            <div className="w-1/2 h-full relative">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {/* Gradient Side - Right Half */}
            <div className="w-1/2 h-full bg-gradient-to-br from-purple via-purple/90 to-magenta flex items-center justify-center">
              <div className="text-center px-6 md:px-12">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 md:mb-4 animate-fade-in-up uppercase tracking-wide leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-primary-foreground/90 text-sm sm:text-base md:text-lg animate-fade-in-up animation-delay-100">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

HeroBanner.displayName = "HeroBanner";

export default HeroBanner;
