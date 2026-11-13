import { type Company, getCompany } from '@/data/companies';

import data from './leads.json';

/**
 * Demo matches and chat for the logged-in account (c01) — see docs/bond-demo-data.md
 * ("Leads: demo chat"). Stored in leads.json so the demo panel can edit them.
 * Fictional. Owner names are looked up from companies.json where shown (Leads only).
 */
export type Message = {
  id: string;
  from: 'me' | 'them';
  text: string;
  attachment?: string;
};

export type Lead = {
  /** Company id in companies.json. */
  id: string;
  company: string;
  industry: string;
  location: string;
  /** The comment sent with the original like/proposal, pinned at the top of the thread. */
  pinnedComment?: string;
  messages: Message[];
  muted: boolean;
};

/** A chat as stored in leads.json: company details are looked up from companies.json. */
export type LeadSeed = Omit<Lead, 'company' | 'industry' | 'location'>;

/** Fills in a chat's company name, industry and location from a company lookup. */
export function withCompanyFields(
  seed: LeadSeed,
  lookup: (id: string) => Pick<Company, 'name' | 'industry' | 'location'>,
): Lead {
  const { name, industry, location } = lookup(seed.id);
  return { ...seed, company: name, industry, location };
}

/** Back to the stored shape (drops the looked-up company fields). */
export function toLeadSeed({ company: _c, industry: _i, location: _l, ...seed }: Lead): LeadSeed {
  return seed;
}

const LEAD_SEEDS = data.leads as LeadSeed[];

export const DEMO_LEADS: Lead[] = LEAD_SEEDS.map((seed) => withCompanyFields(seed, getCompany));
