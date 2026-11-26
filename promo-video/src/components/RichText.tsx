import { Easing, interpolate, useCurrentFrame } from 'remotion';

export const POWDER = '#A2B2D8';
export const GRAPE_DEEP = '#2E2838';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

type Token = { text: string; mark: boolean; suffix?: string } | 'break';

/** `"Your [ceramic mugs].|Their [scented wax]."`: [..] is emphasised, | is a line break. */
const tokenize = (text: string): Token[] =>
  text.split('|').flatMap((line, li) => {
    const tokens: Token[] = li > 0 ? ['break'] : [];
    for (const part of line.split(/(\[[^\]]+\])/)) {
      if (!part) continue;
      if (part.startsWith('[')) {
        tokens.push({ text: part.slice(1, -1), mark: true });
        continue;
      }
      const words = part.split(' ');
      const prev = tokens[tokens.length - 1];
      // Punctuation straight after a phrase ("[wax].") stays attached to it, outside the pill.
      if (words[0] && prev && prev !== 'break' && prev.mark) prev.suffix = words.shift();
      for (const w of words) if (w) tokens.push({ text: w, mark: false });
    }
    return tokens;
  });

/**
 * Text whose words rise in one by one (blur to sharp). Emphasised phrases get
 * a powder-blue pill that sweeps in behind them once they land, with
 * grape-deep text for contrast (6.7:1, docs/bond-brand-kit.md).
 */
export const RichText = ({
  text,
  delay = 0,
  stagger = 3,
  markLag = 8,
}: {
  readonly text: string;
  /** Frame the first word starts. */
  readonly delay?: number;
  /** Frames between words. */
  readonly stagger?: number;
  /** Frames after an emphasised phrase appears before its pill sweeps in. */
  readonly markLag?: number;
}) => {
  const frame = useCurrentFrame();
  let i = 0;
  return (
    <>
      {tokenize(text).map((t, k) => {
        if (t === 'break') return <br key={k} />;
        const start = delay + i++ * stagger;
        const word = {
          display: 'inline-block',
          opacity: interpolate(frame, [start, start + 10], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [start, start + 18], [0.5, 0], { ...clamp, easing: out })}em`,
          filter: `blur(${interpolate(frame, [start, start + 12], [10, 0], clamp)}px)`,
        } as const;
        const space = <span key={`${k}s`}> </span>;
        if (!t.mark) return [<span key={k} style={word}>{t.text}</span>, space];

        const m = start + markLag;
        const sweep = interpolate(frame, [m, m + 14], [0, 1], { ...clamp, easing: out });
        const pop = interpolate(frame, [m, m + 6, m + 16], [1, 1.07, 1], clamp);
        return [
          <span key={k} style={{ ...word, scale: pop, margin: '0 -0.08em' }}>
            <span style={{ position: 'relative', display: 'inline-block', padding: '0 0.16em' }}>
              <span
                style={{
                  position: 'absolute',
                  inset: '0.08em 0',
                  borderRadius: 999,
                  background: POWDER,
                  scale: `${sweep} 1`,
                  transformOrigin: 'left center',
                }}
              />
              <span style={{ position: 'relative', color: sweep > 0.4 ? GRAPE_DEEP : undefined }}>{t.text}</span>
            </span>
            {t.suffix ? <span style={{ marginLeft: '0.04em' }}>{t.suffix}</span> : null}
          </span>,
          space,
        ];
      })}
    </>
  );
};
