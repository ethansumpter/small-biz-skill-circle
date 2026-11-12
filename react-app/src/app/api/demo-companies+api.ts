/// <reference types="node" />

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Demo panel backend (development only). Reads and writes the demo companies in
 * src/data/companies.json on the machine running `npx expo start`. Only the
 * `companies` array is replaced; every other key in the file is kept as-is.
 * Not part of the Bond product — it exists so the demo data can be edited.
 */

const FILE = path.join(process.cwd(), 'src', 'data', 'companies.json');

type CompaniesFile = { companies: { id: string }[]; [key: string]: unknown };

const devOnly = () =>
  process.env.NODE_ENV === 'production'
    ? Response.json({ error: 'The demo panel only works with the development server.' }, { status: 403 })
    : null;

async function readData(): Promise<CompaniesFile> {
  return JSON.parse(await readFile(FILE, 'utf8'));
}

export async function GET() {
  return devOnly() ?? Response.json(await readData());
}

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }

  const companies = (body as { companies?: unknown })?.companies;
  if (!Array.isArray(companies) || companies.some((c) => typeof c !== 'object' || c === null || Array.isArray(c))) {
    return Response.json({ error: '`companies` must be an array of company objects.' }, { status: 400 });
  }

  // The panel edits companies but never adds, removes or re-ids them.
  const data = await readData();
  const currentIds = data.companies.map((c) => c.id).join(',');
  const newIds = companies.map((c: { id?: unknown }) => c.id).join(',');
  if (currentIds !== newIds) {
    return Response.json(
      { error: 'Company ids changed. Reload the demo panel and try again.' },
      { status: 409 },
    );
  }

  data.companies = companies;
  await writeFile(FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return Response.json({ ok: true });
}
