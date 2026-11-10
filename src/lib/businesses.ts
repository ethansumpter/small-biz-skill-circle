export type Business = {
  id: string;
  name: string;
  owner: string;
  city: string;
  offers: string[];
  needs: string[];
  blurb: string;
};

export const SKILLS = [
  "Web design",
  "Photography",
  "Bookkeeping",
  "Copywriting",
  "Social media",
  "Legal advice",
  "Carpentry",
  "Catering",
  "Video editing",
  "SEO",
  "Branding",
  "Event space",
] as const;

export const BUSINESSES: Business[] = [
  { id: "1", name: "Oak & Iron Workshop", owner: "Priya Shah", city: "Bristol", offers: ["Carpentry", "Event space"], needs: ["Web design", "Photography"], blurb: "Handmade furniture studio with a big open workshop." },
  { id: "2", name: "Lens Lane Studio", owner: "Tom Becker", city: "Leeds", offers: ["Photography", "Video editing"], needs: ["Bookkeeping", "SEO"], blurb: "Product and portrait photography for local brands." },
  { id: "3", name: "Ledger Light", owner: "Amara Okafor", city: "London", offers: ["Bookkeeping"], needs: ["Branding", "Copywriting", "Social media"], blurb: "Friendly bookkeeping for sole traders and micro-businesses." },
  { id: "4", name: "Pixel Pantry", owner: "Jonas Reed", city: "Manchester", offers: ["Web design", "SEO"], needs: ["Photography", "Catering"], blurb: "Two-person web studio building fast, simple sites." },
  { id: "5", name: "Crumb & Co.", owner: "Lucia Moretti", city: "Bristol", offers: ["Catering", "Event space"], needs: ["Social media", "Web design"], blurb: "Neighbourhood bakery that caters launches and workshops." },
  { id: "6", name: "Wordsmith Works", owner: "Ellie Grant", city: "Edinburgh", offers: ["Copywriting", "Social media"], needs: ["Legal advice", "Bookkeeping"], blurb: "Copy and content for small brands with big voices." },
  { id: "7", name: "Fairway Legal", owner: "Daniel Cho", city: "London", offers: ["Legal advice"], needs: ["Web design", "Copywriting"], blurb: "Plain-English contracts and advice for start-ups." },
  { id: "8", name: "Mark & Muse", owner: "Sofia Alvarez", city: "Leeds", offers: ["Branding", "Social media"], needs: ["Video editing", "Carpentry"], blurb: "Brand identities that feel local and personal." },
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
