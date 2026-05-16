/**
 * Email template system.
 *
 * Templates are functions that accept variables and return { subject, html }.
 * The CMO will draft the actual copy — these are structural scaffolds with
 * placeholder content that can be swapped out.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
}

type TemplateFunction = (vars: Record<string, string>) => EmailTemplate;

// ---------- Shared layout ----------

function wrapLayout(body: string, unsubscribeUrl?: string): string {
  const footer = unsubscribeUrl
    ? `<p style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
        You're receiving this because you signed up for BrilDesk updates.<br/>
        <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
      </p>`
    : `<p style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
        This is a transactional email from BrilDesk.
      </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="margin-bottom:24px;">
      <strong style="font-size:18px;color:#111827;">BrilDesk</strong>
    </div>
    ${body}
    ${footer}
  </div>
</body>
</html>`;
}

// ---------- Transactional templates ----------

const signupConfirmation: TemplateFunction = (vars) => ({
  subject: `Welcome to BrilDesk, ${vars.name}!`,
  html: wrapLayout(`
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Welcome aboard! 🎉</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name}, you're #${vars.queue_position} on the BrilDesk waitlist.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Your referral code: <strong>${vars.referral_code}</strong><br/>
      Share it to move up the queue — each referral bumps you 5 spots.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Share this link: <a href="${vars.referral_url}" style="color:#2563eb;">${vars.referral_url}</a>
    </p>
  `),
});

const referralNotification: TemplateFunction = (vars) => ({
  subject: `Someone used your referral code! You moved up to #${vars.new_position}`,
  html: wrapLayout(`
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">You moved up! 🚀</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name}, someone just signed up with your referral code.
      You've moved to position <strong>#${vars.new_position}</strong> in the queue.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Keep sharing to get access sooner: <a href="${vars.referral_url}" style="color:#2563eb;">${vars.referral_url}</a>
    </p>
  `),
});

const queuePositionUpdate: TemplateFunction = (vars) => ({
  subject: `BrilDesk: You're now #${vars.queue_position} in line`,
  html: wrapLayout(`
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Queue update</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name}, your current position is <strong>#${vars.queue_position}</strong>.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.message || "We're working hard to onboard everyone. Stay tuned!"}
    </p>
  `),
});

// ---------- Marketing / Waitlist nurture templates ----------
// The CMO will replace the placeholder copy in these templates.

const waitlistNurture1: TemplateFunction = (vars) => ({
  subject: "Why we're building BrilDesk",
  html: wrapLayout(
    `
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Why BrilDesk?</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert founder story / problem statement here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const waitlistNurture2: TemplateFunction = (vars) => ({
  subject: "What makes BrilDesk different",
  html: wrapLayout(
    `
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">What makes us different</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert competitive differentiation / key features here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const waitlistNurture3: TemplateFunction = (vars) => ({
  subject: "How teams use BrilDesk to save 4+ hours/day",
  html: wrapLayout(
    `
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Real results</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert use case / social proof / case study here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const waitlistNurture4: TemplateFunction = (vars) => ({
  subject: "Your early access is almost here",
  html: wrapLayout(
    `
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Almost there</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert preview / teaser of upcoming features here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const waitlistNurture5: TemplateFunction = (vars) => ({
  subject: "Refer a friend, skip the line",
  html: wrapLayout(
    `
    <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">Move up faster</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert referral program details here]"}
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Your referral link: <a href="${vars.referral_url}" style="color:#2563eb;">${vars.referral_url}</a>
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

// ---------- Cold outreach templates ----------

const coldOutreach1: TemplateFunction = (vars) => ({
  subject: `${vars.company_name}, is WhatsApp support eating your team's time?`,
  html: wrapLayout(
    `
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert cold outreach opener — problem identification here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const coldOutreach2: TemplateFunction = (vars) => ({
  subject: `Re: WhatsApp support for ${vars.company_name}`,
  html: wrapLayout(
    `
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert follow-up with value proposition / social proof here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

const coldOutreach3: TemplateFunction = (vars) => ({
  subject: `Last note — BrilDesk for ${vars.company_name}`,
  html: wrapLayout(
    `
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      Hi ${vars.name},
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;">
      ${vars.body || "[CMO: Insert breakup email — final call to action here]"}
    </p>
  `,
    vars.unsubscribe_url,
  ),
});

// ---------- Template registry ----------

const templates: Record<string, TemplateFunction> = {
  // Transactional
  "signup-confirmation": signupConfirmation,
  "referral-notification": referralNotification,
  "queue-position-update": queuePositionUpdate,

  // Marketing — Waitlist nurture (5 emails)
  "waitlist-nurture-1": waitlistNurture1,
  "waitlist-nurture-2": waitlistNurture2,
  "waitlist-nurture-3": waitlistNurture3,
  "waitlist-nurture-4": waitlistNurture4,
  "waitlist-nurture-5": waitlistNurture5,

  // Marketing — Cold outreach (3 emails)
  "cold-outreach-1": coldOutreach1,
  "cold-outreach-2": coldOutreach2,
  "cold-outreach-3": coldOutreach3,
};

/**
 * Render an email template by key with the given variables.
 */
export function renderTemplate(
  key: string,
  vars: Record<string, string>,
): EmailTemplate | null {
  const fn = templates[key];
  if (!fn) return null;
  return fn(vars);
}

/**
 * Get all available template keys.
 */
export function listTemplateKeys(): string[] {
  return Object.keys(templates);
}
