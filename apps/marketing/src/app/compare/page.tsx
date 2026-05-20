import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare BrilDesk to Alternatives',
  description:
    'See how BrilDesk compares to WATI, Respond.io, Trengo, and Interakt for WhatsApp shared inbox, CRM, and sales team collaboration.',
};

const competitors = [
  {
    slug: 'brildesk-vs-wati',
    name: 'WATI',
    tagline: 'Built-in CRM & transparent pricing vs per-message markups',
    bestFor: 'Teams that want deal tracking without paying extra per message',
  },
  {
    slug: 'brildesk-vs-respond-io',
    name: 'Respond.io',
    tagline: 'Sales-focused simplicity vs omnichannel complexity',
    bestFor: 'Sales teams that need WhatsApp + CRM, not 10 channels they won\'t use',
  },
  {
    slug: 'brildesk-vs-trengo',
    name: 'Trengo',
    tagline: 'Affordable SMB pricing vs enterprise-tier costs',
    bestFor: 'Growing teams that need WhatsApp collaboration without the enterprise price tag',
  },
  {
    slug: 'brildesk-vs-interakt',
    name: 'Interakt',
    tagline: 'Full CRM & agent routing vs basic broadcast tools',
    bestFor: 'Teams that need sales pipeline management, not just bulk messaging',
  },
];

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
        How BrilDesk Compares
      </h1>
      <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600">
        BrilDesk is the WhatsApp shared inbox built for sales teams. See how we stack up against
        the alternatives on features, pricing, and ease of use.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {competitors.map((c) => (
          <a
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="group rounded-xl border border-gray-200 p-6 transition hover:border-green-300 hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-green-700">
              BrilDesk vs {c.name}
            </h2>
            <p className="mb-3 text-sm text-gray-600">{c.tagline}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Best for:</span> {c.bestFor}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
