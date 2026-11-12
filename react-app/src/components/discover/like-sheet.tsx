import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanyAvatar } from '@/components/company-avatar';
import type { Company } from '@/data/companies';
import { proposalTypesFor } from '@/data/discover';
import { useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';

/**
 * Send a like, or a proposal when a type is picked. A short comment is
 * required (docs/bond-features.md, Proposals). Preview only: nothing is sent.
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
  const insets = useSafeAreaInsets();
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

  const send = () => {
    if (!comment.trim()) {
      setError(`Add a short comment so ${company.name} knows why you're getting in touch.`);
      return;
    }
    onSend(comment);
    setComment('');
    setError('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surfaceRaised, paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <View style={styles.head}>
            <CompanyAvatar companyId={company.id} size={40} />
            <View style={styles.flex}>
              <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
                Send a {noun}
              </Text>
              <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
                to {company.name}
              </Text>
            </View>
          </View>

          <View accessibilityRole="radiogroup" accessibilityLabel="Proposal type" style={styles.chips}>
            {proposalTypesFor(company).map((option) => {
              const selected = option === proposalType;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => onProposalType(selected ? undefined : option)}
                  style={[
                    styles.choice,
                    selected
                      ? { backgroundColor: colors.accent, borderColor: colors.accent }
                      : { backgroundColor: colors.surface, borderColor: colors.line },
                  ]}
                >
                  <Text style={[type.caption, { color: selected ? colors.onAccent : colors.ink }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.field}>
            <Text style={[type.label, { color: colors.ink }]}>Your comment</Text>
            <TextInput
              accessibilityLabel="Your comment"
              value={comment}
              onChangeText={(text) => {
                setComment(text);
                if (error && text.trim()) setError('');
              }}
              placeholder={example}
              placeholderTextColor={colors.inkMuted}
              multiline
              maxLength={280}
              editable={!outOfLikes}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[
                type.body,
                styles.input,
                {
                  color: colors.ink,
                  backgroundColor: colors.surfaceRaised,
                  borderColor: focused || error ? colors.focusRing : colors.line,
                  borderWidth: focused || error ? 2 : 1,
                },
              ]}
            />
            <View style={styles.meta}>
              <Text style={[type.caption, styles.flex, { color: error ? colors.ink : colors.inkMuted }]}>
                {error ||
                  (outOfLikes
                    ? "You've used today's likes on the Free plan. Bond Plus has unlimited likes."
                    : `${likesLeft} ${likesLeft === 1 ? 'like' : 'likes'} left today. Preview only: nothing is sent.`)}
              </Text>
              <Text style={[type.caption, { color: colors.inkMuted }]}>{comment.length}/280</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.button, { borderColor: colors.line, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[type.label, { color: colors.ink }]}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={outOfLikes}
              onPress={send}
              style={({ pressed }) => [
                styles.button,
                styles.flex,
                {
                  backgroundColor: colors.ink,
                  borderColor: colors.ink,
                  opacity: outOfLikes ? 0.4 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[type.label, { color: colors.surface }]}>Send {noun}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(33, 36, 69, 0.4)' },
  sheet: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: space[4],
    gap: space[4],
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  choice: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 32,
    justifyContent: 'center',
  },
  field: { gap: space[2] },
  input: {
    minHeight: 104,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    textAlignVertical: 'top',
  },
  meta: { flexDirection: 'row', gap: space[2] },
  actions: { flexDirection: 'row', gap: space[2] },
  button: {
    minHeight: 48,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
