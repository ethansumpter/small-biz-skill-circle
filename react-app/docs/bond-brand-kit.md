# Bond — Brand Kit

> Context for AI agents. Source: Bond Design System artifact (tokens.css / tokens.json / README). Use semantic tokens in UI code; use brand tokens directly only in marketing/illustration.

## Brand
- **Name:** Bond (formerly Swapkit) · **Tagline:** "Stronger Together"
- **What it is:** matches small businesses by skills/offers so they can trade expertise and collaborate.
- **Feel:** calm, friendly, trustworthy — "a neighbour who knows a lot of people", not a growth-hacking startup.

## Colour
### Brand palette (60 / 30 / 20)
| Token | Hex | Share | Role |
|---|---|---|---|
| `--platinum` | `#F0F3F5` | 60% | Page ground; text on grape |
| `--vintage-grape` | `#544A63` | 30% | Text, headings, dark panels, primary buttons |
| `--powder-blue` | `#A2B2D8` | 20% | Highlights, chips, selected states, illustration |
| `--navy` | `#212445` | — | Logo wordmark; headlines that must match the logo |

*(Design-system README table lists 25% / 15%; tokens say 30% / 20%. Treat as approximate.)*

### Derived
| Token | Hex | Use |
|---|---|---|
| `--grape-deep` | `#2E2838` | Text on powder-blue fills (6.7:1) |
| `--link` (light) | `#4A5A8A` | Links/inline actions on platinum (6.0:1) |
| `--surface` (dark) | `#231E2B` | Dark-mode page ground |

### Semantic tokens (use these in UI)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface` | `#F0F3F5` | `#231E2B` | Page background |
| `--surface-raised` | `#FFFFFF` | `#544A63` | Cards, dialogs, menus |
| `--ink` | `#544A63` | `#F0F3F5` | Primary text |
| `--ink-muted` | `#6B6378` | `#C6C2D0` | Secondary text, metadata |
| `--accent` | `#A2B2D8` | `#A2B2D8` | Highlight fills, badges, selected chips |
| `--on-accent` | `#2E2838` | `#2E2838` | Text/icons on accent |
| `--link` / `--focus-ring` | `#4A5A8A` | `#A2B2D8` | Links; 2px focus outline |
| `--line` | `#D5D9E2` | `#3D3549` | Dividers, input borders (never text) |

Dark mode: `data-theme="dark"` on the page wrapper.

### Contrast rules (WCAG 2.1)
- ✅ Any text: Grape↔Platinum (7.4), Navy on Platinum (13.4), Navy on Powder Blue (7.1), Grape-deep on Powder Blue (6.7).
- ⚠️ Large/bold only (24px+ or 18.5px bold): Powder Blue on Grape, Grape on Powder Blue (3.9).
- ❌ Never text: Powder Blue↔Platinum (1.9), Navy on Grape (1.8).
- Thin/Extra-Light/Light weights only on Grape/Platinum pairings.

## Typography — Lexend only
`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap">`
Stack: `"Lexend", ui-sans-serif, system-ui, sans-serif`

| Style | Weight | Size / line | Use |
|---|---|---|---|
| display | 600 | 40/48, -0.01em | Page titles, hero |
| heading | 600 | 24/32 | Section headings |
| subheading | 500 | 18/26 | Card titles, skill swaps |
| body | 400 | 16/24 | Running text |
| label | 500 | 14/20 | Buttons, chips, form labels |
| caption | 400 | 12/16, 0.02em | Metadata (ink/ink-muted only) |

- Thin (100) / Extra Light (200) only at ≥32px. Black (900) for logotype/posters.
- Powder-blue text on grape → use Bold (700)+.

## Spacing & shape
- 4px base: `--space-2` 8 (in chips/buttons) · `--space-4` 16 (card padding, phone gutter) · `--space-6` 24 (between cards) · `--space-12` 48 (between sections).
- Radius: `--radius-sm` 6 (inputs, small badges) · `--radius-md` 12 (cards, dialogs, buttons) · `--radius-full` (skill chips, avatars, match circles).
- Motif: **circles/pills for people, skills and matches** — two overlapping circles = a match.

## Logo
- `bond-logo.png` — two overlapping rings with orbiting dots + "Bond" wordmark (navy) + "Stronger Together". 1560×672, on white.
- `bond-mark.png` — rings only, transparent. 637×372. Use where space is tight or name is set separately.
- Rules: don't redraw/recolour; light grounds only (white/platinum). On dark grounds, place the mark on a platinum tile — no dark version exists yet.

## Voice
- Plain, warm, specific — like a helpful neighbour. e.g. "Trade an hour of design for an hour of bookkeeping."
- Name the skill and the business, not the feature.
- No hype, no urgency, no emoji.
