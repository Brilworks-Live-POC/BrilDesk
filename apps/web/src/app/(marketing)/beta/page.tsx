'use client';

import { useState, useEffect } from 'react';

type FormState = 'idle' | 'submitting' | 'success';

interface SignupResult {
  queue_position: number;
  referral_code: string;
  already_signed_up: boolean;
}

function getUTMParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

function getReferralFromURL() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || '';
}

export default function BetaSignupPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [result, setResult] = useState<SignupResult | null>(null);
  const [error, setError] = useState('');
  const [referral, setReferral] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReferral(getReferralFromURL());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('submitting');
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const utmParams = getUTMParams();

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      team_size: formData.get('team_size') as string,
      messages_per_day: formData.get('messages_per_day') as string,
      referral: referral || undefined,
      ...utmParams,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/beta-signups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        setFormState('idle');
        return;
      }

      const data: SignupResult = await res.json();
      setResult(data);
      setFormState('success');
    } catch {
      setError('Network error. Please try again.');
      setFormState('idle');
    }
  }

  async function handleQualify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    await fetch(`${apiUrl}/api/beta-signups/qualify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        answers: {
          current_tool: formData.get('current_tool'),
          biggest_pain: formData.get('biggest_pain'),
          timeline: formData.get('timeline'),
        },
      }),
    }).catch(() => {});
  }

  function getReferralLink() {
    if (!result) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/beta?ref=${result.referral_code}`;
  }

  function copyReferralLink() {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (formState === 'success' && result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {result.already_signed_up ? "You're already on the list!" : "You're in!"}
        </h1>

        <p className="mb-2 text-lg text-gray-600">
          Your queue position: <span className="font-bold text-green-600">#{result.queue_position}</span>
        </p>

        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Move up the queue</h2>
          <p className="mb-4 text-sm text-gray-600">
            Share your referral link — move up <strong>5 spots</strong> for every person who joins.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={getReferralLink()}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            />
            <button
              onClick={copyReferralLink}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Qualification questions — non-blocking */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
          <h3 className="mb-1 text-base font-semibold text-gray-900">Help us build for you</h3>
          <p className="mb-4 text-sm text-gray-500">Optional — helps us prioritize features for your team.</p>
          <form onSubmit={handleQualify} className="space-y-4">
            <input type="hidden" name="email" value={result.referral_code} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                What do you use for WhatsApp today?
              </label>
              <select name="current_tool" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="whatsapp_business_app">WhatsApp Business App</option>
                <option value="wati">WATI</option>
                <option value="respond_io">Respond.io</option>
                <option value="interakt">Interakt</option>
                <option value="trengo">Trengo</option>
                <option value="other">Other tool</option>
                <option value="nothing">Nothing — personal WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Biggest pain with your current setup?
              </label>
              <select name="biggest_pain" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="missed_messages">Messages get missed</option>
                <option value="no_visibility">No visibility into rep performance</option>
                <option value="rep_collision">Reps step on each other's toes</option>
                <option value="no_crm">Can't tie messages to deals</option>
                <option value="cost">Current tool is too expensive</option>
                <option value="other">Something else</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                When do you need a solution?
              </label>
              <select name="timeline" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
                <option value="this_quarter">This quarter</option>
                <option value="exploring">Just exploring</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          Your sales team&apos;s WhatsApp inbox<br className="hidden md:block" /> is leaking deals. Fix it.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          BrilDesk gives your whole team one shared WhatsApp inbox — so no message gets missed,
          no rep steps on another&apos;s deal, and you see everything in real time.
        </p>
      </div>

      {/* Pain points */}
      <div className="mb-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Missed messages</h3>
          <p className="text-sm text-gray-600">
            Leads message at night or on weekends. Nobody sees it. By Monday the deal is dead.
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-6">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No visibility</h3>
          <p className="text-sm text-gray-600">
            Managers can&apos;t see who&apos;s replying, what&apos;s stuck, or which deals need help — until it&apos;s too late.
          </p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-6">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Rep collision</h3>
          <p className="text-sm text-gray-600">
            Two reps reply to the same lead. The customer gets confused. You look unprofessional.
          </p>
        </div>
      </div>

      {/* Signup form */}
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Join the Beta — Free for Early Teams
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            Be first in line when we launch. Early teams get free access.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Your name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Jane Smith"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Work email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="jane@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="team_size" className="mb-1 block text-sm font-medium text-gray-700">
                Team size
              </label>
              <select
                id="team_size"
                name="team_size"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select team size</option>
                <option value="1-3">1–3 reps</option>
                <option value="4-10">4–10 reps</option>
                <option value="11-25">11–25 reps</option>
                <option value="25+">25+ reps</option>
              </select>
            </div>
            <div>
              <label htmlFor="messages_per_day" className="mb-1 block text-sm font-medium text-gray-700">
                WhatsApp messages per day
              </label>
              <select
                id="messages_per_day"
                name="messages_per_day"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select volume</option>
                <option value="1-50">1–50</option>
                <option value="50-200">50–200</option>
                <option value="200-500">200–500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {formState === 'submitting' ? 'Joining...' : 'Join the Beta — Free for Early Teams'}
            </button>
          </form>

          {referral && (
            <p className="mt-3 text-center text-xs text-gray-500">
              Referred by a friend — you&apos;ll both move up the queue!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
