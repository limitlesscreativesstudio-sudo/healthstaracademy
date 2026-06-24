import { Link, useParams, Navigate } from "react-router-dom";
import { MapPin, Phone, Clock, CheckCircle2, Building2, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import { CITY_MARKETS, getMarket } from "@/data/cityMarkets";
import heroImage from "@/assets/hero-programs.jpg";

const CityLandingPage = () => {
  const { city = "" } = useParams();
  const market = getMarket(city);

  if (!market) return <Navigate to="/locations" replace />;

  const canonical = `/cna-classes/${market.slug}`;
  const fullUrl = `https://healthstaracademy.org${canonical}`;
  const otherMarkets = CITY_MARKETS.filter((m) => m.slug !== market.slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "@id": `${fullUrl}#org`,
      name: `Health Star Academy — CNA Classes in ${market.city}`,
      url: fullUrl,
      telephone: "(209) 323-4169",
      email: "info@healthstaracademy.org",
      areaServed: [market.city, market.county, market.region, ...market.nearbyAreas],
      address: {
        "@type": "PostalAddress",
        addressLocality: market.city,
        addressRegion: market.state,
        postalCode: market.zip,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: market.lat,
        longitude: market.lng,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: `Certified Nursing Assistant (CNA) Program — ${market.city}, ${market.state}`,
      description: market.metaDescription,
      provider: {
        "@type": "EducationalOrganization",
        name: "Health Star Academy",
        sameAs: "https://www.healthstaracademy.org",
      },
      educationalCredentialAwarded: "California CNA Certification (CDPH-approved)",
      offers: {
        "@type": "Offer",
        price: "2499",
        priceCurrency: "USD",
        category: "Tuition",
        availability: "https://schema.org/InStock",
        url: fullUrl,
      },
      hasCourseInstance: [
        {
          "@type": "CourseInstance",
          courseMode: "Blended",
          name: "6-Week Daytime CNA Track",
          location: { "@type": "Place", name: market.nearestSite.name, address: `${market.nearestSite.address}, ${market.nearestSite.city}, ${market.state}` },
        },
        {
          "@type": "CourseInstance",
          courseMode: "Blended",
          name: "8-Weekend CNA Track",
          location: { "@type": "Place", name: market.nearestSite.name, address: `${market.nearestSite.address}, ${market.nearestSite.city}, ${market.state}` },
        },
      ],
    },
    buildBreadcrumbSchema([
      { name: "Locations", path: "/locations" },
      { name: `CNA Classes ${market.city}`, path: canonical },
    ]),
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title={market.metaTitle}
        description={market.metaDescription}
        canonical={canonical}
        keywords={market.keywords}
        structuredData={structuredData}
      />

      <HeroBanner
        imageSrc={heroImage}
        imageAlt={`CNA training serving ${market.city}, ${market.state}`}
        title={market.heroHeadline}
        subtitle={market.heroSubhead}
      />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="sr-only">{market.heroHeadline}</h1>
          <p className="text-lg text-foreground/90 leading-relaxed">{market.intro}</p>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="rounded-lg border bg-muted/30 p-4">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <div className="text-sm font-semibold">6-Week Daytime</div>
              <div className="text-xs text-muted-foreground">or 8-Weekend track</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <DollarSign className="w-5 h-5 text-primary mb-2" />
              <div className="text-sm font-semibold">$2,499 Tuition</div>
              <div className="text-xs text-muted-foreground">+ $175 enrollment fee</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
              <div className="text-sm font-semibold">CDPH-Approved</div>
              <div className="text-xs text-muted-foreground">BBB accredited</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Why {market.city} students choose Health Star Academy
          </h2>
          <ul className="space-y-3">
            {market.whyHere.map((reason) => (
              <li key={reason} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Your clinical training site
          </h2>
          <div className="rounded-lg border p-5 bg-muted/20">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{market.nearestSite.name}</h3>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{market.nearestSite.address}, {market.nearestSite.city}, {market.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>From {market.city}: {market.nearestSite.driveTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href="tel:2093234169" className="text-primary hover:underline">(209) 323-4169</a>
                </div>
              </div>
            </div>
          </div>
          {market.nearbyAreas.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Also serving nearby: {market.nearbyAreas.join(", ")}.
            </p>
          )}
        </div>
      </section>

      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to start your CNA career in {market.city}?
          </h2>
          <p className="text-muted-foreground mb-6">
            Take the 2-minute pre-qualification check or call us today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/pre-qualification">Start Pre-Qualification</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="tel:2093234169">Call (209) 323-4169</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-2">
            CNA classes in nearby California cities
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Health Star Academy serves students across the Central Valley and Bay Area. Explore other markets we train in:
          </p>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {otherMarkets.map((m) => (
              <li key={m.slug}>
                <Link
                  to={`/cna-classes/${m.slug}`}
                  className="flex items-center justify-between gap-2 rounded border bg-muted/20 hover:bg-muted/40 px-3 py-2 text-sm transition"
                >
                  <span className="font-medium">CNA Classes in {m.city}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-sm">
            <Link to="/locations" className="text-primary hover:underline">
              View all clinical training locations →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityLandingPage;
