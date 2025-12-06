'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type Locale, locales } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

// Compact locale labels
const localeLabels: Record<Locale, string> = {
  vi: 'VI',
  en: 'EN',
};

const localeFullNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-gray-100 flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentLocale === locale
              ? 'bg-gray-800 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title={localeFullNames[locale]}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
