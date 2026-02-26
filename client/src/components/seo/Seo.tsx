interface SeoProps {
  title: string;
  description: string;
}

const APP_NAME = "Instant Wellness Kits";

export function Seo({ title, description }: SeoProps) {
  const fullTitle = `${title} | ${APP_NAME}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
