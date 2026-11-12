# Bond — Demo Seed Data (hardcoded)

> Context for AI agents. Fixed demo content for the Bond prototype. All companies, reviews and links are **fictional**; links use the reserved `.example` domain. Follow the screen layout in `bond-app-structure.md`, the field rules in `bond-features.md` and the voice in `bond-brand-kit.md` (plain, warm, specific; no hype, no emoji).

## Data rules for the demo
- **No owner or personal names** on profiles, cards or comments. Companies speak as "we".
- All firms are in or near **Leeds, West Yorkshire**. Distances are from the demo user.
- Each company: 1 active proposal (max 3 allowed), 3 gallery images, 2–3 prompts, 1–2 platform reviews.
- Firm size: **Micro** = 1–9 staff, **SME** = 10–249.
- Gallery entries are **image descriptions** for placeholders or generated art. Don't use real photos of people.

---

## Demo user (logged-in account)
> The demo panel (Profile → Settings → Demo panel) can switch the logged-in company for the session and edit the demo companies, proposals and Leads chats: in the dev server it saves them to `src/data/companies.json` and `src/data/leads.json`; on hosted demos the edits last for the session only. Edits saved there are not copied back into this doc.

**Kiln & Clay Studio** (`c01`): Independent ceramicist. Plan: **Free**, with a Boost available. Verified: yes.

| Screen | Demo state |
|---|---|
| Discover | Feed of the other 17 companies (order below), filters off |
| Your Network | 2 incoming proposals (`c03`, `c12`), 1 saved (`c09`) |
| ＋ Proposals | 1 of 3 active (`p01`) |
| Leads | 1 live chat with Wick & Wild (`c02`), 1 matched but not started (`c10`) |
| Profile → Get More | Boost: £4.99 for 7 days. Bond Plus: £14.99/month |

**Discover order:** c02, c03, c05, c07, c09, c10, c11, c12, c04, c06, c08, c13, c14, c15, c16, c17, c18.

---

## Companies

| ID | Company | Industry | Location | Size | Verified | Rating |
|---|---|---|---|---|---|---|
| c01 | Kiln & Clay Studio | Ceramics | Chapel Allerton, Leeds | Micro | ✓ | 4.9 |
| c02 | Wick & Wild Candle Co. | Home fragrance | Headingley, Leeds | Micro | ✓ | 4.8 |
| c03 | Oak & Grain Workshop | Woodworking | Kirkstall, Leeds | Micro | ✓ | 4.9 |
| c04 | Northfield Audio | Consumer audio | Holbeck, Leeds | SME | ✓ | 4.7 |
| c05 | Loomhouse Textiles | Textile weaving | Saltaire, Bradford (9 mi) | Micro | ✓ | 4.9 |
| c06 | Good Boy Goods | Pet accessories | Horsforth, Leeds | Micro | – | 4.6 |
| c07 | Hide & Thread Leather | Leatherwork | Leeds city centre | Micro | ✓ | 4.8 |
| c08 | Nib & Ledger Stationery | Pens & stationery | Harrogate (15 mi) | SME | ✓ | 4.7 |
| c09 | Brightframe Photography | Event photography | Roundhay, Leeds | Micro | ✓ | 4.9 |
| c10 | Reel North Studio | Social content creation | Leeds Dock | Micro | ✓ | 4.6 |
| c11 | Keyhouse Estates | Estate agency | Meanwood, Leeds | SME | ✓ | 4.5 |
| c12 | Clear Space Staging | Home staging & decluttering | Oakwood, Leeds | Micro | ✓ | 4.8 |
| c13 | Forge Fitness | Personal training | Kirkstall, Leeds | Micro | ✓ | 4.8 |
| c14 | Fuel Well Nutrition | Registered nutrition | Headingley, Leeds | Micro | ✓ | 4.9 |
| c15 | Studio Lark Hair | Hair styling | Chapel Allerton, Leeds | Micro | ✓ | 4.7 |
| c16 | True Tone Colour Studio | Colour analysis | Leeds city centre | Micro | – | 4.8 |
| c17 | Tally & Co. Accountants | Accounting | Wellington Place, Leeds | SME | ✓ | 4.8 |
| c18 | Peopleworks HR | Fractional HR | Leeds city centre (remote-first) | Micro | ✓ | 4.7 |

### Profile details

**c01 · Kiln & Clay Studio**
- Offer: Hand-thrown stoneware in small batches. Textured mugs, planters and vessels. Custom glazes.
- Looking for: A maker who can fill or use our vessels, so they're sold as a finished product.
- Interests: Product collaborations, Cross-promotion
- Prompts: "Our favourite collab would be…" Something people keep and refill long after the first use. / "We're best at…" Glazes nobody else in Leeds is making.
- Gallery: speckled oatmeal mugs on a shelf · a wheel mid-throw · a row of glazed planters
- Links: kilnandclay.example · Instagram @kilnandclay.example

**c02 · Wick & Wild Candle Co.**
- Offer: Hand-poured soy candles with scents developed in-house. Refill service.
- Looking for: Reusable, collectible vessels so our candles don't come in single-use glass.
- Interests: Product collaborations, Cross-promotion
- Prompts: "A scent we're proud of…" Rhubarb, fig leaf and Yorkshire moorland heather. / "Our customers care about…" Less waste, more ritual.
- Gallery: amber candles burning · wax pouring from a jug · gift box with kraft paper

**c03 · Oak & Grain Workshop**
- Offer: Bespoke furniture and joinery in British hardwoods (oak, walnut, ash). CNC and hand finishing.
- Looking for: Product partners who need precise, beautiful wooden housings.
- Interests: Product collaborations, Service collaborations
- Prompts: "The tool we can't live without…" A 1950s bandsaw we restored ourselves. / "We'd love to make…" Something that sounds as good as it looks.
- Gallery: walnut offcuts stacked · dovetail joint close-up · finished oak sideboard

**c04 · Northfield Audio**
- Offer: Bluetooth speaker internals and turntable components, with in-house acoustic tuning.
- Looking for: A craft partner for small-run premium enclosures and plinths.
- Interests: Product collaborations, Cross-promotion
- Prompts: "Our listening room rule…" No screens, just records. / "We want customers to say…" "I didn't know wood could sound like that."
- Gallery: speaker driver on a workbench · turntable platter · test room with acoustic panels

**c05 · Loomhouse Textiles**
- Offer: Handwoven wool and hemp fabrics on floor looms. Custom patterns in short runs.
- Looking for: A brand that turns our cloth into durable everyday goods.
- Interests: Product collaborations, Service collaborations
- Prompts: "A pattern we're known for…" The Aire stripe, in moss and slate. / "We'd love our fabric to be…" Chewed, walked and washed for years.
- Gallery: loom with warp threads · bolts of striped fabric · wool skeins in natural dyes

**c06 · Good Boy Goods**
- Offer: Pet collars, leads and beds, made and sold through our online shop and two local pet stores.
- Looking for: Sustainable, distinctive fabric to anchor a premium range.
- Interests: Product collaborations, Cross-promotion
- Prompts: "Our toughest tester…" A spaniel called Biscuit. / "Customers keep asking for…" Something that isn't nylon.
- Gallery: dog on a patterned bed · collar and lead set · packing table

**c07 · Hide & Thread Leather**
- Offer: Hand-stitched vegetable-tanned leather goods: covers, wallets, straps.
- Looking for: A stationery brand to co-design a travel journal system.
- Interests: Product collaborations
- Prompts: "Every piece is…" Saddle-stitched by hand, two needles, one thread. / "Our leather ages into…" Something nobody else owns.
- Gallery: tan leather hides · stitching in progress · finished A5 cover

**c08 · Nib & Ledger Stationery**
- Offer: Fountain pens, inks and custom-bound notebooks. Wholesale to 40 UK shops.
- Looking for: A leatherworker for covers built around our pens.
- Interests: Product collaborations, Cross-promotion
- Prompts: "Our best-selling ink…" Harrogate Green. / "We obsess over…" Paper that doesn't feather.
- Gallery: pens in a tray · ink bottles · stack of bound notebooks

**c09 · Brightframe Photography**
- Offer: Wedding and corporate event photography with a 48-hour gallery turnaround.
- Looking for: A video creator so clients get photo and short-form video from one booking.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Our favourite moment to shoot…" The five minutes after the speeches. / "Clients book us because…" We're calm when things run late.
- Gallery: venue at golden hour · camera on a tripod · printed album spread

**c10 · Reel North Studio**
- Offer: Vertical video reels shot, edited and posted on the day for events and brands.
- Looking for: Photographers who want to add video without hiring.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Our record turnaround…" A reel posted 40 minutes after the first dance. / "We're best at…" Making events look as good online as they felt in the room.
- Gallery: phone on a gimbal · editing timeline · reel analytics screen

**c11 · Keyhouse Estates**
- Offer: Independent estate agency, sales and lettings across north Leeds. About 120 listings a year.
- Looking for: A staging partner to help sellers get market-ready before photos.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Sellers always ask…" "Should we redecorate first?" / "Our edge over the big chains…" We answer the phone.
- Gallery: terraced street in Meanwood · bright staged lounge · "For sale" board

**c12 · Clear Space Staging**
- Offer: Decluttering, furniture and decor rental, and light cosmetic refreshes.
- Looking for: Agents who'll refer sellers, plus local makers whose pieces we can stage with.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Our first question in any house…" What can go in the loft? / "We stage with…" Local, handmade pieces wherever we can.
- Gallery: before/after living room · rental furniture store · styled kitchen shelf

**c13 · Forge Fitness**
- Offer: 1:1 and small-group personal training. Strength and conditioning.
- Looking for: A registered nutritionist for a joint programme.
- Interests: Service collaborations
- Prompts: "Our clients stay because…" We write the plan around their week. / "We won't…" Sell supplements.
- Gallery: gym floor with racks · kettlebell session · client progress board

**c14 · Fuel Well Nutrition**
- Offer: Registered nutritionist offering meal-prep coaching and metabolic tracking.
- Looking for: Trainers who want to give clients food support from a qualified professional.
- Interests: Service collaborations, Cross-promotion
- Prompts: "We're qualified in…" Registered nutrition (AfN). / "Our favourite meal-prep trick…" Cook once, eat three ways.
- Gallery: prepped meal boxes · consultation desk · weekly planner

**c15 · Studio Lark Hair**
- Offer: Cutting, colour and styling in a four-chair salon.
- Looking for: A colour-analysis partner for a premium image session.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Our most-booked service…" Lived-in balayage. / "We'd love to offer…" Colour that works with your wardrobe too.
- Gallery: salon interior · colour swatches · styling station

**c16 · True Tone Colour Studio**
- Offer: Seasonal colour analysis, undertone testing and wardrobe palettes.
- Looking for: A salon to turn our analysis into hair colour.
- Interests: Service collaborations
- Prompts: "People are surprised that…" Undertone matters more than eye colour. / "Every client leaves with…" A printed palette card.
- Gallery: fabric drape session · palette card · natural-light studio

**c17 · Tally & Co. Accountants**
- Offer: Bookkeeping, payroll and tax for startups and SMEs. Xero-certified.
- Looking for: An HR partner to cover a startup's first hire from end to end.
- Interests: Service collaborations, Cross-promotion
- Prompts: "Founders always forget…" Pension auto-enrolment. / "We speak…" Plain English, not accountant.
- Gallery: office at Wellington Place · payroll dashboard · client workshop

**c18 · Peopleworks HR**
- Offer: Fractional HR: contracts, policies, onboarding and people processes.
- Looking for: An accountant to pair payroll with employment setup.
- Interests: Service collaborations
- Prompts: "We help with…" The bits founders google at 2am. / "Our favourite document…" A one-page handbook people actually read.
- Gallery: onboarding checklist · video call workshop · contract templates

---

## Collaboration proposals (the 9 demo pairs)

| ID | Pair | Type | Goal | Offer ↔ Need | Budget | Status |
|---|---|---|---|---|---|---|
| p01 | c01 Kiln & Clay × c02 Wick & Wild | Product collaboration | Launch a new product | Hand-thrown reusable vessels ↔ custom-scented soy wax fill | Revenue share 50/50 | **Matched** (in Leads) |
| p02 | c03 Oak & Grain × c04 Northfield Audio | Product collaboration | Launch a new product | Acoustic-grade hardwood enclosures and plinths ↔ speaker and turntable internals | £2,500 prototype run, split 40/60 | Open |
| p03 | c05 Loomhouse × c06 Good Boy Goods | Product collaboration | Reach new customers | Patterned wool/hemp fabric ↔ collars, leads and beds | £800 fabric order + 10% revenue share | Open |
| p04 | c07 Hide & Thread × c08 Nib & Ledger | Product collaboration | Launch a new product | Hand-stitched leather covers ↔ fountain pens and custom-bound notebooks | £1,200 first batch of 50 | Open |
| p05 | c09 Brightframe × c10 Reel North | Service collaboration / Bundle deal | Reach new customers | High-res event portraits ↔ same-day vertical reels | Package from £1,950; 60/40 split | Matched (no chat yet) |
| p06 | c11 Keyhouse × c12 Clear Space | Service collaboration | Reach new customers | Seller referrals and listing photos ↔ decluttering, furniture rental and refresh | £650 per property, referral fee 10% | Open |
| p07 | c13 Forge × c14 Fuel Well | Service collaboration / Bundle deal | Launch a new product | Bespoke 12-week training ↔ weekly meal-prep coaching and metabolic tracking | £780 per client, 50/50 | Open |
| p08 | c15 Studio Lark × c16 True Tone | Service collaboration | Reach new customers | Hair colour and styling ↔ undertone and wardrobe-palette analysis | £245 per session, 55/45 | Open |
| p09 | c17 Tally & Co. × c18 Peopleworks | Service collaboration / Bundle deal | Reach new customers | Payroll and pension setup ↔ contracts and onboarding workflows | £1,400 per startup, 50/50 | Open |

### Proposal cards (shown on Discover / ＋)
- **p01:** Refillable candles in handmade stoneware. Leeds, Ceramics × Home fragrance. *Our vessels, your wax. Customers bring the pot back for a refill instead of buying new glass.*
- **p02:** Handcrafted wooden speakers and turntable plinths. Leeds, Woodworking × Audio. *Small-run enclosures in oak and walnut, tuned for sound as well as looks.*
- **p03:** A sustainable premium pet range. Leeds/Bradford, Textiles × Pet. *Handwoven wool and hemp collars, leads and beds made to last years, not months.*
- **p04:** Modular travel journals. Leeds/Harrogate, Leather × Stationery. *Saddle-stitched covers cut to hold a specific pen, with refillable custom-bound notebooks.*
- **p05:** Photo + reels event package. Leeds, Photography × Content. *Portraits within 48 hours and reels posted on the day, from one booking.*
- **p06:** Market-ready seller tier. Leeds, Property × Staging. *Decluttering, furniture rental and a quick refresh before the listing photos are taken.*
- **p07:** 12-week transformation programme. Leeds, Fitness × Nutrition. *Training built around your week, plus meal-prep coaching from a registered nutritionist.*
- **p08:** Personal image overhaul. Leeds, Hair × Colour analysis. *We match your undertone to your ideal hair colour and a wardrobe palette in one session.*
- **p09:** First-hire package for startups. Leeds, Finance × HR. *Payroll, pensions, contracts and onboarding set up together, so the first hire goes smoothly.*

### "Why this match" panel (example for p01)
- **Company profile:** both are handmade, small-batch Leeds makers. Both are verified.
- **Customer base:** overlapping gift buyers aged 25–45; both sell at Leeds Kirkgate Market makers' days.
- **Cooperation objectives:** both picked *Launch a new product* and *Reduce waste/packaging*.
- **Match strength:** 92%.

Use 78–94% for the other pairs.

---

## Your Network (incoming to demo user)
| From | Proposal | Comment (required) | Actions |
|---|---|---|---|
| c03 Oak & Grain | Serveware set: oak boards with your ceramic dishes | "We think our oak boards and your glazed dishes would make a lovely serving set for the Christmas markets. Fancy it?" | Accept / Reject |
| c12 Clear Space | Stage homes with your planters on loan, with a credit card on display | "We stage around 15 homes a month and buyers always ask where the pottery is from. We'd credit you on every one." | Accept / Reject |
| Saved: c09 Brightframe | – | – | Open profile |

## Leads: demo chat (c01 ↔ c02)
Stored in `src/data/leads.json` (company name, industry and location come from `companies.json`).

Pinned comment from c02: "We love your speckled mugs. Could they hold a 200g pour? We'd love to talk refills."

| From | Message |
|---|---|
| c02 | Hi! We'd love to test a pour in three of your mug sizes. Do you have seconds we could experiment with? |
| c01 | Yes, we've got about 20 seconds from the last firing. Collect from the studio Thursday? |
| c02 | Perfect. We're thinking a rhubarb and fig scent for the first run, about 60 units. |
| c01 | Great. Shall we split 50/50 and sell through both shops? |
| c02 | Works for us. I'll draft a refill card customers can bring back. *(attachment: refill-card-draft.pdf)* |

Thread menu: Unmatch · Mute · Report · Block · Enable notifications.

---

## Reviews (platform-controlled, read-only)
| Company | Stars | Reviewer (company) | Text |
|---|---|---|---|
| c01 | 5 | Clear Space Staging | Reliable, beautiful work, and delivered a week early. |
| c01 | 5 | Wick & Wild Candle Co. | Easy to work with, and clear on costs from day one. |
| c02 | 5 | Kiln & Clay Studio | Brilliant scents and fair on the split. |
| c03 | 5 | Keyhouse Estates | Built bespoke shelving for our office, and it's flawless. |
| c09 | 5 | Reel North Studio | Calm under pressure and great at sharing the shot list. |
| c11 | 4 | Clear Space Staging | Good referrals. Payments are occasionally slow. |
| c14 | 5 | Forge Fitness | Clients love the meal plans. Very professional. |
| c17 | 5 | Peopleworks HR | Made payroll setup painless for our joint clients. |

Each review shows a small **Report review** link.

## AI assistant (demo prompts and replies)
- *"Why did I match with Wick & Wild?"* → Short summary drawn from the "Why this match" panel.
- *"Help me write a comment for Northfield Audio."* → "We hand-make oak and walnut cases and would love to build enclosures for your speakers. Could we send a sample?"
- *"Which proposals near me need ceramics?"* → Lists c12 and c03 with distances.
- Suggested chips: Draft a proposal · Explain my matches · Improve my profile · Safety help

## Monetisation (demo values)
Stored in `src/data/plans.json` (prices in pence, formatted by the app; the Free plan's `limits` set the 3 active proposals and 10 likes a day used across the demo). Change values there and keep this table in step.

| Product | Price | Benefit |
|---|---|---|
| Free | £0 | 3 active proposals, 10 likes a day |
| Boost | £4.99 / 7 days | Shown first in Discover within 10 miles |
| Bond Plus | £14.99 / month | Unlimited likes, see who saved you, "Why this match" detail, priority verification |

## Filter options (Discover / Network)
*How the demo matches them:* a company with no `distanceMiles` is in Leeds and counts as within 5 miles. **Maker** = interests include Product collaborations; **Service provider** = interests include Service collaborations. **Collaboration type** uses the company's proposals. Logged in as another company, Discover shows everyone else in the order above, with c01 last.

- Location: Leeds · Within 5 / 10 / 25 miles
- Industry: all industries above
- Firm size: Micro · SME
- Identity: Verified only · Maker · Service provider
- Collaboration type: Bundle deal · Product collaboration · Service collaboration
