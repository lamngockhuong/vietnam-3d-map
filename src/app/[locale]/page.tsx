import { MapWrapper } from '@/components/MapWrapper';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

type PageParams = { locale: Locale };

interface PageProps {
  params: Promise<PageParams>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 3D Map Canvas */}
      <MapWrapper dict={dict} />

      {/* Title HUD */}
      <div className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 text-center z-10 w-full px-16 sm:px-4 sm:w-auto">
        <h1 className="text-2xl sm:text-5xl font-bold text-white tracking-[0.2em] sm:tracking-[0.3em] drop-shadow-lg whitespace-nowrap">
          {dict.title.main}
        </h1>
        <div className="text-vietnam-yellow text-xs sm:text-sm tracking-wider" style={{ marginTop: '8px' }}>
          {dict.title.subtitle}
        </div>
      </div>

      {/* Top Right Controls - Language Switcher */}
      <div className="fixed top-4 sm:top-8 right-3 sm:right-8 z-10">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Copyright */}
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
        <a
          href="https://khuong.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 text-xs hover:text-white transition-colors"
        >
          © 2025 khuong.dev
        </a>
      </div>
    </main>
  );
}
