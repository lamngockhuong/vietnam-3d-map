import { type NextRequest, NextResponse } from 'next/server';

const locales = ['vi', 'en'] as const;
const defaultLocale = 'vi';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except _next, api, static files, and public assets
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.json$|.*\\.html$).*)',
  ],
};
