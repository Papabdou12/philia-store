import React from 'react';
import { Helmet } from 'react-helmet';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://philiastore.sn';
const STORE_PHONE = import.meta.env.VITE_STORE_PHONE || '';
const STORE_INSTAGRAM = import.meta.env.VITE_STORE_INSTAGRAM || '';
const STORE_TIKTOK = import.meta.env.VITE_STORE_TIKTOK || '';

const sameAs = [STORE_INSTAGRAM, STORE_TIKTOK].filter(Boolean);

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: import.meta.env.VITE_SITE_NAME || "Philia'Store",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  ...(STORE_PHONE && {
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: STORE_PHONE,
      contactType: 'customer service',
      areaServed: 'SN',
      availableLanguage: 'French',
    },
  }),
  ...(sameAs.length > 0 && { sameAs }),
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "Philia'Store",
  url: BASE_URL,
  description: "Boutique en ligne sénégalaise — Mode, Beauté, Tech, Maison, Enfants et Sport. Livraison dans tout le Sénégal.",
  inLanguage: 'fr-SN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/boutique?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * SEOHead — Composant SEO/GEO unifié pour Philia'Store
 *
 * Props issues de getPageMeta() :
 *   title, description, canonical,
 *   ogTitle, ogDescription, ogImage, ogType, ogUrl,
 *   twitterCard, siteName,
 *   extraSchemas (array de JSON-LD objects supplémentaires)
 *   includeOrganization (bool, défaut true)
 *   includeWebSite (bool, défaut true sur la home)
 */
const SEOHead = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  siteName = "Philia'Store",
  extraSchemas = [],
  includeOrganization = true,
  includeWebSite = false,
}) => {
  const resolvedCanonical = canonical || ogUrl || BASE_URL;
  const resolvedOgUrl = ogUrl || canonical || BASE_URL;
  const resolvedOgImage = ogImage || `${BASE_URL}/og-image.jpg`;
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;

  const schemas = [];
  if (includeOrganization) schemas.push(ORGANIZATION_SCHEMA);
  if (includeWebSite) schemas.push(WEBSITE_SCHEMA);
  schemas.push(...extraSchemas);

  return (
    <Helmet>
      {/* Balises de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Hreflang — français uniquement (marché sénégalais) */}
      <link rel="alternate" hrefLang="fr" href={resolvedCanonical} />
      <link rel="alternate" hrefLang="fr-SN" href={resolvedCanonical} />
      <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="fr_SN" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* JSON-LD schemas */}
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/<\/script>/gi, '<\\/script>') }}
        />
      ))}
    </Helmet>
  );
};

export default SEOHead;
