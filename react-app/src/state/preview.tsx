import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import {
  companies as BUNDLED_COMPANIES,
  proposals as BUNDLED_PROPOSALS,
  type Company,
  type CompanyProposal,
  DEMO_USER_ID,
} from '@/data/companies';
import { DEMO_LEADS, type Lead, type LeadSeed, withCompanyFields } from '@/data/demo-leads';
import { DEMO_INCOMING, type IncomingProposal } from '@/data/demo-network';
import { buildDemoUser } from '@/data/demo-user';
import { MAX_ACTIVE_PROPOSALS } from '@/data/plans';

/**
 * All preview-only app state (proposals, matches, conversations) lives in this
 * one provider. It's seeded from docs/bond-demo-data.md, kept in memory, resets
 * on reload, and never sends anything anywhere. That includes the demo
 * companies: the demo panel can edit them for the session (hosted demos can't
 * write companies.json, so this is the only place edits live there).
 */

// ── Proposals ────────────────────────────────────────────────────────────────


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
  /** The demo companies for this session. Seeded from companies.json; editable in the demo panel. */
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  getCompany: (id: string) => Company;
  /** The demo collaboration proposals (companies.json `proposals`), editable in the demo panel. */
  demoProposals: CompanyProposal[];
  setDemoProposals: (proposals: CompanyProposal[]) => void;
  /** Replaces every Leads chat (demo panel). */
  replaceLeads: (seeds: LeadSeed[]) => void;
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
  incoming: IncomingProposal[];
  acceptProposal: (companyId: string) => void;
  rejectProposal: (companyId: string) => void;
};

const PreviewContext = createContext<PreviewState | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(BUNDLED_COMPANIES);
  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const getCompany = useCallback(
    (id: string) => {
      const company = companyById.get(id);
      if (!company) throw new Error(`Unknown company id: ${id}`);
      return company;
    },
    [companyById],
  );

  const [demoProposals, setDemoProposals] = useState<CompanyProposal[]>(BUNDLED_PROPOSALS);

  const [currentUserId, setCurrentUserIdState] = useState<string>(DEMO_USER_ID);
  const [discover, setDiscover] = useState<DiscoverState>(() => seedDiscover(DEMO_USER_ID));
  const [incoming, setIncoming] = useState<IncomingProposal[]>(DEMO_INCOMING);
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);

  // A different account starts with its own fresh Discover feed.
  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    setDiscover(seedDiscover(id));
    setIncoming(id === DEMO_USER_ID ? DEMO_INCOMING : []);
  }, []);

  // Accepting makes a match: the proposal leaves Your Network and opens a chat in Leads.
  const acceptProposal = useCallback(
    (companyId: string) => {
      const proposal = incoming.find((p) => p.companyId === companyId);
      if (!proposal) return;
      const { name, industry, location } = getCompany(companyId);
      setIncoming((current) => current.filter((p) => p.companyId !== companyId));
      setLeads((current) =>
        current.some((l) => l.id === companyId)
          ? current
          : [
              {
                id: companyId,
                company: name,
                industry,
                location,
                pinnedComment: proposal.comment,
                messages: [],
                muted: false,
              },
              ...current,
            ],
      );
    },
    [incoming, getCompany],
  );

  const rejectProposal = useCallback((companyId: string) => {
    setIncoming((current) => current.filter((p) => p.companyId !== companyId));
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

  const replaceLeads = useCallback(
    (seeds: LeadSeed[]) => setLeads(seeds.map((seed) => withCompanyFields(seed, getCompany))),
    [getCompany],
  );

  const unmatch = useCallback((leadId: string) => {
    setLeads((current) => current.filter((lead) => lead.id !== leadId));
  }, []);

  // Leads copy a company's name, industry and location; keep them in step with demo panel edits.
  const liveLeads = useMemo(
    () =>
      leads.map((lead) => {
        const c = companyById.get(lead.id);
        return c ? { ...lead, company: c.name, industry: c.industry, location: c.location } : lead;
      }),
    [leads, companyById],
  );

  const value = useMemo(
    () => ({
      companies,
      setCompanies,
      getCompany,
      demoProposals,
      setDemoProposals,
      replaceLeads,
      currentUserId,
      setCurrentUserId,
      proposals,
      addProposal,
      leads: liveLeads,
      sendMessage,
      toggleMute,
      unmatch,
      discover,
      passCompany,
      toggleSaved,
      sendLike,
      blockCompany,
      restartDiscover,
      incoming,
      acceptProposal,
      rejectProposal,
    }),
    [
      companies,
      getCompany,
      demoProposals,
      replaceLeads,
      currentUserId,
      setCurrentUserId,
      proposals,
      addProposal,
      liveLeads,
      sendMessage,
      toggleMute,
      unmatch,
      discover,
      passCompany,
      toggleSaved,
      sendLike,
      blockCompany,
      restartDiscover,
      incoming,
      acceptProposal,
      rejectProposal,
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

/** The session's demo companies (with any demo panel edits) and a lookup by id. */
export function useCompanies() {
  const { companies, setCompanies, getCompany } = usePreview();
  return { companies, setCompanies, getCompany };
}

/** The demo collaboration proposals for this session (with any demo panel edits). */
export function useDemoProposals() {
  const { demoProposals, setDemoProposals } = usePreview();
  return { demoProposals, setDemoProposals };
}

export function useLeads() {
  const { leads, sendMessage, toggleMute, unmatch, replaceLeads } = usePreview();
  return { leads, sendMessage, toggleMute, unmatch, replaceLeads };
}

/** The demo company the app is logged in as (defaults to c01; switchable in the demo panel). */
export function useCurrentUser() {
  const { currentUserId, setCurrentUserId, getCompany } = usePreview();
  return { user: buildDemoUser(getCompany(currentUserId)), currentUserId, setCurrentUserId };
}

/** Discover progress for the logged-in account: passes, saves, blocks and likes sent. */
export function useDiscover() {
  const { discover, passCompany, toggleSaved, sendLike, blockCompany, restartDiscover } = usePreview();
  return { ...discover, passCompany, toggleSaved, sendLike, blockCompany, restartDiscover };
}

/** Your Network: proposals sent to the logged-in account, plus companies it saved. */
export function useNetwork() {
  const { incoming, acceptProposal, rejectProposal, discover, toggleSaved } = usePreview();
  return { incoming, saved: discover.saved, acceptProposal, rejectProposal, toggleSaved };
}
