# Bond promo video

A 42-second promo video for Bond, the mobile app in [`../react-app`](../react-app),
built with [Remotion](https://www.remotion.dev/docs) (React components rendered
to video). The app screenshots are shown in an iPhone 17 Pro frame.

- **Output:** 1920×1080, 30 fps, MP4, silent (no music track yet)
- **Composition ID:** `BondPromo`
- **Storyboard:** follows the 12 reference frames in
  [`../react-app/assets/video-example-shots`](../react-app/assets/video-example-shots)

## Commands

Run these from this folder.

| Command | What it does |
| --- | --- |
| `npm i` | Install dependencies |
| `npm run dev` | Open Remotion Studio to preview, scrub and edit the video |
| `npx remotion render BondPromo out/bond-promo.mp4` | Render the video (about 1 minute) |
| `npx remotion still BondPromo out/frame.png --frame=150` | Render one frame as an image |
| `npx tsc --noEmit` | Typecheck |

`out/` is gitignored, so share a rendered video by sending the file, not by
committing it.

## Scenes

| # | Scene | Screenshot(s) | Transition out |
| --- | --- | --- | --- |
| 1 | Hook: app icon, "Bond", "Stronger Together" | none | Circles |
| 2 | Find a local business partner | 0157 | Slide |
| 3 | Swipe through local businesses (touch dot, Pass then Like) | 0157 → 0159 → 0157 → 0158 | Slide |
| 4 | Find the perfect match (AI filters, then the profile) | 0165 → 0160 | Zoom |
| 5 | "They make candles. They need quality containers." | offer card cropped from 0160 | Circles |
| 6 | "Your ceramic mugs. Their scented wax." + both logos overlapping | company logos | Slide |
| 7 | "AI that plans, then acts for you" + plan → review → goes live steps | 0162 | Slide |
| 8 | Pitch a collaboration (proposal sheet, tap Send) | 0160 → 0169 | Slide |
| 9 | Plan the first product drop | 0161 | Zoom |
| 10 | "One batch. Two shopfronts." chat bubbles | bubbles cropped from 0161 | Slide |
| 11 | Every great collab starts here (three phones) | 0166, 0161, 0171 | Circles |
| 12 | CTA: app icon, "Bond", "Find your perfect business collab" | none | — |

## Code layout

```
src/
├── Root.tsx               # Registers the BondPromo composition (total duration lives here)
├── BondPromo.tsx          # The timeline: scene order, durations, transitions, per-scene decor
├── transitions.tsx        # Custom transitions: circlesReveal (two merging circles), zoomThrough
├── fonts.ts               # Loads Lexend 400–700 from public/fonts
└── components/
    ├── IPhone17Pro.tsx    # The phone frame, drawn in CSS (no image)
    ├── Screen.tsx         # A screenshot inside the phone, with optional cross-fade in
    ├── Scenes.tsx         # Scene layouts: PhoneScene, BrandScene, close-ups, statement, trio
    ├── RichText.tsx       # Word-by-word text reveal with highlighted phrases
    └── Decor.tsx          # Chips, sparkles, pulse rings, touch dot, tap, Pass/Like, agent steps
public/
├── screens/               # The 10 app screenshots (8-bit copies of react-app/assets/app-screenshots)
├── crops/                 # Offer card and chat bubbles cut from screenshots; company logos
├── logo/app-icon.png      # Copy of react-app/assets/icon.png
└── fonts/                 # Lexend TTFs from react-app's @expo-google-fonts/lexend
```

## Editing

- **Text:** headlines use a small markup. `[words]` get a powder-blue highlight
  and `|` starts a new line, e.g. `"They make [candles].|They need [quality containers]."`.
  Edit them in `BondPromo.tsx`, `Scenes.tsx`, or live in Studio.
- **Timing:** each scene's `durationInFrames` is set in `BondPromo.tsx`. If you
  change a scene's length or add a transition, update `durationInFrames` in
  `Root.tsx`. It equals the sum of the scene lengths minus each transition's
  length, because transitions overlap the scenes either side.
- **Timing inside a scene:** frame numbers like `at={30}` and `fadeInAt={26}` count
  from the start of that scene.
- **New screenshots:** take them on a device with a 1170×2532 screen, or one with
  the same aspect ratio. Copy them into `public/screens/` as 8-bit PNGs, because
  16-bit PNGs from the phone are larger and slower to render.
- **Brand:** follow [`../react-app/docs/bond-brand-kit.md`](../react-app/docs/bond-brand-kit.md).
  Use a flat Platinum (`#F0F3F5`) background so it matches the screenshots, Lexend
  only, and Grape (`#544A63`) text. Highlighted text is grape-deep on powder blue.

## Licence

Remotion is free for individuals and companies of up to 3 people. Larger
companies need a [company licence](https://www.remotion.dev/docs/license).
