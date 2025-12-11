import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Image as ImageIcon } from "lucide-react";
import heroPrograms from "@/assets/hero-programs.jpg";
import graduateMaria from "@/assets/graduate-maria.jpg";
import studentDavid from "@/assets/student-david.jpg";
import instructorJane from "@/assets/instructor-jane.jpg";
import instructorJohn from "@/assets/instructor-john.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const GalleryPage = () => {
  // Placeholder gallery images - will be replaced with partner's images
  const galleryImages = [
    { src: heroPrograms, alt: "Health Star Academy CNA students in scrubs", category: "Students" },
    { src: trainingLab, alt: "Clinical training in progress", category: "Training" },
    { src: graduateMaria, alt: "Graduate Maria Gonzalez", category: "Graduates" },
    { src: studentDavid, alt: "Student David in clinical setting", category: "Students" },
    { src: instructorJane, alt: "Instructor providing guidance", category: "Instructors" },
    { src: instructorJohn, alt: "Clinical instructor with students", category: "Instructors" },
  ];

  return (
    <main className="pt-30">
      {/* Hero Section - Marketing Style */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 h-64 lg:h-full relative">
            <img
              src={heroPrograms}
              alt="Health Star Academy students and graduates"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Gradient Side */}
          <div className="w-full lg:w-1/2 h-full bg-gradient-to-br from-purple via-purple/90 to-magenta flex items-center justify-center py-12 lg:py-0">
            <div className="text-center px-8 lg:px-12">
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in-up uppercase tracking-wide">
                Your Future in<br />
                Healthcare<br />
                <span className="text-cyan">Starts Here</span>
              </h1>
              <p className="text-primary-foreground/90 text-lg animate-fade-in-up animation-delay-100">
                Hands-On Training • Real-World Impact
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 container-custom py-32 lg:py-40" />
      </section>

      {/* Gallery Intro */}
      <section className="py-12 bg-background">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="h-8 w-8 text-purple" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal">
              Our Gallery
            </h2>
          </div>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Take a look at our students, graduates, and training in action. These moments capture the dedication and growth of future healthcare professionals at Health Star Academy.
          </p>
        </div>
      </section>

      {/* Photo Gallery Grid */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-cyan text-charcoal px-3 py-1 rounded-full text-sm font-semibold">
                      {image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="mt-12 text-center bg-background rounded-xl p-8 shadow-soft">
            <ImageIcon className="h-12 w-12 text-purple/30 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
              More Photos Coming Soon!
            </h3>
            <p className="text-gray-dark max-w-lg mx-auto">
              We're adding more photos of our students, clinical training, and graduation ceremonies. Check back soon for updates!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Be Part of Our Story
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Join the Health Star Academy community and start your journey to a rewarding healthcare career.
          </p>
          <Button variant="secondary" size="xl" asChild>
            <Link to="/programs/admissions">
              Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default GalleryPage;