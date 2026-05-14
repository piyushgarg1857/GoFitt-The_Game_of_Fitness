import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  noindex?: boolean;
}

export default function SEO({
  title = 'GoFit - Professional Fitness Experience',
  description = 'Track your athletic progress, connect with peers, and reach milestones. GoFit provides a refined tracking ecosystem for dedicated individuals.',
  keywords = 'fitness, tracking, workout, health, community, leaderboard, sports',
  ogImage = '/logo.png', // Fallback to logo if no specific OG image is provided
  url = 'https://gofitt.vercel.app',
  noindex = false,
}: SEOProps) {
  const pageTitle = title.includes('GoFit') ? title : `${title} | GoFit`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content="English" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="GoFit" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Head>
  );
}
