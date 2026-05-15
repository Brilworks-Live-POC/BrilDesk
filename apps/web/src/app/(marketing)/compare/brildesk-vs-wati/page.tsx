import type { Metadata } from 'next';
import { ComparisonTable, PricingComparison, CtaBanner } from '../comparison-table';

export const metadata: Metadata = {
  title: 'BrilDesk vs WATI - WhatsApp Shared Inbox Comparison (2026)',
  description:
    'Compare BrilDesk and WATI for WhatsApp shared inbox. BrilDesk offers built-in CRM, deal tracking, and transparent pricing without per-message markups.',
  keywords: ['BrilDesk vs WATI', 'WATI alternative', 'WhatsApp shared inbox', 'WhatsApp CRM'],
};

const features = [
  { name: 'WhatsApp Shared Inbox', brildesk: true, competitor: true },
  { name: 'Built-in CRM & Deal Tracking', brildesk: true, competitor: false, highlight: true },
  { name: 'Smart Agent Routing', brildesk: true, competitor: 'Basic assignment', highlight: true },
  { name: 'Per-Message Markup', brildesk: 'None', competitor: '~20% on Meta rates', highlight: true },
  { name: 'Broadcast Campaigns', brildesk: true, competitor: true },
  { name: 'Team Collaboration', brildesk: true, competitor: true },
  { name: 'Chatbot Builder', brildesk: 'Coming soon', competitor: true },
  { name: 'Shopify Integration', brildesk: 'Coming soon', competitor: '$4.99/mo add-on' },
  { name: 'Extra User Cost', brildesk: 'Included in plan', competitor: '$39-89/mo per user', highlight: true },
  { name: 'WhatsApp Business API', brildesk: true, competitor: true },
  { name: 'Contact Management', brildesk: 'Full CRM', competitor: 'Basic contacts' },
  { name: 'Sales Pipeline View', brildesk: true, competitor: false, highlight: true },
];

export default function BrilDeskVsWati() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-4">
        <a href="/compare" className="text-sm text-green-600 hover:underline">
          &larr; All comparisons
        </a>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
        BrilDesk vs WATI: Which WhatsApp Inbox Is Right for Your Sales Team?
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-gray-600">
        Both BrilDesk and WATI help teams manage WhatsApp conversations. But if your sales team
        needs deal tracking, pipeline visibility, and transparent pricing, here&apos;s why BrilDesk
        is the better fit.
      </p>

      {/* Key differences */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Differences</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Built-in CRM</h3>
            <p className="text-sm text-gray-700">
              BrilDesk includes CRM and deal tracking in every plan. WATI focuses on messaging
              and requires external CRM integrations to manage your pipeline.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">No Per-Message Markups</h3>
            <p className="text-sm text-gray-700">
              WATI adds approximately 20% markup on top of Meta&apos;s official per-message rates.
              BrilDesk passes through Meta&apos;s rates with zero markup.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Users Included</h3>
            <p className="text-sm text-gray-700">
              WATI charges $39-89/month per additional user. BrilDesk includes team members in
              your plan so you can scale without surprise costs.
            </p>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Feature-by-Feature Comparison</h2>
        <ComparisonTable competitorName="WATI" features={features} />
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Pricing Comparison</h2>
        <PricingComparison
          competitorName="WATI"
          brildeskPrice="Free to start"
          competitorPrice="From $59/mo"
          brildeskNote="Transparent pricing with no per-message markups"
          competitorNote="Plus ~20% message markup and $39-89/mo per extra user"
          brildeskIncludes={[
            'Shared WhatsApp inbox',
            'Built-in CRM & deal tracking',
            'Smart agent routing',
            'Team members included',
            'No per-message markup',
          ]}
          competitorIncludes={[
            'Shared WhatsApp inbox',
            'Broadcast campaigns',
            'Chatbot builder',
            'Shopify integration ($4.99 add-on)',
            'Extra users $39-89/mo each',
          ]}
        />
      </section>

      {/* Who should choose */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Who Should Choose What?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-3 font-semibold text-green-700">Choose BrilDesk if you...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>&#8226; Need to track deals and sales pipeline on WhatsApp</li>
              <li>&#8226; Want transparent pricing without per-message markups</li>
              <li>&#8226; Need smart routing to assign leads to the right agent</li>
              <li>&#8226; Are a growing SMB team that wants CRM included</li>
              <li>&#8226; Want to scale your team without per-seat surcharges</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-3 font-semibold text-gray-600">Choose WATI if you...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>&#8226; Primarily need broadcast campaigns and chatbots</li>
              <li>&#8226; Already use an external CRM you don&apos;t want to replace</li>
              <li>&#8226; Need deep Shopify/e-commerce integrations today</li>
              <li>&#8226; Run a support-first (not sales-first) operation</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
