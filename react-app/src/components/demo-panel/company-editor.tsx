import { useMemo, useState } from 'react';

import { DetailShell, FieldsCard, Tabs } from '@/components/demo-panel/editor-shell';
import { ObjectFields } from '@/components/demo-panel/json-field';
import { diffJson, type Json } from '@/utils/json-diff';

/** A record edited in the demo panel: any JSON object with an id. */
export type EditRecord = { id: string; [key: string]: Json };
export type CompanyRecord = EditRecord;

/**
 * The demo panel's company editor. A company's fields are split into sections
 * (one shown at a time) so nobody has to scroll through every field at once.
 */

const SECTIONS: { key: string; title: string; fields: string[] }[] = [
  {
    key: 'basics',
    title: 'Basics',
    fields: ['id', 'name', 'initials', 'industry', 'location', 'distanceMiles', 'size', 'verified', 'rating'],
  },
  { key: 'profile', title: 'Profile', fields: ['offer', 'lookingFor', 'interests', 'prompts'] },
  { key: 'media', title: 'Images & links', fields: ['profileImage', 'gallery', 'links'] },
  { key: 'reviews', title: 'Reviews', fields: ['reviews'] },
  { key: 'proposals', title: 'Proposals', fields: ['proposalIds'] },
];
const LISTED = new Set(SECTIONS.flatMap((s) => s.fields));

const CHOICES = { size: ['Micro', 'SME'] };

/** Sections for this company, plus "Other" for any field not listed above (e.g. one added to the JSON later). */
function sectionsFor(company: CompanyRecord) {
  const other = Object.keys(company).filter((key) => !LISTED.has(key));
  return other.length ? [...SECTIONS, { key: 'other', title: 'Other', fields: other }] : SECTIONS;
}

export const companyName = (company: CompanyRecord) =>
  typeof company.name === 'string' && company.name ? company.name : company.id;

export function CompanyDetail({
  company,
  original,
  isCurrentUser,
  position,
  onChange,
  onDiscard,
  onBack,
  onPrev,
  onNext,
}: {
  company: CompanyRecord;
  original: CompanyRecord;
  isCurrentUser: boolean;
  position: string;
  onChange: (next: CompanyRecord) => void;
  onDiscard: () => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const sections = useMemo(() => sectionsFor(company), [company]);
  // Kept when moving between companies, so the same section can be edited across several.
  const [sectionKey, setSectionKey] = useState('basics');
  const section = sections.find((s) => s.key === sectionKey) ?? sections[0];

  const counts = useMemo(() => {
    const pick = (record: CompanyRecord, fields: string[]) =>
      Object.fromEntries(fields.filter((f) => f in record).map((f) => [f, record[f]])) as Json;
    return new Map(sections.map((s) => [s.key, diffJson(pick(original, s.fields), pick(company, s.fields)).length]));
  }, [company, original, sections]);
  const total = [...counts.values()].reduce((n, c) => n + c, 0);

  return (
    <DetailShell
      avatarIds={[company.id]}
      title={companyName(company)}
      subtitle={[company.id, company.industry, company.location].filter(Boolean).join(' · ')}
      tag={isCurrentUser ? 'Logged in' : undefined}
      changeCount={total}
      position={position}
      backLabel="All companies"
      onDiscard={onDiscard}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
    >
      <Tabs
        label="Company sections"
        tabs={sections.map((s) => ({ key: s.key, title: s.title, count: counts.get(s.key) }))}
        value={section.key}
        onChange={setSectionKey}
      />
      <FieldsCard>
        <ObjectFields
          keys={section.fields}
          value={company}
          original={original}
          choices={CHOICES}
          onChange={(next) => onChange(next as CompanyRecord)}
        />
      </FieldsCard>
    </DetailShell>
  );
}
