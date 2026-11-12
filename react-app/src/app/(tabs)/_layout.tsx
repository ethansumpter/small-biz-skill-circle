import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';

import { BOND_TABS, BondTabBar } from '@/components/bond-tab-bar';
import { useBondColors } from '@/theme/tokens';

export default function TabsLayout() {
  const colors = useBondColors();

  return (
    <Tabs style={styles.root}>
      <View style={[styles.root, { backgroundColor: colors.surface }]}>
        <TabSlot />
      </View>
      <BondTabBar />
      {/* Declares the tab routes; the visible footer is BondTabBar. */}
      <TabList style={styles.hidden}>
        {BOND_TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} />
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
});
