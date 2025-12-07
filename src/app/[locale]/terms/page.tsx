import type { Metadata } from 'next';
import { FileText, GraduationCap, Database, Scale, AlertCircle, RefreshCw } from 'lucide-react';
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
    title: `${dict.pages.terms.title} | ${dict.meta.title}`,
    description: dict.pages.terms.description,
  };
}

const sectionIcons = [FileText, GraduationCap, Database, Scale, AlertCircle, RefreshCw];
const sectionColors = [
  { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
  { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80' },
  { bg: 'rgba(6, 182, 212, 0.1)', text: '#22d3ee' },
  { bg: 'rgba(168, 85, 247, 0.1)', text: '#a78bfa' },
  { bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c' },
  { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
];

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const terms = dict.pages.terms;

  const sections = [
    { title: terms.acceptance, content: terms.acceptanceText },
    { title: terms.educationalUse, content: terms.educationalUseText },
    { title: terms.accuracy, content: terms.accuracyText },
    { title: terms.intellectualProperty, content: terms.intellectualPropertyText },
    { title: terms.limitations, content: terms.limitationsText },
    { title: terms.changes, content: terms.changesText },
  ];

  return (
    <PageLayout locale={locale} dict={dict} title={terms.title} description={terms.description}>
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

        <div style={{
          paddingTop: '24px',
          marginTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>
            {terms.lastUpdated}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
