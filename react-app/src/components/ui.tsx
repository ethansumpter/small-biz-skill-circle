import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { radius, space, type, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const colors = useBondColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const colors = useBondColors();
  return (
    <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
      {children}
    </Text>
  );
}

export function Chip({ label }: { label: string }) {
  const colors = useBondColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.accent }]}>
      <Text style={[type.label, { color: colors.onAccent }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={[type.label, { color: colors.surface }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Ionicons name={icon} size={24} color={colors.ink} />
    </Pressable>
  );
}

export function ListRow({
  icon,
  label,
  detail,
  onPress,
  last,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
}) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.ink} />
      <Text style={[type.body, styles.rowLabel, { color: colors.ink }]}>{label}</Text>
      {detail ? <Text style={[type.caption, { color: colors.inkMuted }]}>{detail}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

export function FieldLabel({
  label,
  required,
  error,
  showOptional = true,
}: {
  label: string;
  required?: boolean;
  error?: string;
  /** Turn off inside a section already marked optional, so "(optional)" isn't repeated on every field. */
  showOptional?: boolean;
}) {
  const colors = useBondColors();
  return (
    <View style={styles.fieldLabel}>
      <Text style={[type.label, { color: colors.ink }]}>
        {label}
        {required || !showOptional ? '' : <Text style={{ color: colors.inkMuted }}> (optional)</Text>}
      </Text>
      {error ? <Text style={[type.caption, { color: colors.ink }]}>{error}</Text> : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  required,
  error,
  showOptional,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  showOptional?: boolean;
}) {
  const colors = useBondColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} error={error} showOptional={showOptional} />
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          type.body,
          styles.input,
          multiline && styles.inputMultiline,
          {
            color: colors.ink,
            backgroundColor: colors.surfaceRaised,
            borderColor: focused ? colors.focusRing : error ? colors.ink : colors.line,
            borderWidth: focused || error ? 2 : 1,
          },
        ]}
      />
    </View>
  );
}

/** Single-choice pill group. Picked: ink fill with a tick (same as the filter chips). */
export function ChoiceChips({
  label,
  options,
  value,
  onChange,
  required,
  error,
  showOptional,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  showOptional?: boolean;
}) {
  const colors = useBondColors();

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} error={error} showOptional={showOptional} />
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(selected ? '' : option)}
              style={({ pressed }) => [
                styles.choice,
                selected
                  ? { backgroundColor: colors.ink, borderColor: colors.ink }
                  : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                pressed && { opacity: 0.7 },
              ]}
            >
              {selected ? <Ionicons name="checkmark" size={16} color={colors.surface} /> : null}
              <Text style={[type.label, { color: selected ? colors.surface : colors.ink }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space[2] },
  fieldLabel: { gap: space[1] },
  input: {
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    minHeight: 48,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 40,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space[4],
    gap: space[3],
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  button: {
    borderRadius: radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 52,
  },
  rowLabel: { flex: 1 },
});
