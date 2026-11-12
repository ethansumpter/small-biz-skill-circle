import data from './companies.json';

/**
 * Typed access to src/data/companies.json (generated from docs/bond-demo-data.md).
 */
export type Company = (typeof data.companies)[number];
export type CompanyProposal = (typeof data.proposals)[number];

export const companies: Company[] = data.companies;
export const proposals: CompanyProposal[] = data.proposals;
export const DEMO_USER_ID = data.demoUserId;

const byId = new Map(companies.map((c) => [c.id, c]));

export function getCompany(id: string): Company {
  const company = byId.get(id);
  if (!company) throw new Error(`Unknown company id: ${id}`);
  return company;
}
