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

    // Simulate form submission
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
    {
      icon: Phone,
      title: "Phone",
      content: "(555) 123-HEAL",
      link: "tel:5551234325",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@healthstaracademy.com",
      link: "mailto:info@healthstaracademy.com",
    },
    {
      icon: MapPin,
      title: "Address",
      content: "1234 Healthcare Blvd, Suite 100\nCity, State 12345",
      link: "https://maps.google.com",
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Mon-Fri: 9am-6pm\nSat: 10am-2pm",
    },
    {
      icon: MessageSquare,
      title: "Text Us",
      content: "(555) 987-6543",
      link: "sms:5559876543",
    },
  ];

  const interestOptions = [
    { value: "next-class", label: "Next CNA Class" },
    { value: "payment-plans", label: "Payment Plans" },
    { value: "background-check", label: "Background Check Info" },
    { value: "schedule", label: "Class Schedule Options" },
    { value: "general", label: "General Question" },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            We're Here to Help You<br />
            <span className="text-coral">Get Started</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Have questions? Ready to enroll? Our friendly admissions team is here to guide you through every step of your healthcare career journey.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="animate-slide-in-left">
              <h2 className="font-heading text-3xl font-bold text-charcoal mb-6">
                Contact Information
              </h2>
              <p className="text-gray-dark mb-8 leading-relaxed">
                Reach out to us through any of the channels below. We're committed to responding 
                to all inquiries within one business hour during office hours.
              </p>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-gray-dark hover:text-teal transition-colors whitespace-pre-line"
                        >
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
              <div className="mt-8 rounded-xl overflow-hidden shadow-soft h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596073366!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1635959481234!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HealthStar Academy Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-slide-in-right">
              <div className="bg-neutral-light rounded-xl p-8 shadow-soft">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                  Send Your Inquiry
                </h2>
                <p className="text-gray-dark mb-6">
                  Fill out the form below and an admissions advisor will contact you within one business hour.
                </p>

                {isSubmitted ? (
                  <div className="text-center py-12 animate-scale-in">
                    <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-teal" />
                    </div>
                    <h3 className="font-heading font-semibold text-2xl text-charcoal mb-4">
                      Thank You!
                    </h3>
                    <p className="text-gray-dark mb-6">
                      Your inquiry has been received. An admissions advisor will contact you within one business hour during office hours.
                    </p>
                    <Button
                      variant="default"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          interest: "",
                          message: "",
                        });
                      }}
                    >
                      Submit Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div>
                      <label htmlFor="interest" className="block text-sm font-medium text-charcoal mb-2">
                        I'm interested in... *
                      </label>
                      <Select
                        value={formData.interest}
                        onValueChange={(value) => handleChange("interest", value)}
                        required
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {interestOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                        Your Message (Optional)
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your goals or any questions you have..."
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        rows={4}
                        className="bg-background resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send My Inquiry <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-medium text-center">
                      By submitting this form, you agree to be contacted by HealthStar Academy regarding your inquiry.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance Banner */}
      <section className="py-8 bg-teal">
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
