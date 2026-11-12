import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { radius, space, type, useBondColors } from '@/theme/tokens';
import { humanise, type Json } from '@/utils/json-diff';

/**
 * Generic editor for one value of a demo company. Strings get a text box,
 * numbers (and empty `null` values such as distanceMiles) a number box,
 * booleans a switch, lists add/remove rows, and objects nest their fields.
 * Fields that differ from the saved file are marked with a dot.
 */

type Props = {
  label: string;
  value: Json;
  /** The saved value, used to mark edited fields. Undefined for new items. */
  original: Json | undefined;
  onChange: (next: Json) => void;
  readOnly?: boolean;
  onRemove?: () => void;
};

const READ_ONLY_KEYS = new Set(['id']);

export function JsonField(props: Props) {
  const { value } = props;
  if (Array.isArray(value)) return <ArrayField {...props} value={value} />;
  if (typeof value === 'object' && value !== null) return <ObjectField {...props} value={value} />;
  return <LeafField {...props} />;
}

export function ObjectFields({
  value,
  original,
  onChange,
}: {
  value: { [key: string]: Json };
  original: Json | undefined;
  onChange: (next: { [key: string]: Json }) => void;
}) {
  const saved = isObject(original) ? original : undefined;
  return (
    <View style={styles.fields}>
      {Object.entries(value).map(([key, child]) => (
        <JsonField
          key={key}
          label={humanise(key)}
          value={child}
          original={saved?.[key]}
          readOnly={READ_ONLY_KEYS.has(key)}
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

function ArrayField({ label, value, original, onChange, onRemove }: Props & { value: Json[] }) {
  const colors = useBondColors();
  const saved = Array.isArray(original) ? original : undefined;
  const lengthChanged = saved !== undefined && saved.length !== value.length;

  return (
    <View style={styles.fields}>
      <Label text={`${label} (${value.length})`} edited={lengthChanged} onRemove={onRemove} />
      {value.map((item, i) => (
        <JsonField
          key={i}
          label={`#${i + 1}`}
          value={item}
          original={saved?.[i]}
          onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))}
          onRemove={() => onChange(value.filter((_, j) => j !== i))}
        />
      ))}
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

function LeafField({ label, value, original, onChange, readOnly, onRemove }: Props) {
  const colors = useBondColors();
  const edited = original === undefined || original !== value;

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
      <Input
        label={label}
        value={text}
        onChangeText={onChange}
        multiline={text.length > 48}
        editable={!readOnly}
      />
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

function Input({
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

function Label({ text, edited, onRemove }: { text: string; edited: boolean; onRemove?: () => void }) {
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
