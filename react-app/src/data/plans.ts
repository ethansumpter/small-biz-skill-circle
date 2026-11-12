import data from './plans.json';

/**
 * Bond's commercials (subscription plans and Boost), from src/data/plans.json —
 * see docs/bond-demo-data.md ("Monetisation"). Demo values only: nothing is charged.
 */

/** Plans the app looks up by id. They can be edited but not removed; more plans can be added. */
export const CORE_PLAN_IDS = ['free', 'boost', 'plus'] as const;
export type CorePlanId = (typeof CORE_PLAN_IDS)[number];
export type PlanId = CorePlanId | (string & {});

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

export type Plans = Record<CorePlanId, Plan> & Record<string, Plan>;

/** As bundled. The app reads the session's plans (with demo panel edits) via `usePlans()`. */
export const BUNDLED_PLANS = data.plans as unknown as Plans;

export const isCorePlan = (id: string) => (CORE_PLAN_IDS as readonly string[]).includes(id);

/** Everything on sale (all plans but Free): Boost, Bond Plus, then any added plans in file order. */
export function paidPlans(plans: Plans): (Plan & { id: string })[] {
  const ids = ['boost', 'plus', ...Object.keys(plans).filter((id) => !isCorePlan(id))];
  return ids.filter((id) => plans[id]).map((id) => ({ id, ...plans[id] }));
}

/** Plan ids are lowercase letters, numbers and dashes, e.g. "team-pack". */
export const PLAN_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Team Pack!" → "team-pack", made unique against `taken` ("team-pack-2", …). */
export function newPlanId(name: string, taken: string[]): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'plan';
  let id = base;
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`;
  return id;
}

/** A new plan's starting values: a monthly subscription at £0 with nothing listed yet. */
export function blankPlan(name: string): Plan {
  return {
    name,
    type: 'subscription',
    pricePence: 0,
    period: { count: 1, unit: 'month' },
    benefits: [],
    limits: {},
  };
}

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
