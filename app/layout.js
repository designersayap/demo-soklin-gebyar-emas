import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Krim Ekonomi gebyar-berkah-umroh",
  description: "Berkah Ekonomi - Solusi Rumah Nyaman untuk keluarga Indonesia. Menangkan hadiah Umroh dan Logam Mulia dari Sabun Ekonomi.",
  keywords: "Sabun Ekonomi, Berkah Ekonomi, Undian Berhadiah, Umroh, Emas, Logam Mulia, Solusi Rumah Nyaman",
  icons: { icon: "https://res.cloudinary.com/dp3tcw3wj/image/upload/v1766991826/favicon-ekonomi_mg5xwv.ico" },
  alternates: { canonical: "https://berkah-umroh.sabunkrimekonomi.id/" },
  openGraph: {
    title: "Berkah Ekonomi - Gebyar Berkah Umroh Pesta Emas",
    description: "Menangkan hadiah Umroh dan Emas dari Sabun Ekonomi. Solusi hemat dan bersih untuk keluarga",
    images: [{ url: "https://res.cloudinary.com/dp3tcw3wj/image/upload/v1769656055/banner-testimonial-placeholder-desktop_cyvdie.webp" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Poppins:wght@600;700&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
        
        {/* Favicon */}
        <link rel="icon" href="https://res.cloudinary.com/dp3tcw3wj/image/upload/v1766991826/favicon-ekonomi_mg5xwv.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Berkah Ekonomi - Gebyar Berkah Umroh Pesta Emas" />
        <meta property="og:description" content="Menangkan hadiah Umroh dan Emas dari Sabun Ekonomi. Solusi hemat dan bersih untuk keluarga" />
        <meta property="og:image" content="https://res.cloudinary.com/dp3tcw3wj/image/upload/v1769656055/banner-testimonial-placeholder-desktop_cyvdie.webp" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://berkah-umroh.sabunkrimekonomi.id/" />
        
      </head>
      <body>
        {children}
        
        {/* Analytics Scripts */}
        
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5F3T8GZZ');`}
        </Script>
        

        
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "ukanc4ygp4");`}
        </Script>

        

        
      </body>
    </html>
  );
}
