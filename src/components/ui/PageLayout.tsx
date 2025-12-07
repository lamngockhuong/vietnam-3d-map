import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

function GithubIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

interface PageLayoutProps {
  locale: Locale;
  dict: Dictionary;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PageLayout({ locale, dict, title, description, children }: PageLayoutProps) {
  return (
    <div
      className="page-layout"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0c1e2b',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Decorative background elements */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '-160px',
          right: '-160px',
          width: '384px',
          height: '384px',
          backgroundColor: 'rgba(234, 179, 8, 0.05)',
          borderRadius: '50%',
          filter: 'blur(48px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-160px',
          width: '320px',
          height: '320px',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          borderRadius: '50%',
          filter: 'blur(48px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Navigation bar */}
        <nav style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{
            maxWidth: '896px',
            margin: '0 auto',
            padding: '0 48px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '64px',
            }}>
              <Link
                href={`/${locale}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                <span>{dict.pages.backToMap}</span>
              </Link>

              <a
                href="https://github.com/lamngockhuong/vietnam-3d-map"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                title="GitHub"
              >
                <GithubIcon style={{ width: '20px', height: '20px' }} />
              </a>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: '64px 48px 80px 48px',
          width: '100%',
          flex: 1,
        }}>
          {/* Page header */}
          <header style={{ marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}>
              {title}
            </h1>
            {description && (
              <p style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '640px',
                lineHeight: 1.6,
              }}>
                {description}
              </p>
            )}
          </header>

          {/* Page content */}
          <div style={{ maxWidth: '720px' }}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'auto',
        }}>
          <div style={{
            maxWidth: '896px',
            margin: '0 auto',
            padding: '32px 48px',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '32px',
                fontSize: '14px',
              }}>
                <Link
                  href={`/${locale}/about`}
                  style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  {dict.footer.about}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  {dict.footer.terms}
                </Link>
                <Link
                  href={`/${locale}/privacy`}
                  style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  {dict.footer.privacy}
                </Link>
              </div>
              <a
                href="https://khuong.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                }}
              >
                © 2025 khuong.dev
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
