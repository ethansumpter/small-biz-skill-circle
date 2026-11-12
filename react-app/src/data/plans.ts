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

export const plans = data.plans as Record<PlanId, Plan>;

/** The Free plan's limits, enforced across the demo. */
export const MAX_ACTIVE_PROPOSALS = plans.free.limits.activeProposals ?? Infinity;
export const FREE_LIKES_PER_DAY = plans.free.limits.likesPerDay ?? Infinity;

/** "£0", "£4.99 for 7 days", "£14.99 / month". */
export function formatPrice(plan: Plan): string {
  const pounds = plan.pricePence / 100;
  const amount = `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
  if (!plan.period || plan.pricePence === 0) return amount;
  const { count, unit } = plan.period;
  if (plan.type === 'subscription') return count === 1 ? `${amount} / ${unit}` : `${amount} every ${count} ${unit}s`;
  return `${amount} for ${count} ${count === 1 ? unit : `${unit}s`}`;
}
