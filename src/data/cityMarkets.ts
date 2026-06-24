// Per-market data driving city landing pages.
// Each market gets its own URL, title, meta description, and structured data.

export interface CityMarket {
  slug: string;
  city: string;
  region: string;
  county: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  /** True = we have a clinical site here. False = we serve the market from a nearby site. */
  hasClinicalSite: boolean;
  nearestSite: {
    name: string;
    address: string;
    city: string;
    driveTime: string;
  };
  heroHeadline: string;
  heroSubhead: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  whyHere: string[];
  nearbyAreas: string[];
}

export const CITY_MARKETS: CityMarket[] = [
  {
    slug: "stockton",
    city: "Stockton",
    region: "Central Valley",
    county: "San Joaquin County",
    state: "CA",
    zip: "95209",
    lat: 38.0202,
    lng: -121.3236,
    hasClinicalSite: true,
    nearestSite: {
      name: "Meadowood Health and Rehabilitation Center",
      address: "3110 Wagner Heights Rd",
      city: "Stockton",
      driveTime: "On-site",
    },
    heroHeadline: "CNA Classes in Stockton, CA",
    heroSubhead: "CDPH-approved hybrid CNA training at our Stockton main campus — online theory plus in-person clinicals at Meadowood Health and Rehabilitation Center.",
    metaTitle: "CNA Classes in Stockton, CA — CDPH-Approved Hybrid Training",
    metaDescription: "CNA classes in Stockton, CA. Hybrid program with online theory and in-person clinicals at Meadowood. 6-week daytime or 8-weekend tracks. $2,499 tuition.",
    keywords: "CNA classes Stockton, CNA training Stockton CA, CDPH CNA Stockton, hybrid CNA Stockton, nursing assistant Stockton",
    intro: "Health Star Academy is a CDPH-approved CNA school headquartered in Stockton. Our main campus runs clinicals at Meadowood Health and Rehabilitation Center, so Stockton students complete all 100 hours of in-person training minutes from home.",
    whyHere: [
      "Main campus and primary clinical site located in Stockton",
      "Daytime (6-week) and Weekend (8-week) tracks both run from Stockton",
      "Local skills lab and state-exam testing site",
    ],
    nearbyAreas: ["Lodi", "Manteca", "Tracy", "Lathrop", "French Camp"],
  },
  {
    slug: "lodi",
    city: "Lodi",
    region: "Central Valley",
    county: "San Joaquin County",
    state: "CA",
    zip: "95240",
    lat: 38.1302,
    lng: -121.2777,
    hasClinicalSite: true,
    nearestSite: {
      name: "Lodi Creek Post-Acute",
      address: "321 West Turner Road",
      city: "Lodi",
      driveTime: "On-site",
    },
    heroHeadline: "CNA Classes in Lodi, CA",
    heroSubhead: "Hybrid CNA program with in-person clinicals at Lodi Creek Post-Acute. Finish in as little as 6 weeks while keeping your current job.",
    metaTitle: "CNA Classes in Lodi, CA — Clinicals at Lodi Creek Post-Acute",
    metaDescription: "CNA classes in Lodi, CA. CDPH-approved hybrid program with clinicals at Lodi Creek Post-Acute. 6-week daytime or 8-weekend tracks. $2,499 tuition.",
    keywords: "CNA classes Lodi, CNA training Lodi CA, Lodi nursing assistant program, CDPH CNA Lodi",
    intro: "Lodi students train at Lodi Creek Post-Acute, our partner skilled-nursing facility on West Turner Road. Theory hours happen online, so you only commute for clinical days.",
    whyHere: [
      "Dedicated clinical site in Lodi — no Stockton commute required for clinicals",
      "Hybrid format pairs online theory with hands-on Lodi shifts",
      "Small cohorts with licensed-nurse mentors at the facility",
    ],
    nearbyAreas: ["Stockton", "Galt", "Acampo", "Woodbridge", "Lockeford"],
  },
  {
    slug: "hayward",
    city: "Hayward",
    region: "Bay Area",
    county: "Alameda County",
    state: "CA",
    zip: "94541",
    lat: 37.6688,
    lng: -122.0872,
    hasClinicalSite: true,
    nearestSite: {
      name: "Bay Area Skilled Nursing Facility",
      address: "22300 Foothill Blvd",
      city: "Hayward",
      driveTime: "On-site",
    },
    heroHeadline: "CNA Classes in Hayward, CA",
    heroSubhead: "Bay Area CNA training with clinicals at Bay Area Skilled Nursing on Foothill Blvd. CDPH-approved, hybrid, finish in 6 weeks.",
    metaTitle: "CNA Classes in Hayward, CA — Bay Area CDPH Training",
    metaDescription: "Hybrid CNA classes in Hayward, CA. CDPH-approved program with clinicals at Bay Area Skilled Nursing. 6-week daytime or 8-weekend tracks. $2,499 tuition.",
    keywords: "CNA classes Hayward, CNA training Hayward CA, Bay Area CNA program, East Bay CNA, CDPH CNA Hayward",
    intro: "Hayward is our Bay Area training hub. Clinicals run at Bay Area Skilled Nursing Facility on Foothill Blvd, so East Bay students never need to cross the bridge.",
    whyHere: [
      "Bay Area clinical site — no Central Valley commute",
      "Serves Hayward, Fremont, Union City, San Leandro, Oakland students",
      "Hybrid schedule keeps Bay Area working students employed during training",
    ],
    nearbyAreas: ["Fremont", "Union City", "San Leandro", "Castro Valley", "Oakland"],
  },
  {
    slug: "sacramento",
    city: "Sacramento",
    region: "Sacramento Region",
    county: "Sacramento County",
    state: "CA",
    zip: "95814",
    lat: 38.5816,
    lng: -121.4944,
    hasClinicalSite: false,
    nearestSite: {
      name: "Meadowood Health and Rehabilitation Center",
      address: "3110 Wagner Heights Rd",
      city: "Stockton",
      driveTime: "~45 min south on I-5",
    },
    heroHeadline: "CNA Classes for Sacramento Students",
    heroSubhead: "CDPH-approved hybrid CNA program serving Sacramento. Online theory from anywhere; clinicals 45 minutes south at our Stockton main campus.",
    metaTitle: "CNA Classes Sacramento — CDPH-Approved Hybrid Program",
    metaDescription: "CNA classes for Sacramento students. Online theory plus clinicals at our Stockton campus (~45 min). CDPH-approved, 6-week daytime or 8-weekend tracks.",
    keywords: "CNA classes Sacramento, CNA training Sacramento CA, CDPH CNA Sacramento, hybrid CNA Sacramento, nursing assistant Sacramento",
    intro: "Sacramento-area students complete all 60 hours of CNA theory online and drive ~45 minutes south to our Meadowood clinical site in Stockton for hands-on training. Most Sacramento students choose the Weekend track to keep weekday jobs.",
    whyHere: [
      "Online theory works from anywhere in the Sacramento metro",
      "Short I-5 drive to clinicals — done in 6–8 weeks total",
      "Weekend track is the most popular pick for Sacramento students",
    ],
    nearbyAreas: ["Elk Grove", "Galt", "Folsom", "Rancho Cordova", "Citrus Heights"],
  },
  {
    slug: "fremont",
    city: "Fremont",
    region: "East Bay",
    county: "Alameda County",
    state: "CA",
    zip: "94538",
    lat: 37.5485,
    lng: -121.9886,
    hasClinicalSite: false,
    nearestSite: {
      name: "Bay Area Skilled Nursing Facility",
      address: "22300 Foothill Blvd",
      city: "Hayward",
      driveTime: "~20 min north on I-880",
    },
    heroHeadline: "CNA Classes for Fremont, CA",
    heroSubhead: "Hybrid CNA program for Fremont and South Bay students. Online theory plus clinicals 20 minutes away at our Hayward Bay Area Skilled Nursing site.",
    metaTitle: "CNA Classes in Fremont, CA — Hybrid CDPH Program",
    metaDescription: "CNA classes for Fremont, CA. CDPH-approved hybrid program with online theory and clinicals at Bay Area Skilled Nursing (Hayward, ~20 min). 6-week track.",
    keywords: "CNA classes Fremont, CNA training Fremont CA, South Bay CNA program, East Bay CNA Fremont",
    intro: "Fremont students train with our Bay Area cohort. Theory is fully online; clinicals are a 20-minute drive up I-880 to Bay Area Skilled Nursing in Hayward.",
    whyHere: [
      "Short commute to Hayward clinical site",
      "Hybrid schedule fits Fremont tech-corridor work schedules",
      "Serves Fremont, Newark, Union City, and Milpitas",
    ],
    nearbyAreas: ["Newark", "Union City", "Milpitas", "Hayward", "San Jose"],
  },
  {
    slug: "oakland",
    city: "Oakland",
    region: "East Bay",
    county: "Alameda County",
    state: "CA",
    zip: "94612",
    lat: 37.8044,
    lng: -122.2712,
    hasClinicalSite: false,
    nearestSite: {
      name: "Bay Area Skilled Nursing Facility",
      address: "22300 Foothill Blvd",
      city: "Hayward",
      driveTime: "~25 min south on I-880",
    },
    heroHeadline: "CNA Classes for Oakland, CA",
    heroSubhead: "CDPH-approved CNA training for Oakland students. Online theory plus hands-on clinicals at our Hayward partner facility.",
    metaTitle: "CNA Classes in Oakland, CA — Hybrid CDPH Training",
    metaDescription: "CNA classes for Oakland, CA. Hybrid CDPH-approved program with clinicals at Bay Area Skilled Nursing in Hayward. 6-week daytime or 8-weekend tracks.",
    keywords: "CNA classes Oakland, CNA training Oakland CA, East Bay CNA Oakland, CDPH CNA Oakland",
    intro: "Oakland students join the Bay Area cohort. Theory is fully online, and clinicals run at Bay Area Skilled Nursing in Hayward — a short I-880 commute south.",
    whyHere: [
      "Closest Bay Area CDPH clinical partner for Oakland residents",
      "Weekend cohort works for Oakland students with weekday jobs",
      "Career pathway support into Alameda County SNFs and hospitals",
    ],
    nearbyAreas: ["Berkeley", "Alameda", "San Leandro", "Emeryville", "Piedmont"],
  },
  {
    slug: "tracy",
    city: "Tracy",
    region: "Central Valley",
    county: "San Joaquin County",
    state: "CA",
    zip: "95376",
    lat: 37.7397,
    lng: -121.4252,
    hasClinicalSite: false,
    nearestSite: {
      name: "Meadowood Health and Rehabilitation Center",
      address: "3110 Wagner Heights Rd",
      city: "Stockton",
      driveTime: "~25 min north on I-205/I-5",
    },
    heroHeadline: "CNA Classes for Tracy, CA",
    heroSubhead: "Hybrid CNA program serving Tracy. Online theory plus clinicals 25 minutes north at our Stockton main campus.",
    metaTitle: "CNA Classes in Tracy, CA — Hybrid CDPH Program",
    metaDescription: "CNA classes for Tracy, CA. CDPH-approved hybrid program with online theory and clinicals at Meadowood (Stockton, ~25 min). 6-week daytime track available.",
    keywords: "CNA classes Tracy, CNA training Tracy CA, CDPH CNA Tracy, San Joaquin CNA",
    intro: "Tracy students keep theory online and commute 25 minutes north on I-205 to clinicals at Meadowood in Stockton — a Bay Area-friendly schedule from a Central Valley home base.",
    whyHere: [
      "Short I-205 commute to clinical site",
      "Hybrid format saves gas vs. daily classroom schools",
      "Daytime and Weekend tracks both available",
    ],
    nearbyAreas: ["Mountain House", "Lathrop", "Manteca", "Livermore", "Stockton"],
  },
  {
    slug: "manteca",
    city: "Manteca",
    region: "Central Valley",
    county: "San Joaquin County",
    state: "CA",
    zip: "95336",
    lat: 37.7975,
    lng: -121.2161,
    hasClinicalSite: false,
    nearestSite: {
      name: "Meadowood Health and Rehabilitation Center",
      address: "3110 Wagner Heights Rd",
      city: "Stockton",
      driveTime: "~20 min north on Hwy 99",
    },
    heroHeadline: "CNA Classes for Manteca, CA",
    heroSubhead: "CDPH-approved hybrid CNA training for Manteca. Online theory and clinicals 20 minutes away at our Stockton campus.",
    metaTitle: "CNA Classes in Manteca, CA — Hybrid CDPH Training",
    metaDescription: "CNA classes for Manteca, CA. CDPH-approved hybrid program; clinicals at Meadowood (Stockton, ~20 min). 6-week daytime or 8-weekend tracks. $2,499 tuition.",
    keywords: "CNA classes Manteca, CNA training Manteca CA, CDPH CNA Manteca, nursing assistant Manteca",
    intro: "Manteca students take theory online and drive 20 minutes north on Hwy 99 to clinicals at Meadowood in Stockton. Either Daytime or Weekend track works.",
    whyHere: [
      "20-minute commute to clinical site",
      "Local SNF career placements after certification",
      "Hybrid schedule preserves current employment",
    ],
    nearbyAreas: ["Lathrop", "Ripon", "Stockton", "Tracy", "Modesto"],
  },
  {
    slug: "modesto",
    city: "Modesto",
    region: "Central Valley",
    county: "Stanislaus County",
    state: "CA",
    zip: "95354",
    lat: 37.6391,
    lng: -120.9969,
    hasClinicalSite: false,
    nearestSite: {
      name: "Meadowood Health and Rehabilitation Center",
      address: "3110 Wagner Heights Rd",
      city: "Stockton",
      driveTime: "~35 min north on Hwy 99",
    },
    heroHeadline: "CNA Classes for Modesto, CA",
    heroSubhead: "Hybrid CNA training serving Modesto and Stanislaus County. Online theory plus clinicals at our Stockton campus.",
    metaTitle: "CNA Classes in Modesto, CA — Hybrid CDPH Program",
    metaDescription: "CNA classes for Modesto, CA. CDPH-approved hybrid program with online theory and clinicals at Meadowood in Stockton. 6-week or 8-weekend tracks.",
    keywords: "CNA classes Modesto, CNA training Modesto CA, Stanislaus CNA, CDPH CNA Modesto",
    intro: "Modesto and Stanislaus County students train fully online for theory and travel ~35 minutes north on Hwy 99 to clinicals at our Stockton main campus.",
    whyHere: [
      "Closest CDPH hybrid program serving Stanislaus County",
      "Weekend track popular with Modesto working students",
      "Same $2,499 flat tuition as Central Valley students",
    ],
    nearbyAreas: ["Ceres", "Turlock", "Riverbank", "Oakdale", "Manteca"],
  },
];

export const getMarket = (slug: string) =>
  CITY_MARKETS.find((m) => m.slug === slug.toLowerCase());
