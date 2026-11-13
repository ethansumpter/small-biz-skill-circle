# Bond — Brand Kit

> Context for AI agents. Source: Bond Brand Kit PDF (colour scheme, typeface, logo, general theme), plus the Bond Design System artifact for derived and semantic tokens. Where they disagree, the Brand Kit PDF wins. Use semantic tokens in UI code; use brand tokens directly only in marketing/illustration.

## Brand
- **Name:** Bond · **Tagline:** "Stronger Together"
- **What it is:** matches small businesses by skills/offers so they can trade expertise and collaborate.
- **Feel:** calm, friendly, trustworthy — "a neighbour who knows a lot of people", not a growth-hacking startup.
- **General theme:** minimalist and futuristic, with a neutral palette. The brand is about **unity and innovation**: think Star Trek (optimistic, clean, collaborative), not Blade Runner (dark, gritty, neon).

## Colour
### Brand palette (60 / 30 / 20)
| Token | Hex | Share | Role |
|---|---|---|---|
| `--platinum` | `#F0F3F5` | 60% | Page ground; text on grape |
| `--vintage-grape` | `#544A63` | 30% | Text, headings, logo and wordmark, dark panels, primary buttons |
| `--powder-blue` | `#A2B2D8` | 20% | Highlights, chips, selected states, logo orbits, illustration |

These three are the whole brand palette. *(The Brand Kit lists 60 / 30 / 20, which sums to 110%; read it as dominant / secondary / accent rather than exact shares.)*

Navy (`#212445`) is no longer a brand colour: the new logo and wordmark are grape. Don't reintroduce navy.

### Derived
| Token | Hex | Use |
|---|---|---|
| `--grape-deep` | `#2E2838` | Text on powder-blue fills (6.7:1) |
| `--link` (light) | `#4A5A8A` | Links/inline actions on platinum (6.0:1) |
| `--surface` (dark) | `#231E2B` | Dark-mode page ground |
| `overlay.scrim` | grape-deep at 40% | Backdrop behind bottom sheets and menus |
| `overlay.shadow` | grape-deep at 15%, `0 2px 8px` | Shadow on floating buttons (AI assistant, Discover rail) |

Tint scrims and shadows with grape-deep, never navy or black.

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
The Brand Kit shows all six pairings of the three colours at every weight. In the app, use them within these limits:

| Pairing | Ratio | Use |
|---|---|---|
| Grape text on Platinum / Platinum text on Grape | 7.4 | ✅ Any text, any weight |
| Grape-deep text on Powder Blue | 6.7 | ✅ Any text (use for small text on blue fills) |
| Grape text on Powder Blue / Powder Blue text on Grape | 3.9 | ⚠️ Large or bold only (24px+, or 18.5px+ bold). Powder Blue on Grape: Bold (700)+ |
| Powder Blue text on Platinum / Platinum text on Powder Blue | 1.9 | ❌ Never for text people must read; decorative or logo use only |

- Thin / Extra Light / Light weights only on the Grape↔Platinum pairings.

## Typography — Lexend only
The Brand Kit uses one typeface across all nine weights: Thin (100), Extra Light (200), Light (300), Standard (400), Medium (500), Semi Bold (600), Bold (700), Extra Bold (800), Black (900).

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

- Thin (100) / Extra Light (200) only at ≥32px. Black (900) for posters and big display moments.
- The logo wordmark ("ond" after the B) is a regular weight, so don't set "Bond" in Black next to the logo.
- Powder-blue text on grape → use Bold (700)+.

## Spacing & shape
- 4px base: `--space-2` 8 (in chips/buttons) · `--space-4` 16 (card padding, phone gutter) · `--space-6` 24 (between cards) · `--space-12` 48 (between sections).
- Radius: `--radius-sm` 6 (inputs, small badges) · `--radius-md` 12 (cards, dialogs, buttons) · `--radius-full` (skill chips, avatars, match circles).
- Motif: **circles/pills for people, skills and matches** — two overlapping circles = a match.

## iOS liquid glass
- **iOS 26+ only** (`expo-glass-effect`, wrapped in `src/components/glass.tsx`). Android, web, older iOS and iOS with *Reduce Transparency* on keep the solid surfaces above.
- **Where:** the footer tab bar (a floating pill of untinted glass) and the floating buttons: AI assistant bubble and the Discover save/cross rail (saved = powder-blue tint; the two blend as one group). Nothing else uses glass, and glass never sits on glass: the centre ＋ inside the bar is a solid powder-blue circle (ink ring when selected), and the selected tab gets a faint ink wash instead of the solid powder-blue pill.
- Give glass shapes an exact corner radius (half the height), not `radius.full`; glass doesn't draw true circles from 999.
- Icons and labels on glass keep their normal ink / ink-muted tokens.
- Never fade glass (opacity below 1 stops it rendering); buttons shrink slightly on press instead.

## Logo
The two stacked atoms stand for the two SMEs. The electron on the top orbit is what makes it an atom, and it's what makes the bond. Drawn in grape (outline, nuclei) and powder blue (orbits, electron), with gradient orbits.

All files are 2000×2000 transparent PNGs in `assets/logo/` (full-size originals are in the Teams chat).

| File | Contents | Use |
|---|---|---|
| `bond-logo-wordmark.png` | B outline with the two atoms inside, followed by "ond" | Full logo: splash, onboarding, marketing, anywhere the name isn't set nearby. Sits left of centre in its square. |
| `bond-logo-b.png` | B outline with the two atoms inside, no text | Primary mark: **Expo app icon**, favicon, avatars, small square spaces |
| `bond-logo-atoms.png` | The two atoms only, no B outline | Decorative or illustrative use, loading states, places where the B would repeat a nearby "Bond" |

### App icon
- Use `bond-logo-b.png` on a solid Platinum (`#F0F3F5`) background.
- iOS needs an opaque 1024×1024 PNG (no transparency), so flatten the mark onto Platinum.
- Android adaptive icon: the B as the foreground, kept inside the central safe zone (about 66% of the canvas), with a Platinum background; monochrome version in a single colour.
- Favicon and splash use the same mark.
- Generated from `bond-logo-b.png` (wired up in `app.json`):

| File | Size | Contents |
|---|---|---|
| `assets/icon.png` | 1024×1024, opaque | B at 68% height on Platinum |
| `assets/android-icon-foreground.png` | 1024×1024, transparent | B at 55% height (inside safe zone) |
| `assets/android-icon-background.png` | 1024×1024, opaque | Solid Platinum (`adaptiveIcon.backgroundColor` is `#F0F3F5` too) |
| `assets/android-icon-monochrome.png` | 1024×1024, transparent | B silhouette in white, 55% height |
| `assets/favicon.png` | 48×48, opaque | B on Platinum |
| `public/apple-touch-icon.png` | 180×180, opaque | B on Platinum (scaled from `icon.png`); web home-screen icon, linked in `src/app/+html.tsx` |
| `public/icon-192.png`, `public/icon-512.png` | 192×192, 512×512, opaque | B on Platinum (scaled from `icon.png`); web app icons for Chrome/Android install, listed in `public/manifest.webmanifest` |
| `assets/splash-icon.png` | 1024×1024, transparent | B at 90% height. Splash via the `expo-splash-screen` plugin in `app.json` (200pt wide, Platinum background); held until Lexend loads in `src/app/_layout.tsx` |

### Rules
- Don't redraw, recolour, stretch or add effects. Keep the gradients as drawn.
- Light grounds only (white or platinum). On dark grounds, place the logo on a platinum tile; no dark version exists yet.
- The fine orbit and nucleus detail disappears below about 32px; at very small sizes prefer the B mark over the full wordmark.
- In the app header, use the atoms (`bond-logo-atoms.png`, cropped to `assets/logo/bond-logo-atoms-header.png`) at 36px tall, left of the `BOND` text wordmark in grape, together on a platinum tile (`BondLogo` in `src/components/bond-logo.tsx`). Atoms rather than the B, so the B isn't repeated. Don't go smaller: the orbit detail is lost below about 32px.
- The Your Network tab icon (`ConnectionIcon`, two overlapping circles) is a UI icon, not the logo; the atoms lose their detail at tab-icon size.

## Voice
- Plain, warm, specific — like a helpful neighbour. e.g. "Trade an hour of design for an hour of bookkeeping."
- Lean into unity and innovation: businesses getting further together, framed hopefully. Optimistic about the future, never dystopian or edgy.
- Name the skill and the business, not the feature.
- No hype, no urgency, no emoji.
