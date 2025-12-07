import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import '../globals.css';
import { type Locale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

const baseUrl = 'https://vietmap.vercel.app';
const GA_MEASUREMENT_ID = 'G-WZQ1V6BVQM';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  const alternateLanguages = Object.fromEntries(
    locales.map((l) => [l, `${baseUrl}/${l}`])
  );

  return {
    title: {
      default: dict.meta.title,
      template: `%s | ${dict.meta.title}`,
    },
    description: dict.meta.description,
    keywords:
      locale === 'vi'
        ? [
            'bản đồ 3D Việt Nam',
            'bản đồ Việt Nam',
            'Hoàng Sa',
            'Trường Sa',
            'địa lý Việt Nam',
            'tỉnh thành Việt Nam',
            '34 tỉnh thành',
            'sáp nhập tỉnh 2025',
          ]
        : [
            'Vietnam 3D map',
            'Vietnam map',
            'Paracel Islands',
            'Spratly Islands',
            'Vietnam geography',
            'Vietnam provinces',
            '34 provinces',
            'province merger 2025',
          ],
    authors: [{ name: 'Lam Ngoc Khuong', url: 'https://khuong.dev' }],
    creator: 'Lam Ngoc Khuong',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternateLanguages,
    },
    icons: {
      icon: '/icon.svg',
    },
    verification: {
      google: 'XhDoCgldH-4ctJaAhfo3bgJ5qvwjvKXkts0_YYDz1cw',
    },
    openGraph: {
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? 'en_US' : 'vi_VN',
      url: `${baseUrl}/${locale}`,
      siteName: dict.meta.title,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: dict.meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

function JsonLd({ locale }: { locale: string }) {
  const isVi = locale === 'vi';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isVi ? 'Bản đồ 3D Việt Nam' : 'Vietnam 3D Map',
    description: isVi
      ? 'Bản đồ 3D tương tác của Việt Nam với quần đảo Hoàng Sa và Trường Sa'
      : 'Interactive 3D Map of Vietnam including Paracel and Spratly Islands',
    url: `${baseUrl}/${locale}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Lam Ngoc Khuong',
      url: 'https://khuong.dev',
    },
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
    about: {
      '@type': 'Place',
      name: isVi ? 'Việt Nam' : 'Vietnam',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 16.0544,
        longitude: 108.2022,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires innerHTML for SEO
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script
          data-goatcounter="https://vietmap.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
        <JsonLd locale={locale} />
      </head>
      <body className={`${inter.className} bg-vietnam-ocean`}>{children}</body>
    </html>
  );
}
