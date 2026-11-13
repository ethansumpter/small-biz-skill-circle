import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, LinearTransition } from 'react-native-reanimated';

import { ChoiceChips, PrimaryButton, TextField } from '@/components/ui';
import type { ProposalInput } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

/** Option lists from docs/bond-features.md and docs/bond-demo-data.md (filter options). */
const COLLABORATION_TYPES = ['Bundle deal', 'Product collaboration', 'Service collaboration'] as const;
const BUSINESS_GOALS = ['Reach new customers', 'Launch a new product', 'Reduce marketing costs'] as const;
const LOCATIONS = ['Leeds', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles'] as const;
const FIRM_SIZES = ['Micro', 'SME', 'Either'] as const;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const EMPTY: ProposalInput = {
  lookingFor: '',
  partnerType: '',
  collaborationType: '',
  businessGoal: '',
  location: '',
  firmSize: '',
  weOffer: '',
  budget: '',
  requirements: '',
};

const REQUIRED: { key: keyof ProposalInput; message: string }[] = [
  { key: 'lookingFor', message: "Say what you're looking for." },
  { key: 'weOffer', message: 'Say what you can offer in return.' },
  { key: 'collaborationType', message: 'Pick a collaboration type.' },
  { key: 'businessGoal', message: 'Pick a business goal.' },
];

const OPTIONAL_KEYS: (keyof ProposalInput)[] = ['partnerType', 'location', 'firmSize', 'budget', 'requirements'];

type Errors = Partial<Record<keyof ProposalInput, string>>;

/**
 * The ＋ New Proposal form (fields from docs/bond-app-structure.md §3), in three
 * groups so it reads in small steps: the exchange (what you want, what you give),
 * the kind of collaboration, then the optional partner details, folded away
 * behind "Add more detail" until wanted.
 */
export function NewProposalForm({ onSubmit }: { onSubmit: (input: ProposalInput) => void }) {
  const colors = useBondColors();
  const [form, setForm] = useState<ProposalInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [showMore, setShowMore] = useState(false);
  const optionalFilled = OPTIONAL_KEYS.filter((k) => form[k].trim()).length;

  const set = (key: keyof ProposalInput) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = () => {
    const next: Errors = {};
    for (const { key, message } of REQUIRED) {
      if (!form[key].trim()) next[key] = message;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(form);
    setForm(EMPTY);
    setShowMore(false);
  };

  return (
    <View style={styles.form}>
      <Section title="The exchange">
        <TextField
          label="What are you looking for?"
          required
          multiline
          value={form.lookingFor}
          onChangeText={set('lookingFor')}
          placeholder="e.g. A local café partner for a Christmas joint promotion"
          error={errors.lookingFor}
        />
        <TextField
          label="What can you offer?"
          required
          multiline
          value={form.weOffer}
          onChangeText={set('weOffer')}
          placeholder="e.g. Social media promotion, access to our customer base"
          error={errors.weOffer}
        />
      </Section>

      <Section title="The collaboration">
        <ChoiceChips
          label="Type"
          required
          options={COLLABORATION_TYPES}
          value={form.collaborationType}
          onChange={set('collaborationType')}
          error={errors.collaborationType}
        />
        <ChoiceChips
          label="Goal"
          required
          options={BUSINESS_GOALS}
          value={form.businessGoal}
          onChange={set('businessGoal')}
          error={errors.businessGoal}
        />
      </Section>

      <Animated.View layout={LinearTransition.duration(220).easing(EASE_OUT)} style={styles.more}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showMore }}
          onPress={() => setShowMore((v) => !v)}
          style={({ pressed }) => [styles.moreToggle, { borderColor: colors.line, opacity: pressed ? 0.6 : 1 }]}
        >
          <View style={styles.flex}>
            <Text style={[type.label, { color: colors.ink }]}>{showMore ? 'Partner details' : 'Add more detail'}</Text>
            <Text style={[type.caption, { color: colors.inkMuted }]}>
              {optionalFilled
                ? `${optionalFilled} of ${OPTIONAL_KEYS.length} added`
                : 'Optional: partner type, location, firm size, budget, requirements'}
            </Text>
          </View>
          <Ionicons name={showMore ? 'chevron-up' : 'chevron-down'} size={20} color={colors.inkMuted} />
        </Pressable>

        {showMore ? (
          <Animated.View entering={FadeIn.duration(200).easing(EASE_OUT)} style={styles.sectionBody}>
            <TextField
              label="Industry or partner type"
              showOptional={false}
              value={form.partnerType}
              onChangeText={set('partnerType')}
              placeholder="e.g. Photographer, Retail"
            />
            <ChoiceChips
              label="Location"
              showOptional={false}
              options={LOCATIONS}
              value={form.location}
              onChange={set('location')}
            />
            <ChoiceChips
              label="Preferred firm size"
              showOptional={false}
              options={FIRM_SIZES}
              value={form.firmSize}
              onChange={set('firmSize')}
            />
            <TextField
              label="Budget"
              showOptional={false}
              value={form.budget}
              onChangeText={set('budget')}
              placeholder="e.g. £500, or a 50/50 revenue share"
            />
            <TextField
              label="Requirements"
              showOptional={false}
              multiline
              value={form.requirements}
              onChangeText={set('requirements')}
              placeholder="e.g. Must operate locally, must serve a similar customer group"
            />
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.View layout={LinearTransition.duration(220).easing(EASE_OUT)}>
        <PrimaryButton label="Post proposal" onPress={submit} />
      </Animated.View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const colors = useBondColors();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[type.caption, styles.sectionTitle, { color: colors.inkMuted }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: space[6] },
  section: { gap: space[3] },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionBody: { gap: space[4] },
  more: { gap: space[4] },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
