'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type Locale } from '@/i18n/config';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

const localeFullNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = currentLocale === 'vi' ? 'en' : 'vi';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const isVietnamese = currentLocale === 'vi';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleLocale}
          className="relative bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 rounded-full flex items-center cursor-pointer transition-all hover:shadow-xl"
          style={{ width: '72px', height: '36px', padding: '3px' }}
        >
          {/* Sliding indicator */}
          <span
            className="absolute bg-gray-800 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: '30px',
              height: '30px',
              left: isVietnamese ? '3px' : '39px',
            }}
          />
          {/* Labels */}
          <span
            className={`relative z-10 flex-1 text-xs font-semibold text-center transition-colors duration-300 ${
              isVietnamese ? 'text-white' : 'text-gray-500'
            }`}
          >
            VI
          </span>
          <span
            className={`relative z-10 flex-1 text-xs font-semibold text-center transition-colors duration-300 ${
              !isVietnamese ? 'text-white' : 'text-gray-500'
            }`}
          >
            EN
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {localeFullNames[currentLocale === 'vi' ? 'en' : 'vi']}
      </TooltipContent>
    </Tooltip>
  );
}
