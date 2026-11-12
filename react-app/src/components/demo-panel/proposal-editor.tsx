import { type EditRecord } from '@/components/demo-panel/company-editor';
import { DetailShell, FieldsCard } from '@/components/demo-panel/editor-shell';
import { ObjectFields } from '@/components/demo-panel/json-field';
import { useCompanies } from '@/state/preview';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * The demo panel's editor for one collaboration proposal (companies.json
 * `proposals`). The partner companies are fixed; who contributes what, the
 * wording, status and terms are editable.
 */

const FIELDS = [
  'id',
  'title',
  'summary',
  'status',
  'collaborationType',
  'businessGoal',
  'budget',
  'region',
  'industries',
  'companyIds',
  'contributions',
];

const CHOICES = {
  status: ['Open', 'Matched (no chat yet)', 'Matched (in Leads)'],
  collaborationType: ['Product collaboration', 'Service collaboration', 'Bundle deal'],
  businessGoal: ['Launch a new product', 'Reach new customers'],
};

export const partnerIds = (proposal: EditRecord) =>
  Array.isArray(proposal.companyIds) ? proposal.companyIds.map(String) : [];

/** "Kiln & Clay Studio × Wick & Wild Candle Co." */
export function usePartnerNames() {
  const { companies } = useCompanies();
  return (proposal: EditRecord) =>
    partnerIds(proposal)
      .map((id) => companies.find((c) => c.id === id)?.name ?? id)
      .join(' × ');
}

export const proposalTitle = (proposal: EditRecord) =>
  typeof proposal.title === 'string' && proposal.title ? proposal.title : proposal.id;

export function ProposalDetail({
  proposal,
  original,
  position,
  onChange,
  onDiscard,
  onBack,
  onPrev,
  onNext,
}: {
  proposal: EditRecord;
  original: EditRecord;
  position: string;
  onChange: (next: EditRecord) => void;
  onDiscard: () => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const partners = usePartnerNames();
  const other = Object.keys(proposal).filter((key) => !FIELDS.includes(key));

  return (
    <DetailShell
      avatarIds={partnerIds(proposal)}
      title={proposalTitle(proposal)}
      subtitle={`${proposal.id} · ${partners(proposal)}`}
      tag={typeof proposal.status === 'string' ? proposal.status : undefined}
      changeCount={diffJson(original as Json, proposal as Json).length}
      position={position}
      backLabel="All proposals"
      onDiscard={onDiscard}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
    >
      <FieldsCard>
        <ObjectFields
          keys={[...FIELDS, ...other]}
          value={proposal}
          original={original}
          choices={CHOICES}
          onChange={(next) => onChange(next as EditRecord)}
        />
      </FieldsCard>
    </DetailShell>
  );
}
