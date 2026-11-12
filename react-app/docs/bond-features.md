# Bond — Features, Data Model & Matching Logic

> Context for AI agents. Source: LUBS3991 "App function and features" spec. Screen layout lives in `bond-app-structure.md`; styling in `bond-brand-kit.md`.

## Core value
Fair, equivalent exchange of skills/services between businesses. Matching is driven by **what a firm can offer ↔ what another is looking for**.

## Feature 1 — Business matching
### Company profile (required to use the app)
| Field | Notes |
|---|---|
| Company name + details | Name, location, firm size (Micro / SME), verification status |
| Proprietary details | Identity / company details section |
| Industry | Sector the firm operates in |
| Interests | Collaboration interests, Cross-promotion, Product collaborations, Service collaborations |
| Offer / Looking for | Headline proposal shown first on Discover |
| Mini gallery | Images; min 3 |
| Prompts | Hinge-style; min 2, max 3; optional "friend's take" |
| Reviews / feedback | **Platform-controlled only** — company cannot edit; can report false reviews |
| Links | Website, LinkedIn, Instagram, Facebook, Google Business Profile |
| Visibility toggles | Per-field show/hide |

**Privacy rule:** no owner/personal names on Discover — show the business, not the person.

### Collaboration goal setting
- Both parties select cooperative goals (e.g. *Reach new customers*, *Reduce marketing costs*, *Launch a new product*).
- **Match result → "Why this match"** panel: Company profile · Customer base · Cooperation objectives.
- **Budget & cost sharing:** both parties enter budget and agree allocation (fixed amount or revenue share).

### Proposals
- Created via **＋**; **max 3 active** per firm.
- Structured fields: looking for, partner type, collaboration type, business goal, location/radius, preferred firm size, what we offer, budget, requirements.
- Sending a like/proposal from Discover **requires a short comment**.

## Matching algorithm
Inputs:
1. Profile **Interests** section (+ offer/looking-for and proposal fields).
2. Company **website URL** — AI analyses it to infer offering, audience and fit.

Output: a curated, ranked **Discover** feed. Each card leads with the proposal/interest, then company details. Respect user filters (location, industry, identity, firm size).

## Match lifecycle
```
Discover card → Cross (skip) | Save | Like/Proposal + comment
        ↓ (recipient)
Your Network → Accept | Reject
        ↓ Accept
Leads (chat) → Unmatch | Mute | Report | Block
```

## AI assistant / chatbot
- Floating bubble on every screen; also reachable from Safety → Help centre.
- Roles: help & support, explain matches, help draft proposals/comments, suggest collaborations.
- Uses AI-matching data only with the user's **AI-matching data permission** (Settings → Privacy & data).

## Trust & safety
Business verification · block list · report profiles/reviews/chats · company help line · personal-safety guidance · pause/delete account · download/delete my data (GDPR-style).

## Monetisation
- **Subscription** (premium tier).
- **Boost** — paid premium visibility in others' Discover feeds.
- Value-based monetisation model (details TBD).

## Open questions in the spec
- Prompts: min 2 vs max 3 — treat as 2–3.
- "Overview" tab content undefined.
- Exact pricing / premium perks undefined.
