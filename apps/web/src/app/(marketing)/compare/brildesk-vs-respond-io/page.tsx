import type { Metadata } from 'next';
import { ComparisonTable, PricingComparison, CtaBanner } from '../comparison-table';

export const metadata: Metadata = {
  title: 'BrilDesk vs Respond.io - WhatsApp Shared Inbox Comparison (2026)',
  description:
    'Compare BrilDesk and Respond.io for WhatsApp sales teams. BrilDesk offers purpose-built WhatsApp CRM at a fraction of the cost.',
  keywords: [
    'BrilDesk vs Respond.io',
    'Respond.io alternative',
    'WhatsApp shared inbox',
    'WhatsApp CRM',
  ],
};

const features = [
  { name: 'WhatsApp Shared Inbox', brildesk: true, competitor: true },
  { name: 'Built-in CRM & Deal Tracking', brildesk: true, competitor: 'Basic contacts', highlight: true },
  { name: 'Smart Agent Routing', brildesk: true, competitor: true },
  { name: 'Sales Pipeline View', brildesk: true, competitor: false, highlight: true },
  { name: 'Omnichannel (Email, IG, FB, etc.)', brildesk: 'WhatsApp-focused', competitor: true },
  { name: 'AI Agent / Chatbot', brildesk: 'Coming soon', competitor: true },
  { name: 'Broadcast Campaigns', brildesk: true, competitor: true },
  { name: 'Per-Message Markup', brildesk: 'None', competitor: 'None', },
  { name: 'Team Collaboration', brildesk: true, competitor: true },
  { name: 'WhatsApp Business API', brildesk: true, competitor: true },
  { name: 'Ease of Setup', brildesk: 'Minutes', competitor: 'Moderate', highlight: true },
  { name: 'Learning Curve', brildesk: 'Low — sales-focused UI', competitor: 'Steeper — many channels', highlight: true },
];

export default function BrilDeskVsRespondIo() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-4">
        <a href="/compare" className="text-sm text-green-600 hover:underline">
          &larr; All comparisons
        </a>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
        BrilDesk vs Respond.io: Purpose-Built WhatsApp CRM vs Omnichannel Platform
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-gray-600">
        Respond.io is a powerful omnichannel platform. But if your team sells on WhatsApp and
        needs a CRM built into the inbox, BrilDesk delivers more value at a lower price point.
      </p>

      {/* Key differences */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Differences</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Sales-First Design</h3>
            <p className="text-sm text-gray-700">
              BrilDesk is built for sales teams on WhatsApp. Every feature — from deal tracking
              to agent routing — is designed to help you close more deals, not manage support tickets
              across 10 channels.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">Simpler & Faster</h3>
            <p className="text-sm text-gray-700">
              Respond.io&apos;s breadth means complexity. BrilDesk gets your team productive in
              minutes with a focused UI that sales reps actually enjoy using.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">SMB-Friendly Pricing</h3>
            <p className="text-sm text-gray-700">
              Respond.io&apos;s Growth plan starts at $199/mo for 10 users. BrilDesk gives you
              a shared inbox with built-in CRM at a fraction of the cost.
            </p>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Feature-by-Feature Comparison</h2>
        <ComparisonTable competitorName="Respond.io" features={features} />
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Pricing Comparison</h2>
        <PricingComparison
          competitorName="Respond.io"
          brildeskPrice="Free to start"
          competitorPrice="From $79/mo"
          brildeskNote="Built-in CRM included in every plan"
          competitorNote="Growth plan at $199/mo for advanced features and 10 users"
          brildeskIncludes={[
            'Shared WhatsApp inbox',
            'Built-in CRM & deal tracking',
            'Smart agent routing',
            'Sales pipeline management',
            'No per-message markup',
          ]}
          competitorIncludes={[
            'Omnichannel inbox (WhatsApp, email, IG, FB, etc.)',
            'AI Agents for automation',
            'Advanced reporting',
            'WhatsApp coexistence (API + Business App)',
            'No per-message markup',
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
              <li>&#8226; Run sales primarily through WhatsApp</li>
              <li>&#8226; Need CRM and deal tracking in the same tool</li>
              <li>&#8226; Want a simple tool your team can start using today</li>
              <li>&#8226; Are an SMB that doesn&apos;t need 10 communication channels</li>
              <li>&#8226; Want to keep costs low as you scale</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-3 font-semibold text-gray-600">Choose Respond.io if you...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>&#8226; Need a true omnichannel platform (email, IG, TikTok, etc.)</li>
              <li>&#8226; Want advanced AI agents for autonomous responses</li>
              <li>&#8226; Have a larger team with complex workflow automation needs</li>
              <li>&#8226; Already use multiple messaging channels equally</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
