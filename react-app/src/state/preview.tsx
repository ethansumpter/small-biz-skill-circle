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

// ── Discover ─────────────────────────────────────────────────────────────────

/** A like (or proposal, when a type is picked) sent from Discover. Never delivered anywhere. */
export type SentLike = { companyId: string; comment: string; proposalType?: string };

type DiscoverState = {
  /** Crossed (skipped) companies; "Start again" brings them back. */
  passed: string[];
  sent: SentLike[];
  saved: string[];
  blocked: string[];
};

/** Demo account starts with Brightframe saved (docs/bond-demo-data.md, Your Network). */
const seedDiscover = (userId: string): DiscoverState => ({
  passed: [],
  sent: [],
  saved: userId === DEMO_USER_ID ? ['c09'] : [],
  blocked: [],
});

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
  discover: DiscoverState;
  passCompany: (id: string) => void;
  toggleSaved: (id: string) => void;
  sendLike: (like: SentLike) => void;
  blockCompany: (id: string) => void;
  restartDiscover: () => void;
};

const PreviewContext = createContext<PreviewState | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<string>(DEMO_USER_ID);
  const [discover, setDiscover] = useState<DiscoverState>(() => seedDiscover(DEMO_USER_ID));

  // A different account starts with its own fresh Discover feed.
  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    setDiscover(seedDiscover(id));
  }, []);

  const passCompany = useCallback((id: string) => {
    setDiscover((d) => ({ ...d, passed: [...d.passed, id] }));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setDiscover((d) => ({
      ...d,
      saved: d.saved.includes(id) ? d.saved.filter((s) => s !== id) : [...d.saved, id],
    }));
  }, []);

  const sendLike = useCallback((like: SentLike) => {
    const comment = like.comment.trim();
    if (!comment) return;
    setDiscover((d) => ({ ...d, sent: [...d.sent, { ...like, comment }] }));
  }, []);

  const blockCompany = useCallback((id: string) => {
    setDiscover((d) => ({ ...d, blocked: [...d.blocked, id], saved: d.saved.filter((s) => s !== id) }));
  }, []);

  const restartDiscover = useCallback(() => {
    setDiscover((d) => ({ ...d, passed: [] }));
  }, []);
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
    () => ({
      currentUserId,
      setCurrentUserId,
      proposals,
      addProposal,
      leads,
      sendMessage,
      toggleMute,
      unmatch,
      discover,
      passCompany,
      toggleSaved,
      sendLike,
      blockCompany,
      restartDiscover,
    }),
    [
      currentUserId,
      setCurrentUserId,
      proposals,
      addProposal,
      leads,
      sendMessage,
      toggleMute,
      unmatch,
      discover,
      passCompany,
      toggleSaved,
      sendLike,
      blockCompany,
      restartDiscover,
    ],
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

/** Discover progress for the logged-in account: passes, saves, blocks and likes sent. */
export function useDiscover() {
  const { discover, passCompany, toggleSaved, sendLike, blockCompany, restartDiscover } = usePreview();
  return { ...discover, passCompany, toggleSaved, sendLike, blockCompany, restartDiscover };
}
