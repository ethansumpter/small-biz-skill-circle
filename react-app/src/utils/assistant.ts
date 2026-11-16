import type { Company, CompanyProposal } from '@/data/companies';

/**
 * Bond AI assistant: scripted answers built from the demo data
 * (docs/bond-features.md, "AI assistant / chatbot"). No model is called and
 * nothing leaves the device; every reply says what it's based on.
 */

export type Intent = 'partners' | 'whyMatch' | 'proposal' | 'campaign' | 'website' | 'data' | 'help';

/** Quick-action chips, in the order shown. */
export const QUICK_ACTIONS: { intent: Intent; label: string }[] = [
  { intent: 'partners', label: 'Who should we team up with?' },
  { intent: 'whyMatch', label: 'Why did we match?' },
  { intent: 'proposal', label: 'Help me write a proposal' },
  { intent: 'campaign', label: 'Plan a joint campaign' },
  { intent: 'website', label: 'Analyse our website' },
  { intent: 'data', label: 'How is our data used?' },
];

export type AssistantSection = { heading: string; body: string };

export type AssistantReply = {
  text: string;
  sections?: AssistantSection[];
  /** Optional next step, e.g. open Discover or the proposal form. */
  action?: { label: string; href: '/' | '/proposals/new' | '/leads' };
};

export type AssistantContext = {
  user: Company;
  companies: Company[];
  proposals: CompanyProposal[];
  /** Company ids you've matched with (Leads). */
  matchedIds: string[];
  /** Company ids you've blocked; never suggested. */
  blockedIds: string[];
};

// ── Intent detection for typed questions ─────────────────────────────────────

const KEYWORDS: [Intent, RegExp][] = [
  ['data', /\b(data|privacy|private|gdpr|permission|share my|delete)\b/i],
  ['website', /\b(website|site|url|link|analy[sz]e)\b/i],
  ['campaign', /\b(campaign|promo|promotion|marketing|post|email|launch|discount|advert)/i],
  ['proposal', /\b(proposal|propose|write|draft|pitch|comment|intro)/i],
  ['whyMatch', /\b(why|match(ed)?|explain)\b/i],
  ['partners', /\b(partner|team up|collab|suggest|who|recommend|find)/i],
];

export function detectIntent(text: string): Intent {
  return KEYWORDS.find(([, re]) => re.test(text))?.[0] ?? 'help';
}

// ── Matching ─────────────────────────────────────────────────────────────────

const STOP = new Set(
  // Common words plus generic ones ("small", "sold") that would make unrelated firms look alike.
  ('a an and are as at be but by can for from in into is it of on or our so that the their them they this to us we who with your you ' +
    'small sold short product finished need want help make brand local every more plus without between range premium').split(' '),
);

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
      .map((w) => w.replace(/s$/, '')),
  );
}

function overlap(a: string, b: string): number {
  const wb = words(b);
  return [...words(a)].filter((w) => wb.has(w)).length;
}

/** The demo proposal both firms are named in, if any. */
export function sharedProposal(a: string, b: string, proposals: CompanyProposal[]) {
  return proposals.find((p) => p.companyIds.includes(a) && p.companyIds.includes(b));
}

/**
 * How well another firm fits: a shared proposal, or one side needing what the
 * other offers. Shared interests only break ties, so firms with no real signal score 0.
 */
export function fitScore(user: Company, other: Company, proposals: CompanyProposal[]): number {
  let signal = 0;
  if (sharedProposal(user.id, other.id, proposals)) signal += 10;
  signal += 2 * overlap(user.lookingFor, other.offer + ' ' + other.industry);
  signal += 2 * overlap(other.lookingFor, user.offer + ' ' + user.industry);
  if (/maker/i.test(other.lookingFor) && user.interests.includes('Product collaborations')) signal += 2;
  if (!signal) return 0;
  return signal + user.interests.filter((i) => other.interests.includes(i)).length;
}

export function suggestPartners(ctx: AssistantContext, count = 3): Company[] {
  const skip = new Set([ctx.user.id, ...ctx.matchedIds, ...ctx.blockedIds]);
  return ctx.companies
    .filter((c) => !skip.has(c.id))
    .map((c) => ({ c, score: fitScore(ctx.user, c, ctx.proposals) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ c }) => c);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0].replace(/\.$/, '');
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const area = (c: Company) => c.location.split(',').pop()!.trim();
/** "Leeds" and "Leeds Dock" count as the same area. */
const sameArea = (a: Company, b: Company) => area(a).includes(area(b)) || area(b).includes(area(a));
const initial = (name: string) => (name.match(/[A-Za-z]/)?.[0] ?? 'X').toUpperCase();

/** Discount code for a joint offer: BOND- + both firms' initials + 10, e.g. BOND-KW10. */
export function campaignCode(a: string, b: string) {
  return `BOND-${initial(a)}${initial(b)}10`;
}

function collaborationType(c: Company) {
  if (c.interests.includes('Product collaborations')) return 'Product collaboration';
  if (c.interests.includes('Service collaborations')) return 'Service collaboration';
  return 'Bundle deal';
}

function goal(c: Company) {
  return c.interests.includes('Product collaborations') ? 'Launch a new product' : 'Reach new customers';
}

function matchedCompanies(ctx: AssistantContext) {
  return ctx.matchedIds
    .map((id) => ctx.companies.find((c) => c.id === id))
    .filter((c): c is Company => !!c);
}

/** The partner to plan around: a matched firm first, otherwise the best suggestion. */
function bestPartner(ctx: AssistantContext): Company | undefined {
  return matchedCompanies(ctx)[0] ?? suggestPartners(ctx, 1)[0];
}

// ── Replies ──────────────────────────────────────────────────────────────────

export function greeting(user: Company): AssistantReply {
  return {
    text: `Hi, I'm Bond's assistant. I can suggest partners for ${user.name}, explain your matches, draft proposals and plan joint campaigns. Pick an option below or ask me a question.`,
  };
}

export function reply(intent: Intent, ctx: AssistantContext): AssistantReply {
  const { user } = ctx;

  switch (intent) {
    case 'partners': {
      const picks = suggestPartners(ctx);
      if (!picks.length) return { text: "You've seen everyone who fits right now. Check back as new businesses join." };
      return {
        text: `Based on what ${user.name} offers and is looking for, ${picks.length === 1 ? 'this business fits best' : 'these businesses fit best'}:`,
        sections: picks.map((c) => {
          const p = sharedProposal(user.id, c.id, ctx.proposals);
          return {
            heading: `${c.name} · ${c.industry}, ${area(c)}`,
            body: p
              ? `They've proposed "${p.title}" with you in mind. ${p.summary}`
              : `They're looking for ${lower(c.lookingFor).replace(/\.$/, '')}. You offer ${lower(firstSentence(user.offer))}.`,
          };
        }),
        action: { label: 'Open Discover', href: '/' },
      };
    }

    case 'whyMatch': {
      const matched = matchedCompanies(ctx);
      if (!matched.length) return { text: "You haven't matched with anyone yet. Once a business accepts your proposal, I can explain the match." };
      return {
        text: 'Here is why you matched, using the same three checks Bond uses for every match:',
        sections: matched.map((c) => {
          const p = sharedProposal(user.id, c.id, ctx.proposals);
          const shared = user.interests.filter((i) => c.interests.includes(i));
          return {
            heading: c.name,
            body: [
              `Company profile: a ${c.size.toLowerCase()} ${c.industry.toLowerCase()} business in ${area(c)}${c.verified ? ', verified' : ''}.`,
              `Customer base: both of you sell to people in ${sameArea(user, c) ? area(user) : `${area(user)} and ${area(c)}`}, so a joint offer reaches two sets of customers.`,
              `Cooperation objectives: ${p ? `"${p.title}", aiming to ${lower(p.businessGoal)}` : `you both want ${shared.length ? shared.join(' and ').toLowerCase() : 'local partnerships'}`}.`,
            ].join('\n'),
          };
        }),
        action: { label: 'Go to Leads', href: '/leads' },
      };
    }

    case 'proposal': {
      return {
        text: `Here's a first draft for ${user.name}. Edit anything that doesn't sound like you before you post it.`,
        sections: [
          { heading: 'What are you looking for?', body: user.lookingFor },
          { heading: 'What can you offer?', body: firstSentence(user.offer) + '.' },
          { heading: 'Collaboration type', body: collaborationType(user) },
          { heading: 'Business goal', body: goal(user) },
          { heading: 'Location', body: `${area(user)}, within 10 miles` },
          { heading: 'Budget', body: 'Revenue share 50/50, so neither side pays upfront' },
        ],
        action: { label: 'Start a proposal', href: '/proposals/new' },
      };
    }

    case 'campaign': {
      const partner = bestPartner(ctx);
      if (!partner) return { text: 'Match with a partner first, then I can plan a joint campaign with them.' };
      const code = campaignCode(user.name, partner.name);
      const p = sharedProposal(user.id, partner.id, ctx.proposals);
      const theme = p?.title ?? `${user.industry} × ${partner.industry}`;
      return {
        text: `A joint campaign plan for ${user.name} and ${partner.name}. Both of you approve it before anything goes out.`,
        sections: [
          { heading: 'Campaign', body: `${theme}: a two-week launch to both customer lists.` },
          {
            heading: 'Social post',
            body: `We've teamed up with ${partner.name}. ${p ? p.summary : `${firstSentence(user.offer)}, paired with ${lower(firstSentence(partner.offer))}.`} Use ${code} for 10% off for two weeks.`,
          },
          { heading: 'Email subject', body: `Something new from ${user.name} and ${partner.name}` },
          { heading: 'Joint offer', body: `10% off the bundle with code ${code}, valid at either business.` },
          { heading: 'How you will know it worked', body: `Count ${code} uses each week and note new customers for each business. Review together after two weeks and decide whether to run it again.` },
        ],
        action: { label: 'Message them in Leads', href: '/leads' },
      };
    }

    case 'website': {
      const site = user.links.find((l) => !/instagram|linkedin|facebook/i.test(l)) ?? user.links[0] ?? 'your website';
      const picks = suggestPartners(ctx, 2);
      return {
        text: `Here's what I picked up from ${site}. I use this, with your permission, to improve your Discover feed.`,
        sections: [
          { heading: 'What you sell', body: user.offer },
          { heading: 'Who you sell to', body: `Local customers in ${area(user)} who value ${user.industry.toLowerCase()} made in small batches.` },
          { heading: 'What you need', body: user.lookingFor },
          ...(picks.length ? [{ heading: 'Good fits', body: picks.map((c) => `${c.name} (${c.industry})`).join(', ') }] : []),
        ],
      };
    }

    case 'data':
      return {
        text: 'In plain English, here is how Bond uses your data:',
        sections: [
          { heading: 'What I use', body: 'Your profile, interests, proposals and website link. I use them only to suggest partners and draft content.' },
          { heading: 'Your permission', body: 'AI matching only runs with the AI-matching data permission on. Change it in Settings, Privacy & data.' },
          { heading: 'Never shared or sold', body: "Other businesses never see your customer data, and your data isn't sold. You can download or delete it at any time." },
          { heading: 'You decide', body: 'Nothing I draft is posted or sent until you approve it.' },
        ],
      };

    case 'help':
    default:
      return {
        text: "I'm not sure I understood that. I can help with these:",
        sections: [
          { heading: 'Find partners', body: 'Suggest businesses that fit what you offer and need.' },
          { heading: 'Explain matches', body: 'Show why a business matched with you.' },
          { heading: 'Write and plan', body: 'Draft a proposal, or plan a joint campaign with a partner.' },
        ],
      };
  }
}
