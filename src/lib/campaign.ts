export type CampaignDraft = { name: string; post: string; email: string; offer: string; code: string };

/** Discount code: COLLAB- + first letter of each business name + 10, e.g. COLLAB-YN10. */
export function discountCode(myName: string, partnerName: string) {
  const initial = (s: string) => (s.trim().match(/[A-Za-z]/)?.[0] ?? "X").toUpperCase();
  return `COLLAB-${initial(myName)}${initial(partnerName)}10`;
}

/** A campaign can only launch once both owners have approved. */
export function canLaunch(mine: boolean, partner: boolean) {
  return mine && partner;
}

export function draftCampaign(me: { name: string; skills: string[] }, partner: { name: string; skills: string[] }): CampaignDraft {
  const code = discountCode(me.name, partner.name);
  const a = me.skills[0] ?? "marketing";
  const b = partner.skills[0] ?? "sales";
  return {
    code,
    name: `${me.name} × ${partner.name}: Grow Together Week`,
    post: `We've teamed up! 🤝 ${me.name} brings ${a.toLowerCase()}, ${partner.name} brings ${b.toLowerCase()} — one bundle to help small businesses sell more. Use code ${code} for 10% off this week only. #SmallBusiness #Collab`,
    email: `Subject: Two experts, one offer\n\nHi there,\n\n${me.name} and ${partner.name} are joining forces. For one week, get ${a.toLowerCase()} and ${b.toLowerCase()} support in a single package — built for small teams who want results fast.\n\nUse ${code} at checkout for 10% off.\n\nCheers,\nThe ${me.name} & ${partner.name} teams`,
    offer: `10% off any combined ${a} + ${b} package booked with either business this week. Code: ${code}`,
  };
}
