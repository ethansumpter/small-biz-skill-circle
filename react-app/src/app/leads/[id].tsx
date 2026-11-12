import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanyAvatar } from '@/components/company-avatar';
import { Composer } from '@/components/leads/composer';
import { MessageBubble } from '@/components/leads/message-bubble';
import { type ThreadAction, ThreadMenu } from '@/components/leads/thread-menu';
import { IconButton } from '@/components/ui';
import { useLeads } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

export default function LeadThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { leads, sendMessage, toggleMute, unmatch } = useLeads();
  const [menuOpen, setMenuOpen] = useState(false);

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
        <Text style={[type.body, { color: colors.ink }]}>This match is no longer available.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={[type.label, { color: colors.link }]}>Back to Leads</Text>
        </Pressable>
      </View>
    );
  }

  const handleAction = (action: ThreadAction) => {
    setMenuOpen(false);
    switch (action) {
      case 'mute':
        toggleMute(lead.id);
        break;
      case 'unmatch':
        Alert.alert(`Unmatch ${lead.company}?`, 'This removes the chat for both of you.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unmatch',
            style: 'destructive',
            onPress: () => {
              router.back();
              unmatch(lead.id);
            },
          },
        ]);
        break;
      case 'report':
        notInPreview('Report');
        break;
      case 'block':
        notInPreview('Block');
        break;
      case 'notifications':
        notInPreview('Notifications');
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Thread header: back, logo + name (→ their profile), ⋮ menu */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + space[1], backgroundColor: colors.surfaceRaised, borderBottomColor: colors.line },
        ]}
      >
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${lead.company}, view profile`}
          onPress={() => notInPreview('Company profiles')}
          style={styles.who}
        >
          <CompanyAvatar companyId={lead.id} size={40} />
          <View style={styles.whoText}>
            <Text numberOfLines={1} style={[type.label, { color: colors.ink }]}>
              {lead.company}
            </Text>
            <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
              {lead.industry} · {lead.location}
              {lead.muted ? ' · Muted' : ''}
            </Text>
          </View>
        </Pressable>
        <IconButton icon="ellipsis-vertical" label="Chat options" onPress={() => setMenuOpen(true)} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={styles.messages}
        keyboardDismissMode="interactive"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {lead.pinnedComment ? (
          <View style={[styles.pinned, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>
            <View style={styles.pinnedLabel}>
              <Ionicons name="pin-outline" size={14} color={colors.inkMuted} />
              <Text style={[type.caption, { color: colors.inkMuted }]}>Their note with the proposal</Text>
            </View>
            <Text style={[type.body, { color: colors.ink }]}>{lead.pinnedComment}</Text>
          </View>
        ) : null}

        {lead.messages.length === 0 ? (
          <Text style={[type.body, styles.empty, { color: colors.inkMuted }]}>
            You matched with {lead.company}. Say hello and suggest a first step.
          </Text>
        ) : (
          lead.messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </ScrollView>

      <Composer onSend={(text) => sendMessage(lead.id, text)} bottomInset={insets.bottom} />

      <ThreadMenu visible={menuOpen} muted={lead.muted} onClose={() => setMenuOpen(false)} onSelect={handleAction} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[1],
    paddingBottom: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  whoText: { flex: 1 },
  messages: { padding: space[4], gap: space[2] },
  pinned: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space[3],
    gap: space[1],
    marginBottom: space[2],
  },
  pinnedLabel: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  empty: { textAlign: 'center', marginTop: space[6] },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
});
