import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BottomSheet } from '@/components/bottom-sheet';
import { CompanyAvatar } from '@/components/company-avatar';
import type { Company } from '@/data/companies';
import { proposalTypesFor } from '@/data/discover';
import { useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';

const MAX_COMMENT = 280;
/** Only show the character count once it's worth watching. */
const SHOW_COUNT_FROM = 200;

/**
 * Send a like, or a proposal when a type is picked. A short comment is
 * required (docs/bond-features.md, Proposals). Preview only: nothing is sent.
 * Layout, top to bottom: who it's to (with close), optional proposal type,
 * the comment, one line of status, and a single Send button.
 */
export function LikeSheet({
  company,
  visible,
  proposalType,
  onProposalType,
  likesLeft,
  onClose,
  onSend,
}: {
  company: Company;
  visible: boolean;
  proposalType: string | undefined;
  onProposalType: (type: string | undefined) => void;
  likesLeft: number;
  onClose: () => void;
  onSend: (comment: string) => void;
}) {
  const colors = useBondColors();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const { user } = useCurrentUser();
  // Example from the mockup, in business voice (no owner names on Discover).
  const industry = user.industry.toLowerCase();
  const example = `e.g. Hi, we're ${user.name}, ${/^[aeiou]/.test(industry) ? 'an' : 'a'} ${industry} business. We'd love to work with you!`;

  // Fresh comment for each company.
  useEffect(() => {
    setComment('');
    setError('');
  }, [company.id]);

  const outOfLikes = likesLeft <= 0;
  const noun = proposalType ? 'proposal' : 'like';
  const types = proposalTypesFor(company);

  const send = () => {
    if (!comment.trim()) {
      setError(`Add a short comment so ${company.name} knows why you're getting in touch.`);
      return;
    }
    onSend(comment);
    setComment('');
    setError('');
  };

  const status =
    error ||
    (outOfLikes
      ? "You've used today's likes on the Free plan. Bond Plus has unlimited likes."
      : Number.isFinite(likesLeft)
        ? `${likesLeft} ${likesLeft === 1 ? 'like' : 'likes'} left today`
        : 'Unlimited likes');

  return (
    <BottomSheet visible={visible} onRequestClose={onClose} avoidKeyboard>
      <View style={styles.head}>
        <CompanyAvatar companyId={company.id} size={44} />
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
            Send a {noun}
          </Text>
          <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
            to {company.name}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.close, { backgroundColor: colors.surface, opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>

      {types.length ? (
        <View style={styles.section}>
          <Text style={[type.label, { color: colors.inkMuted }]}>Make it a proposal (optional)</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Proposal type" style={styles.chips}>
            {types.map((option) => {
              const selected = option === proposalType;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => onProposalType(selected ? undefined : option)}
                  style={({ pressed }) => [
                    styles.choice,
                    selected
                      ? { backgroundColor: colors.ink, borderColor: colors.ink }
                      : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  {selected ? (
                    <Animated.View entering={FadeIn.duration(150)}>
                      <Ionicons name="checkmark" size={16} color={colors.surface} />
                    </Animated.View>
                  ) : null}
                  <Text style={[type.label, { color: selected ? colors.surface : colors.ink }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <View>
          <TextInput
            accessibilityLabel="Your comment"
            accessibilityHint="Required"
            value={comment}
            onChangeText={(text) => {
              setComment(text);
              if (error && text.trim()) setError('');
            }}
            placeholder={example}
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={MAX_COMMENT}
            editable={!outOfLikes}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              type.body,
              styles.input,
              {
                color: colors.ink,
                backgroundColor: colors.surface,
                borderColor: error ? colors.ink : focused ? colors.focusRing : 'transparent',
              },
            ]}
          />
          {comment.length >= SHOW_COUNT_FROM ? (
            <Text style={[type.caption, styles.count, { color: colors.inkMuted }]}>
              {MAX_COMMENT - comment.length}
            </Text>
          ) : null}
        </View>
        <View style={styles.status}>
          {error ? <Ionicons name="alert-circle" size={16} color={colors.ink} /> : null}
          <Text style={[type.caption, styles.flex, { color: error ? colors.ink : colors.inkMuted }]}>{status}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={outOfLikes}
        onPress={send}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: colors.ink, opacity: outOfLikes ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name={proposalType ? 'paper-plane' : 'thumbs-up'} size={18} color={colors.surface} />
        <Text style={[type.label, { color: colors.surface }]}>Send {noun}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 36,
  },
  input: {
    minHeight: 112,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: space[3],
    paddingTop: space[3],
    paddingBottom: space[6],
    textAlignVertical: 'top',
  },
  count: { position: 'absolute', right: space[3], bottom: space[2] },
  status: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  send: {
    flexDirection: 'row',
    gap: space[2],
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
