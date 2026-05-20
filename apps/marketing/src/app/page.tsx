import type { Metadata } from 'next';
import {
  MessageSquare,
  GitFork,
  BarChart3,
  MessageCircle,
  Activity,
  RefreshCw,
  Building2,
  GraduationCap,
  ShoppingBag,
  Landmark,
  Plane,
  AlertTriangle,
  EyeOff,
  UserX,
  Wifi,
  Users,
  Zap,
  Check,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'BrilDesk — Stop Losing WhatsApp Leads | Shared Inbox for Sales Teams',
  description:
    'BrilDesk is a WhatsApp shared inbox built for sales teams. Route leads to the right rep, track deals through your pipeline, and never lose a WhatsApp conversation again. Starting at ~$49/mo.',
  openGraph: {
    title: 'BrilDesk — Stop Losing WhatsApp Leads',
    description:
      'WhatsApp shared inbox for sales teams. Route leads, track deals, close faster.',
    type: 'website',
    url: 'https://brildesk.com',
    siteName: 'BrilDesk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrilDesk — Stop Losing WhatsApp Leads',
    description:
      'WhatsApp shared inbox for sales teams. Route leads, track deals, close faster.',
  },
};

const features = [
  {
    icon: MessageSquare,
    title: 'Shared Inbox',
    description: "One inbox for your whole team — no more 'who's handling this lead?'",
  },
  {
    icon: GitFork,
    title: 'Smart Routing',
    description:
      'Every lead goes to the right rep, instantly — no cherry-picking, no orphaned conversations',
  },
  {
    icon: BarChart3,
    title: 'Pipeline View',
    description: 'See exactly where every deal stands without leaving WhatsApp',
  },
  {
    icon: MessageCircle,
    title: 'Internal Notes',
    description: 'Loop in your manager or a specialist without the customer seeing a thing',
  },
  {
    icon: Activity,
    title: 'Real-time Dashboard',
    description:
      "Know who's online, who's responding, and who's falling behind — in real time",
  },
  {
    icon: RefreshCw,
    title: 'CRM Sync',
    description: 'Deals move from WhatsApp to your CRM automatically — no copy-paste',
  },
];

const competitors = [
  {
    name: 'BrilDesk',
    highlight: true,
    price: '~$49/mo',
    salesFocus: true,
    pipeline: true,
    smartRouting: true,
    easySetup: true,
    noMarkup: true,
  },
  {
    name: 'Respond.io',
    highlight: false,
    price: '$79/mo',
    salesFocus: false,
    pipeline: false,
    smartRouting: true,
    easySetup: false,
    noMarkup: true,
  },
  {
    name: 'WATI',
    highlight: false,
    price: '$59/mo',
    salesFocus: false,
    pipeline: false,
    smartRouting: false,
    easySetup: false,
    noMarkup: false,
  },
  {
    name: 'Trengo',
    highlight: false,
    price: '€299/mo',
    salesFocus: false,
    pipeline: false,
    smartRouting: true,
    easySetup: false,
    noMarkup: false,
  },
];

const comparisonRows = [
  { label: 'Starting price', key: 'price' as const },
  { label: 'Built for sales', key: 'salesFocus' as const },
  { label: 'Pipeline view', key: 'pipeline' as const },
  { label: 'Smart routing', key: 'smartRouting' as const },
  { label: '5-min setup', key: 'easySetup' as const },
  { label: 'No API markup', key: 'noMarkup' as const },
];

const steps = [
  {
    number: '1',
    title: 'Connect WhatsApp',
    description: 'Link your WhatsApp Business number in under 5 minutes. No developer needed.',
  },
  {
    number: '2',
    title: 'Invite Your Team',
    description: 'Add your sales reps. Set up routing rules. Assign roles.',
  },
  {
    number: '3',
    title: 'Start Closing',
    description: 'Every lead routed, every conversation tracked, every deal visible.',
  },
];

const industries = [
  { icon: Building2, label: 'Real Estate' },
  { icon: GraduationCap, label: 'Education' },
  { icon: ShoppingBag, label: 'D2C' },
  { icon: Landmark, label: 'Financial Services' },
  { icon: Plane, label: 'Travel' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="px-6 pb-20 pt-16 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
            Stop losing leads
            <br />
            <span className="text-green-600">on WhatsApp.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
            BrilDesk gives your sales team one shared WhatsApp inbox — so every lead is
            tracked, every rep is accountable, and every deal is visible.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://app.brildesk.saas-yard.com"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              See how it works
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-sm font-medium tracking-wide text-gray-500 uppercase">
            Trusted by sales teams in India, Dubai &amp; Southeast Asia
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {industries.map((industry) => (
              <div key={industry.label} className="flex items-center gap-2 text-gray-400">
                <industry.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{industry.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Sound familiar?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              If your sales team shares a WhatsApp number, you&apos;re probably dealing with
              this every day.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Leads go unanswered</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                A lead messages at night or on a weekend. Nobody sees it. By Monday, they
                already bought from your competitor.
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <EyeOff className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                Zero pipeline visibility
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Managers can&apos;t see who&apos;s replying, what&apos;s stuck, or which deals need help
                — until it&apos;s too late.
              </p>
            </div>
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <UserX className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                Rep leaves, deals vanish
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                When a rep quits, their WhatsApp conversations go with them. Full context,
                gone overnight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything your sales team needs in one inbox
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Purpose-built for sales workflows — not support tickets, not broadcast
              campaigns.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Built for sales, not bolted on
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Other tools started as support platforms or broadcast tools. BrilDesk is
              sales-first from day one.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Feature</th>
                  {competitors.map((c) => (
                    <th
                      key={c.name}
                      className={`px-4 py-3 text-center font-semibold ${
                        c.highlight ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.key} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                    {competitors.map((c) => {
                      const val = c[row.key];
                      return (
                        <td key={c.name} className="px-4 py-3 text-center">
                          {typeof val === 'string' ? (
                            <span
                              className={
                                c.highlight ? 'font-semibold text-green-600' : 'text-gray-700'
                              }
                            >
                              {val}
                            </span>
                          ) : val ? (
                            <Check
                              className={`mx-auto h-5 w-5 ${
                                c.highlight ? 'text-green-600' : 'text-gray-400'
                              }`}
                            />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-gray-300" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <a
              href="/compare"
              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
            >
              See detailed comparisons
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Set up in 5 minutes. Start closing today.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Wifi className="h-4 w-4" />
              <span>No developer needed</span>
              <span className="mx-2 text-gray-300">|</span>
              <Users className="h-4 w-4" />
              <span>Works with WhatsApp Business API</span>
              <span className="mx-2 text-gray-300">|</span>
              <Zap className="h-4 w-4" />
              <span>Free during beta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Simple pricing. No surprises.
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Flat per-seat pricing. No per-message markups. No conversation-based billing
            traps.
          </p>
          <div className="mb-8 inline-block rounded-2xl border border-gray-200 bg-white px-10 py-8 shadow-sm">
            <p className="mb-1 text-sm font-medium text-gray-500 uppercase">Starting at</p>
            <p className="mb-2 text-5xl font-extrabold text-gray-900">
              ~$49<span className="text-2xl font-medium text-gray-400">/mo</span>
            </p>
            <p className="text-sm text-gray-600">
              Per-seat pricing that scales with your team
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://app.brildesk.saas-yard.com"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
            >
              Get Started — Free for Early Teams
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-sm text-gray-500">
              Early teams get free access during beta
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-green-600 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to stop losing WhatsApp leads?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-green-100">
            Every day you wait, leads slip through the cracks. Set up BrilDesk in 5 minutes
            and start closing more deals as a team.
          </p>
          <a
            href="https://app.brildesk.saas-yard.com"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-green-700 shadow-lg transition hover:bg-green-50"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
