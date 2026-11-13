import { usePathname } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { AiAssistantButton } from '@/components/ai-assistant-button';
import { BOND_TABS, BondTabBar } from '@/components/bond-tab-bar';
import { TabBarOverlapContext, useLiquidGlass } from '@/components/glass';
import { setTabBarHidden, TabBarVisibilityContext } from '@/components/tab-bar-visibility';
import { useBondColors } from '@/theme/tokens';

export default function TabsLayout() {
  const colors = useBondColors();
  const glass = useLiquidGlass();
  const pathname = usePathname();
  // The bar floats over the bottom of every tab (so hiding it on scroll frees the space);
  // its measured height is how far screens pad and how far it slides away.
  const [barHeight, setBarHeight] = useState(0);
  const progress = useSharedValue(0);
  const target = useSharedValue(0);
  const visibility = useMemo(() => ({ progress, target, height: barHeight }), [progress, target, barHeight]);

  // A new tab always starts with the bar showing.
  useEffect(() => {
    setTabBarHidden(visibility, false);
  }, [pathname, visibility]);

  return (
    <TabBarOverlapContext.Provider value={barHeight}>
      <TabBarVisibilityContext.Provider value={visibility}>
        <Tabs style={styles.root}>
          <View style={[styles.root, { backgroundColor: colors.surface }]}>
            {/* Fill the whole screen; content scrolls under the floating bar. TabSlot's default
                container doesn't shrink, so on web each screen grew to its full content height
                and nothing scrolled. */}
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
      </TabBarVisibilityContext.Provider>
    </TabBarOverlapContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
  slot: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0 },
});
