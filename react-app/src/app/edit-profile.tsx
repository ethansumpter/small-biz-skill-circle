import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanyAvatar } from '@/components/company-avatar';
import { StackHeader } from '@/components/stack-header';
import { ChoiceChips, FieldLabel, PrimaryButton, TextField } from '@/components/ui';
import { useCompanies, useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { confirmAction, showMessage } from '@/utils/dialog';
import { notInPreview } from '@/utils/preview';

/** Interest options from docs/bond-features.md (Company profile). */
const INTERESTS = ['Collaboration interests', 'Cross-promotion', 'Product collaborations', 'Service collaborations'];
const SIZES = ['Micro', 'SME'] as const;

/**
 * Profile → pencil: edit your profile (docs/bond-app-structure.md §5). Fields
 * follow the Discover card's order: offer, company details, prompts, gallery,
 * links. Preview only: edits live in this page and aren't saved anywhere, and
 * Save says so rather than implying anything changed.
 */
export default function EditProfileScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { currentUserId } = useCurrentUser();
  const { getCompany } = useCompanies();
  const company = getCompany(currentUserId);

  const [initial] = useState(() => ({
    name: company.name,
    ownerName: company.ownerName ?? '',
    industry: company.industry,
    location: company.location,
    size: company.size,
    offer: company.offer,
    lookingFor: company.lookingFor,
    interests: [...company.interests],
    prompts: company.prompts.map((p) => ({ ...p })),
    links: [...company.links],
  }));
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set =
    <K extends keyof typeof form>(key: K) =>
    (value: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (interest: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));

  const setPromptAnswer = (index: number, answer: string) =>
    setForm((f) => ({ ...f, prompts: f.prompts.map((p, i) => (i === index ? { ...p, answer } : p)) }));

  const setLink = (index: number, link: string) =>
    setForm((f) => ({ ...f, links: f.links.map((l, i) => (i === index ? link : l)) }));

  const save = () => {
    showMessage(
      'Preview only',
      "Your edits look good, but the Bond preview doesn't save profile changes. Your profile stays as it was.",
    );
    router.back();
  };

  const back = () => {
    if (!dirty) return router.back();
    confirmAction({
      title: 'Discard your edits?',
      message: "You've made changes on this page. Leaving now drops them.",
      confirmLabel: 'Discard',
      destructive: true,
      onConfirm: () => router.back(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StackHeader title="Edit profile" subtitle={company.name} onBack={back} />

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.logo}>
          <CompanyAvatar companyId={company.id} size={96} borderWidth={3} borderColor={colors.ink} />
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => notInPreview('Change logo')}>
            <Text style={[type.label, { color: colors.link }]}>Change logo</Text>
          </Pressable>
        </View>

        <Section title="Your offer" hint="Shown first on your Discover card.">
          <TextField
            label="We can offer"
            required
            multiline
            value={form.offer}
            onChangeText={set('offer')}
            placeholder="What you make or do, in a sentence or two"
          />
          <TextField
            label="We're looking for"
            required
            multiline
            value={form.lookingFor}
            onChangeText={set('lookingFor')}
            placeholder="The partner or collaboration you want"
          />
        </Section>

        <Section title="Company details">
          <TextField label="Company name" required value={form.name} onChangeText={set('name')} />
          <TextField
            label="Your name"
            required
            value={form.ownerName}
            onChangeText={set('ownerName')}
            placeholder="Full name"
          />
          <Text style={[type.caption, styles.hintUnder, { color: colors.inkMuted }]}>
            Shown on your profile and to businesses you match with. Never on Discover.
          </Text>
          <TextField label="Industry" required value={form.industry} onChangeText={set('industry')} />
          <TextField label="Location" required value={form.location} onChangeText={set('location')} />
          <ChoiceChips label="Firm size" required options={SIZES} value={form.size} onChange={set('size')} />
          <View style={styles.field}>
            <FieldLabel label="Interests" required />
            <View style={styles.chips}>
              {INTERESTS.map((interest) => {
                const on = form.interests.includes(interest);
                return (
                  <Pressable
                    key={interest}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => toggleInterest(interest)}
                    style={({ pressed }) => [
                      styles.chip,
                      on
                        ? { backgroundColor: colors.ink, borderColor: colors.ink }
                        : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {on ? <Ionicons name="checkmark" size={16} color={colors.surface} /> : null}
                    <Text style={[type.label, { color: on ? colors.surface : colors.ink }]}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Row
            icon={company.verified ? 'shield-checkmark' : 'shield-outline'}
            label={company.verified ? 'Verified business' : 'Verify your business'}
            detail={company.verified ? 'Done' : undefined}
            onPress={company.verified ? undefined : () => notInPreview('Business verification')}
          />
        </Section>

        <Section title="Prompts" hint="2 or 3 short answers that show your personality.">
          {form.prompts.map((prompt, i) => (
            <TextField
              key={prompt.question}
              label={prompt.question}
              required
              multiline
              value={prompt.answer}
              onChangeText={(text) => setPromptAnswer(i, text)}
            />
          ))}
          {form.prompts.length < 3 ? (
            <Row icon="add-circle-outline" label="Add a prompt" onPress={() => notInPreview('Add a prompt')} />
          ) : null}
        </Section>

        <Section title="Gallery" hint="At least 3 images.">
          <View style={styles.gallery}>
            {company.gallery.map((description) => (
              <Pressable
                key={description}
                accessibilityRole="button"
                accessibilityLabel={`Replace image: ${description}`}
                onPress={() => notInPreview('Photo uploads')}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: colors.surfaceRaised, borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="image-outline" size={22} color={colors.inkMuted} />
                <Text numberOfLines={3} style={[type.caption, styles.tileText, { color: colors.inkMuted }]}>
                  {description}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Links">
          {form.links.map((link, i) => (
            <TextField
              key={i}
              label={i === 0 ? 'Website' : `Link ${i + 1}`}
              value={link}
              onChangeText={(text) => setLink(i, text)}
            />
          ))}
        </Section>

        <Section title="Reviews">
          <Text style={[type.body, { color: colors.inkMuted }]}>
            Reviews come from businesses you&apos;ve worked with, so you can&apos;t edit them. You can report one from
            your Discover card if it&apos;s false.
          </Text>
        </Section>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[3]), backgroundColor: colors.surfaceRaised, borderTopColor: colors.line },
        ]}
      >
        <PrimaryButton label={dirty ? 'Save changes' : 'Done'} onPress={dirty ? save : () => router.back()} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  const colors = useBondColors();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text accessibilityRole="header" style={[type.caption, styles.sectionTitle, { color: colors.inkMuted }]}>
          {title}
        </Text>
        {hint ? <Text style={[type.caption, { color: colors.inkMuted }]}>{hint}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: 'shield-checkmark' | 'shield-outline' | 'add-circle-outline';
  label: string;
  detail?: string;
  onPress?: () => void;
}) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.ink} />
      <Text style={[type.label, styles.flex, { color: onPress ? colors.link : colors.ink }]}>{label}</Text>
      {detail ? <Text style={[type.caption, { color: colors.inkMuted }]}>{detail}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: space[4],
    paddingBottom: space[12],
    gap: space[6],
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  logo: { alignItems: 'center', gap: space[2] },
  section: { gap: space[3] },
  sectionHead: { gap: 2 },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionBody: { gap: space[4] },
  hintUnder: { marginTop: -space[3] },
  field: { gap: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 40,
  },
  gallery: { flexDirection: 'row', gap: space[2] },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    padding: space[2],
  },
  tileText: { textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
