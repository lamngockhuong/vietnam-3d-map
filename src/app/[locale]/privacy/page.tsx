import type { Metadata } from 'next';
import { Shield, HardDrive, Cookie, ExternalLink, Users, RefreshCw, Mail } from 'lucide-react';
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
    title: `${dict.pages.privacy.title} | ${dict.meta.title}`,
    description: dict.pages.privacy.description,
  };
}

const sectionIcons = [Shield, HardDrive, Cookie, ExternalLink, Users, RefreshCw];
const sectionColors = [
  { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80' },
  { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
  { bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c' },
  { bg: 'rgba(168, 85, 247, 0.1)', text: '#a78bfa' },
  { bg: 'rgba(6, 182, 212, 0.1)', text: '#22d3ee' },
  { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
];

const highlightCards = [
  { icon: Shield, bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', text: 'No personal data collection' },
  { icon: HardDrive, bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', text: 'Local storage only' },
  { icon: Cookie, bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.1)', color: '#fb923c', text: 'No tracking cookies' },
];

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const privacy = dict.pages.privacy;

  const sections = [
    { title: privacy.collection, content: privacy.collectionText },
    { title: privacy.localStorage, content: privacy.localStorageText },
    { title: privacy.cookies, content: privacy.cookiesText },
    { title: privacy.thirdParty, content: privacy.thirdPartyText },
    { title: privacy.children, content: privacy.childrenText },
    { title: privacy.changes, content: privacy.changesText },
  ];

  return (
    <PageLayout locale={locale} dict={dict} title={privacy.title} description={privacy.description}>
      {/* Privacy highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '40px',
      }}>
        {highlightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: card.bg,
              border: `1px solid ${card.border}`,
            }}>
              <Icon style={{ width: '20px', height: '20px', color: card.color, marginBottom: '6px' }} />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{card.text}</p>
            </div>
          );
        })}
      </div>

      {/* Main sections */}
      <div>
        {sections.map((section, index) => {
          const Icon = sectionIcons[index];
          const colors = sectionColors[index];
          return (
            <section key={index} style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: colors.text }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    marginBottom: '8px',
                  }}>
                    {section.title}
                  </h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.7,
                    margin: 0,
                    fontSize: '15px',
                  }}>
                    {section.content}
                  </p>
                </div>
              </div>
            </section>
          );
        })}

        {/* Contact Section */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Mail style={{ width: '20px', height: '20px', color: '#f472b6' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                marginBottom: '8px',
              }}>
                {privacy.contact}
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                margin: 0,
                fontSize: '15px',
              }}>
                {privacy.contactText.split('khuong.dev')[0]}
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
          </div>
        </section>

        <div style={{
          paddingTop: '24px',
          marginTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>
            {privacy.lastUpdated}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
