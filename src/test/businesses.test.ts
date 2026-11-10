import { describe, expect, it } from "vitest";

import { BUSINESSES, SKILLS, SKILL_GROUPS, findMatches, matchForBusiness } from "@/lib/businesses";

// Swapkit is scoped to Sales and Marketing functions only. These tests lock that
// scope in: the skill picker must stay inside those two groups, and every
// profile must trade using skills that actually exist in the picker.
describe("Sales & Marketing scope", () => {
  it("offers only Sales and Marketing skill groups", () => {
    expect(SKILL_GROUPS.map((g) => g.name)).toEqual(["Sales", "Marketing"]);
  });

  it("keeps every skill in the picker inside those two groups", () => {
    const grouped = SKILL_GROUPS.flatMap((g) => [...g.skills]);
    expect(SKILLS).toEqual(grouped);
    expect(grouped).toContain("Cold email");
    expect(grouped).toContain("Paid ads");
  });

  it("lists no skills outside Sales and Marketing", () => {
    const offScope = ["Carpentry", "Bookkeeping", "Catering", "Legal advice", "Event space", "Photography"];
    expect(SKILLS.filter((s) => offScope.includes(s))).toEqual([]);
  });

  it("gives every business offers and needs drawn from the picker", () => {
    for (const b of BUSINESSES) {
      expect(b.offers.length).toBeGreaterThan(0);
      expect(b.needs.length).toBeGreaterThan(0);
      for (const s of [...b.offers, ...b.needs]) expect(SKILLS).toContain(s);
    }
  });

  it("opens on a set of mutual sales & marketing matches", () => {
    const offers = ["Copywriting", "Email marketing", "Social media"];
    const needs = ["SEO", "Paid ads", "LinkedIn outreach"];
    const matches = findMatches(offers, needs);

    expect(matches.length).toBe(3);
    expect(matches.map((m) => m.business.id)).toEqual(["2", "4", "7"]);
    for (const m of matches) {
      expect(m.theyGive.length).toBeGreaterThan(0);
      expect(m.youGive.length).toBeGreaterThan(0);
    }
  });
});
