import { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import HeroBanner from '@/components/HeroBanner';
import SEO from '@/components/SEO';
import heroImage from '@/assets/hero-programs.jpg';
import stocktonFacility from '@/assets/stockton-facility.jpg';
import studentCareTraining from '@/assets/student-care-training.jpg';
import studentsVitalsPractice from '@/assets/students-vitals-practice.jpg';

interface Facility {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  services: string[];
  isPrimary: boolean;
  image?: string;
}

interface Location {
  city: string;
  state: string;
  facilities: Facility[];
}

const centralValleyLocations: Location[] = [
  {
    city: "Stockton",
    state: "CA",
    facilities: [
      {
        name: "Meadowood Health and Rehabilitation Center",
        address: "3110 Wagner Heights Rd, Stockton, CA 95209",
        phone: "(209) 323-4169",
        hours: "Mon-Fri: 9:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=3110+Wagner+Heights+Rd+Stockton+CA+95209",
        services: ["Clinical Training", "Skills Lab", "State Exam Testing"],
        isPrimary: true,
        image: stocktonFacility,
      },
    ],
  },
  {
    city: "Lodi",
    state: "CA",
    facilities: [
      {
        name: "Lodi Creek Post-Acute",
        address: "321 West Turner Road, Lodi, CA 95240",
        phone: "(209) 323-4169",
        hours: "Mon-Fri: 9:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=321+West+Turner+Road+Lodi+CA+95240",
        services: ["Clinical Training", "Hands-on Practice"],
        isPrimary: false,
        image: studentCareTraining,
      },
    ],
  },
];

const bayAreaLocations: Location[] = [
  {
    city: "Hayward",
    state: "CA",
    facilities: [
      {
        name: "Bay Area Skilled Nursing Facility",
        address: "22300 Foothill Blvd, Hayward, CA 94541",
        phone: "(209) 323-4169",
        hours: "Mon-Fri: 9:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=22300+Foothill+Blvd+Hayward+CA+94541",
        services: ["Clinical Training", "Skills Assessment"],
        isPrimary: false,
        image: studentsVitalsPractice,
      },
    ],
  },
];

const LocationItem = ({ location }: { location: Location }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-background overflow-hidden">
      <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold text-foreground">
            {location.city}, {location.state}
          </span>
          {location.facilities.some(f => f.isPrimary) && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Main Campus</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-6 pb-6 pt-2 space-y-4">
          {location.facilities.map((facility) => (
            <div key={facility.name} className="bg-muted/30 rounded-lg overflow-hidden">
              {/* Facility Image */}
              {facility.image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={`${facility.name} training facility`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{facility.name}</h4>
                  </div>
                </div>
                
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{facility.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${facility.phone}`} className="text-primary hover:underline">{facility.phone}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{facility.hours}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Services Available:</p>
                  <div className="flex flex-wrap gap-1">
                    {facility.services.map((service) => (
                      <span key={service} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <Button asChild variant="outline" size="sm">
                  <a href={facility.mapUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const LocationsPage = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Training Locations | Health Star Academy"
        description="Find Health Star Academy CNA training locations throughout California's Central Valley and Bay Area. Clinical training sites in Stockton, Lodi, and Hayward."
        canonical="/locations"
        keywords="CNA training locations, nursing assistant school California, Stockton CNA, Lodi CNA, Hayward CNA, Central Valley healthcare training"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Health Star Academy",
          "url": "https://www.healthstaracademy.org",
          "telephone": "(209) 323-4169",
          "email": "info@healthstaracademy.org",
          "areaServed": ["Stockton", "Lodi", "Hayward", "Sacramento", "Bay Area", "Central Valley"],
          "location": [
            {
              "@type": "Place",
              "name": "Meadowood Health and Rehabilitation Center",
              "description": "Primary clinical training site for Health Star Academy CNA students in Stockton.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "3110 Wagner Heights Rd",
                "addressLocality": "Stockton",
                "addressRegion": "CA",
                "postalCode": "95209",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 38.0202,
                "longitude": -121.3236
              }
            },
            {
              "@type": "Place",
              "name": "Lodi Creek Post-Acute",
              "description": "Clinical training site for Health Star Academy CNA students in Lodi.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "321 West Turner Road",
                "addressLocality": "Lodi",
                "addressRegion": "CA",
                "postalCode": "95240",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 38.1302,
                "longitude": -121.2777
              }
            },
            {
              "@type": "Place",
              "name": "Bay Area Skilled Nursing Facility",
              "description": "Clinical training site for Health Star Academy CNA students in Hayward.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "22300 Foothill Blvd",
                "addressLocality": "Hayward",
                "addressRegion": "CA",
                "postalCode": "94541",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 37.6688,
                "longitude": -122.0872
              }
            }
          ]
        }}
      />

      <HeroBanner
        imageSrc={heroImage}
        imageAlt="Health Star Academy training locations"
        title="Our Locations"
        subtitle="Training sites throughout California's Central Valley and Bay Area"
      />

      {/* Central Valley Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Central Valley</h2>
              <p className="text-muted-foreground">Our primary training region with multiple clinical sites</p>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            {centralValleyLocations.map((location) => (
              <LocationItem key={location.city} location={location} />
            ))}
          </div>
        </div>
      </section>

      {/* Bay Area Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Bay Area</h2>
              <p className="text-muted-foreground">Extended training opportunities in the Bay Area</p>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            {bayAreaLocations.map((location) => (
              <LocationItem key={location.city} location={location} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Questions About Our Locations?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Contact us to learn more about training opportunities at any of our locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/contact">Contact Us</a>
            </Button>
            <Button asChild variant="outline">
              <a href="tel:2093234169">Call (209) 323-4169</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;