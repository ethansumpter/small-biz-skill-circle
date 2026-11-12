/**
 * Demo matches and chat for the logged-in account (c01) — see docs/bond-demo-data.md
 * ("Leads: demo chat"). Fictional. No owner or personal names.
 */
export type Message = {
  id: string;
  from: 'me' | 'them';
  text: string;
  attachment?: string;
};

export type Lead = {
  id: string;
  company: string;
  initials: string;
  industry: string;
  location: string;
  /** The comment sent with the original like/proposal, pinned at the top of the thread. */
  pinnedComment?: string;
  messages: Message[];
  muted: boolean;
};

export const DEMO_LEADS: Lead[] = [
  {
    id: 'c02',
    company: 'Wick & Wild Candle Co.',
    initials: 'WW',
    industry: 'Home fragrance',
    location: 'Headingley, Leeds',
    pinnedComment: "We love your speckled mugs. Could they hold a 200g pour? We'd love to talk refills.",
    muted: false,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: "Hi! We'd love to test a pour in three of your mug sizes. Do you have seconds we could experiment with?",
      },
      { id: 'm2', from: 'me', text: "Yes, we've got about 20 seconds from the last firing. Collect from the studio Thursday?" },
      { id: 'm3', from: 'them', text: "Perfect. We're thinking a rhubarb and fig scent for the first run, about 60 units." },
      { id: 'm4', from: 'me', text: 'Great. Shall we split 50/50 and sell through both shops?' },
      {
        id: 'm5',
        from: 'them',
        text: "Works for us. I'll draft a refill card customers can bring back.",
        attachment: 'refill-card-draft.pdf',
      },
    ],
  },
  {
    id: 'c10',
    company: 'Reel North Studio',
    initials: 'RN',
    industry: 'Social content creation',
    location: 'Leeds Dock',
    muted: false,
    messages: [],
  },
];
