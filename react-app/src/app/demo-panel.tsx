import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CompanyRecord, CompanyEditor } from '@/components/demo-panel/company-editor';
import { CompanyPicker } from '@/components/demo-panel/company-picker';
import { type CompanyChanges, ConfirmSaveModal } from '@/components/demo-panel/confirm-save-modal';
import { StackHeader } from '@/components/stack-header';
import { companies as bundledCompanies, DEMO_USER_ID, getCompany } from '@/data/companies';
import { useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * Demo panel: an admin view for the demo, separate from the Bond product.
 * Edits every demo company and writes them to src/data/companies.json (via the
 * dev-only /api/demo-companies route) after a confirmation listing each change.
 * Also switches which company the app is logged in as (session only).
 */

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

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function DemoPanelScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { currentUserId, setCurrentUserId } = useCurrentUser();

  const [original, setOriginal] = useState<CompanyRecord[]>(() => clone(bundledCompanies) as CompanyRecord[]);
  const [draft, setDraft] = useState<CompanyRecord[]>(original);
  const [canSave, setCanSave] = useState(false);
  const [banner, setBanner] = useState<Banner>({ tone: 'info', text: 'Loading companies.json from the dev server…' });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the file as it is on disk now, not as it was when the app was bundled.
  // Unsaved edits are kept if this is a retry, so nothing typed is lost.
  const load = useCallback(async (isCancelled: () => boolean = () => false) => {
    setBanner({ tone: 'info', text: 'Loading companies.json from the dev server…' });
    try {
      const res = await fetch(apiUrl());
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      const data = (await res.json()) as { companies: CompanyRecord[] };
      if (isCancelled()) return;
      setOriginal(data.companies);
      setDraft((current) => (current === original ? data.companies : current));
      setCanSave(true);
      setBanner(null);
    } catch (error) {
      if (isCancelled()) return;
      setCanSave(false);
      setBanner({
        tone: 'error',
        text: `Couldn't reach the dev server at ${apiUrl()} (${(error as Error).message}). Showing the bundled data, and saving is off. Check \`npx expo start\` is running, then tap Retry.`,
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
    setSaving(true);
    try {
      const res = await fetch(apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: draft }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
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
            The demo panel is for setting up the demo. Changes here edit the fictional demo companies in
            src/data/companies.json for everyone using this build. They aren't something a Bond member could do.
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
            {banner.tone === 'error' && !canSave ? (
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
            Switches the company the app acts as straight away. Resets to {getCompany(DEMO_USER_ID).name} on reload.
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
          {!canSave && banner?.tone === 'error' ? (
            <Text style={[type.caption, { color: colors.inkMuted }]}>Saving is off: dev server not reachable.</Text>
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
          disabled={!totalChanges || !canSave}
          onPress={() => setConfirmOpen(true)}
          style={({ pressed }) => [
            styles.barButton,
            {
              backgroundColor: colors.ink,
              borderColor: colors.ink,
              opacity: !totalChanges || !canSave ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[type.label, { color: colors.surface }]}>Save…</Text>
        </Pressable>
      </View>

      <ConfirmSaveModal
        visible={confirmOpen}
        groups={changeGroups}
        saving={saving}
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
