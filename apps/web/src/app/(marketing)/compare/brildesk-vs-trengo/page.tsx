import type { Metadata } from 'next';
import { ComparisonTable, PricingComparison, CtaBanner } from '../comparison-table';

export const metadata: Metadata = {
  title: 'BrilDesk vs Trengo - WhatsApp Shared Inbox Comparison (2026)',
  description:
    'Compare BrilDesk and Trengo for WhatsApp shared inbox. BrilDesk offers built-in CRM and deal tracking at a fraction of Trengo\'s enterprise pricing.',
  keywords: [
    'BrilDesk vs Trengo',
    'Trengo alternative',
    'WhatsApp shared inbox',
    'WhatsApp CRM',
  ],
};

const features = [
  { name: 'WhatsApp Shared Inbox', brildesk: true, competitor: true },
  { name: 'Built-in CRM & Deal Tracking', brildesk: true, competitor: false, highlight: true },
  { name: 'Smart Agent Routing', brildesk: true, competitor: true },
  { name: 'Sales Pipeline View', brildesk: true, competitor: false, highlight: true },
  { name: 'Multi-Channel (Email, Voice, etc.)', brildesk: 'WhatsApp-focused', competitor: true },
  { name: 'Team Collaboration', brildesk: true, competitor: true },
  { name: 'Broadcast Campaigns', brildesk: true, competitor: 'Add-on' },
  { name: 'Billing Model', brildesk: 'Per plan', competitor: 'Per conversation', highlight: true },
  { name: 'WhatsApp Business API', brildesk: true, competitor: 'Add-on cost' },
  { name: 'Starting Price', brildesk: 'Free to start', competitor: 'From ~$325/mo', highlight: true },
  { name: 'Users Included', brildesk: 'Included in plan', competitor: '10 on Boost, 20 on Pro' },
  { name: 'Ease of Setup', brildesk: 'Minutes', competitor: 'Moderate' },
];

export default function BrilDeskVsTrengo() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-4">
        <a href="/compare" className="text-sm text-green-600 hover:underline">
          &larr; All comparisons
        </a>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
        BrilDesk vs Trengo: WhatsApp Sales Inbox Without the Enterprise Price Tag
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-gray-600">
        Trengo is a well-known multi-channel inbox, but its enterprise-level pricing
        and conversation-based billing make it a tough fit for growing SMBs. BrilDesk gives
        you WhatsApp + CRM for a fraction of the cost.
      </p>

      {/* Key differences */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Differences</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">80% Lower Starting Price</h3>
            <p className="text-sm text-gray-700">
              Trengo&apos;s Boost plan starts at ~$325/month. BrilDesk lets you start free
              and scale affordably as your team grows.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">No Conversation Fees</h3>
            <p className="text-sm text-gray-700">
              Trengo bills per conversation (6,000/year on Boost), meaning costs spike
              as you grow. BrilDesk uses straightforward plan-based pricing.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Built-in Sales CRM</h3>
            <p className="text-sm text-gray-700">
              Trengo is a customer service platform. BrilDesk is built for sales —
              with deal tracking, pipeline views, and lead management in every plan.
            </p>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Feature-by-Feature Comparison</h2>
        <ComparisonTable competitorName="Trengo" features={features} />
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Pricing Comparison</h2>
        <PricingComparison
          competitorName="Trengo"
          brildeskPrice="Free to start"
          competitorPrice="From ~$325/mo"
          brildeskNote="Simple per-plan pricing, no per-conversation fees"
          competitorNote="Conversation-based billing. WhatsApp API, Voice, and AI are add-ons."
          brildeskIncludes={[
            'Shared WhatsApp inbox',
            'Built-in CRM & deal tracking',
            'Smart agent routing',
            'Unlimited conversations',
            'No per-conversation billing',
          ]}
          competitorIncludes={[
            'Multi-channel inbox (email, chat, WhatsApp, voice)',
            '10 users included on Boost',
            '6,000 conversations/year on Boost',
            'WhatsApp Business API (add-on)',
            'Workflow automation',
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
              <li>&#8226; Primarily sell on WhatsApp and need CRM built in</li>
              <li>&#8226; Want predictable pricing that doesn&apos;t scale with conversations</li>
              <li>&#8226; Are an SMB that can&apos;t justify $300+/month for a shared inbox</li>
              <li>&#8226; Need deal tracking and pipeline visibility</li>
              <li>&#8226; Want to get your team set up in minutes, not days</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-3 font-semibold text-gray-600">Choose Trengo if you...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>&#8226; Need a multi-channel support platform (email, voice, live chat)</li>
              <li>&#8226; Have an enterprise budget for customer service tooling</li>
              <li>&#8226; Want deep integrations with HubSpot, Shopify, WooCommerce</li>
              <li>&#8226; Run a support-centric operation across many channels</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
