import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartHandshake, GraduationCap, ArrowRight } from "lucide-react";
import { HHA_STATUS, HHA_PRIORITY_NOTICE } from "../../supabase/functions/_shared/hha";
export default function ProgramPaths() {
  return <section className="section-padding bg-neutral-light"><div className="container-custom">
    <h2 className="font-heading text-3xl font-bold text-charcoal mb-6">Choose your healthcare program</h2>
    <div className="grid md:grid-cols-2 gap-6">
      <article className="rounded-lg border border-cyan/30 bg-background p-6 flex flex-col items-start">
        <HeartHandshake className="h-8 w-8 text-cyan-deep mb-4" />
        <h3 className="font-heading text-2xl font-semibold mb-3">Step 1: Home Health Aide (HHA), 120 hours</h3>
        <p className="text-purple font-semibold mb-3">{HHA_STATUS}</p>
        <p className="text-gray-dark mb-4">Your first step into healthcare. No prior certification needed. Train to care for clients in their homes.</p>
        <p className="text-sm text-gray-dark mb-6">The planned program combines classroom theory and supervised clinical practice taught by Registered Nurses. Minimum age 16. HHA certification does not grant CNA certification. CNA is a separate program you can take next.</p>
        <Button asChild className="mt-auto h-auto whitespace-normal"><Link to="/pre-qualification?program=hha">Join the HHA priority list <ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link></Button>
        <p className="text-sm text-muted-foreground mt-3">{HHA_PRIORITY_NOTICE}</p>
      </article>
      <article className="rounded-lg border border-purple/30 bg-background p-6 flex flex-col items-start">
        <GraduationCap className="h-8 w-8 text-purple mb-4" />
        <h3 className="font-heading text-2xl font-semibold mb-3">Step 2: Certified Nursing Assistant (CNA)</h3>
        <p className="text-purple font-semibold mb-3">CDPH approved hybrid training</p>
        <p className="text-gray-dark mb-4">60 hours online theory and 100 hours clinical training in Stockton, Lodi and Hayward.</p>
        <p className="text-sm text-gray-dark mb-6">6 week Daytime or 8 weekend tracks. Tuition $2,499 plus $175 enrollment fee. Next CNA cohort January 4, 2027.</p>
        <div className="flex flex-wrap gap-3 mt-auto"><Button asChild><Link to="/pre-qualification?program=cna">Start Your Application</Link></Button><Button variant="outline" asChild><Link to="/programs">View Program</Link></Button></div>
      </article>
    </div>
  </div></section>;
}
