# Bond — App Structure & Screen Layout

> Context for AI agents. Source: LUBS3991 "App function and features" spec (Manvi & Zhuoran Zhang) + hand-drawn wireframes. Visual styling lives in `bond-brand-kit.md`; matching/business logic in `bond-features.md`.

## Product in one line
Bond is a **B2B collaboration-matching phone app** (Hinge-style UX) that matches small businesses on what they *can offer* and what they are *looking for*, so they can run joint promotions, bundles and skill/service swaps.

## Global layout (phone, portrait)
- **Top bar:** `BOND` logo (left); screen-specific icons (right).
- **Bottom tab bar, in this order:**
  1. **Discover** — one company profile at a time
  2. **Your Network** — incoming proposals/likes
  3. **＋ (centre)** — create a New Proposal (Instagram-style centre button)
  4. **Leads** — chats with matched companies
  5. **Profile** — own profile, purchases, safety, settings
- **AI assistant bubble:** floating, bottom-right, on every screen (above tab bar).

## 1. Discover
Vertical scroll card showing **one profile at a time**. Top → bottom:
1. **Filter row** (chips): Location, Industry, more…; filter icon at left.
2. **Offer / Looking-for box** — the firm's "I can offer" / "I am looking for" proposal. Always shown first. Overflow (⋮) → Block, Report.
3. **Company details** — name, verification badge/tag, location, firm size, industry.
4. **Prompts** (Hinge-style Q&A).
5. **Mini gallery** (image grid).
6. **Proposal block** — pick proposal type: Collaboration interests · Cross-promotion · Product request · Service request (list can be trimmed by firm preferences).
7. **Reviews** — at the very bottom.

**Actions (right side, floating):** Comment bubble · Save for later · ✕ Cross/decline · Send like/proposal.
**Rules:**
- Sending a like/proposal **requires a comment** (short intro, e.g. "Hi, I'm Alex, a photographer. I'd love to work with you!").
- After cross / like / proposal, **auto-advance** to the next profile.
- Data rule: **never show owner names** — company identity only.

**Demo build decisions (not in the spec):**
- Filters are single-choice per category. The filter icon opens every category, **Location** and **Industry** open their own, and **More…** opens Firm size, Identity and Collaboration type.
- Layout follows `docs/discover-section-mockup.png`. The **comment bubble** sits on the offer box next to ⋯. The **Proposal** box has a numbered list of types (trimmed to the firm's interests) and a 👍 button that sends. Only **save** and **cross** float on the right, above the AI bubble. Reviews sit side by side and scroll sideways.
- Picking a type makes the send a **proposal**. With no type picked it's a **like**. The comment bubble and 👍 open the same sheet, and the comment is required. The placeholder follows the mockup's example in business voice ("Hi, we're Kiln & Clay Studio, a ceramics business…").
- **Save** toggles and stays on the same company. **Cross**, **like**, **proposal** and **Block** (⋮) move on to the next company. When everyone has been seen, passed companies can be shown again.
- Free plan: 10 likes a day. Likes, saves and blocks are preview state only. Nothing is delivered, and the confirmation says so.

## 2. Your Network
- Grid of tiles = companies who have **proposed to you** (and items you saved).
- Tap a tile → opens their profile (same layout as Discover) with their **proposal chat bubble** and **Accept / Reject**.
- Filters: Location · Identity · Firm size.

**Demo build decisions (layout per `docs/your-network-section-mockup.png`):**
- Two-column grid in two sections: **Proposed to you** (tiles carry a chat-bubble badge and the proposal title) and **Saved** (bookmark badge). A company that proposed and is also saved shows once, as a proposal.
- Tapping a tile opens `/network/[id]`: the Discover card, with their proposal as a chat bubble at the top and **✕ / Accept** at the bottom. There's no comment bubble or 👍, because you're answering their proposal.
- **Accept** removes it from Your Network, adds a match to Leads with their comment pinned, and opens that chat. **✕** rejects it and goes back. **Block** (⋮) does both and removes the company.
- On a saved company's page, the card keeps Discover's comment bubble and 👍 for sending a like or proposal. The bottom bar is **Remove from saved**.

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

## 4. Leads (chats)
- List of matched companies → chat thread.
- **Thread header:** company logo + name (tap → their profile); ⋮ menu: Unmatch, Mute, Report, Block, Enable notifications.
- Comment bubble (the original proposal note) pinned at top of thread.
- **Composer:** text field, voice/mic, attach images/files.

## 5. Profile
**Header:** `BOND` logo; top-right icons **Preferences** (sliders) and **Settings** (gear). Centre: firm logo/avatar with **pencil** badge → Edit profile.
**Tabs under avatar:** Get More · Safety · Overview.

- **Get More** (in-app purchases): Boost profile (premium visibility) · Premium subscription.
- **Safety:** Verify your business · Block list · Contact company help line · Help centre / AI chatbot · Personal safety · Account & privacy.
- **Overview:** summary of own profile/activity.
- **Edit profile (pencil):** looks **identical to the Discover card** but every field editable / empty to fill.
  - Show/hide **toggle** beside each field.
  - **Min 3 gallery images, min 2 prompts** (spec elsewhere says max 3 prompts).
  - Reviews at bottom, read-only, with small **Report review** button.

### Settings (gear)
> **Demo build:** the gear opens `/settings`, which holds only a **Demo panel** button and text saying it is for the demo panel. The demo panel (`/demo-panel`) is an admin tool for the demo, not part of Bond: it lists every demo company, lets anyone edit any field (except `id`), and writes the result to `src/data/companies.json` through the dev-only `/api/demo-companies` route after a confirmation listing every change. It also has a **Logged in as** dropdown that switches the demo account for the session (held in the preview provider; resets to `demoUserId` on reload). The product settings below are not built yet.

- **Account details:** Email & phone · Company information · Manage subscription · Pause account · Delete account
- **Connected accounts & links:** Company website · LinkedIn · Instagram · Facebook · Google Business Profile
- **Privacy & data:** Privacy preferences · Data-sharing permissions · AI-matching data permissions · Download my data · Delete my data
- **Legal:** Privacy Policy · Terms of Service · Community Guidelines · Cookie Policy

## Reference patterns
Hinge (Discover card, profile tabs, settings lists) and Instagram (centre "+" tab). Borrow interaction patterns only — apply Bond branding.
