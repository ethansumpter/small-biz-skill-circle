/// <reference types="node" />

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Demo panel backend (development only). Reads and writes the demo data on the
 * machine running `npx expo start`:
 *   - src/data/companies.json: `companies` and `proposals` (other keys kept as-is)
 *   - src/data/leads.json: `leads`, the Leads chats (other keys kept as-is)
 * A POST only writes the datasets it includes. Not part of the Bond product: it
 * exists so the demo data can be edited.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

type Item = { id: string; [key: string]: unknown };
type CompaniesFile = { companies: Item[]; proposals: Item[]; [key: string]: unknown };
type LeadsFile = { leads: Item[]; [key: string]: unknown };

const devOnly = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'The demo panel only works with the development server.' }, { status: 403 })
    : null;

const readJson = async <T,>(file: string): Promise<T> => JSON.parse(await readFile(file, 'utf8'));
const writeJson = (file: string, data: unknown) => writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

class BadRequest extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

/** An array of objects that each have a string id. */
function items(value: unknown, name: string): Item[] {
  if (
    !Array.isArray(value) ||
    value.some((v) => typeof v !== 'object' || v === null || Array.isArray(v) || typeof (v as Item).id !== 'string')
  ) {
    throw new BadRequest(`\`${name}\` must be an array of objects with an id.`);
  }
  return value as Item[];
}

/** The panel edits companies and proposals but never adds, removes or re-ids them. */
function sameIds(current: Item[], next: Item[], name: string) {
  if (current.map((c) => c.id).join(',') !== next.map((c) => c.id).join(',')) {
    throw new BadRequest(`${name} ids changed. Reload the demo panel and try again.`, 409);
  }
}

export async function GET() {
  const blocked = devOnly();
  if (blocked) return blocked;
  const [companiesFile, leadsFile] = await Promise.all([
    readJson<CompaniesFile>(COMPANIES_FILE),
    readJson<LeadsFile>(LEADS_FILE),
  ]);
  return Response.json({
    companies: companiesFile.companies,
    proposals: companiesFile.proposals,
    leads: leadsFile.leads,
  });
}

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  let body: { companies?: unknown; proposals?: unknown; leads?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }

  try {
    const companiesFile = await readJson<CompaniesFile>(COMPANIES_FILE);
    let companiesChanged = false;

    if (body.companies !== undefined) {
      const companies = items(body.companies, 'companies');
      sameIds(companiesFile.companies, companies, 'Company');
      companiesFile.companies = companies;
      companiesChanged = true;
    }
    if (body.proposals !== undefined) {
      const proposals = items(body.proposals, 'proposals');
      sameIds(companiesFile.proposals, proposals, 'Proposal');
      companiesFile.proposals = proposals;
      companiesChanged = true;
    }

    let leadsFile: LeadsFile | null = null;
    if (body.leads !== undefined) {
      const leads = items(body.leads, 'leads');
      const companyIds = new Set(companiesFile.companies.map((c) => c.id));
      const unknown = leads.find((l) => !companyIds.has(l.id));
      if (unknown) throw new BadRequest(`Chat with unknown company id: ${unknown.id}`);
      if (leads.some((l) => !Array.isArray(l.messages))) throw new BadRequest('Every chat needs a `messages` array.');
      leadsFile = { ...(await readJson<LeadsFile>(LEADS_FILE)), leads };
    }

    // Validate everything before writing anything.
    if (companiesChanged) await writeJson(COMPANIES_FILE, companiesFile);
    if (leadsFile) await writeJson(LEADS_FILE, leadsFile);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof BadRequest) return Response.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
