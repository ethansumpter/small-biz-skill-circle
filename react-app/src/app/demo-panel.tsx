import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanyDetail, companyName, type EditRecord } from '@/components/demo-panel/company-editor';
import { CompanyPicker } from '@/components/demo-panel/company-picker';
import { type CompanyChanges, ConfirmSaveModal } from '@/components/demo-panel/confirm-save-modal';
import { ItemRow, Tabs } from '@/components/demo-panel/editor-shell';
import { LeadDetail } from '@/components/demo-panel/lead-editor';
import { partnerIds, ProposalDetail, proposalTitle, usePartnerNames } from '@/components/demo-panel/proposal-editor';
import { StackHeader } from '@/components/stack-header';
import { type Company, type CompanyProposal, DEMO_USER_ID, getCompany as getBundledCompany } from '@/data/companies';
import { type LeadSeed, toLeadSeed } from '@/data/demo-leads';
import { useCompanies, useCurrentUser, useDemoProposals, useLeads } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * Demo panel: an admin view for the demo, separate from the Bond product.
 * Three editors (companies, collaboration proposals and Leads chats), each a
 * list plus a detail view. Edits are applied after a confirmation listing each
 * change, and always update the session (preview provider). With the dev
 * server they're also written to src/data/companies.json and
 * src/data/leads.json via the dev-only /api/demo-companies route; hosted demos
 * (web on EAS Hosting, EAS Update) have no dev server, so there edits last for
 * the session only.
 * Also switches which company the app is logged in as (session only).
 *
 * Chats start from the session's Leads (including messages sent this session),
 * so saving them to the file keeps the chats as they are now.
 */

/** Only development builds have a dev server (and the data files) to write to. */
const HAS_DEV_SERVER = __DEV__;

/** Window width at which the list and editor sit side by side. */
const WIDE_LAYOUT = 900;

/**
 * Absolute URL of the dev-only API route. On a phone, a relative URL has no
 * host, so point at the dev server the app was loaded from (`hostUri`, e.g.
 * "192.168.1.20:8081"; tunnels use https). On web, relative works as-is.
 */
function apiUrl() {
  const path = '/api/demo-companies';
  if (Platform.OS === 'web') return path;
  const host = Constants.expoConfig?.hostUri;
  if (!host) return path;
  const protocol = /\.exp\.direct|ngrok/.test(host) ? 'https' : 'http';
  return `${protocol}://${host}${path}`;
}

type Banner = { tone: 'info' | 'success' | 'error'; text: string } | null;

const SESSION_ONLY_BANNER: Banner = {
  tone: 'info',
  text: 'This hosted demo has no dev server, so edits apply to this session only and reset when you reload. Nobody else sees them.',
};

type Tab = 'companies' | 'proposals' | 'chats';
const TAB_TITLES: Record<Tab, string> = { companies: 'Companies', proposals: 'Proposals', chats: 'Chats' };
const NOUN: Record<Tab, [string, string]> = {
  companies: ['company', 'companies'],
  proposals: ['proposal', 'proposals'],
  chats: ['chat', 'chats'],
};

/** A row in the current tab's list. */
type Entry = { id: string; avatarIds: string[]; title: string; subtitle: string; tag?: string };

type Group = CompanyChanges & { tab: Tab; itemId: string };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const plural = (n: number, [one, many]: [string, string]) => `${n} ${n === 1 ? one : many}`;
const replaceById = <T extends { id: string }>(list: T[], next: T) => list.map((x) => (x.id === next.id ? next : x));

export default function DemoPanelScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const { companies: sessionCompanies, setCompanies } = useCompanies();
  const { demoProposals, setDemoProposals } = useDemoProposals();
  const { leads: sessionLeads, replaceLeads } = useLeads();
  const partnerNames = usePartnerNames();

  // Saved ("original") and edited ("draft") copies of each dataset.
  const initial = useRef({
    companies: clone(sessionCompanies) as unknown as EditRecord[],
    proposals: clone(demoProposals) as unknown as EditRecord[],
  }).current;
  const [origCompanies, setOrigCompanies] = useState(initial.companies);
  const [companies, setDraftCompanies] = useState(initial.companies);
  const [origProposals, setOrigProposals] = useState(initial.proposals);
  const [proposals, setDraftProposals] = useState(initial.proposals);
  const [origLeads, setOrigLeads] = useState<LeadSeed[]>(() => clone(sessionLeads.map(toLeadSeed)));
  const [leads, setDraftLeads] = useState<LeadSeed[]>(origLeads);

  /** True once the data files are reachable; otherwise applied edits last for the session only. */
  const [canSave, setCanSave] = useState(false);
  const [banner, setBanner] = useState<Banner>(
    HAS_DEV_SERVER ? { tone: 'info', text: 'Loading the demo data from the dev server…' } : SESSION_ONLY_BANNER,
  );
  const [tab, setTab] = useState<Tab>('companies');
  /** The item open in each tab; null shows the list (narrow) or a default item (wide). */
  const [selected, setSelected] = useState<Record<Tab, string | null>>({ companies: null, proposals: null, chats: null });
  const [query, setQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const detailRef = useRef<ScrollViewInstance>(null);

  // Load the files as they are on disk now, not as they were when the app was bundled.
  // Unsaved edits are kept if this is a retry, so nothing typed is lost. Chats stay as
  // they are in the session (see the note at the top).
  const load = useCallback(async (isCancelled: () => boolean = () => false) => {
    if (!HAS_DEV_SERVER) return;
    setBanner({ tone: 'info', text: 'Loading the demo data from the dev server…' });
    try {
      const res = await fetch(apiUrl());
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      const data = (await res.json()) as { companies: EditRecord[]; proposals: EditRecord[] };
      if (isCancelled()) return;
      setOrigCompanies(data.companies);
      setDraftCompanies((current) => (current === initial.companies ? data.companies : current));
      setCompanies(data.companies as unknown as Company[]);
      setOrigProposals(data.proposals);
      setDraftProposals((current) => (current === initial.proposals ? data.proposals : current));
      setDemoProposals(data.proposals as unknown as CompanyProposal[]);
      setCanSave(true);
      setBanner(null);
    } catch (error) {
      if (isCancelled()) return;
      setCanSave(false);
      setBanner({
        tone: 'error',
        text: `Couldn't reach the dev server at ${apiUrl()} (${(error as Error).message}). Showing this session's data. Changes apply to this session only and aren't saved to the files. Check \`npx expo start\` is running, then tap Retry.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  const nameOf = useCallback(
    (id: string) => String(companies.find((c) => c.id === id)?.name ?? id),
    [companies],
  );

  // ── Changes ────────────────────────────────────────────────────────────────

  const groups: Group[] = useMemo(() => {
    const byIndex = (tab: Tab, draft: EditRecord[], saved: EditRecord[], name: (r: EditRecord) => string) =>
      draft.map((item, i) => ({
        tab,
        itemId: item.id,
        id: item.id,
        name: name(saved[i] ?? item),
        changes: diffJson(saved[i] as Json, item as Json),
      }));
    // Chats can be added and removed, so they're matched by id.
    const leadIds = [...new Set([...origLeads.map((l) => l.id), ...leads.map((l) => l.id)])];
    const chatGroups = leadIds.map((id) => ({
      tab: 'chats' as const,
      itemId: id,
      id: `chat ${id}`,
      name: `Chat with ${nameOf(id)}`,
      changes: diffJson(
        origLeads.find((l) => l.id === id) as unknown as Json | undefined,
        leads.find((l) => l.id === id) as unknown as Json | undefined,
      ),
    }));
    return [
      ...byIndex('companies', companies, origCompanies, companyName),
      ...byIndex('proposals', proposals, origProposals, (p) => `Proposal: ${proposalTitle(p)}`),
      ...chatGroups,
    ].filter((g) => g.changes.length > 0);
  }, [companies, origCompanies, proposals, origProposals, leads, origLeads, nameOf]);

  const changeCounts = useMemo(
    () => new Map(groups.map((g) => [`${g.tab}:${g.itemId}`, g.changes.length])),
    [groups],
  );
  const tabCount = (t: Tab) => groups.filter((g) => g.tab === t).reduce((n, g) => n + g.changes.length, 0);
  const totalChanges = groups.reduce((n, g) => n + g.changes.length, 0);
  const changed = (t: Tab) => groups.some((g) => g.tab === t);
  const files = [
    ...(changed('companies') || changed('proposals') ? ['src/data/companies.json'] : []),
    ...(changed('chats') ? ['src/data/leads.json'] : []),
  ];

  // ── Saving ─────────────────────────────────────────────────────────────────

  function applyToSession() {
    setCompanies(companies as unknown as Company[]);
    setDemoProposals(proposals as unknown as CompanyProposal[]);
    replaceLeads(leads);
    setOrigCompanies(companies);
    setOrigProposals(proposals);
    setOrigLeads(leads);
  }

  async function save() {
    const summary = plural(totalChanges, ['change', 'changes']);
    if (!canSave) {
      applyToSession();
      setConfirmOpen(false);
      setBanner({ tone: 'success', text: `Applied ${summary} for this session. They reset when you reload.` });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(changed('companies') ? { companies } : {}),
          ...(changed('proposals') ? { proposals } : {}),
          ...(changed('chats') ? { leads } : {}),
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
      applyToSession();
      setConfirmOpen(false);
      setBanner({ tone: 'success', text: `Saved ${summary} to ${files.join(' and ')}.` });
    } catch (error) {
      setConfirmOpen(false);
      setBanner({ tone: 'error', text: `Nothing was saved: ${(error as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  function discardAll() {
    setDraftCompanies(origCompanies);
    setDraftProposals(origProposals);
    setDraftLeads(origLeads);
  }

  // ── Lists ──────────────────────────────────────────────────────────────────

  const entries: Entry[] = useMemo(() => {
    if (tab === 'companies') {
      return companies.map((c) => ({
        id: c.id,
        avatarIds: [c.id],
        title: companyName(c),
        subtitle: [c.id, c.industry].filter(Boolean).join(' · '),
        tag: c.id === currentUserId ? 'Logged in' : undefined,
      }));
    }
    if (tab === 'proposals') {
      return proposals.map((p) => ({
        id: p.id,
        avatarIds: partnerIds(p),
        title: proposalTitle(p),
        // Status goes in the subtitle rather than a tag, which would squeeze the (long) title.
        subtitle: [p.id, p.status, partnerNames(p)].filter(Boolean).join(' · '),
      }));
    }
    return leads.map((l) => ({
      id: l.id,
      avatarIds: [l.id],
      title: nameOf(l.id),
      subtitle: `${plural(l.messages.length, ['message', 'messages'])}${l.pinnedComment ? ' · pinned comment' : ''}${l.muted ? ' · muted' : ''}`,
      tag: origLeads.some((o) => o.id === l.id) ? undefined : 'New',
    }));
  }, [tab, companies, proposals, leads, origLeads, currentUserId, partnerNames, nameOf]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => [e.id, e.title, e.subtitle, e.tag].some((v) => (v ?? '').toLowerCase().includes(q)));
  }, [entries, query]);

  // Wide screens show the list and the editor side by side; narrow ones take turns.
  const wide = width >= WIDE_LAYOUT;
  const fallbackId = tab === 'companies' ? currentUserId : entries[0]?.id;
  const shownId = selected[tab] ?? (wide ? fallbackId : null);
  const select = useCallback((id: string | null) => setSelected((s) => ({ ...s, [tab]: id })), [tab]);

  // Previous / next follow the filtered list, or the full list if the item is filtered out.
  const navList = shownId && visible.some((e) => e.id === shownId) ? visible : entries;
  const index = navList.findIndex((e) => e.id === shownId);
  const goTo = (i: number) => (index >= 0 && i >= 0 && i < navList.length ? () => select(navList[i].id) : undefined);

  useEffect(() => {
    detailRef.current?.scrollTo({ y: 0, animated: false });
  }, [shownId, tab]);

  const switchTab = (next: string) => {
    setTab(next as Tab);
    setQuery('');
  };

  // ── Detail ─────────────────────────────────────────────────────────────────

  const nav = {
    position: `${index + 1} of ${navList.length}`,
    onBack: wide ? undefined : () => select(null),
    onPrev: goTo(index - 1),
    onNext: goTo(index + 1),
  };

  let detail: ReactNode = null;
  if (tab === 'companies') {
    const company = companies.find((c) => c.id === shownId);
    if (company) {
      const saved = origCompanies.find((c) => c.id === company.id) ?? company;
      detail = (
        <CompanyDetail
          company={company}
          original={saved}
          isCurrentUser={company.id === currentUserId}
          onChange={(next) => setDraftCompanies((list) => replaceById(list, next))}
          onDiscard={() => setDraftCompanies((list) => replaceById(list, saved))}
          {...nav}
        />
      );
    }
  } else if (tab === 'proposals') {
    const proposal = proposals.find((p) => p.id === shownId);
    if (proposal) {
      const saved = origProposals.find((p) => p.id === proposal.id) ?? proposal;
      detail = (
        <ProposalDetail
          proposal={proposal}
          original={saved}
          onChange={(next) => setDraftProposals((list) => replaceById(list, next))}
          onDiscard={() => setDraftProposals((list) => replaceById(list, saved))}
          {...nav}
        />
      );
    }
  } else {
    const lead = leads.find((l) => l.id === shownId);
    if (lead) {
      const saved = origLeads.find((l) => l.id === lead.id);
      detail = (
        <LeadDetail
          lead={lead}
          original={saved}
          onChange={(next) => setDraftLeads((list) => replaceById(list, next))}
          onDiscard={() =>
            setDraftLeads((list) => (saved ? replaceById(list, saved) : list.filter((l) => l.id !== lead.id)))
          }
          onDelete={() => {
            setDraftLeads((list) => list.filter((l) => l.id !== lead.id));
            select(null);
          }}
          {...nav}
        />
      );
    }
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  const bannerView = (tones: Exclude<Banner, null>['tone'][]) =>
    banner && tones.includes(banner.tone) ? (
      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.banner,
          { borderColor: banner.tone === 'error' ? colors.ink : colors.line, backgroundColor: colors.surfaceRaised },
        ]}
      >
        <Ionicons
          name={banner.tone === 'success' ? 'checkmark-circle' : banner.tone === 'error' ? 'alert-circle' : 'information-circle-outline'}
          size={18}
          color={colors.ink}
        />
        <Text style={[type.caption, styles.flex, { color: colors.ink }]}>{banner.text}</Text>
        {banner.tone === 'error' && HAS_DEV_SERVER && !canSave ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => load()}>
            <Text style={[type.label, { color: colors.link }]}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    ) : null;

  const pickerOptions = companies.map((c) => ({ id: c.id, name: companyName(c), industry: String(c.industry) }));
  const chatOptions = pickerOptions.filter((o) => o.id !== currentUserId && !leads.some((l) => l.id === o.id));

  const listPane = (
    <>
      <View style={[styles.notice, { backgroundColor: colors.accent }]}>
        <Ionicons name="construct-outline" size={20} color={colors.onAccent} />
        <Text style={[type.caption, styles.flex, { color: colors.onAccent }]}>
          {canSave
            ? 'For setting up the demo, not part of Bond. Saved changes edit the fictional demo data in src/data/ for everyone using this build.'
            : 'For setting up the demo, not part of Bond. Changes edit the fictional demo data for this session only.'}
        </Text>
      </View>

      {bannerView(['info', 'success', 'error'])}

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
          Logged in as
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          Switches the company the app acts as straight away. Resets to {getBundledCompany(DEMO_USER_ID).name} on reload.
        </Text>
        <CompanyPicker label="Log in as" options={pickerOptions} value={currentUserId} onChange={setCurrentUserId} />
      </View>

      <View style={styles.section}>
        <Tabs
          label="What to edit"
          tabs={(Object.keys(TAB_TITLES) as Tab[]).map((t) => ({ key: t, title: TAB_TITLES[t], count: tabCount(t) }))}
          value={tab}
          onChange={switchTab}
        />
        {tab === 'chats' ? (
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            The chats in Leads, as they are in this session (including messages sent since the app loaded).
          </Text>
        ) : null}
        <View style={[styles.search, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>
          <Ionicons name="search" size={18} color={colors.inkMuted} />
          <TextInput
            accessibilityLabel={`Filter ${NOUN[tab][1]}`}
            placeholder={`Filter ${plural(entries.length, NOUN[tab])}`}
            placeholderTextColor={colors.inkMuted}
            value={query}
            onChangeText={setQuery}
            style={[type.body, styles.flex, styles.searchInput, { color: colors.ink }]}
          />
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear filter" hitSlop={8} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.rows}>
          {visible.map((entry) => (
            <ItemRow
              key={entry.id}
              {...entry}
              changeCount={changeCounts.get(`${tab}:${entry.id}`) ?? 0}
              selected={wide && entry.id === shownId}
              onPress={select}
            />
          ))}
        </View>
        {visible.length === 0 ? (
          <Text style={[type.body, { color: colors.inkMuted }]}>
            {query ? `No ${NOUN[tab][1]} match “${query}”.` : `No ${NOUN[tab][1]} yet.`}
          </Text>
        ) : null}
        {tab === 'chats' && chatOptions.length ? (
          <CompanyPicker
            label="Start a chat with"
            placeholder="Add a chat…"
            options={chatOptions}
            onChange={(id) => {
              setDraftLeads((list) => [...list, { id, muted: false, messages: [] }]);
              select(id);
            }}
          />
        ) : null}
      </View>
    </>
  );

  const detailPane = detail ? (
    <>
      {wide ? null : bannerView(['success', 'error'])}
      {detail}
    </>
  ) : (
    <Text style={[type.body, { color: colors.inkMuted }]}>Pick a {NOUN[tab][0]} to edit.</Text>
  );

  const bottomPad = { paddingBottom: space[12] + insets.bottom };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StackHeader title="Demo panel" subtitle="Admin tool for the demo, not part of Bond" />

      {wide ? (
        <View style={styles.split}>
          <ScrollView
            style={[styles.listColumn, { borderRightColor: colors.line }]}
            contentContainerStyle={[styles.content, bottomPad]}
            keyboardShouldPersistTaps="handled"
          >
            {listPane}
          </ScrollView>
          <ScrollView
            ref={detailRef}
            style={styles.root}
            contentContainerStyle={[styles.content, styles.detailContent, bottomPad]}
            keyboardShouldPersistTaps="handled"
          >
            {detailPane}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          ref={detailRef}
          style={styles.root}
          contentContainerStyle={[styles.content, styles.narrowContent, bottomPad]}
          keyboardShouldPersistTaps="handled"
        >
          {shownId && detail ? detailPane : listPane}
        </ScrollView>
      )}

      {/* Save bar */}
      <View
        style={[
          styles.saveBar,
          { paddingBottom: insets.bottom + space[3], backgroundColor: colors.surfaceRaised, borderTopColor: colors.line },
        ]}
      >
        <View style={styles.flex}>
          <Text style={[type.label, { color: totalChanges ? colors.ink : colors.inkMuted }]}>
            {totalChanges ? `${plural(totalChanges, ['unsaved change', 'unsaved changes'])}` : 'No unsaved changes'}
          </Text>
          {!canSave ? (
            <Text style={[type.caption, { color: colors.inkMuted }]}>Changes apply to this session only.</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Discard all unsaved changes"
          disabled={!totalChanges}
          onPress={discardAll}
          style={({ pressed }) => [
            styles.barButton,
            { borderColor: colors.line, opacity: !totalChanges ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[type.label, { color: colors.ink }]}>Discard all</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Shows every change and asks you to confirm"
          disabled={!totalChanges}
          onPress={() => setConfirmOpen(true)}
          style={({ pressed }) => [
            styles.barButton,
            { backgroundColor: colors.ink, borderColor: colors.ink, opacity: !totalChanges ? 0.4 : pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[type.label, { color: colors.surface }]}>{canSave ? 'Save…' : 'Apply…'}</Text>
        </Pressable>
      </View>

      <ConfirmSaveModal
        visible={confirmOpen}
        groups={groups}
        saving={saving}
        target={canSave ? 'file' : 'session'}
        files={files}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={save}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space[4], gap: space[6] },
  narrowContent: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  detailContent: { width: '100%', maxWidth: 760 },
  split: { flex: 1, flexDirection: 'row' },
  listColumn: { width: 360, flexGrow: 0, borderRightWidth: StyleSheet.hairlineWidth },
  rows: { gap: space[2] },
  notice: { flexDirection: 'row', gap: space[3], padding: space[3], borderRadius: radius.md, alignItems: 'flex-start' },
  banner: {
    flexDirection: 'row',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  section: { gap: space[3] },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: { minHeight: 44 },
  saveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barButton: {
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
