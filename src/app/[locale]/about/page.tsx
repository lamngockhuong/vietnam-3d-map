import type { Metadata } from 'next';
import { Code2, Globe, Hand, Map } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

type PageParams = { locale: Locale };

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: `${dict.pages.about.title} | ${dict.meta.title}`,
    description: dict.pages.about.description,
  };
}

const featureIcons = [Map, Globe, Map, Hand, Globe];

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const about = dict.pages.about;

  return (
    <PageLayout locale={locale} dict={dict} title={about.title} description={about.description}>
      {/* Purpose Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Map style={{ width: '20px', height: '20px', color: '#eab308' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, marginBottom: '8px' }}>
              {about.purpose}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
              {about.purposeText}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Globe style={{ width: '20px', height: '20px', color: '#22d3ee' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, marginBottom: '12px' }}>
              {about.features}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {about.featuresText.map((feature, index) => {
                const Icon = featureIcons[index] || Map;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '14px', paddingTop: '3px' }}>{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Code2 style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, marginBottom: '8px' }}>
              {about.technology}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, margin: 0, marginBottom: '16px' }}>
              {about.technologyText}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Next.js', 'React Three Fiber', 'Three.js', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                <span
                  key={tech}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Code2 style={{ width: '20px', height: '20px', color: '#4ade80' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, marginBottom: '8px' }}>
              {about.openSource}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, margin: 0, marginBottom: '16px' }}>
              {about.openSourceText.split('github.com/lamngockhuong/vietnam-3d-map')[0]}
            </p>
            <a
              href="https://github.com/lamngockhuong/vietnam-3d-map"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              <svg style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.6)' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span style={{ fontWeight: 500 }}>lamngockhuong/vietnam-3d-map</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <div style={{
        paddingTop: '24px',
        marginTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: 0, marginBottom: '8px' }}>
          {about.contact}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, fontSize: '15px' }}>
          {about.contactText.split('khuong.dev')[0]}
          <a
            href="https://khuong.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#eab308', textDecoration: 'none' }}
          >
            khuong.dev
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
