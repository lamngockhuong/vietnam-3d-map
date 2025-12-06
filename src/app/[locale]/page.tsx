import { MapWrapper } from '@/components/MapWrapper';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Legend } from '@/components/ui/Legend';
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
      <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <h1 className="text-5xl font-bold text-white tracking-[0.3em] drop-shadow-lg">
          {dict.title.main}
        </h1>
        <div className="text-vietnam-yellow text-sm mt-2 tracking-wider">{dict.title.subtitle}</div>
      </div>

      {/* Top Right Controls - Camera toggle + Language Switcher in one container */}
      <div className="fixed top-8 right-8 z-10">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Legend Panel - increased margins from edges */}
      <div className="fixed top-28 left-8 z-10">
        <Legend dict={dict} />
      </div>
    </main>
  );
}
