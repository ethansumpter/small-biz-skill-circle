import { getCompany } from '@/data/companies';

/**
 * The logged-in demo account. Defaults to c01 Kiln & Clay Studio and can be
 * switched to any demo company from the demo panel (Profile → Settings).
 * Profile fields come from companies.json; plan and activity are from
 * docs/bond-demo-data.md. All content is fictional. No owner or personal names.
 *
 * Read it with `useCurrentUser()` from '@/state/preview'.
 */
export function buildDemoUser(companyId: string) {
  return {
    ...getCompany(companyId),
    // App state for the demo account (not part of the public company profile).
    plan: 'Free',
    activity: {
      incomingProposals: 2,
      saved: 1,
      matches: 2,
    },
  };
}

export type DemoUser = ReturnType<typeof buildDemoUser>;

export const plans = {
  free: { name: 'Free', price: '£0', benefits: ['3 active proposals', '10 likes a day'] },
  boost: { name: 'Boost', price: '£4.99 for 7 days', benefits: ['Shown first in Discover within 10 miles'] },
  plus: {
    name: 'Bond Plus',
    price: '£14.99 / month',
    benefits: ['Unlimited likes', 'See who saved you', '"Why this match" detail', 'Priority verification'],
  },
};
