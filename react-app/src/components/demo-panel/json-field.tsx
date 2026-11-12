import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useCompanies } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { humanise, type Json } from '@/utils/json-diff';

/**
 * Generic editor for one value of a demo company. Strings get a text box,
 * numbers (and empty `null` values such as distanceMiles) a number box,
 * booleans a switch, lists add/remove rows, and objects nest their fields.
 * Fields that differ from the saved file are marked with a dot. Ids and file
 * paths (e.g. profileImage) are shown locked: they point at files in the repo,
 * so changing them here would only break the link.
 */

type Props = {
  label: string;
  value: Json;
  /** The saved value, used to mark edited fields. Undefined for new items. */
  original: Json | undefined;
  onChange: (next: Json) => void;
  readOnly?: boolean;
  onRemove?: () => void;
  /** Fixed options for a text value (or for each text item of a list), shown as chips. */
  choices?: string[];
};

/** Fixed options per field key, e.g. { status: ['Open', …] }. */
export type Choices = Record<string, string[]>;

const READ_ONLY_KEYS = new Set(['id', 'profileImage', 'companyIds']);

/** A repo-relative file path such as "assets/images/companies/c01.png". */
const FILE_PATH = /^[\w.-]+(\/[\w.-]+)+\.[a-z0-9]+$/i;

export const isReadOnly = (key: string | number, value: Json) =>
  (typeof key === 'string' && READ_ONLY_KEYS.has(key)) || (typeof value === 'string' && FILE_PATH.test(value));

export function JsonField(props: Props) {
  const { value } = props;
  if (props.readOnly && typeof value === 'object' && value !== null) return <LockedField {...props} />;
  if (Array.isArray(value)) return <ArrayField {...props} value={value} />;
  if (typeof value === 'object' && value !== null) return <ObjectField {...props} value={value} />;
  return <LeafField {...props} />;
}

/** Every field of an object, or only `keys` when given (edits still merge into the whole object). */
export function ObjectFields({
  value,
  original,
  onChange,
  keys,
  choices,
}: {
  value: { [key: string]: Json };
  original: Json | undefined;
  onChange: (next: { [key: string]: Json }) => void;
  keys?: string[];
  choices?: Choices;
}) {
  const { companies } = useCompanies();
  const saved = isObject(original) ? original : undefined;
  // Keys that are company ids (e.g. a proposal's `contributions`) are labelled with the company's name.
  const labelFor = (key: string) => companies.find((c) => c.id === key)?.name ?? humanise(key);
  const shown = (keys ?? Object.keys(value)).filter((key) => key in value);
  return (
    <View style={styles.fields}>
      {shown.map((key) => [key, value[key]] as const).map(([key, child]) => (
        <JsonField
          key={key}
          label={labelFor(key)}
          value={child}
          original={saved?.[key]}
          readOnly={isReadOnly(key, child)}
          choices={choices?.[key]}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </View>
  );
}

function ObjectField({ label, value, original, onChange, onRemove }: Props & { value: { [key: string]: Json } }) {
  const colors = useBondColors();
  return (
    <View style={[styles.group, { borderLeftColor: colors.accent }]}>
      <Label text={label} edited={false} onRemove={onRemove} />
      <ObjectFields value={value} original={original} onChange={onChange} />
    </View>
  );
}

function ArrayField({ label, value, original, onChange, onRemove, choices }: Props & { value: Json[] }) {
  const colors = useBondColors();
  const saved = Array.isArray(original) ? original : undefined;
  const lengthChanged = saved !== undefined && saved.length !== value.length;

  return (
    <View style={styles.fields}>
      <Label text={`${label} (${value.length})`} edited={lengthChanged} onRemove={onRemove} />
      {value.map((item, i) => {
        const locked = isReadOnly(i, item);
        return (
          <JsonField
            key={i}
            label={itemLabel(item, i)}
            value={item}
            original={saved?.[i]}
            readOnly={locked}
            choices={choices}
            onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))}
            onRemove={locked ? undefined : () => onChange(value.filter((_, j) => j !== i))}
          />
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add to ${label}`}
        onPress={() => onChange([...value, blankLike(value[0] ?? saved?.[0] ?? '')])}
        style={({ pressed }) => [styles.add, { borderColor: colors.line, opacity: pressed ? 0.6 : 1 }]}
      >
        <Ionicons name="add" size={16} color={colors.link} />
        <Text style={[type.label, { color: colors.link }]}>Add</Text>
      </Pressable>
    </View>
  );
}

/** Shown for ids and file paths: visible and selectable, but not editable. */
function LockedField({ label, value }: Props) {
  const colors = useBondColors();
  const text =
    value === null ? 'Empty' : Array.isArray(value) ? value.map(String).join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <View style={styles.field}>
      <Label text={label} edited={false} />
      <View
        accessible
        accessibilityLabel={`${label}: ${text}. Read only`}
        style={[styles.locked, { backgroundColor: colors.surface, borderColor: colors.line }]}
      >
        <Ionicons name="lock-closed-outline" size={16} color={colors.inkMuted} />
        <Text selectable style={[type.body, styles.lockedText, { color: colors.inkMuted }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function LeafField(props: Props) {
  const { label, value, original, onChange, readOnly, onRemove, choices } = props;
  const colors = useBondColors();
  const edited = original === undefined || original !== value;

  if (readOnly) return <LockedField {...props} />;

  if (choices && typeof value === 'string') {
    const options = choices.includes(value) || value === '' ? choices : [...choices, value];
    return (
      <View style={styles.field}>
        <Label text={label} edited={edited} onRemove={onRemove} />
        <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
          {options.map((option) => {
            const active = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => onChange(option)}
                style={({ pressed }) => [
                  styles.choice,
                  {
                    backgroundColor: active ? colors.ink : colors.surfaceRaised,
                    borderColor: active ? colors.ink : colors.line,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[type.label, { color: active ? colors.surface : colors.ink }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <View style={styles.switchRow}>
        <Label text={label} edited={edited} onRemove={onRemove} />
        <Switch
          accessibilityLabel={label}
          value={value}
          onValueChange={onChange}
          trackColor={{ true: colors.focusRing, false: colors.line }}
        />
      </View>
    );
  }

  if (typeof value === 'number' || value === null) {
    return (
      <View style={styles.field}>
        <Label text={label} edited={edited} onRemove={onRemove} />
        <NumberInput label={label} value={value} onChange={onChange} />
      </View>
    );
  }

  const text = String(value);
  return (
    <View style={styles.field}>
      <Label text={label} edited={edited} onRemove={onRemove} />
      <Input label={label} value={text} onChangeText={onChange} multiline={text.length > 48} />
    </View>
  );
}

/** Number box: empty saves as null, anything that isn't a number is flagged and not applied. */
function NumberInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: Json) => void }) {
  const colors = useBondColors();
  const [text, setText] = useState(value === null ? '' : String(value));
  const parsed = text.trim() === '' ? null : Number(text);
  const invalid = parsed !== null && Number.isNaN(parsed);

  // Follow outside changes (e.g. Discard) without clobbering a half-typed "4." while editing.
  useEffect(() => {
    if (value !== parsed) setText(value === null ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={styles.field}>
      <Input
        label={label}
        value={text}
        keyboardType="decimal-pad"
        placeholder="Empty"
        invalid={invalid}
        onChangeText={(next) => {
          setText(next);
          const n = next.trim() === '' ? null : Number(next);
          if (n === null || !Number.isNaN(n)) onChange(n);
        }}
      />
      {invalid ? <Text style={[type.caption, { color: colors.ink }]}>Not a number, so this edit isn't kept.</Text> : null}
    </View>
  );
}

export function Input({
  label,
  value,
  onChangeText,
  multiline,
  editable = true,
  keyboardType,
  placeholder,
  invalid,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: 'decimal-pad';
  placeholder?: string;
  invalid?: boolean;
}) {
  const colors = useBondColors();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      editable={editable}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={colors.inkMuted}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        type.body,
        styles.input,
        multiline && styles.multiline,
        {
          color: editable ? colors.ink : colors.inkMuted,
          backgroundColor: editable ? colors.surfaceRaised : colors.surface,
          borderColor: focused || invalid ? colors.focusRing : colors.line,
          borderWidth: focused || invalid ? 2 : 1,
        },
      ]}
    />
  );
}

export function Label({ text, edited, onRemove }: { text: string; edited: boolean; onRemove?: () => void }) {
  const colors = useBondColors();
  return (
    <View style={styles.labelRow}>
      <Text style={[type.label, styles.labelText, { color: colors.ink }]}>{text}</Text>
      {edited ? (
        <View
          accessible
          accessibilityLabel="Edited"
          style={[styles.dot, { backgroundColor: colors.focusRing }]}
        />
      ) : null}
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${text}`} hitSlop={8} onPress={onRemove}>
          <Ionicons name="trash-outline" size={18} color={colors.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** "#2 · Glazes nobody else…" for list items that are objects, so reviews and prompts are easy to tell apart. */
function itemLabel(item: Json, i: number): string {
  if (!isObject(item)) return `#${i + 1}`;
  const hint = [item.question, item.from, item.title, item.name].find((v) => typeof v === 'string' && v.trim());
  if (typeof hint !== 'string') return `#${i + 1}`;
  return `#${i + 1} · ${hint.length > 40 ? `${hint.slice(0, 40).trimEnd()}…` : hint}`;
}

const isObject = (v: Json | undefined): v is { [key: string]: Json } =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** An empty value with the same shape, for "Add" on a list. */
function blankLike(sample: Json): Json {
  if (typeof sample === 'string') return '';
  if (typeof sample === 'number' || sample === null) return null;
  if (typeof sample === 'boolean') return false;
  if (Array.isArray(sample)) return [];
  return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankLike(v)]));
}

const styles = StyleSheet.create({
  fields: { gap: space[3] },
  field: { gap: space[1] },
  group: { gap: space[2], borderLeftWidth: 3, paddingLeft: space[3] },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  labelText: { flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 44,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  lockedText: { flex: 1 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  choice: { minHeight: 36, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1, justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { borderRadius: radius.sm, paddingHorizontal: space[3], paddingVertical: space[2], minHeight: 44 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    minHeight: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
