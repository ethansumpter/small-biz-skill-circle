import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanyAvatar } from '@/components/company-avatar';
import { radius, space, type, useBondColors } from '@/theme/tokens';

type Option = { id: string; name: string; industry: string };

/** Dropdown for choosing which demo company the app is logged in as. */
export function CompanyPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.name ?? value}`}
        accessibilityHint="Opens the list of demo companies"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.surfaceRaised, borderColor: colors.line, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <CompanyAvatar companyId={value} size={36} />
        <View style={styles.flex}>
          <Text numberOfLines={1} style={[type.label, { color: colors.ink }]}>
            {selected?.name ?? value}
          </Text>
          <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
            {value} · {selected?.industry}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.inkMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surfaceRaised, marginTop: insets.top + space[12], marginBottom: insets.bottom + space[6] },
            ]}
          >
            <Text accessibilityRole="header" style={[type.subheading, styles.sheetTitle, { color: colors.ink }]}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.id}
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      { borderTopColor: colors.line },
                      active && { backgroundColor: colors.surface },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <CompanyAvatar companyId={item.id} size={32} />
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={[type.label, { color: colors.ink }]}>
                        {item.name}
                      </Text>
                      <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
                        {item.id} · {item.industry}
                      </Text>
                    </View>
                    {active ? <Ionicons name="checkmark" size={20} color={colors.focusRing} /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: space[4] },
  sheet: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', borderRadius: radius.md, overflow: 'hidden' },
  sheetTitle: { padding: space[4] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
