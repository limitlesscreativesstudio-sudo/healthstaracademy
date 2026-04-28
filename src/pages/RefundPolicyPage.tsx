import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";

const RefundPolicyPage = () => {
  return (
    <>
      <SEO
        title="Refund Policy | Health Star Academy | CNA Training Stockton CA"
        description="Health Star Academy's Refund Policy outlines tuition refund eligibility, withdrawal procedures, and fee details for our CNA training program."
        canonical="/refund-policy"
        robots="noindex, follow"
        structuredData={buildBreadcrumbSchema([{ name: "Refund Policy", path: "/refund-policy" }])}
      />
      <main className="pt-28 md:pt-32">
        <section className="section-padding bg-background">
          <div className="container-custom max-w-4xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
              Refund Policy
            </h1>
            <p className="text-gray-medium mb-8">Last Updated: April 2, 2026</p>

            <div className="prose prose-lg max-w-none space-y-8 text-gray-dark">
              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">1. Tuition Overview</h2>
                <p className="leading-relaxed">
                  The total tuition for Health Star Academy's Certified Nursing Assistant (CNA) training program is <strong>$2,499</strong>. A separate, non-refundable <strong>$175 enrollment fee</strong> is required at the start of the application process to secure your seat.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">2. Tuition Breakdown</h2>
                <p className="leading-relaxed mb-3">Tuition is itemized as follows for full transparency:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Instruction:</strong> $1,000</li>
                  <li><strong>Lab Supplies:</strong> $350</li>
                  <li><strong>LiveScan Background Check:</strong> $200</li>
                  <li><strong>Textbook:</strong> $250</li>
                  <li><strong>Uniform:</strong> $200</li>
                  <li><strong>Workbook:</strong> $100</li>
                  <li><strong>BP Cuff & Stethoscope:</strong> $200</li>
                  <li><strong>Chromebook:</strong> Program Use Only</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">3. Enrollment Fee</h2>
                <p className="leading-relaxed">
                  The <strong>$175 enrollment fee</strong> is non-refundable and is required to initiate the application process. This fee covers administrative processing, application review, and seat reservation in your selected cohort.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">4. Refund Eligibility</h2>
                <p className="leading-relaxed">
                  Students who withdraw from the program <strong>within 5 days of the program start date</strong> are entitled to a refund of tuition minus a <strong>$495 administrative fee</strong>. This means the maximum refund amount is <strong>$2,004</strong> ($2,499 − $495).
                </p>
                <p className="leading-relaxed mt-3">
                  Please note: the <strong>$495 administrative fee</strong> is separate from and distinct from the <strong>$175 application/enrollment fee</strong>. The $175 application fee is paid at the start of the application process, is non-refundable under all circumstances, and is not included in the refund calculation above.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">5. Withdrawal After 5 Days</h2>
                <p className="leading-relaxed">
                  Students who withdraw <strong>after the 5-day period</strong> following the program start date are not eligible for a tuition refund. All fees and tuition paid are considered earned and non-refundable.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">6. How to Request a Refund</h2>
                <p className="leading-relaxed">
                  To request a refund, students must submit a written withdrawal notice to Health Star Academy within the eligible timeframe. Refund requests can be submitted via:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Email: <a href="mailto:info@healthstaracademy.org" className="text-purple hover:underline font-medium">info@healthstaracademy.org</a></li>
                  <li>Phone: <a href="tel:2093234169" className="text-purple hover:underline font-medium">(209) 323-4169</a></li>
                  <li>In person at our Stockton campus</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  Approved refunds will be processed within <strong>30 business days</strong> of receiving the written withdrawal notice.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">7. Payment Plans</h2>
                <p className="leading-relaxed">
                  Students enrolled in a payment plan through Denefits who withdraw from the program remain responsible for any outstanding balance per the terms of their payment plan agreement. Please review your payment plan terms carefully before enrolling.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">8. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have questions about our refund policy, please contact us:
                </p>
                <div className="bg-neutral-light rounded-xl p-6 mt-3">
                  <p className="font-semibold text-charcoal">Health Star Academy</p>
                  <p>5250 Claremont Avenue, Suite 127</p>
                  <p>Stockton, CA 95207</p>
                  <p className="mt-2">
                    Phone: <a href="tel:2093234169" className="text-purple hover:underline">(209) 323-4169</a>
                  </p>
                  <p>
                    Email: <a href="mailto:info@healthstaracademy.org" className="text-purple hover:underline">info@healthstaracademy.org</a>
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-10 text-center">
              <Button variant="default" asChild>
                <Link to="/contact">
                  Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default RefundPolicyPage;
