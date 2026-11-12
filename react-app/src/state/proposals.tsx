import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Preview-only proposal state. Seeded from docs/bond-demo-data.md and kept in
 * memory: it resets on reload and nothing is sent anywhere.
 */
export const MAX_ACTIVE_PROPOSALS = 3;

export type ProposalInput = {
  lookingFor: string;
  partnerType: string;
  collaborationType: string;
  businessGoal: string;
  location: string;
  firmSize: string;
  weOffer: string;
  budget: string;
  requirements: string;
};

export type Proposal = {
  id: string;
  title: string;
  meta: string;
  summary: string;
  status: 'Open' | 'Matched';
};

const SEED: Proposal[] = [
  {
    id: 'p01',
    title: 'Refillable candles in handmade stoneware',
    meta: 'Leeds · Ceramics × Home fragrance',
    summary: 'Our vessels, your wax. Customers bring the pot back for a refill instead of buying new glass.',
    status: 'Matched',
  },
];

type ProposalsState = {
  proposals: Proposal[];
  canAdd: boolean;
  addProposal: (input: ProposalInput) => void;
};

const ProposalsContext = createContext<ProposalsState | null>(null);

export function ProposalsProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<Proposal[]>(SEED);

  const addProposal = useCallback((input: ProposalInput) => {
    setProposals((current) => {
      if (current.length >= MAX_ACTIVE_PROPOSALS) return current;
      const meta = [input.location, input.partnerType, input.collaborationType].filter(Boolean).join(' · ');
      return [
        ...current,
        {
          id: `local-${Date.now()}`,
          title: input.lookingFor.trim(),
          meta,
          summary: `We can offer: ${input.weOffer.trim()}`,
          status: 'Open',
        },
      ];
    });
  }, []);

  const value = useMemo(
    () => ({ proposals, canAdd: proposals.length < MAX_ACTIVE_PROPOSALS, addProposal }),
    [proposals, addProposal],
  );

  return <ProposalsContext.Provider value={value}>{children}</ProposalsContext.Provider>;
}

export function useProposals() {
  const ctx = useContext(ProposalsContext);
  if (!ctx) throw new Error('useProposals must be used inside <ProposalsProvider>');
  return ctx;
}
