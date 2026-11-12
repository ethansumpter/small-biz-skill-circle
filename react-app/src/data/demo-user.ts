/**
 * Hardcoded demo account (c01 Kiln & Clay Studio) — see docs/bond-demo-data.md.
 * All content is fictional. No owner or personal names.
 */
export const demoUser = {
  id: 'c01',
  name: 'Kiln & Clay Studio',
  initials: 'KC',
  industry: 'Ceramics',
  location: 'Chapel Allerton, Leeds',
  size: 'Micro',
  verified: true,
  rating: 4.9,
  plan: 'Free',
  offer: 'Hand-thrown stoneware in small batches. Textured mugs, planters and vessels. Custom glazes.',
  lookingFor: "A maker who can fill or use our vessels, so they're sold as a finished product.",
  interests: ['Product collaborations', 'Cross-promotion'],
  prompts: [
    {
      question: 'Our favourite collab would be…',
      answer: 'Something people keep and refill long after the first use.',
    },
    { question: "We're best at…", answer: 'Glazes nobody else in Leeds is making.' },
  ],
  links: ['kilnandclay.example', 'Instagram @kilnandclay.example'],
  activity: {
    activeProposals: 1,
    maxProposals: 3,
    incomingProposals: 2,
    saved: 1,
    matches: 2,
  },
  reviews: [
    { from: 'Clear Space Staging', stars: 5, text: 'Reliable, beautiful work, and delivered a week early.' },
    { from: 'Wick & Wild Candle Co.', stars: 5, text: 'Easy to work with, and clear on costs from day one.' },
  ],
};

export const plans = {
  free: { name: 'Free', price: '£0', benefits: ['3 active proposals', '10 likes a day'] },
  boost: { name: 'Boost', price: '£4.99 for 7 days', benefits: ['Shown first in Discover within 10 miles'] },
  plus: {
    name: 'Bond Plus',
    price: '£14.99 / month',
    benefits: ['Unlimited likes', 'See who saved you', '"Why this match" detail', 'Priority verification'],
  },
};
