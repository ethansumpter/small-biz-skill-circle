import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChips, PrimaryButton, TextField } from '@/components/ui';
import type { ProposalInput } from '@/state/preview';
import { space } from '@/theme/tokens';

/** Option lists from docs/bond-features.md and docs/bond-demo-data.md (filter options). */
const COLLABORATION_TYPES = ['Bundle deal', 'Product collaboration', 'Service collaboration'] as const;
const BUSINESS_GOALS = ['Reach new customers', 'Launch a new product', 'Reduce marketing costs'] as const;
const LOCATIONS = ['Leeds', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles'] as const;
const FIRM_SIZES = ['Micro', 'SME', 'Either'] as const;

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
  { key: 'collaborationType', message: 'Pick a collaboration type.' },
  { key: 'businessGoal', message: 'Pick a business goal.' },
  { key: 'weOffer', message: 'Say what you can offer in return.' },
];

type Errors = Partial<Record<keyof ProposalInput, string>>;

/** The ＋ New Proposal form. Fields and order follow docs/bond-app-structure.md §3. */
export function NewProposalForm({ onSubmit }: { onSubmit: (input: ProposalInput) => void }) {
  const [form, setForm] = useState<ProposalInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

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
  };

  return (
    <View style={styles.form}>
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
        label="Industry or partner type"
        value={form.partnerType}
        onChangeText={set('partnerType')}
        placeholder="e.g. Photographer, Retail"
      />
      <ChoiceChips
        label="Collaboration type"
        required
        options={COLLABORATION_TYPES}
        value={form.collaborationType}
        onChange={set('collaborationType')}
        error={errors.collaborationType}
      />
      <ChoiceChips
        label="Business goal"
        required
        options={BUSINESS_GOALS}
        value={form.businessGoal}
        onChange={set('businessGoal')}
        error={errors.businessGoal}
      />
      <ChoiceChips label="Location" options={LOCATIONS} value={form.location} onChange={set('location')} />
      <ChoiceChips label="Preferred firm size" options={FIRM_SIZES} value={form.firmSize} onChange={set('firmSize')} />
      <TextField
        label="What we can offer"
        required
        multiline
        value={form.weOffer}
        onChangeText={set('weOffer')}
        placeholder="e.g. Social media promotion, access to our customer base"
        error={errors.weOffer}
      />
      <TextField
        label="Budget"
        value={form.budget}
        onChangeText={set('budget')}
        placeholder="e.g. £500, or a 50/50 revenue share"
      />
      <TextField
        label="Requirements"
        multiline
        value={form.requirements}
        onChangeText={set('requirements')}
        placeholder="e.g. Must operate locally, must serve a similar customer group"
      />
      <PrimaryButton label="Post proposal" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space[6] },
});
