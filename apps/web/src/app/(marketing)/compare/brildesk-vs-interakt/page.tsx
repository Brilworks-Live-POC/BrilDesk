import type { Metadata } from 'next';
import { ComparisonTable, PricingComparison, CtaBanner } from '../comparison-table';

export const metadata: Metadata = {
  title: 'BrilDesk vs Interakt - WhatsApp Shared Inbox Comparison (2026)',
  description:
    'Compare BrilDesk and Interakt for WhatsApp sales teams. BrilDesk offers full CRM, deal tracking, and agent routing where Interakt focuses on broadcast and e-commerce.',
  keywords: [
    'BrilDesk vs Interakt',
    'Interakt alternative',
    'WhatsApp shared inbox',
    'WhatsApp CRM',
  ],
};

const features = [
  { name: 'WhatsApp Shared Inbox', brildesk: true, competitor: true },
  { name: 'Built-in CRM & Deal Tracking', brildesk: true, competitor: false, highlight: true },
  { name: 'Smart Agent Routing', brildesk: true, competitor: 'Basic', highlight: true },
  { name: 'Sales Pipeline View', brildesk: true, competitor: false, highlight: true },
  { name: 'Broadcast Campaigns', brildesk: true, competitor: true },
  { name: 'Click-to-WhatsApp Ads', brildesk: 'Coming soon', competitor: true },
  { name: 'E-Commerce Integrations', brildesk: 'Coming soon', competitor: 'Shopify, WooCommerce' },
  { name: 'No-Code Chatbot', brildesk: 'Coming soon', competitor: true },
  { name: 'AI Agent', brildesk: 'Coming soon', competitor: 'Premium add-on (~$115)' },
  { name: 'Team Collaboration', brildesk: true, competitor: true },
  { name: 'WhatsApp Business API', brildesk: true, competitor: true },
  { name: 'Contact Management', brildesk: 'Full CRM', competitor: 'Basic contacts', highlight: true },
];

export default function BrilDeskVsInterakt() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-4">
        <a href="/compare" className="text-sm text-green-600 hover:underline">
          &larr; All comparisons
        </a>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
        BrilDesk vs Interakt: WhatsApp CRM for Sales vs Broadcast & E-Commerce Tool
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-gray-600">
        Interakt is popular for WhatsApp broadcasts and Shopify integrations. But if your team
        needs to manage sales conversations, track deals, and route leads to the right agent,
        BrilDesk is purpose-built for that job.
      </p>

      {/* Key differences */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Differences</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Sales Pipeline Built In</h3>
            <p className="text-sm text-gray-700">
              BrilDesk gives you deal tracking and pipeline views right inside your WhatsApp
              inbox. Interakt focuses on broadcast campaigns and order notifications — great
              for e-commerce, but not for managing a sales process.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Smart Agent Routing</h3>
            <p className="text-sm text-gray-700">
              Route incoming leads to the right sales rep based on rules you set.
              Interakt offers basic team inbox features, but lacks intelligent routing
              for high-volume sales teams.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Full Contact CRM</h3>
            <p className="text-sm text-gray-700">
              Every WhatsApp contact in BrilDesk is a CRM record with deal history,
              notes, and tags. Interakt provides basic contact management without
              the depth sales teams need.
            </p>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Feature-by-Feature Comparison</h2>
        <ComparisonTable competitorName="Interakt" features={features} />
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Pricing Comparison</h2>
        <PricingComparison
          competitorName="Interakt"
          brildeskPrice="Free to start"
          competitorPrice="From ~$49/mo"
          brildeskNote="CRM, deal tracking, and agent routing included"
          competitorNote="AI agents are a ~$115/mo premium add-on. Meta fees separate."
          brildeskIncludes={[
            'Shared WhatsApp inbox',
            'Built-in CRM & deal tracking',
            'Smart agent routing',
            'Sales pipeline management',
            'Team collaboration tools',
          ]}
          competitorIncludes={[
            'Shared WhatsApp inbox',
            'Broadcast campaigns',
            'Click-to-WhatsApp ads',
            'Shopify & WooCommerce integrations',
            'No-code chatbot builder',
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
              <li>&#8226; Run a sales team that closes deals over WhatsApp</li>
              <li>&#8226; Need CRM and pipeline tracking in your inbox</li>
              <li>&#8226; Want smart routing so leads reach the right agent</li>
              <li>&#8226; Need more than just broadcast — you need conversation management</li>
              <li>&#8226; Are a service business (agency, consulting, B2B)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-3 font-semibold text-gray-600">Choose Interakt if you...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>&#8226; Run an e-commerce store on Shopify or WooCommerce</li>
              <li>&#8226; Primarily need WhatsApp for order notifications and broadcasts</li>
              <li>&#8226; Want click-to-WhatsApp ad integrations today</li>
              <li>&#8226; Need a no-code chatbot for automated customer support</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
