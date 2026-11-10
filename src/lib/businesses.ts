export type Business = {
  id: string;
  name: string;
  owner: string;
  city: string;
  focus: string;
  offers: string[];
  needs: string[];
  blurb: string;
};

/**
 * Swapkit is scoped to the two functions small businesses most often need
 * outside help with: Sales and Marketing. Every skill a member can offer or
 * ask for comes from these two groups.
 */
export const SKILL_GROUPS = [
  {
    name: "Sales",
    skills: [
      "Sales calls & demos",
      "Cold email",
      "LinkedIn outreach",
      "Appointment setting",
      "Sales scripts",
      "Pipeline reviews",
      "CRM setup",
      "Partnership deals",
    ],
  },
  {
    name: "Marketing",
    skills: [
      "SEO",
      "Paid ads",
      "Email marketing",
      "Social media",
      "Copywriting",
      "Content strategy",
      "Brand identity",
      "Website CRO",
      "Analytics & reporting",
      "Video & reels",
    ],
  },
] as const;

export type SkillGroup = (typeof SKILL_GROUPS)[number];
export type Skill = SkillGroup["skills"][number];

export const SKILLS: string[] = SKILL_GROUPS.flatMap((g) => [...g.skills]);

export const BUSINESSES: Business[] = [
  {
    id: "1",
    name: "Northline Sales Co.",
    owner: "Priya Shah",
    city: "Bristol",
    focus: "Outbound sales",
    offers: ["Cold email", "Appointment setting", "CRM setup"],
    needs: ["SEO", "Email marketing", "Copywriting"],
    blurb: "Two-person outbound team booking meetings for local service businesses.",
  },
  {
    id: "2",
    name: "Bright Signal Media",
    owner: "Tom Becker",
    city: "Leeds",
    focus: "Performance marketing",
    offers: ["Paid ads", "Analytics & reporting", "Website CRO"],
    needs: ["Copywriting", "Sales calls & demos", "Email marketing"],
    blurb: "Runs Google and Meta budgets for brands under £1m turnover.",
  },
  {
    id: "3",
    name: "Quill & Quote",
    owner: "Amara Okafor",
    city: "Manchester",
    focus: "Content & email",
    offers: ["Copywriting", "Email marketing", "Content strategy"],
    needs: ["SEO", "Paid ads", "LinkedIn outreach"],
    blurb: "Writes newsletters and landing page copy for small brands.",
  },
  {
    id: "4",
    name: "Foundry Digital",
    owner: "Jonas Reed",
    city: "London",
    focus: "Search & conversion",
    offers: ["SEO", "Website CRO", "Analytics & reporting"],
    needs: ["Cold email", "Copywriting", "Video & reels"],
    blurb: "Technical SEO and funnel fixes for shops and SaaS startups.",
  },
  {
    id: "5",
    name: "Ladder & Co.",
    owner: "Lucia Moretti",
    city: "Edinburgh",
    focus: "Sales coaching",
    offers: ["Sales calls & demos", "Sales scripts", "Pipeline reviews"],
    needs: ["Social media", "Email marketing", "Brand identity"],
    blurb: "Fractional sales lead who trains founders to close their own deals.",
  },
  {
    id: "6",
    name: "Halo Content Studio",
    owner: "Ellie Grant",
    city: "Bristol",
    focus: "Short-form video",
    offers: ["Video & reels", "Social media", "LinkedIn outreach"],
    needs: ["Cold email", "Website CRO", "SEO"],
    blurb: "Films and edits reels, UGC and product clips for local brands.",
  },
  {
    id: "7",
    name: "Meridian Partners",
    owner: "Daniel Cho",
    city: "London",
    focus: "Channel & partnerships",
    offers: ["Partnership deals", "LinkedIn outreach", "CRM setup"],
    needs: ["Email marketing", "Paid ads", "Content strategy"],
    blurb: "Sets up referral and reseller deals between small businesses.",
  },
  {
    id: "8",
    name: "Signal & Sage",
    owner: "Sofia Alvarez",
    city: "Leeds",
    focus: "Brand & messaging",
    offers: ["Brand identity", "Content strategy", "Email marketing"],
    needs: ["Sales calls & demos", "SEO", "Analytics & reporting"],
    blurb: "Brand identities and messaging for businesses finding their voice.",
  },
];

export type Match = { business: Business; theyGive: string[]; youGive: string[]; score: number };

/** A mutual match needs both sides to benefit: they offer something you need AND need something you offer. */
export function findMatches(myOffers: string[], myNeeds: string[], list = BUSINESSES): Match[] {
  return list
    .map((b) => {
      const theyGive = b.offers.filter((s) => myNeeds.includes(s));
      const youGive = b.needs.filter((s) => myOffers.includes(s));
      return { business: b, theyGive, youGive, score: theyGive.length + youGive.length };
    })
    .filter((m) => m.theyGive.length > 0 && m.youGive.length > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Build a match for one specific business, e.g. a cooperation partner. Falls
 * back to each side's own skills when the current picker selection overlaps
 * nothing, so a joint campaign can always be drafted.
 */
export function matchForBusiness(id: string, myOffers: string[], myNeeds: string[]): Match | null {
  const business = BUSINESSES.find((b) => b.id === id);
  if (!business) return null;
  const theyGive = business.offers.filter((s) => myNeeds.includes(s));
  const youGive = business.needs.filter((s) => myOffers.includes(s));
  return {
    business,
    theyGive: theyGive.length ? theyGive : [...business.offers],
    youGive: youGive.length ? youGive : myOffers.length ? [...myOffers] : [...business.needs],
    score: theyGive.length + youGive.length,
  };
}
