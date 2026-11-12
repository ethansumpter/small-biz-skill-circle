import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CompanyRecord, CompanyEditor } from '@/components/demo-panel/company-editor';
import { CompanyPicker } from '@/components/demo-panel/company-picker';
import { type CompanyChanges, ConfirmSaveModal } from '@/components/demo-panel/confirm-save-modal';
import { StackHeader } from '@/components/stack-header';
import { type Company, DEMO_USER_ID, getCompany as getBundledCompany } from '@/data/companies';
import { useCompanies, useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * Demo panel: an admin view for the demo, separate from the Bond product.
 * Edits every demo company after a confirmation listing each change. Applied
 * edits always update the session's companies (preview provider). With the dev
 * server, they're also written to src/data/companies.json via the dev-only
 * /api/demo-companies route; hosted demos (web on EAS Hosting, EAS Update) have
 * no dev server, so there edits last for the session only.
 * Also switches which company the app is logged in as (session only).
 */

/** Only development builds have a dev server (and companies.json) to write to. */
const HAS_DEV_SERVER = __DEV__;

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

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function DemoPanelScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const { companies: sessionCompanies, setCompanies } = useCompanies();

  const [original, setOriginal] = useState<CompanyRecord[]>(() => clone(sessionCompanies) as CompanyRecord[]);
  const [draft, setDraft] = useState<CompanyRecord[]>(original);
  /** True once companies.json is reachable; otherwise applied edits last for the session only. */
  const [canSave, setCanSave] = useState(false);
  const [banner, setBanner] = useState<Banner>(HAS_DEV_SERVER ? { tone: 'info', text: 'Loading companies.json from the dev server…' } : SESSION_ONLY_BANNER);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the file as it is on disk now, not as it was when the app was bundled.
  // Unsaved edits are kept if this is a retry, so nothing typed is lost.
  const load = useCallback(async (isCancelled: () => boolean = () => false) => {
    if (!HAS_DEV_SERVER) return;
    setBanner({ tone: 'info', text: 'Loading companies.json from the dev server…' });
    try {
      const res = await fetch(apiUrl());
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      const data = (await res.json()) as { companies: CompanyRecord[] };
      if (isCancelled()) return;
      setOriginal(data.companies);
      setDraft((current) => (current === original ? data.companies : current));
      setCompanies(data.companies as unknown as Company[]);
      setCanSave(true);
      setBanner(null);
    } catch (error) {
      if (isCancelled()) return;
      setCanSave(false);
      setBanner({
        tone: 'error',
        text: `Couldn't reach the dev server at ${apiUrl()} (${(error as Error).message}). Showing this session's data. Changes apply to this session only and aren't saved to the file. Check \`npx expo start\` is running, then tap Retry.`,
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

  const changeGroups: CompanyChanges[] = useMemo(
    () =>
      draft
        .map((company, i) => ({
          id: company.id,
          name: String(original[i]?.name ?? company.id),
          changes: diffJson(original[i] as Json, company as Json),
        }))
        .filter((g) => g.changes.length > 0),
    [draft, original],
  );
  const changeCounts = useMemo(() => new Map(changeGroups.map((g) => [g.id, g.changes.length])), [changeGroups]);
  const totalChanges = changeGroups.reduce((n, g) => n + g.changes.length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return draft;
    return draft.filter((c) =>
      [c.id, c.name, c.industry, c.location].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [draft, query]);

  const toggle = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateCompany = useCallback((next: CompanyRecord) => {
    setDraft((current) => current.map((c) => (c.id === next.id ? next : c)));
  }, []);

  async function save() {
    if (!canSave) {
      setCompanies(draft as unknown as Company[]);
      setOriginal(draft);
      setConfirmOpen(false);
      setBanner({
        tone: 'success',
        text: `Applied ${totalChanges} ${totalChanges === 1 ? 'change' : 'changes'} for this session. They reset when you reload.`,
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: draft }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
      setCompanies(draft as unknown as Company[]);
      setOriginal(draft);
      setConfirmOpen(false);
      setBanner({ tone: 'success', text: `Saved ${totalChanges} ${totalChanges === 1 ? 'change' : 'changes'} to companies.json.` });
    } catch (error) {
      setConfirmOpen(false);
      setBanner({ tone: 'error', text: `Nothing was saved: ${(error as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  const pickerOptions = original.map((c) => ({ id: c.id, name: String(c.name), industry: String(c.industry) }));

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StackHeader title="Demo panel" subtitle="Admin tool for the demo, not part of Bond" />

      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: space[12] * 2 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.notice, { backgroundColor: colors.accent }]}>
          <Ionicons name="construct-outline" size={20} color={colors.onAccent} />
          <Text style={[type.caption, styles.flex, { color: colors.onAccent }]}>
            {canSave
              ? 'The demo panel is for setting up the demo. Changes here edit the fictional demo companies in src/data/companies.json for everyone using this build. They aren\'t something a Bond member could do.'
              : 'The demo panel is for setting up the demo. Changes here edit the fictional demo companies for this session only. They aren\'t something a Bond member could do.'}
          </Text>
        </View>

        {banner ? (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.banner,
              {
                borderColor: banner.tone === 'error' ? colors.ink : colors.line,
                backgroundColor: colors.surfaceRaised,
              },
            ]}
          >
            <Ionicons
              name={banner.tone === 'success' ? 'checkmark-circle' : banner.tone === 'error' ? 'alert-circle' : 'time-outline'}
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
        ) : null}

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
            Logged in as
          </Text>
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            Switches the company the app acts as straight away. Resets to {getBundledCompany(DEMO_USER_ID).name} on reload.
          </Text>
          <CompanyPicker
            label="Log in as"
            options={pickerOptions}
            value={currentUserId}
            onChange={setCurrentUserId}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text accessibilityRole="header" style={[type.subheading, styles.flex, { color: colors.ink }]}>
              Demo companies ({draft.length})
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setExpanded(expanded.size ? new Set() : new Set(draft.map((c) => c.id)))}
            >
              <Text style={[type.label, { color: colors.link }]}>{expanded.size ? 'Collapse all' : 'Expand all'}</Text>
            </Pressable>
          </View>

          <View style={[styles.search, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>
            <Ionicons name="search" size={18} color={colors.inkMuted} />
            <TextInput
              accessibilityLabel="Filter companies"
              placeholder="Filter by name, id, industry or location"
              placeholderTextColor={colors.inkMuted}
              value={query}
              onChangeText={setQuery}
              style={[type.body, styles.flex, styles.searchInput, { color: colors.ink }]}
            />
          </View>

          {visible.map((company) => (
            <CompanyEditor
              key={company.id}
              company={company}
              original={original.find((c) => c.id === company.id) ?? company}
              changeCount={changeCounts.get(company.id) ?? 0}
              expanded={expanded.has(company.id)}
              isCurrentUser={company.id === currentUserId}
              onToggle={toggle}
              onChange={updateCompany}
            />
          ))}
          {visible.length === 0 ? (
            <Text style={[type.body, { color: colors.inkMuted }]}>No companies match “{query}”.</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Save bar */}
      <View
        style={[
          styles.saveBar,
          { paddingBottom: insets.bottom + space[3], backgroundColor: colors.surfaceRaised, borderTopColor: colors.line },
        ]}
      >
        <View style={styles.flex}>
          <Text style={[type.label, { color: totalChanges ? colors.ink : colors.inkMuted }]}>
            {totalChanges
              ? `${totalChanges} unsaved ${totalChanges === 1 ? 'change' : 'changes'} in ${changeGroups.length} ${changeGroups.length === 1 ? 'company' : 'companies'}`
              : 'No unsaved changes'}
          </Text>
          {!canSave ? (
            <Text style={[type.caption, { color: colors.inkMuted }]}>Changes apply to this session only.</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={!totalChanges}
          onPress={() => setDraft(original)}
          style={({ pressed }) => [
            styles.barButton,
            { borderColor: colors.line, opacity: !totalChanges ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[type.label, { color: colors.ink }]}>Discard</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Shows every change and asks you to confirm"
          disabled={!totalChanges}
          onPress={() => setConfirmOpen(true)}
          style={({ pressed }) => [
            styles.barButton,
            {
              backgroundColor: colors.ink,
              borderColor: colors.ink,
              opacity: !totalChanges ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[type.label, { color: colors.surface }]}>{canSave ? 'Save…' : 'Apply…'}</Text>
        </Pressable>
      </View>

      <ConfirmSaveModal
        visible={confirmOpen}
        groups={changeGroups}
        saving={saving}
        target={canSave ? 'file' : 'session'}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={save}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space[4], gap: space[6], width: '100%', maxWidth: 720, alignSelf: 'center' },
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
  sectionHead: { flexDirection: 'row', alignItems: 'center' },
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
