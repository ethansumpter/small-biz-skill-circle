import type { Company } from '@/data/companies';
import { plans } from '@/data/plans';

/**
 * The logged-in demo account. Defaults to c01 Kiln & Clay Studio and can be
 * switched to any demo company from the demo panel (Profile → Settings).
 * Profile fields come from companies.json and the plan from plans.json; activity
 * is from docs/bond-demo-data.md. All content is fictional. No owner or personal names.
 *
 * Read it with `useCurrentUser()` from '@/state/preview'.
 */
export function buildDemoUser(company: Company) {
  return {
    ...company,
    // App state for the demo account (not part of the public company profile).
    plan: plans.free.name,
    activity: {
      incomingProposals: 2,
      saved: 1,
      matches: 2,
    },
  };
}

export type DemoUser = ReturnType<typeof buildDemoUser>;
