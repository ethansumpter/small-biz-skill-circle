import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { type EditRecord } from '@/components/demo-panel/company-editor';
import { DetailShell, FieldsCard } from '@/components/demo-panel/editor-shell';
import { Label, NumberInput, ObjectFields } from '@/components/demo-panel/json-field';
import { formatPrice, type Plan } from '@/data/plans';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * The demo panel's editor for one plan in plans.json: name, type, price (entered
 * in pounds, stored in pence), billing period, benefits and limits. The plan id
 * is fixed because the app looks plans up by it. Free, Boost and Bond Plus can't
 * be deleted; added plans can.
 */

const TYPES = ['plan', 'one-off', 'subscription'];
const UNITS = ['day', 'week', 'month', 'year'];
const LIMITS: { key: 'activeProposals' | 'likesPerDay'; label: string }[] = [
  { key: 'activeProposals', label: 'Active proposals' },
  { key: 'likesPerDay', label: 'Likes a day' },
];
const KNOWN = new Set(['id', 'name', 'type', 'pricePence', 'period', 'benefits', 'limits']);

const asPlan = (record: EditRecord) => record as unknown as Plan & { id: string };

export function PlanDetail({
  plan,
  original,
  position,
  onChange,
  onDiscard,
  onDelete,
  onBack,
  onPrev,
  onNext,
}: {
  plan: EditRecord;
  /** The saved plan; undefined for a plan added in this session. */
  original: EditRecord | undefined;
  position: string;
  onChange: (next: EditRecord) => void;
  onDiscard: () => void;
  /** Shown for added plans only; the app needs Free, Boost and Bond Plus. */
  onDelete?: () => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const colors = useBondColors();
  const p = asPlan(plan);
  const saved = original ? asPlan(original) : ({} as Partial<ReturnType<typeof asPlan>>);
  const set = (patch: Partial<Plan>) => onChange({ ...plan, ...(patch as Record<string, Json>) });
  const limits = p.limits ?? {};
  const other = Object.keys(plan).filter((key) => !KNOWN.has(key));

  return (
    <DetailShell
      avatarIds={[]}
      title={p.name || p.id}
      subtitle={`${p.id} · ${formatPrice(p)}`}
      tag={p.type}
      changeCount={diffJson(original as Json | undefined, plan as Json).length}
      position={position}
      backLabel="All plans"
      onDiscard={onDiscard}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
    >
      <FieldsCard>
        <ObjectFields
          keys={['id', 'name', 'type']}
          value={plan}
          original={original}
          choices={{ type: TYPES }}
          onChange={(next) => onChange(next as EditRecord)}
        />
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          Plan: the default tier. One-off: a single purchase that lasts for the period. Subscription: renews every period.
        </Text>
      </FieldsCard>

      <FieldsCard>
        <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
          Price
        </Text>
        <View style={styles.field}>
          <Label text="Price in pounds (£)" edited={p.pricePence !== saved.pricePence} />
          <NumberInput
            label="Price in pounds"
            value={p.pricePence / 100}
            onChange={(v) => set({ pricePence: typeof v === 'number' ? Math.max(0, Math.round(v * 100)) : 0 })}
          />
        </View>
        <View style={styles.switchRow}>
          <Label
            text={p.type === 'subscription' ? 'Billed every period' : 'Lasts for a period'}
            edited={JSON.stringify(p.period) !== JSON.stringify(saved.period)}
          />
          <Switch
            accessibilityLabel="Has a period"
            value={!!p.period}
            onValueChange={(on) => set({ period: on ? (saved.period ?? { count: 1, unit: 'month' }) : null })}
            trackColor={{ true: colors.focusRing, false: colors.line }}
          />
        </View>
        {p.period ? (
          <ObjectFields
            value={p.period as unknown as { [key: string]: Json }}
            original={(saved.period ?? undefined) as unknown as Json}
            choices={{ unit: UNITS }}
            onChange={(next) => set({ period: next as unknown as Plan['period'] })}
          />
        ) : null}
        <View style={[styles.preview, { backgroundColor: colors.surface }]}>
          <Text style={[type.caption, { color: colors.inkMuted }]}>Shows in the app as</Text>
          <Text style={[type.label, { color: colors.ink }]}>{formatPrice(p)}</Text>
        </View>
      </FieldsCard>

      <FieldsCard>
        <ObjectFields keys={['benefits']} value={plan} original={original} onChange={(next) => onChange(next as EditRecord)} />
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          The text listed on Profile → Get more. It isn&apos;t checked against the limits below, so keep the two in step.
        </Text>
      </FieldsCard>

      <FieldsCard>
        <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
          Limits
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {p.id === 'free'
            ? 'The demo enforces these Free plan limits across the app (New Proposal and likes on Discover).'
            : "For reference only: the demo enforces the Free plan's limits."}
        </Text>
        {LIMITS.map(({ key, label }) => (
          <LimitField
            key={key}
            label={label}
            value={limits[key]}
            edited={limits[key] !== saved.limits?.[key]}
            onChange={(v) => {
              const next = { ...limits };
              if (v === undefined) delete next[key];
              else next[key] = v;
              set({ limits: next });
            }}
          />
        ))}
      </FieldsCard>

      {other.length ? (
        <FieldsCard>
          <ObjectFields keys={other} value={plan} original={original} onChange={(next) => onChange(next as EditRecord)} />
        </FieldsCard>
      ) : null}

      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          style={({ pressed }) => [styles.delete, { borderColor: colors.line, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.ink} />
          <Text style={[type.label, { color: colors.ink }]}>Delete this plan</Text>
        </Pressable>
      ) : null}
    </DetailShell>
  );
}

/** A limit is not set (missing), unlimited (null) or a number. */
function LimitField({
  label,
  value,
  edited,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  edited: boolean;
  onChange: (v: number | null | undefined) => void;
}) {
  const colors = useBondColors();
  const mode = value === undefined ? 'unset' : value === null ? 'unlimited' : 'limit';
  const modes: { key: typeof mode; title: string; next: number | null | undefined }[] = [
    { key: 'unset', title: 'Not set', next: undefined },
    { key: 'unlimited', title: 'Unlimited', next: null },
    { key: 'limit', title: 'Limit', next: typeof value === 'number' ? value : 1 },
  ];
  return (
    <View style={styles.field}>
      <Label text={label} edited={edited} />
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
        {modes.map((m) => {
          const active = m.key === mode;
          return (
            <Pressable
              key={m.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onChange(m.next)}
              style={({ pressed }) => [
                styles.choice,
                {
                  backgroundColor: active ? colors.ink : colors.surfaceRaised,
                  borderColor: active ? colors.ink : colors.line,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[type.label, { color: active ? colors.surface : colors.ink }]}>{m.title}</Text>
            </Pressable>
          );
        })}
      </View>
      {mode === 'limit' ? (
        <NumberInput
          label={`${label} limit`}
          value={value as number}
          onChange={(v) => onChange(typeof v === 'number' ? Math.max(0, Math.round(v)) : 0)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space[1] },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { gap: 2, padding: space[3], borderRadius: radius.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  choice: { minHeight: 36, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1, justifyContent: 'center' },
});
