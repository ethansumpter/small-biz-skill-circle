/**
 * Proposals sent to the demo account (c01 Kiln & Clay Studio) — see
 * docs/bond-demo-data.md ("Your Network"). Fictional. No owner or personal names.
 * Other accounts start with none (these are written to Kiln & Clay).
 */
export type IncomingProposal = {
  /** Company id in companies.json. */
  companyId: string;
  title: string;
  /** The comment sent with the proposal (always present; it's required). */
  comment: string;
};

export const DEMO_INCOMING: IncomingProposal[] = [
  {
    companyId: 'c03',
    title: 'Serveware set: oak boards with your ceramic dishes',
    comment:
      'We think our oak boards and your glazed dishes would make a lovely serving set for the Christmas markets. Fancy it?',
  },
  {
    companyId: 'c12',
    title: 'Stage homes with your planters on loan, with a credit card on display',
    comment:
      "We stage around 15 homes a month and buyers always ask where the pottery is from. We'd credit you on every one.",
  },
];
