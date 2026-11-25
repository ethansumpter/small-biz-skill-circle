# Bond — App Structure & Screen Layout

> Context for AI agents. Source: LUBS3991 "App function and features" spec (Manvi & Zhuoran Zhang) + hand-drawn wireframes. Visual styling lives in `bond-brand-kit.md`; matching/business logic in `bond-features.md`.

## Product in one line
Bond is a **B2B collaboration-matching phone app** (Hinge-style UX) that matches small businesses on what they *can offer* and what they are *looking for*, so they can run joint promotions, bundles and skill/service swaps.

## Global layout (phone, portrait)
- **Top bar:** one fixed header on **every page**, tabs and pushed screens alike (`AppHeader`, rendered once in the root layout so it never scrolls or moves when you navigate): the atoms logo (36px tall) beside the `BOND` text wordmark on a platinum tile (left); page-specific icons (right; currently only Profile has them). Pushed screens put their own back/title bar underneath it. Filter rows sit just below it and also stay put while the content scrolls.
- **Bottom tab bar, icons only (no text labels; each tab's name is read out by screen readers), in this order:**
  1. **Discover** — one company profile at a time
  2. **Your Network** — incoming proposals/likes
  3. **＋ (centre)** — create a New Proposal (Instagram-style centre button)
  4. **Leads** — chats with matched companies
  5. **Profile** — own profile, purchases, safety, settings
- **AI assistant bubble:** floating, bottom-right, on every screen (above tab bar). A smiley with the **AI sparkle** (see brand kit, *AI mark*) tucked onto its top-right.
- **Hide on scroll:** the tab bar floats over the bottom of every tab (tab content scrolls underneath and pads clear of it). Scrolling down slides it off the bottom; scrolling up, or getting near the top, slides it back (220ms). The AI bubble drops down with it. Switching tabs always shows it. Small scroll jiggles (under 12px) are ignored.
- **iOS 26+:** the tab bar is a liquid glass pill and the floating buttons are glass (see brand kit, *iOS liquid glass*). Other platforms use the solid full-width bar.

## AI assistant
Opened from the floating bubble (every tab) and **Profile → Safety → Help centre and AI assistant**. A chat screen on the root stack (`/assistant`), below the global header with a back bar: *Bond assistant · AI help for your business · Preview*.

**Demo build decisions (not in the spec):**
- **Scripted, not a live model.** Replies are built from the session's demo data (`src/utils/assistant.ts`), so the demo works offline and never says something we can't stand behind. Nothing is sent; the chat resets when closed.
- Opens with a greeting naming the logged-in business, then six **quick-action chips** that stay under the latest reply: *Who should we team up with?* · *Why did we match?* · *Help me write a proposal* · *Plan a joint campaign* · *Analyse our website* · *How is our data used?* Typed questions are matched to the same six by keyword; anything else gets a short "here's what I can help with" reply.
- Replies are a bubble with a lead sentence, labelled sections and, where useful, one link to the next step (Open Discover, Start a proposal, Go to Leads / Message them in Leads).
- **Partners** only suggests firms with a real signal (a shared demo proposal, or one side's *looking for* matching the other's *offer*); never matched or blocked firms.
- **Why did we match** uses the three checks from the spec's "Why this match" panel: company profile, customer base, cooperation objectives. Business names only (privacy rule).
- **Joint campaign** plans a two-week offer with the first matched partner: campaign, social post, email subject, joint offer with a code (`BOND-` + both initials + `10`) and how to measure it (code uses and new customers per business). Both owners approve before anything goes out.
- **Website analysis** shows what the AI matching would infer from the firm's website link (per the matching algorithm in `bond-features.md`).
- A footer note says answers come from demo data and nothing is sent. A short "Thinking…" line shows for 0.7s before each reply.

## 1. Discover
One profile at a time: a swipeable **overview card** (swipe right to like, left to pass) that opens the full profile when tapped. The full profile, top → bottom:
1. **Filter row** (chips): Location, Industry, more…; filter icon at left. *(Demo build: no More… pill; an AI matching pill comes first instead. See below.)* A count of businesses left to see sits under it.
2. **Company details** — name, verification badge/tag, location, firm size, industry. *(Demo build: moved above the offer box.)*
3. **Offer / Looking-for box** — the firm's "I can offer" / "I am looking for" proposal. Overflow (⋮) → Block, Report.
4. **Prompts** (Hinge-style Q&A).
5. **Mini gallery** (image grid).
6. **Proposal block** — pick proposal type: Collaboration interests · Cross-promotion · Product request · Service request (list can be trimmed by firm preferences).
7. **Reviews** — at the very bottom.

**Actions (right side, floating):** Comment bubble · Save for later · ✕ Cross/decline · Send like/proposal.
**Rules:**
- Sending a like/proposal **requires a comment** (short intro, e.g. "Hi, I'm Alex, a photographer. I'd love to work with you!").
- After cross / like / proposal, **auto-advance** to the next profile.
- Data rule: **never show owner names** here — company identity only. (Owner names appear only on your own Profile and in Leads after a match; see `bond-features.md`, privacy rule.)

**Demo build decisions (not in the spec):**
- Filters are single-choice per category. The filter icon opens every category (including Firm size, Identity and Collaboration type, which have no pill of their own), and **Location** and **Industry** open their own. There's no **More…** pill.
- Filter UI (Hinge-style, per the mockup): a bare filter icon with a count badge; unset chips are outlined with a chevron; set chips fill with ink, show the chosen option and an **×** to clear just that filter; **Clear all** appears once two or more are on. Choices apply straight away. The sheet has two levels so it never lists every option at once: the filter icon opens a list of categories (one row each with its current choice, or *Any*); tapping one, or a single-category chip, shows that category's options as a plain list with **Any** first and a tick on the choice. Picking an option from the overview returns to it. The sheet closes with **Show N businesses**, the live result count. Motion (Reanimated): the sheet slides up over a fading backdrop and slides away before closing; levels slide in from the right going in and from the left coming back; chips cross-fade colour and the row reflows as chips change width or **Clear all** appears. With Reduce Motion on, these become fades.
- **AI matching (display only):** the first pill in the filter row (after the filter icon) is the **AI pill**: a round chip with just the AI sparkle (no text), on a powder-blue fill while AI matching is on and outlined when it's off. Screen readers hear *AI matching on/off*. Tapping it opens all filters. The top of that overview has an **AI matching** row: the sparkle in a circle, *AI matching* with *Ranks businesses by how well your offers and needs fit* under it, and a switch (on by default) that the pill follows. It signals that the feed is ranked by the AI matching algorithm (`bond-features.md`). **It does nothing in the demo build:** switching it off doesn't change the feed, and it resets when Discover reloads. Discover only: Your Network's filters and single-category sheets don't show it.
- **Swipe card overview (Tinder/Hinge-style):** Discover shows the top company as a summary card with the next one peeking behind it: logo, name, Verified badge and rating, industry · location · firm size, the offer / looking-for box (3 lines each), up to three interest chips and *Tap to see full profile*. **Swipe right = like, swipe left = pass.** There are no buttons on the overview: you swipe, or tap for the full profile. As you drag, the card washes **green** (right, like) or **red** (left, pass), getting stronger with distance up to 45% at the swipe point (`swipeTint` in `src/theme/tokens.ts`). A drag past 110px (or a quick flick) flies the card off with a slight tilt; shorter drags spring back. Screen readers get *Open full profile*, *Like* and *Pass* actions on the card instead of the gesture. Saving is on the full profile. With Reduce Motion on, cards don't fly or spring. The tab bar doesn't hide on Discover, since the card doesn't scroll.
- **Swiping right still needs a comment:** it opens the like sheet (below) with the card swiped away; sending moves on, closing the sheet brings the card back.
- **Tapping the card** opens `/discover/[id]`: the full Discover card (all of the sections above) under a back header, with a bottom bar of **✕ Pass · Save · Send like** (*Send proposal* once a type is picked). Pass and Block (⋮) go back to Discover's next company. After sending, the bar shows the preview-only confirmation and a **Next business** button.
- The full card's layout follows `docs/discover-section-mockup.png`, with company details moved above the offer box. The **Proposal** box has a numbered list of types (trimmed to the firm's interests). On `/discover/[id]` there's **no comment bubble on the offer box and no 👍 in the Proposal box**: the bottom bar's **Send like / Send proposal** opens the comment sheet. (Your Network's saved-company page still has both, as it has no send bar.) **Reviews** stack vertically, each one the full width of the page.
- Picking a type makes the send a **proposal**. With no type picked it's a **like**. Swiping right, the profile's **Send like / Send proposal** button (and, on Your Network, the comment bubble and 👍) all open the same sheet, and the comment is required. The placeholder follows the mockup's example in business voice ("Hi, we're Kiln & Clay Studio, a ceramics business…"). Sheet layout, top to bottom: avatar + **Send a like/proposal** *to {company}* with a close ×; **Make it a proposal (optional)** type chips (ink when picked, with a tick); the comment field (no separate label; a remaining-characters count appears from 200 of 280); one status line (likes left today, or the error); a single full-width **Send** button. It uses the shared `BottomSheet` (same look and motion as the filter sheet). The "Preview only: nothing is sent" note is on the confirmation toast after sending.
- **Save** (full profile only) toggles and stays on the same company. **Cross** (swipe left), **like** (swipe right), **proposal** and **Block** (⋮) move on to the next company. When everyone has been seen, passed companies can be shown again.
- Free plan: 10 likes a day. Likes, saves and blocks are preview state only. Nothing is delivered, and the confirmation says so.

## 2. Your Network
- Grid of tiles = companies who have **proposed to you** (and items you saved).
- Tap a tile → opens their profile (same layout as Discover) with their **proposal chat bubble** and **Accept / Reject**.
- Filters: Location · Identity · Firm size.

**Demo build decisions (layout per `docs/your-network-section-mockup.png`):**
- Two-column grid in two sections: **Proposed to you** (tiles carry a chat-bubble badge and the proposal title) and **Saved** (bookmark badge). A company that proposed and is also saved shows once, as a proposal.
- Tapping a tile opens `/network/[id]`: the Discover card, with their proposal as a chat bubble at the top and **✕ / Accept** at the bottom. There's no comment bubble or 👍, because you're answering their proposal.
- **Accept** removes it from Your Network, adds a match to Leads with their comment pinned, and opens that chat. **✕** rejects it and goes back. **Block** (⋮) does both and removes the company.
- On a saved company's page, the card keeps the comment bubble and 👍 for sending a like or proposal. The bottom bar is **Remove from saved**.

## 3. ＋ New Proposal
Form to post a collaboration opportunity. **Max 3 active proposals** per account. Fields:
| Field | Examples |
|---|---|
| What are you looking for? | Free-text description of the collaboration |
| Industry / partner type | Photographer, Retail |
| Collaboration type | Bundle deal, Product collab, Service collab |
| Business goal | Reach new customers, Launch a new product |
| Location | Leeds, Within 10 miles |
| Preferred firm size | Micro, SME |
| What we can offer | Social media promotion, Access to our customer base |
| Budget | Amount expected to be paid, Revenue share |
| Requirements | Must operate locally, Must serve similar customer group |

Example card: *Looking for a local café partner — Christmas joint promotion — Leeds, Retail × Hospitality — Budget £500.*

- **Layout (per `docs/new-proposal-section-mockup.png`):** the tab shows **Your proposals** with an *N of 3 active* count, the proposal cards (or a *No proposals yet* card), and one full-width **＋ New proposal** button (dimmed with a note at the limit). The button opens the form on its own page, `/proposals/new`, with a back bar.
- **Form groups:** *The exchange* (What are you looking for? · What can you offer?) and *The collaboration* (Type · Goal) are required and always shown. The five optional fields (partner type, location, firm size, budget, requirements) sit behind **Add more detail**, which shows how many are filled. Picked chips are ink with a tick. **Post proposal** adds it for the session and returns to the tab, which shows a dismissible *Proposal added. Preview only…* note.

## 4. Leads (chats)
- List of matched companies → chat thread. Each row: company name, the owner's full name under it, then the latest message.
- **Thread header:** company logo + name, with the owner's full name first in the line under it (then industry · location) (tap → their profile); ⋮ menu: Unmatch, Mute, Report, Block, Enable notifications.
- Comment bubble (the original proposal note) pinned at top of thread.
- **Composer:** text field, voice/mic, attach images/files.
- **Like a message (demo build, WhatsApp-style):** double-tap a message (double-click on web), yours or theirs, to like it. A ❤️ pops onto the bubble's bottom corner (bottom-right on yours, bottom-left on theirs); double-tap again or tap the heart to remove it. Screen readers get a *Like / Unlike* action on the message. Liking doesn't scroll the chat. Likes are preview state in the provider, kept apart from the messages so the demo panel never saves them to `leads.json`; they reset on reload and nothing is sent.

## 5. Profile
**Header:** the shared top bar shows icons **Preferences** (sliders) and **Settings** (gear). Centre: firm logo/avatar in an ink-coloured ring, with **pencil** badge → Edit profile, the company name beneath it, and the owner's full name (no role) under that.
**Tabs under avatar:** Get More · Safety · Overview.

- **Get More** (in-app purchases): Boost profile (premium visibility) · Premium subscription.
  - *Demo build, following the pricing model ("How Bond creates & captures value"):* two groups. **Plans:** **Free** (*Get matched and start*, with a *Current plan* badge, its limits listed, no price shown) and **Bond Pro** (*Recurring subscription*, **£19.99–£29.99 / month**, its benefits and a **Get Bond Pro** button) on an ink card so it stands out. **Premium add-ons:** **Boosts** (*Profile and proposal boosts*, £4.99 for 7 days each, with **Boost profile** and **Boost a proposal** buttons), **Expert services** (*Optional fractional expert services from Awesome Molecules*, quoted per project, **Talk to an expert**), then any plan added in the demo panel. A footnote reads *Preview only: nothing is charged.* (no pricing disclaimer on screen) Every button shows the "not in the preview" message.
- **Safety:** Verify your business · Block list · Contact company help line · Help centre / AI chatbot · Personal safety · Account & privacy.
- **Overview:** summary of own profile/activity.
- **Edit profile (pencil):** opens `/edit-profile`, a page with every field of the Discover card pre-filled and editable, in the card's order: logo (*Change logo*), **Your offer** (We can offer · We're looking for), **Company details** (company name · your name · industry · location · firm size · interests · verification status), **Prompts**, **Gallery** (tiles, tap to replace), **Links**, and a note that **Reviews** can't be edited. A fixed **Save changes** button (*Done* until something changes). *Demo build:* edits stay on the page and aren't saved; Save says so in a message and goes back, and leaving with edits asks to discard them.
  - Show/hide **toggle** beside each field.
  - **Min 3 gallery images, min 2 prompts** (spec elsewhere says max 3 prompts).
  - Reviews at bottom, read-only, with small **Report review** button.

### Settings (gear)
> **Demo build:** the gear opens `/settings`, which holds only a **Demo panel** button and text saying it is for the demo panel. The demo panel (`/demo-panel`) is an admin tool for the demo, not part of Bond. It has four editors, each a list plus a detail view (side by side on wide screens): **Companies** (every field in sections: Basics, Profile, Images & links, Reviews, Proposals), **Proposals** (the collaboration proposals in `companies.json`: wording, status, type, goal, budget and each partner's contribution) and **Chats** (the Leads chats: pinned comment, mute, and every message with its sender and optional attachment name; chats can be added and deleted, messages added, removed and reordered) and **Plans** (`plans.json`: name, type, price in pounds, billing period, benefits and limits; the Free plan's limits are the ones the demo enforces). Ids (including plan ids), file paths such as `profileImage` and a proposal's `companyIds` are read-only. Edits are applied after a confirmation listing every change, and update the whole app for the session (held in the preview provider). With the dev server running they are also written to `src/data/companies.json`, `src/data/leads.json` and `src/data/plans.json` through the dev-only `/api/demo-companies` route; hosted demos (web on EAS Hosting, EAS Update in Expo Go) have no dev server, so there edits reset on reload and only that viewer sees them. The Chats editor starts from the session's Leads, so saving it keeps any messages sent since the app loaded. Several people can save at once: each save carries the file versions it loaded, and the route refuses (409) if a file changed since, offering **Reload** to re-apply the person's edits on top of the latest data (see `SHARING.md`). A **Build mode** bar under the header shows development or production, where the app is running (web browser, Expo Go, installed app) and where saves go. Plans can be added (id from the name, starting as a £0 monthly subscription) and added plans deleted; Free, Boosts and Bond Pro can't be removed because the app looks them up by id. Profile → Get more shows Free and Bond Pro under Plans, and Boosts, Expert services and any added plans under Premium add-ons. It also has a **Logged in as** dropdown that switches the demo account for the session (held in the preview provider; resets to `demoUserId` on reload). The product settings below are not built yet.

- **Account details:** Email & phone · Company information · Manage subscription · Pause account · Delete account
- **Connected accounts & links:** Company website · LinkedIn · Instagram · Facebook · Google Business Profile
- **Privacy & data:** Privacy preferences · Data-sharing permissions · AI-matching data permissions · Download my data · Delete my data
- **Legal:** Privacy Policy · Terms of Service · Community Guidelines · Cookie Policy

## Reference patterns
Hinge (Discover card, profile tabs, settings lists) and Instagram (centre "+" tab). Borrow interaction patterns only — apply Bond branding.
