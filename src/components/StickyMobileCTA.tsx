import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn } from "lucide-react";

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";
const STUDENT_LOGIN_LINK = "https://b2b0c970-8c97-44e8-bc56-a029b47c90c1.iad.login.instructure.com/?goto=https%3A%2F%2Fb2b0c970-8c97-44e8-bc56-a029b47c90c1.iad.login.instructure.com%2Fam%2Foauth2%2Falpha%2Fauthorize%3Fauthentication_provider%3D79175795-479a-4154-8335-43264065b1fb%26client_id%3Dcanvas-prod-iad%26nonce%3D403e5a2755edd4c40c665dc5c3271f93250931b9c28e46f8%26org_id%3Db2b0c970-8c97-44e8-bc56-a029b47c90c1%26redirect_uri%3Dhttps%3A%2F%2Fsso.canvaslms.com%2Flogin%2Foauth2%2Fcallback%26response_type%3Dcode%26scope%3Dopenid%2520profile%26state%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhYWNfaWQiOjcwMDAwMDAwMDAxNzUyLCJub25jZSI6IjQwM2U1YTI3NTVlZGQ0YzQwYzY2NWRjNWMzMjcxZjkzMjUwOTMxYjljMjhlNDZmOCIsImhvc3QiOiJjYW52YXMuaW5zdHJ1Y3R1cmUuY29tIiwidGFyZ2V0X2F1dGhfcHJvdmlkZXIiOiI3OTE3NTc5NS00NzlhLTQxNTQtODMzNS00MzI2NDA2NWIxZmIiLCJleHAiOjE3NjM4MjU0NTB9.C78jiivDj07cmp0NG17KRNBokyS84zBVicCx-tJvOtg%26target_domain%3Dhttps%3A%2F%2Fcanvas.instructure.com&realm=/alpha";

const StickyMobileCTA = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-2px_rgba(100,80,150,0.15)] p-3">
      <div className="flex gap-3 max-w-lg mx-auto">
        <Button variant="secondary" size="default" asChild className="flex-1">
          <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">
            <GraduationCap className="h-4 w-4" />
            Enroll Now
          </a>
        </Button>
        <Button variant="gray-outline" size="default" asChild className="flex-1">
          <a href={STUDENT_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
            <LogIn className="h-4 w-4" />
            Student Portal
          </a>
        </Button>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
