import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { type Locale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

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

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    icons: {
      icon: '/icon.svg',
    },
    verification: {
      google: 'XhDoCgldH-4ctJaAhfo3bgJ5qvwjvKXkts0_YYDz1cw',
    },
  };
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
      <body className={`${inter.className} bg-vietnam-ocean`}>{children}</body>
    </html>
  );
}
