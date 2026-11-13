import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AiAssistantButton } from '@/components/ai-assistant-button';
import { BOND_TABS, BondTabBar } from '@/components/bond-tab-bar';
import { TabBarOverlapContext, useLiquidGlass } from '@/components/glass';
import { useBondColors } from '@/theme/tokens';

export default function TabsLayout() {
  const colors = useBondColors();
  const glass = useLiquidGlass();
  // Height the floating glass bar covers, measured from the bar itself.
  const [barHeight, setBarHeight] = useState(0);

  return (
    <TabBarOverlapContext.Provider value={glass ? barHeight : 0}>
      <Tabs style={styles.root}>
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
          {/* Fill exactly the space above the tab bar (or, with iOS glass, the whole screen so
              content scrolls under the floating bar). TabSlot's default container doesn't
              shrink, so on web each screen grew to its full content height and nothing scrolled. */}
          <TabSlot style={styles.slot} />
          <AiAssistantButton />
        </View>
        <BondTabBar glass={glass} onHeight={setBarHeight} />
        {/* Declares the tab routes; the visible footer is BondTabBar. */}
        <TabList style={styles.hidden}>
          {BOND_TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} />
          ))}
        </TabList>
      </Tabs>
    </TabBarOverlapContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
  slot: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0 },
});
