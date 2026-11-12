import { type Company, companies, type CompanyProposal } from '@/data/companies';

/**
 * Discover feed data and filters — see docs/bond-demo-data.md ("Discover order",
 * "Filter options") and docs/bond-app-structure.md §1.
 */

/** Feed order for the demo account (c01). c01 goes last when logged in as someone else. */
export const DISCOVER_ORDER = [
  'c02', 'c03', 'c05', 'c07', 'c09', 'c10', 'c11', 'c12', 'c04',
  'c06', 'c08', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c01',
];

/** Free plan allowance (docs/bond-demo-data.md, Monetisation). */
export const FREE_LIKES_PER_DAY = 10;

// ── Filters ──────────────────────────────────────────────────────────────────

export type FilterKey = 'location' | 'industry' | 'size' | 'identity' | 'collaboration';

export type Filters = Partial<Record<FilterKey, string>>;

export const FILTER_LABELS: Record<FilterKey, string> = {
  location: 'Location',
  industry: 'Industry',
  size: 'Firm size',
  identity: 'Identity',
  collaboration: 'Collaboration type',
};

/** Industry filter options: every industry in use, A–Z. */
export function industriesOf(list: Pick<Company, 'industry'>[]): string[] {
  return [...new Set(list.map((c) => c.industry))].sort();
}

export const FILTER_OPTIONS: Record<FilterKey, string[]> = {
  location: ['Leeds', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles'],
  industry: industriesOf(companies),
  size: ['Micro', 'SME'],
  identity: ['Verified only', 'Maker', 'Service provider'],
  collaboration: ['Bundle deal', 'Product collaboration', 'Service collaboration'],
};

/**
 * Companies without a distance are in Leeds itself; counted as within 5 miles.
 * "Maker" and "Service provider" follow the firm's product/service interests.
 */
function matchesFilter(company: Company, key: FilterKey, value: string, proposals: CompanyProposal[]): boolean {
  switch (key) {
    case 'location': {
      if (value === 'Leeds') return company.location.includes('Leeds');
      const limit = Number(value.match(/\d+/)?.[0] ?? Infinity);
      return (company.distanceMiles ?? 0) <= limit;
    }
    case 'industry':
      return company.industry === value;
    case 'size':
      return company.size === value;
    case 'identity':
      if (value === 'Verified only') return company.verified;
      if (value === 'Maker') return company.interests.includes('Product collaborations');
      return company.interests.includes('Service collaborations');
    case 'collaboration':
      return companyProposals(company, proposals).some((p) => p.collaborationType.includes(value));
  }
}

/** `proposals` is the session's demo proposals (useDemoProposals), for the collaboration type filter. */
export function matchesFilters(company: Company, filters: Filters, proposals: CompanyProposal[]): boolean {
  return (Object.entries(filters) as [FilterKey, string | undefined][]).every(
    ([key, value]) => !value || matchesFilter(company, key, value, proposals),
  );
}

// ── Proposals ────────────────────────────────────────────────────────────────

export function companyProposals(company: Pick<Company, 'proposalIds'>, proposals: CompanyProposal[]) {
  return proposals.filter((p) => company.proposalIds.includes(p.id));
}

/**
 * Proposal types offered on a card, trimmed to the firm's interests
 * (docs/bond-app-structure.md §1, item 6).
 */
export function proposalTypesFor(company: Pick<Company, 'interests'>): string[] {
  const types = ['Collaboration interests'];
  if (company.interests.includes('Cross-promotion')) types.push('Cross-promotion');
  if (company.interests.includes('Product collaborations')) types.push('Product request');
  if (company.interests.includes('Service collaborations')) types.push('Service request');
  return types;
}
