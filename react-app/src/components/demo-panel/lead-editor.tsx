import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { DetailShell, FieldsCard, NavButton } from '@/components/demo-panel/editor-shell';
import { Input, Label } from '@/components/demo-panel/json-field';
import type { LeadSeed, Message } from '@/data/demo-leads';
import { useCompanies } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { diffJson, type Json } from '@/utils/json-diff';

/**
 * The demo panel's editor for one Leads chat: the pinned comment, mute, and
 * every message (who sent it, the text, an optional attachment name). Messages
 * can be added, removed and moved up or down.
 */

const newMessageId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function LeadDetail({
  lead,
  original,
  position,
  onChange,
  onDiscard,
  onDelete,
  onBack,
  onPrev,
  onNext,
}: {
  lead: LeadSeed;
  /** Undefined for a chat added in this session. */
  original: LeadSeed | undefined;
  position: string;
  onChange: (next: LeadSeed) => void;
  onDiscard: () => void;
  onDelete: () => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const colors = useBondColors();
  const { companies } = useCompanies();
  const company = companies.find((c) => c.id === lead.id);
  const name = company?.name ?? lead.id;
  const changeCount = original ? diffJson(original as unknown as Json, lead as unknown as Json).length : 0;

  const setMessages = (messages: Message[]) => onChange({ ...lead, messages });
  const updateMessage = (i: number, patch: Partial<Message>) => {
    const next = { ...lead.messages[i], ...patch };
    if (!next.attachment) delete next.attachment;
    setMessages(lead.messages.map((m, j) => (j === i ? next : m)));
  };
  const move = (i: number, by: -1 | 1) => {
    const next = [...lead.messages];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setMessages(next);
  };
  const add = (from: Message['from']) => setMessages([...lead.messages, { id: newMessageId(), from, text: '' }]);

  return (
    <DetailShell
      avatarIds={[lead.id]}
      title={`Chat with ${name}`}
      subtitle={[lead.id, company?.industry, company?.location].filter(Boolean).join(' · ')}
      tag={original ? undefined : 'New'}
      changeCount={changeCount}
      position={position}
      backLabel="All chats"
      onDiscard={onDiscard}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
    >
      <FieldsCard>
        <View style={styles.field}>
          <Label text="Pinned comment" edited={!!original && (original.pinnedComment ?? '') !== (lead.pinnedComment ?? '')} />
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            The comment sent with the original like or proposal, pinned at the top of the chat. Leave empty for none.
          </Text>
          <Input
            label="Pinned comment"
            value={lead.pinnedComment ?? ''}
            multiline
            onChangeText={(text) => {
              const { pinnedComment: _old, ...rest } = lead;
              onChange(text ? { ...rest, pinnedComment: text } : rest);
            }}
          />
        </View>
        <View style={styles.switchRow}>
          <Label text="Muted" edited={!!original && original.muted !== lead.muted} />
          <Switch
            accessibilityLabel="Muted"
            value={lead.muted}
            onValueChange={(muted) => onChange({ ...lead, muted })}
            trackColor={{ true: colors.focusRing, false: colors.line }}
          />
        </View>
      </FieldsCard>

      <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
        Messages ({lead.messages.length})
      </Text>
      {lead.messages.length === 0 ? (
        <Text style={[type.body, { color: colors.inkMuted }]}>No messages yet. The chat opens empty.</Text>
      ) : null}

      {lead.messages.map((message, i) => {
        const mine = message.from === 'me';
        return (
          <View
            key={message.id}
            style={[
              styles.message,
              mine ? styles.mine : styles.theirs,
              { backgroundColor: colors.surfaceRaised, borderColor: mine ? colors.focusRing : colors.line },
            ]}
          >
            <View style={styles.messageHead}>
              <View accessibilityRole="radiogroup" accessibilityLabel={`Message ${i + 1} sender`} style={styles.senders}>
                {(['me', 'them'] as const).map((from) => {
                  const active = message.from === from;
                  return (
                    <Pressable
                      key={from}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      onPress={() => updateMessage(i, { from })}
                      style={({ pressed }) => [
                        styles.sender,
                        {
                          backgroundColor: active ? colors.ink : colors.surface,
                          borderColor: active ? colors.ink : colors.line,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text numberOfLines={1} style={[type.caption, { color: active ? colors.surface : colors.ink }]}>
                        {from === 'me' ? 'You' : name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <IconButton icon="arrow-up" label={`Move message ${i + 1} up`} onPress={i > 0 ? () => move(i, -1) : undefined} />
              <IconButton
                icon="arrow-down"
                label={`Move message ${i + 1} down`}
                onPress={i < lead.messages.length - 1 ? () => move(i, 1) : undefined}
              />
              <IconButton
                icon="trash-outline"
                label={`Delete message ${i + 1}`}
                onPress={() => setMessages(lead.messages.filter((_, j) => j !== i))}
              />
            </View>
            <Input
              label={`Message ${i + 1}`}
              value={message.text}
              multiline
              onChangeText={(text) => updateMessage(i, { text })}
            />
            <View style={styles.attachment}>
              <Ionicons name="attach" size={18} color={colors.inkMuted} />
              <View style={styles.flex}>
                <Input
                  label={`Message ${i + 1} attachment`}
                  value={message.attachment ?? ''}
                  placeholder="Attachment name (optional), e.g. price-list.pdf"
                  onChangeText={(attachment) => updateMessage(i, { attachment })}
                />
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.addRow}>
        <NavButton icon="add" label="Message from you" tone="link" onPress={() => add('me')} />
        <NavButton icon="add" label={`Message from ${name}`} tone="link" onPress={() => add('them')} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onDelete}
        style={({ pressed }) => [styles.delete, { borderColor: colors.line, opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.ink} />
        <Text style={[type.label, { color: colors.ink }]}>Delete this chat</Text>
      </Pressable>
    </DetailShell>
  );
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: 'arrow-up' | 'arrow-down' | 'trash-outline';
  label: string;
  onPress?: () => void;
}) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: !onPress ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      <Ionicons name={icon} size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  field: { gap: space[1] },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  message: { gap: space[2], padding: space[3], borderRadius: radius.md, borderWidth: 1, width: '92%' },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  messageHead: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  senders: { flex: 1, flexDirection: 'row', gap: space[1] },
  sender: {
    flexShrink: 1,
    minHeight: 32,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
  },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
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
});
