import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  type?: "website" | "article";
  image?: string;
  author?: string;
  publishedTime?: string;
  robots?: string;
  structuredData?: object | object[];
}

const SEO = ({
  title,
  description,
  canonical,
  keywords,
  type = "website",
  image = "https://www.healthstaracademy.org/og-image.png",
  author,
  publishedTime,
  robots,
  structuredData,
}: SEOProps) => {
  const baseUrl = "https://www.healthstaracademy.org";
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots Meta Tag */}
      {robots && <meta name="robots" content={robots} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Health Star Academy" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      {/* Geo Tags */}
      <meta name="geo.region" content="US-CA" />
      <meta name="geo.placename" content="Stockton, Sacramento, Bay Area" />

      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData)
          ? structuredData.map((data, i) => (
              <script key={i} type="application/ld+json">
                {JSON.stringify(data)}
              </script>
            ))
          : (
              <script type="application/ld+json">
                {JSON.stringify(structuredData)}
              </script>
            )
      )}
    </Helmet>
  );
};

export default SEO;
