import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';

type NoProps = Record<string, never>;

/**
 * Two overlapping circles grow from the centre and merge to reveal the next
 * scene: Bond's "two circles = a match" motif as a transition.
 */
const CirclesReveal = ({ children, presentationDirection, presentationProgress: p }: TransitionPresentationComponentProps<NoProps>) => {
  if (presentationDirection === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = p * 1250;
  const d = (1 - p) * 150; // circles start apart and slide together
  const mask = [-d, d]
    .map((dx) => `radial-gradient(circle ${r}px at calc(50% + ${dx}px) 50%, #000 calc(100% - 1px), transparent 100%)`)
    .join(', ');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>{children}</AbsoluteFill>
      {/* Powder-blue rim on each circle's edge */}
      {[-d, d].map((dx) => (
        <div
          key={dx}
          style={{
            position: 'absolute',
            left: 960 + dx - r,
            top: 540 - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: '6px solid rgba(162,178,216,0.9)',
            opacity: 1 - p,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const circlesReveal = (): TransitionPresentation<NoProps> => ({ component: CirclesReveal, props: {} });

/** The outgoing scene pushes towards the viewer while the next settles in. */
const ZoomThrough = ({ children, presentationDirection, presentationProgress: p }: TransitionPresentationComponentProps<NoProps>) => {
  const exiting = presentationDirection === 'exiting';
  return (
    <AbsoluteFill
      style={{
        scale: exiting ? 1 + p * 0.35 : 0.86 + p * 0.14,
        opacity: exiting ? 1 - p : p,
        filter: `blur(${exiting ? p * 14 : (1 - p) * 10}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomThrough = (): TransitionPresentation<NoProps> => ({ component: ZoomThrough, props: {} });
