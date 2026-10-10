import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

const StarChartPage = () => (
  <main className="pt-28 md:pt-32">
    <Helmet>
      <title>The Star Chart | Health Star Academy Alumni Newsletter</title>
      <meta name="description" content="Read The Star Chart for Health Star Academy alumni career tips, school news and ways to welcome the next generation of CNAs." />
    </Helmet>
    <section className="section-padding bg-neutral-light border-b border-border">
      <div className="container-custom">
        <p className="text-purple font-semibold text-sm mb-3">Alumni Network</p>
        <h1 className="text-4xl md:text-5xl text-purple mb-5 tracking-normal">The Star Chart</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The Health Star Academy alumni newsletter. Career tips, school news and ways to bring the next great CNA into the family.
        </p>
      </div>
    </section>
    <section className="section-padding">
      <div className="container-custom">
        <Card className="max-w-xl border-t-4 border-t-cyan">
          <CardHeader>
            <CardTitle className="text-purple tracking-normal">Issue 01, Fall 2026</CardTitle>
            <CardDescription className="text-base leading-relaxed pt-2">
              You graduated. You didn't leave the family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="purple-outline" asChild>
              <Link to="/star-chart/issue-01">Read Issue 01 <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  </main>
);

export default StarChartPage;