import { MapPin, Phone, Clock, Navigation, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeroBanner from '@/components/HeroBanner';
import SEO from '@/components/SEO';
import heroImage from '@/assets/hero-programs.jpg';

const centralValleyLocations = [
  {
    city: "Stockton",
    region: "Central Valley",
    facilities: [
      {
        name: "Meadowood Health and Rehabilitation Center",
        address: "1850 N California St, Stockton, CA 95204",
        phone: "(209) 555-0100",
        hours: "Mon-Fri: 8:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=Meadowood+Health+and+Rehabilitation+Center+Stockton+CA",
        services: ["Clinical Training", "Skills Lab", "State Exam Testing"],
        isPrimary: true,
      },
    ],
  },
  {
    city: "Lodi",
    region: "Central Valley",
    facilities: [
      {
        name: "Lodi Creek Post-Acute",
        address: "1101 S Fairmont Ave, Lodi, CA 95240",
        phone: "(209) 555-0200",
        hours: "Mon-Fri: 8:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=Lodi+Creek+Post-Acute+Lodi+CA",
        services: ["Clinical Training", "Hands-on Practice"],
        isPrimary: false,
      },
    ],
  },
];

const bayAreaLocations = [
  {
    city: "Hayward",
    region: "Bay Area",
    facilities: [
      {
        name: "Bay Area Skilled Nursing Facility",
        address: "22300 Foothill Blvd, Hayward, CA 94541",
        phone: "(510) 555-0400",
        hours: "Mon-Fri: 8:00 AM - 5:00 PM",
        mapUrl: "https://maps.google.com/?q=Hayward+CA",
        services: ["Clinical Training", "Skills Assessment"],
        isPrimary: false,
      },
    ],
  },
];

const LocationsPage = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Training Locations | Health Star Academy"
        description="Find Health Star Academy CNA training locations throughout California's Central Valley and Bay Area. Clinical training sites in Stockton, Lodi, and Hayward."
        keywords="CNA training locations, nursing assistant school California, Stockton CNA, Lodi CNA, Hayward CNA, Central Valley healthcare training"
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

          {centralValleyLocations.map((location) => (
            <div key={location.city} className="mb-10">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {location.city}, CA
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {location.facilities.map((facility) => (
                  <Card key={facility.name} className={`overflow-hidden hover:shadow-lg transition-shadow ${facility.isPrimary ? 'ring-2 ring-primary' : ''}`}>
                    {facility.isPrimary && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                        Main Campus
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="block text-lg">{facility.name}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${facility.phone}`} className="text-primary hover:underline">{facility.phone}</a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{facility.hours}</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Services Available:</p>
                        <div className="flex flex-wrap gap-1">
                          {facility.services.map((service) => (
                            <span key={service} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button asChild variant="outline" className="w-full mt-4">
                        <a href={facility.mapUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
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

          {bayAreaLocations.map((location) => (
            <div key={location.city} className="mb-10">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {location.city}, CA
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {location.facilities.map((facility) => (
                  <Card key={facility.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="block text-lg">{facility.name}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${facility.phone}`} className="text-primary hover:underline">{facility.phone}</a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{facility.hours}</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Services Available:</p>
                        <div className="flex flex-wrap gap-1">
                          {facility.services.map((service) => (
                            <span key={service} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button asChild variant="outline" className="w-full mt-4">
                        <a href={facility.mapUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA - Simplified */}
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
