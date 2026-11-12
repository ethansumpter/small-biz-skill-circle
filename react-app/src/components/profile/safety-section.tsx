import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import { Card, ListRow } from '@/components/ui';
import { demoUser } from '@/data/demo-user';
import { notInPreview } from '@/utils/preview';

type Item = { icon: ComponentProps<typeof Ionicons>['name']; label: string; detail?: string };

/** Safety tab items, in the order given in docs/bond-app-structure.md. */
const ITEMS: Item[] = [
  {
    icon: 'shield-checkmark-outline',
    label: 'Verify your business',
    detail: demoUser.verified ? 'Verified' : undefined,
  },
  { icon: 'ban-outline', label: 'Block list' },
  { icon: 'call-outline', label: 'Contact company help line' },
  { icon: 'help-buoy-outline', label: 'Help centre and AI assistant' },
  { icon: 'heart-outline', label: 'Personal safety' },
  { icon: 'lock-closed-outline', label: 'Account and privacy' },
];

export function SafetySection() {
  return (
    <Card style={{ paddingVertical: 0 }}>
      {ITEMS.map((item, i) => (
        <ListRow
          key={item.label}
          icon={item.icon}
          label={item.label}
          detail={item.detail}
          last={i === ITEMS.length - 1}
          onPress={() => notInPreview(item.label)}
        />
      ))}
    </Card>
  );
}
