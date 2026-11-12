import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { DEMO_USER_ID } from '@/data/companies';
import { DEMO_LEADS, type Lead } from '@/data/demo-leads';
import { buildDemoUser } from '@/data/demo-user';

/**
 * All preview-only app state (proposals, matches, conversations) lives in this
 * one provider. It's seeded from docs/bond-demo-data.md, kept in memory, resets
 * on reload, and never sends anything anywhere.
 */

// ── Proposals ────────────────────────────────────────────────────────────────

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

const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'p01',
    title: 'Refillable candles in handmade stoneware',
    meta: 'Leeds · Ceramics × Home fragrance',
    summary: 'Our vessels, your wax. Customers bring the pot back for a refill instead of buying new glass.',
    status: 'Matched',
  },
];

// ── Context ──────────────────────────────────────────────────────────────────

type PreviewState = {
  /** Which demo company the app is "logged in" as. Switched from the demo panel. */
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  proposals: Proposal[];
  addProposal: (input: ProposalInput) => void;
  leads: Lead[];
  sendMessage: (leadId: string, text: string) => void;
  toggleMute: (leadId: string) => void;
  unmatch: (leadId: string) => void;
};

const PreviewContext = createContext<PreviewState | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>(DEMO_USER_ID);
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);

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

  const sendMessage = useCallback((leadId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? { ...lead, messages: [...lead.messages, { id: `local-${Date.now()}`, from: 'me', text: trimmed }] }
          : lead,
      ),
    );
  }, []);

  const toggleMute = useCallback((leadId: string) => {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, muted: !lead.muted } : lead)));
  }, []);

  const unmatch = useCallback((leadId: string) => {
    setLeads((current) => current.filter((lead) => lead.id !== leadId));
  }, []);

  const value = useMemo(
    () => ({ currentUserId, setCurrentUserId, proposals, addProposal, leads, sendMessage, toggleMute, unmatch }),
    [currentUserId, proposals, addProposal, leads, sendMessage, toggleMute, unmatch],
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error('Preview hooks must be used inside <PreviewProvider>');
  return ctx;
}

export function useProposals() {
  const { proposals, addProposal } = usePreview();
  return { proposals, addProposal, canAdd: proposals.length < MAX_ACTIVE_PROPOSALS };
}

export function useLeads() {
  const { leads, sendMessage, toggleMute, unmatch } = usePreview();
  return { leads, sendMessage, toggleMute, unmatch };
}

/** The demo company the app is logged in as (defaults to c01; switchable in the demo panel). */
export function useCurrentUser() {
  const { currentUserId, setCurrentUserId } = usePreview();
  return { user: buildDemoUser(currentUserId), currentUserId, setCurrentUserId };
}
