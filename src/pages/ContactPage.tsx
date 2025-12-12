import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import HeroBanner from "@/components/HeroBanner";
import studentSmilingStethoscope from "@/assets/student-smiling-stethoscope.jpg";

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Inquiry Submitted!",
      description: "An admissions advisor will contact you within one business hour.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    { icon: Phone, title: "Office", content: "(209) 323-4169", link: "tel:2093234169" },
    { icon: MessageSquare, title: "Mobile", content: "(916) 208-8097", link: "tel:9162088097" },
    { icon: Mail, title: "Email", content: "healthstaracademy@gmail.com", link: "mailto:healthstaracademy@gmail.com" },
    { icon: MapPin, title: "Address", content: "5250 Claremont Avenue, Suite 127\nStockton, CA 95207", link: "https://maps.google.com/?q=5250+Claremont+Avenue+Suite+127+Stockton+CA+95207" },
    { icon: Clock, title: "Office Hours", content: "Mon - Thurs: 9:00 AM - 5:00 PM\nFriday: 9:00 AM - 1:00 PM" },
  ];

  const interestOptions = [
    { value: "next-class", label: "Next CNA Class" },
    { value: "payment-plans", label: "Payment Plans" },
    { value: "background-check", label: "Background Check Info" },
    { value: "schedule", label: "Class Schedule Options" },
    { value: "general", label: "General Question" },
  ];

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={studentSmilingStethoscope}
        imageAlt="Health Star Academy student ready to help patients"
        title={
          <>
            We're Here to<br />
            Help You<br />
            <span className="text-cyan">Get Started</span>
          </>
        }
        subtitle="Your Questions Answered • Support Every Step"
      />

      {/* Contact Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="animate-slide-in-left">
              <h2 className="font-heading text-3xl font-bold text-charcoal mb-4">
                Contact Information
              </h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Reach out to us through any of the channels below. We respond to all inquiries within one business hour during office hours.
              </p>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={item.title} className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-12 h-12 bg-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                      {item.link ? (
                        <a href={item.link} className="text-gray-dark hover:text-purple transition-colors whitespace-pre-line">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-dark whitespace-pre-line">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Embed */}
              <div className="mt-6 rounded-xl overflow-hidden shadow-soft h-56">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.8!2d-121.3!3d37.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU3JzM2LjAiTiAxMjHCsDE4JzAwLjAiVw!5e0!3m2!1sen!2sus!4v1635959481234"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Health Star Academy Location - Stockton, CA"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-slide-in-right">
              <div className="bg-neutral-light rounded-xl p-6 shadow-soft">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                  Send Your Inquiry
                </h2>
                <p className="text-gray-dark mb-4">
                  Fill out the form below and an admissions advisor will contact you within one business hour.
                </p>

                {isSubmitted ? (
                  <div className="text-center py-12 animate-scale-in">
                    <div className="w-20 h-20 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-purple" />
                    </div>
                    <h3 className="font-heading font-semibold text-2xl text-charcoal mb-4">Thank You!</h3>
                    <p className="text-gray-dark mb-6">Your inquiry has been received. An admissions advisor will contact you within one business hour.</p>
                    <Button variant="default" onClick={() => { setIsSubmitted(false); setFormData({ name: "", email: "", phone: "", interest: "", message: "" }); }}>
                      Submit Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">Full Name *</label>
                      <Input id="name" type="text" placeholder="Your full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required className="bg-background" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">Email Address *</label>
                      <Input id="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required className="bg-background" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">Phone Number *</label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required className="bg-background" />
                    </div>
                    <div>
                      <label htmlFor="interest" className="block text-sm font-medium text-charcoal mb-2">I'm interested in... *</label>
                      <Select value={formData.interest} onValueChange={(value) => handleChange("interest", value)} required>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                        <SelectContent>
                          {interestOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">Your Message (Optional)</label>
                      <Textarea id="message" placeholder="Tell us about your goals or any questions..." value={formData.message} onChange={(e) => handleChange("message", e.target.value)} rows={4} className="bg-background resize-none" />
                    </div>
                    <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : (<>Send My Inquiry <Send className="ml-2 h-5 w-5" /></>)}
                    </Button>
                    <p className="text-xs text-gray-medium text-center">By submitting, you agree to be contacted by Health Star Academy regarding your inquiry.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance Banner */}
      <section className="py-8 bg-purple">
        <div className="container-custom text-center">
          <p className="text-primary-foreground font-medium">
            🕐 An admissions advisor will contact you within one business hour during office hours.
          </p>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;