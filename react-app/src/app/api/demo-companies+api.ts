/// <reference types="node" />

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { CORE_PLAN_IDS, PLAN_ID_PATTERN } from '@/data/plans';

/**
 * Demo panel backend (development only). Reads and writes the demo data on the
 * machine running `npx expo start`:
 *   - src/data/companies.json: `companies` and `proposals` (other keys kept as-is)
 *   - src/data/leads.json: `leads`, the Leads chats (other keys kept as-is)
 *   - src/data/plans.json: `plans`, keyed by plan id (other keys kept as-is). Plans can
 *     be added; Free, Boost and Bond Plus can't be removed.
 * A POST only writes the datasets it includes. Not part of the Bond product: it
 * exists so the demo data can be edited.
 *
 * Several people can use the panel at once (everyone on the same dev server), so
 * each file has a version (a hash of its contents). GET returns them, and a POST
 * that includes `versions` is refused with 409 if a file it would write changed
 * since then, so one person's save never silently undoes another's.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

type Item = { id: string; [key: string]: unknown };
type CompaniesFile = { companies: Item[]; proposals: Item[]; [key: string]: unknown };
type LeadsFile = { leads: Item[]; [key: string]: unknown };
type PlansFile = { plans: Record<string, Record<string, unknown>>; [key: string]: unknown };

const devOnly = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'The demo panel only works with the development server.' }, { status: 403 })
    : null;

const readJson = async <T,>(file: string): Promise<T> => JSON.parse(await readFile(file, 'utf8'));

type DataFile = 'companies' | 'leads' | 'plans';
type Versions = Partial<Record<DataFile, string>>;

const FILES: Record<DataFile, string> = { companies: COMPANIES_FILE, leads: LEADS_FILE, plans: PLANS_FILE };
const FILE_NAMES: Record<DataFile, string> = { companies: 'companies.json', leads: 'leads.json', plans: 'plans.json' };

async function currentVersions(): Promise<Record<DataFile, string>> {
  const entries = await Promise.all(
    (Object.keys(FILES) as DataFile[]).map(async (key) => {
      const text = await readFile(FILES[key], 'utf8');
      return [key, createHash('sha1').update(text).digest('hex')] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<DataFile, string>;
}

// One save at a time, so two people saving together can't interleave read-check-write.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}
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
  const [companiesFile, leadsFile, plansFile] = await Promise.all([
    readJson<CompaniesFile>(COMPANIES_FILE),
    readJson<LeadsFile>(LEADS_FILE),
    readJson<PlansFile>(PLANS_FILE),
  ]);
  return Response.json({
    companies: companiesFile.companies,
    proposals: companiesFile.proposals,
    leads: leadsFile.leads,
    plans: plansFile.plans,
    versions: await currentVersions(),
  });
}

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  let body: { companies?: unknown; proposals?: unknown; leads?: unknown; plans?: unknown; versions?: Versions };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }

  return exclusive(() => saveData(body));
}

async function saveData(body: {
  companies?: unknown;
  proposals?: unknown;
  leads?: unknown;
  plans?: unknown;
  versions?: Versions;
}) {
  try {
    // Refuse if a file this save would write changed since the panel loaded it.
    if (body.versions) {
      const writing: DataFile[] = [
        ...(body.companies !== undefined || body.proposals !== undefined ? (['companies'] as const) : []),
        ...(body.leads !== undefined ? (['leads'] as const) : []),
        ...(body.plans !== undefined ? (['plans'] as const) : []),
      ];
      const now = await currentVersions();
      const stale = writing.filter((key) => body.versions?.[key] && body.versions[key] !== now[key]);
      if (stale.length) {
        return Response.json(
          {
            error: `Someone else saved ${stale.map((k) => FILE_NAMES[k]).join(' and ')} after you opened the demo panel, so nothing was saved.`,
            conflict: stale,
          },
          { status: 409 },
        );
      }
    }

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

    let plansFile: PlansFile | null = null;
    if (body.plans !== undefined) {
      const plans = body.plans;
      const isObject = (v: unknown): v is Record<string, unknown> =>
        typeof v === 'object' && v !== null && !Array.isArray(v);
      if (!isObject(plans) || !Object.values(plans).every(isObject)) {
        throw new BadRequest('`plans` must be an object of plan objects, keyed by plan id.');
      }
      const current = await readJson<PlansFile>(PLANS_FILE);
      // Plans can be added (and added ones removed), but the app looks up Free, Boost and
      // Bond Plus by id, so those must stay.
      const missing = CORE_PLAN_IDS.filter((id) => !(id in plans));
      if (missing.length) {
        throw new BadRequest(`The ${missing.join(', ')} plan can't be removed: the app uses it.`, 409);
      }
      const badId = Object.keys(plans).find((id) => !PLAN_ID_PATTERN.test(id));
      if (badId !== undefined) {
        throw new BadRequest(`Plan id "${badId}" must be lowercase letters, numbers and dashes.`);
      }
      const PLAN_TYPES = ['plan', 'one-off', 'subscription'];
      const UNITS = ['day', 'week', 'month', 'year'];
      for (const [id, p] of Object.entries(plans)) {
        if (!isObject(p) || typeof p.name !== 'string' || !p.name.trim()) {
          throw new BadRequest(`Plan "${id}" needs a name.`);
        }
        if (!PLAN_TYPES.includes(p.type as string)) {
          throw new BadRequest(`Plan "${p.name}" needs a type: ${PLAN_TYPES.join(', ')}.`);
        }
        if (typeof p.pricePence !== 'number' || !Number.isInteger(p.pricePence) || p.pricePence < 0) {
          throw new BadRequest(`Plan "${p.name}" needs a price in pence of 0 or more.`);
        }
        const period = p.period;
        if (
          period !== null &&
          !(
            isObject(period) &&
            Number.isInteger(period.count) &&
            (period.count as number) >= 1 &&
            UNITS.includes(period.unit as string)
          )
        ) {
          throw new BadRequest(`Plan "${p.name}" has an invalid period (a count of 1 or more and a unit).`);
        }
        if (!Array.isArray(p.benefits) || p.benefits.some((b) => typeof b !== 'string')) {
          throw new BadRequest(`Plan "${p.name}" needs a list of benefits (it can be empty).`);
        }
      }
      plansFile = { ...current, plans: plans as PlansFile['plans'] };
    }

    // Validate everything before writing anything.
    if (companiesChanged) await writeJson(COMPANIES_FILE, companiesFile);
    if (leadsFile) await writeJson(LEADS_FILE, leadsFile);
    if (plansFile) await writeJson(PLANS_FILE, plansFile);
    return Response.json({ ok: true, versions: await currentVersions() });
  } catch (error) {
    if (error instanceof BadRequest) return Response.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
