import data from './plans.json';

/**
 * Bond's commercials (subscription plans and Boost), from src/data/plans.json —
 * see docs/bond-demo-data.md ("Monetisation"). Demo values only: nothing is charged.
 */

export type PlanId = keyof typeof data.plans;

export type Plan = {
  name: string;
  /** "plan": the default tier; "one-off": a single purchase for `period`; "subscription": renews every `period`. */
  type: 'plan' | 'one-off' | 'subscription';
  pricePence: number;
  period: { count: number; unit: 'day' | 'week' | 'month' | 'year' } | null;
  benefits: string[];
  /** Enforced in the app. Missing means no limit set by this plan; null means unlimited. */
  limits: { activeProposals?: number | null; likesPerDay?: number | null };
};

export type Plans = Record<PlanId, Plan>;

/** As bundled. The app reads the session's plans (with demo panel edits) via `usePlans()`. */
export const BUNDLED_PLANS = data.plans as Plans;

/** The Free plan's limits, enforced across the demo. Not set or null means unlimited (Infinity). */
export function freeLimits(plans: Plans) {
  return {
    maxActiveProposals: plans.free.limits.activeProposals ?? Infinity,
    likesPerDay: plans.free.limits.likesPerDay ?? Infinity,
  };
}

/** 3 → "3", Infinity → "unlimited". */
export const formatLimit = (n: number) => (Number.isFinite(n) ? String(n) : 'unlimited');

/** "£0", "£4.99 for 7 days", "£14.99 / month". */
export function formatPrice(plan: Plan): string {
  const pounds = plan.pricePence / 100;
  const amount = `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
  if (!plan.period || plan.pricePence === 0) return amount;
  const { count, unit } = plan.period;
  if (plan.type === 'subscription') return count === 1 ? `${amount} / ${unit}` : `${amount} every ${count} ${unit}s`;
  return `${amount} for ${count} ${count === 1 ? unit : `${unit}s`}`;
}
