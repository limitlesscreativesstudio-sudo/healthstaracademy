const BASE_URL = "https://www.healthstaracademy.org";

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": item.name,
        "item": `${BASE_URL}${item.path}`,
      })),
    ],
  };
}
