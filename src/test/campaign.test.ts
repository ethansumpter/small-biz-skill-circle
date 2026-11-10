import { describe, expect, it } from "vitest";
import { canLaunch, discountCode, draftCampaign, exampleResults, resultsSuggestion } from "@/lib/campaign";

describe("joint campaign", () => {
  it("builds the discount code from both names", () => {
    expect(discountCode("Jade Studio", "Signal & Sage")).toBe("COLLAB-JS10");
  });
  it("launches only when both owners approve", () => {
    expect(canLaunch(true, false)).toBe(false);
    expect(canLaunch(false, true)).toBe(false);
    expect(canLaunch(true, true)).toBe(true);
  });
  it("uses both business names in the draft", () => {
    const d = draftCampaign({ name: "Jade Studio", skills: ["SEO"] }, { name: "Signal & Sage", skills: ["Brand identity"] });
    expect(d.name).toContain("Jade Studio");
    expect(d.name).toContain("Signal & Sage");
    expect(d.offer).toContain("COLLAB-JS10");
  });
  it("suggests repeating a collab that brought in customers", () => {
    expect(resultsSuggestion(exampleResults())).toContain("23 new customers");
    expect(resultsSuggestion({ uses: 2, mine: 1, theirs: 1 })).toContain("different partner");
  });
});
