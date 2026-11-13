import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * The HTML page around the web build (web only; runs in Node at build/request
 * time, not in the browser). Tuned for phone browsers:
 * - viewport-fit=cover lets safe-area insets (notch, home bar) reach the app.
 * - interactive-widget=resizes-content makes Chrome on Android shrink the page
 *   when the keyboard opens, so inputs at the bottom (chat composer) stay visible.
 * - 100dvh follows the browser's toolbars as they show and hide, so the tab bar
 *   is never hidden behind them.
 * - The page itself never scrolls or bounces; each screen's ScrollView does.
 * Colours match src/theme/tokens.ts (surface, light and dark).
 */
export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();

  return (
    <html lang="en-GB" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F0F3F5" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#231E2B" />
        <meta name="color-scheme" content="light dark" />
        {/* Full-screen when added to the home screen */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Bond" />
        {/* Home-screen icon: the B on Platinum (opaque 180×180, from assets/icon.png; served from public/). */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Lets Chrome/Android offer "Install app" (name, icons, standalone display). */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />

        {/* Stops the page (not the app's ScrollViews) scrolling, so screens behave like native. */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

const css = `
html, body, #root { height: 100%; }
@supports (height: 100dvh) {
  html, body, #root { height: 100dvh; }
}
body {
  background-color: #F0F3F5;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #231E2B; }
}
`;
