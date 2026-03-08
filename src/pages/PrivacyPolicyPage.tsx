import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";

const PrivacyPolicyPage = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | Health Star Academy | CNA Training Stockton CA"
        description="Health Star Academy's Privacy Policy explains how we collect, use, and protect your personal information when you use our website and CNA training services."
        canonical="/privacy-policy"
        robots="noindex, follow"
      />
      <main className="pt-28 md:pt-32">
        <section className="section-padding bg-background">
          <div className="container-custom max-w-4xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-medium mb-8">Last Updated: February 16, 2026</p>

            <div className="prose prose-lg max-w-none space-y-8 text-gray-dark">
              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">1. Introduction</h2>
                <p className="leading-relaxed">
                  Health Star Academy ("we," "our," or "us") is committed to protecting the privacy of our students, prospective students, and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website at healthstaracademy.org, submit inquiries, or enroll in our Certified Nursing Assistant (CNA) training program.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">2. Information We Collect</h2>
                <p className="leading-relaxed mb-3">We collect information you voluntarily provide, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address</li>
                  <li><strong>Enrollment Data:</strong> Date of birth, eligibility responses (age verification, diploma status, government ID confirmation, Social Security Card confirmation, background check eligibility, proof of health, and transportation availability)</li>
                  <li><strong>Payment Information:</strong> Billing details processed through our third-party payment processors (Stripe and Denefits). We do not store credit card numbers on our servers.</li>
                  <li><strong>Academic Records:</strong> Exam scores, attendance records, clinical performance evaluations, and certification status</li>
                  <li><strong>Communications:</strong> Messages submitted through our contact form, email correspondence, and phone call records</li>
                </ul>
                <p className="leading-relaxed mt-3">We also automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and referral sources</li>
                  <li><strong>Cookies:</strong> Essential cookies for site functionality and analytics cookies to improve our services</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processing your enrollment application and determining program eligibility</li>
                  <li>Communicating enrollment status, orientation details, and program updates</li>
                  <li>Processing tuition payments and managing payment plans</li>
                  <li>Maintaining academic records as required by the California Department of Public Health (CDPH)</li>
                  <li>Scheduling LiveScan background checks as required for CNA certification</li>
                  <li>Responding to your inquiries and providing student support</li>
                  <li>Sending program-related communications (class schedules, exam preparation, career resources)</li>
                  <li>Improving our website, services, and training curriculum</li>
                  <li>Complying with state and federal regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">4. FERPA Compliance</h2>
                <p className="leading-relaxed">
                  Health Star Academy respects student privacy in accordance with the Family Educational Rights and Privacy Act (FERPA). Student education records are protected and will not be disclosed without written consent, except as permitted by law. Students have the right to inspect and review their education records and request corrections.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">5. Information Sharing</h2>
                <p className="leading-relaxed mb-3">We do not sell, trade, or rent your personal information. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>CDPH:</strong> As required for CNA certification and program compliance</li>
                  <li><strong>Clinical Training Sites:</strong> Student names and relevant information necessary for clinical placement at approved healthcare facilities in Stockton, Lodi, and Hayward</li>
                  <li><strong>Payment Processors:</strong> Stripe and Denefits for secure payment processing</li>
                  <li><strong>LiveScan Providers:</strong> For required background check processing</li>
                  <li><strong>Canvas LMS:</strong> For online coursework delivery and grade management</li>
                  <li><strong>Legal Authorities:</strong> When required by law, court order, or to protect our legal rights</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">6. Data Security</h2>
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including encrypted data transmission (SSL/TLS), secure server infrastructure, and restricted access controls. Payment processing is handled by PCI-compliant third-party providers. While we take reasonable precautions, no method of electronic transmission or storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">7. Your Rights</h2>
                <p className="leading-relaxed mb-3">Under California law (CCPA/CPRA), you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Know what personal information we collect and how it is used</li>
                  <li>Request deletion of your personal information (subject to legal retention requirements)</li>
                  <li>Opt out of the sale of personal information (we do not sell personal information)</li>
                  <li>Non-discrimination for exercising your privacy rights</li>
                  <li>Access and correct inaccuracies in your personal data</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:info@healthstaracademy.org" className="text-purple hover:underline font-medium">
                    info@healthstaracademy.org
                  </a>{" "}
                  or call <a href="tel:2093234169" className="text-purple hover:underline font-medium">(209) 323-4169</a>.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">8. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain student records for a minimum of three (3) years following program completion, as required by CDPH regulations. Prospective student inquiry data is retained for up to two (2) years. You may request deletion of non-essential data at any time.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">9. Third-Party Links</h2>
                <p className="leading-relaxed">
                  Our website may contain links to third-party websites (e.g., Canvas LMS, Self-Help Credit Union, CDPH). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing personal information.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">10. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our CNA program accepts students who are at least 16 years of age. Students under 18 require parental or guardian consent for enrollment. We do not knowingly collect information from children under 16.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">11. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our website after changes constitutes acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-xl font-bold text-charcoal mb-3">12. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:
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

export default PrivacyPolicyPage;
