# Bond promo video (Remotion)

A Remotion project that renders Bond's promo video. It's separate from the
Lovable web app (repo root) and the Expo app (`../react-app`). See
[README.md](README.md) for the scene list, code layout and commands.

## Remotion skills

Install the Remotion agent skills before working here:

```bash
npx -y skills@latest add remotion-dev/skills -g -y
```

Then follow the `remotion-best-practices` skill. It routes to the others, such
as markup, transitions, render and studio. Docs: https://www.remotion.dev/docs

## Rules

- Drive every animation from `useCurrentFrame()` with `interpolate()` / `Easing`.
  CSS transitions, CSS animations and `Math.random()` don't render correctly.
- Add `@remotion/*` packages with `npx remotion add <package>` so versions match.
- Keep `durationInFrames` in `src/Root.tsx` equal to the sum of the scene
  lengths in `src/BondPromo.tsx` minus each transition's length. The comment in
  `Root.tsx` shows the sum.
- Brand: follow `../react-app/docs/bond-brand-kit.md`.
  - Use a flat Platinum `#F0F3F5` background with no gradients or glows. It must
    match the screenshots' own background, so the cropped chat bubbles blend in.
  - Use Lexend only and Grape `#544A63` text.
  - Highlights are a powder-blue pill with grape-deep text.
  - Green and red are only for the Pass/Like reactions in the swipe scene.
- Don't invent app features. On-screen claims and labels should match what the
  app does, as described in `../react-app/docs/`.
- The app screenshots come from `../react-app/assets/app-screenshots`. Copy them
  into `public/screens/` as 8-bit PNGs rather than referencing them across folders.
- Check visual changes by rendering stills
  (`npx remotion still BondPromo <file> --frame=<n>`) before rendering the whole video.
- Typecheck with `npx tsc --noEmit` before declaring a change done.
- `out/` is gitignored, so don't commit rendered videos.
