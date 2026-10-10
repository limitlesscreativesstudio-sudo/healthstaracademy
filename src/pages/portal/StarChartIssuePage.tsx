import { useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const StarChartIssuePage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const updateHeight = useCallback(() => {
    const frame = frameRef.current;
    const body = frame?.contentDocument?.body;
    if (frame && body) {
      frame.style.height = `${body.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [updateHeight]);

  return (
    <main className="pt-28 md:pt-32">
      <Helmet>
        <title>The Star Chart Issue 01 | Health Star Academy</title>
        <meta name="description" content="Explore the Fall 2026 issue of The Star Chart with alumni career advice, CNA renewal reminders and Health Star Academy school news." />
      </Helmet>
      <header className="container-custom py-8 md:py-10">
        <Button variant="link" asChild className="px-0 mb-3">
          <Link to="/star-chart"><ArrowLeft aria-hidden="true" /> Back to all issues</Link>
        </Button>
        <h1 className="text-2xl md:text-3xl text-purple tracking-normal">The Star Chart, Issue 01, Fall 2026</h1>
      </header>
      <iframe
        ref={frameRef}
        src="/star-chart/issue-01.html"
        title="The Star Chart Issue 01"
        className="block w-full border-0"
        onLoad={updateHeight}
      />
    </main>
  );
};

export default StarChartIssuePage;