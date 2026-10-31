import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PORTAL_ORIGIN } from "@/lib/hsaCloud";

/**
 * On the Cloudflare hosted public site, the student and instructor portal and
 * the admin area stay on Lovable. Any visit to those paths is handed to the
 * portal address. On the Lovable build PORTAL_ORIGIN is empty and this does nothing.
 */
const PortalHandoff = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (!PORTAL_ORIGIN) return;
    if (pathname.startsWith("/portal") || pathname.startsWith("/admin") || pathname.startsWith("/~oauth")) {
      window.location.replace(`${PORTAL_ORIGIN}${pathname}${search}${hash}`);
    }
  }, [pathname, search, hash]);
  return null;
};

export default PortalHandoff;
