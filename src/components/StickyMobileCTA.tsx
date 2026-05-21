import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn } from "lucide-react";

const ENROLLMENT_LINK = "/pre-qualification";
const STUDENT_LOGIN_LINK = "/portal/login";

const StickyMobileCTA = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-2px_rgba(100,80,150,0.15)] p-3">
      <div className="flex gap-3 max-w-lg mx-auto">
        <Button variant="secondary" size="default" asChild className="flex-1">
          <Link to={ENROLLMENT_LINK}>
            <GraduationCap className="h-4 w-4" />
            Enroll Now
          </Link>
        </Button>
        <Button variant="gray-outline" size="default" asChild className="flex-1">
          <Link to={STUDENT_LOGIN_LINK}>
            <LogIn className="h-4 w-4" />
            Student Portal
          </Link>
        </Button>
      </div>
    </div>
  );
});

StickyMobileCTA.displayName = "StickyMobileCTA";

export default StickyMobileCTA;
