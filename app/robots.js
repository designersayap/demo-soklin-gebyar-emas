export const runtime = 'edge';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://berkah-umroh.sabunkrimekonomi.id//sitemap.xml',
  };
}