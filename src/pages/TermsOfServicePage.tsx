import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";

const TermsOfServicePage = () => {
  return (
    <>
      <SEO
        title="Terms of Service | Health Star Academy | CNA Training Stockton CA"
        description="Terms of Service for Health Star Academy's CDPH-approved CNA training program. Enrollment agreements, refund policy, and student responsibilities."
        canonical="/terms-of-service"
        robots="noindex, follow"
        structuredData={buildBreadcrumbSchema([{ name: "Terms of Service", path: "/terms-of-service" }])}
      />
      <main className="pt-28 md:pt-32">
        <section className="section-padding bg-background">
          <div className="container-custom max-w-4xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-medium mb-8">Last Updated: February 16, 2026</p>

            <div className="prose prose-lg max-w-none space-y-8 text-gray-dark">
              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing our website (healthstaracademy.org) or enrolling in Health Star Academy's Certified Nursing Assistant (CNA) training program, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or enroll in our programs.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">2. Program Description</h2>
                <p className="leading-relaxed">
                  Health Star Academy offers a 160-hour CDPH-approved hybrid CNA training program consisting of 60 hours of online theory instruction and 100 hours of supervised clinical training at approved healthcare facilities. The program is designed to prepare students for the California Nurse Assistant Certification Examination.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">3. Enrollment Requirements</h2>
                <p className="leading-relaxed mb-3">To enroll in Health Star Academy's CNA program, applicants must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 16 years of age (students under 18 require written parental or guardian consent)</li>
                  <li>Possess a valid government-issued photo identification (original document required)</li>
                  <li>Possess a Social Security Card (original document required)</li>
                  <li>Be able to pass a criminal background check (LiveScan)</li>
                  <li>Provide proof of good health (physical examination clearance)</li>
                  <li>Have reliable transportation to clinical training sites</li>
                  <li>Complete the enrollment application and pay the $175 non-refundable application fee</li>
                  <li>Submit all required documents at least 10 calendar days prior to the cohort start date</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  Applicants without a high school diploma or equivalent must pass an entrance examination administered by Health Star Academy.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">4. Tuition and Payment</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Application Fee:</strong> $175 non-refundable application fee due with application submission</li>
                  <li><strong>Program Tuition:</strong> $2,499 due at least 14 days prior to the cohort start date</li>
                  <li><strong>Payment Methods:</strong> Full payment via Stripe (credit/debit card, Klarna, Afterpay, digital wallets), 5-week payment plan ($499.80/week via Stripe), or third-party financing through Denefits</li>
                  <li><strong>Included Materials:</strong> Tuition includes a Chromebook provided for use during the program (must be returned upon completion), scrubs, course materials, and access to Canvas LMS</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">5. Refund Policy</h2>
                <p className="leading-relaxed mb-3">Health Star Academy's refund policy is as follows:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The $175 application fee is <strong>non-refundable</strong> under all circumstances</li>
                  <li><strong>Within 5 Days of Program Start:</strong> Students who withdraw within 5 days of the program start date are eligible for a tuition refund minus a <strong>$495 administrative fee</strong> (maximum refund: $2,004)</li>
                  <li><strong>After 5 Days:</strong> No tuition refund is available after the 5-day window</li>
                  <li>Refund requests must be submitted in writing to info@healthstaracademy.org</li>
                  <li>Refunds will be processed within 30 business days of approval</li>
                  <li>See the <a href="/refund-policy" className="text-purple hover:underline">Refund Policy</a> page for full details and FAQ</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">6. Student Responsibilities</h2>
                <p className="leading-relaxed mb-3">Enrolled students are expected to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attend all scheduled online theory sessions and clinical training hours</li>
                  <li>Maintain professional conduct at all clinical training sites</li>
                  <li>Complete all coursework, assignments, and examinations by posted deadlines</li>
                  <li>Adhere to the dress code policy (scrubs provided by Health Star Academy)</li>
                  <li>Maintain patient confidentiality in accordance with HIPAA regulations</li>
                  <li>Arrive on time for all clinical rotations and notify instructors of any absences in advance</li>
                  <li>Return the Chromebook in good working condition upon program completion</li>
                  <li>Comply with all health and safety protocols at clinical sites</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">7. Attendance Policy</h2>
                <p className="leading-relaxed">
                  Students must complete all 160 hours of instruction (60 hours theory + 100 hours clinical) to be eligible for program completion. Excessive absences may result in dismissal from the program. Students who miss clinical hours must arrange make-up sessions, subject to availability and additional fees. Specific attendance requirements are outlined in the Student Handbook provided during orientation.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">8. Academic Standards</h2>
                <p className="leading-relaxed">
                  Students must maintain a minimum overall grade of 75% to successfully complete the program. Clinical performance is evaluated on a satisfactory/unsatisfactory basis. Students who fail to meet academic standards may be placed on academic probation or dismissed from the program in accordance with the policies outlined in the Student Handbook.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">9. Dismissal Policy</h2>
                <p className="leading-relaxed mb-3">Health Star Academy reserves the right to dismiss a student for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Failure to meet academic standards after remediation attempts</li>
                  <li>Violation of clinical site policies or patient safety protocols</li>
                  <li>Unprofessional conduct or behavior</li>
                  <li>Failure to pass the required background check</li>
                  <li>Falsification of enrollment documents or academic work</li>
                  <li>Non-payment of tuition or fees</li>
                  <li>Excessive unexcused absences</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">10. Website Use</h2>
                <p className="leading-relaxed mb-3">When using our website, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Submit false or misleading information through any form</li>
                  <li>Attempt to gain unauthorized access to our systems or data</li>
                  <li>Use automated tools to scrape or collect data from our website</li>
                  <li>Reproduce, distribute, or modify our content without written permission</li>
                  <li>Use our website for any unlawful purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">11. Intellectual Property</h2>
                <p className="leading-relaxed">
                  All content on our website — including text, graphics, logos, images, course materials, and the Health Star Academy brand — is our intellectual property or used with permission. You may not reproduce, distribute, or create derivative works from our content without prior written consent.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">12. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  Health Star Academy provides CNA training to prepare students for the state certification examination. We do not guarantee employment, exam passage, or certification outcomes. Our liability is limited to the amount of tuition paid. We are not liable for indirect, incidental, or consequential damages arising from program participation or website use.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">13. Governing Law</h2>
                <p className="leading-relaxed">
                  These Terms of Service are governed by the laws of the State of California. Any disputes arising from these terms shall be resolved in the courts of San Joaquin County, California.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">14. Changes to These Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our website or participation in our program after changes constitutes acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">15. Contact Information</h2>
                <p className="leading-relaxed">
                  For questions regarding these Terms of Service, contact us:
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
                <Link to="/pre-qualification">
                  Start Your Enrollment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsOfServicePage;
