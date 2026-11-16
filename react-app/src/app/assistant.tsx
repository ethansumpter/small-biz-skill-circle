import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { type ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/stack-header';
import { useCompanies, useCurrentUser, useDemoProposals, useDiscover, useLeads } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import {
  type AssistantContext,
  type AssistantReply,
  detectIntent,
  greeting,
  type Intent,
  QUICK_ACTIONS,
  reply,
} from '@/utils/assistant';

/** Short pause so replies read as considered rather than instant. */
const THINKING_MS = 700;

type ChatItem = { id: string; from: 'user'; text: string } | ({ id: string; from: 'assistant' } & AssistantReply);

/**
 * Bond AI assistant (docs/bond-app-structure.md, "AI assistant"). Opened from the
 * floating bubble and from Profile → Safety → Help centre. Scripted from the demo
 * data: preview only, resets when closed.
 */
export default function AssistantScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { user } = useCurrentUser();
  const { companies } = useCompanies();
  const { demoProposals } = useDemoProposals();
  const { leads } = useLeads();
  const { blocked } = useDiscover();

  const ctx: AssistantContext = useMemo(
    () => ({ user, companies, proposals: demoProposals, matchedIds: leads.map((l) => l.id), blockedIds: blocked }),
    [user, companies, demoProposals, leads, blocked],
  );

  const [items, setItems] = useState<ChatItem[]>(() => [{ id: 'hello', from: 'assistant', ...greeting(user) }]);
  const [thinking, setThinking] = useState(false);
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const ask = (question: string, intent: Intent) => {
    if (thinking) return;
    const stamp = String(Date.now());
    setItems((list) => [...list, { id: `q${stamp}`, from: 'user', text: question }]);
    setThinking(true);
    // Bring the question into view while the reply is on its way.
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    timer.current = setTimeout(() => {
      setItems((list) => [...list, { id: `a${stamp}`, from: 'assistant', ...reply(intent, ctx) }]);
      setThinking(false);
    }, THINKING_MS);
  };

  const send = () => {
    const question = text.trim();
    if (!question) return;
    setText('');
    ask(question, detectIntent(question));
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.surface }]} behavior="padding">
      <StackHeader title="Bond assistant" subtitle="AI help for your business · Preview" />

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={styles.messages}
        keyboardDismissMode="interactive"
      >
        {items.map((item) =>
          item.from === 'user' ? (
            <View key={item.id} style={[styles.row, styles.mine]}>
              <View style={[styles.bubble, styles.mineBubble, { backgroundColor: colors.accent }]}>
                <Text style={[type.body, { color: colors.onAccent }]}>{item.text}</Text>
              </View>
            </View>
          ) : (
            <AssistantBubble
              key={item.id}
              reply={item}
              // Show the start of a new reply, not the chips under it.
              onLayout={(y) => {
                if (item.id === items[items.length - 1].id && item.id !== 'hello') {
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - space[12]), animated: true });
                }
              }}
            />
          ),
        )}

        {thinking ? (
          <View accessibilityLiveRegion="polite" style={styles.thinking}>
            <Ionicons name="sparkles-outline" size={16} color={colors.inkMuted} />
            <Text style={[type.caption, { color: colors.inkMuted }]}>Thinking…</Text>
          </View>
        ) : null}

        {/* Quick actions stay under the latest reply, so there's always a next step. */}
        <View style={styles.chips}>
          {QUICK_ACTIONS.map((a) => (
            <Pressable
              key={a.intent}
              accessibilityRole="button"
              disabled={thinking}
              onPress={() => ask(a.label, a.intent)}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: colors.ink, backgroundColor: colors.surfaceRaised, opacity: thinking ? 0.5 : pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[type.label, { color: colors.ink }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[type.caption, styles.note, { color: colors.inkMuted }]}>
          Preview: answers come from Bond's demo data and nothing is sent. Check AI suggestions before you use them.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.bar,
          { backgroundColor: colors.surfaceRaised, borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, space[2]) },
        ]}
      >
        <TextInput
          accessibilityLabel="Ask the assistant"
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          placeholder="Ask the assistant"
          placeholderTextColor={colors.inkMuted}
          returnKeyType="send"
          style={[type.body, styles.input, { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.line }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={!text.trim() || thinking}
          onPress={send}
          style={[styles.send, { backgroundColor: colors.ink, opacity: !text.trim() || thinking ? 0.4 : 1 }]}
        >
          <Ionicons name="arrow-up" size={20} color={colors.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function AssistantBubble({ reply: r, onLayout }: { reply: AssistantReply; onLayout?: (y: number) => void }) {
  const colors = useBondColors();
  return (
    <View style={[styles.row, styles.theirs]} onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      <View
        style={[
          styles.bubble,
          styles.theirBubble,
          { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
        ]}
      >
        <Text style={[type.body, { color: colors.ink }]}>{r.text}</Text>
        {r.sections?.map((s) => (
          <View key={s.heading} style={[styles.section, { borderTopColor: colors.line }]}>
            <Text style={[type.label, { color: colors.ink }]}>{s.heading}</Text>
            <Text style={[type.body, { color: colors.inkMuted }]}>{s.body}</Text>
          </View>
        ))}
        {r.action ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push(r.action!.href)}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[type.label, { color: colors.link }]}>{r.action.label}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.link} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  messages: { padding: space[4], gap: space[3] },
  row: { flexDirection: 'row' },
  mine: { justifyContent: 'flex-end' },
  theirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '88%', borderRadius: radius.md, paddingHorizontal: space[3], paddingVertical: space[2], gap: space[2] },
  mineBubble: { borderBottomRightRadius: radius.sm },
  theirBubble: { borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: radius.sm },
  section: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space[2], gap: space[1] },
  action: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingTop: space[1] },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[2] },
  chip: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: space[3], paddingVertical: space[2] },
  note: { marginTop: space[2] },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[2],
    paddingHorizontal: space[3],
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space[3] },
  send: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
});
