import type React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

import { FONT } from '../fonts';
import { GRAPE_DEEP, POWDER } from './RichText';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const GRAPE = '#544A63';

/** Pops in (overshoot) at `at`. */
const usePop = (at: number) => {
  const frame = useCurrentFrame();
  return {
    scale: interpolate(frame, [at, at + 16], [0.4, 1], { ...clamp, easing: Easing.spring({ damping: 11 }) }),
    opacity: interpolate(frame, [at, at + 6], [0, 1], clamp),
  };
};

/** Floating pill beside the phone, e.g. a filter or a detail from the chat. */
export const Chip = ({
  at,
  x,
  y,
  children,
  icon,
  accent,
}: {
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  /** Powder-blue fill instead of white. */
  readonly accent?: boolean;
}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  // Gentle bob once it has landed.
  const bob = Math.sin((frame - at) / 14) * 6;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + (frame > at ? bob : 0),
        translate: '-50% -50%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '18px 30px',
        borderRadius: 999,
        background: accent ? POWDER : '#FFFFFF',
        color: accent ? GRAPE_DEEP : GRAPE,
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 34,
        whiteSpace: 'nowrap',
        boxShadow: '0 18px 40px rgba(46,40,56,0.14), 0 4px 10px rgba(46,40,56,0.08)',
        ...pop,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

/** Bond's AI mark: a four-point sparkle. */
export const SparkleIcon = ({ size, color = '#4A5A8A' }: { readonly size: number; readonly color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path d="M12 1 C12.8 7.5 16.5 11.2 23 12 C16.5 12.8 12.8 16.5 12 23 C11.2 16.5 7.5 12.8 1 12 C7.5 11.2 11.2 7.5 12 1 Z" fill={color} />
  </svg>
);

/** A sparkle that pops in at `at`, then slowly twinkles and turns. */
export const Twinkle = ({ at, x, y, size, color }: { readonly at: number; readonly x: number; readonly y: number; readonly size: number; readonly color?: string }) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  const t = (frame - at) / 9;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: '-50% -50%',
        opacity: pop.opacity * (frame > at + 16 ? 0.75 + 0.25 * Math.sin(t) : 1),
        scale: pop.scale * (frame > at + 16 ? 1 + 0.12 * Math.sin(t) : 1),
        rotate: `${interpolate(frame, [at, at + 120], [-30, 30])}deg`,
      }}
    >
      <SparkleIcon size={size} color={color} />
    </div>
  );
};

/**
 * Two overlapping rings that expand and fade behind something, looping every
 * `period` frames: the match motif as a pulse.
 */
export const PulseRings = ({ x, y, size, start = 0, period = 50 }: { readonly x: number; readonly y: number; readonly size: number; readonly start?: number; readonly period?: number }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <>
      {[0, 0.5].map((phase) =>
        [-1, 1].map((side) => {
          const p = (((frame - start) / period + phase) % 1 + 1) % 1;
          return (
            <div
              key={`${phase}${side}`}
              style={{
                position: 'absolute',
                left: x + side * size * 0.14,
                top: y,
                width: size,
                height: size,
                translate: '-50% -50%',
                borderRadius: '50%',
                border: `4px solid ${POWDER}`,
                scale: 0.55 + p * 0.75,
                opacity: (1 - p) * 0.55,
              }}
            />
          );
        }),
      )}
    </>
  );
};

/** A fingertip on the screen. Positions are % of the display. */
export const TouchDot = ({
  frames,
  xs,
  ys,
  show,
  hide,
}: {
  readonly frames: number[];
  readonly xs: number[];
  readonly ys: number[];
  readonly show: number;
  readonly hide: number;
}) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${interpolate(frame, frames, xs, { ...clamp, easing: ease })}%`,
        top: `${interpolate(frame, frames, ys, { ...clamp, easing: ease })}%`,
        width: 64,
        height: 64,
        translate: '-50% -50%',
        borderRadius: '50%',
        background: 'rgba(46,40,56,0.28)',
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: '0 6px 16px rgba(46,40,56,0.25)',
        opacity: interpolate(frame, [show, show + 6, hide, hide + 6], [0, 1, 1, 0], clamp),
        scale: interpolate(frame, [show, show + 8], [1.6, 1], clamp),
      }}
    />
  );
};

/** A tap: dot plus a ripple ring, at % of the display. */
export const Tap = ({ at, x, y }: { readonly at: number; readonly x: number; readonly y: number }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 0, height: 0 }}>
      <div
        style={{
          position: 'absolute',
          width: 64,
          height: 64,
          translate: '-50% -50%',
          borderRadius: '50%',
          background: 'rgba(46,40,56,0.28)',
          border: '3px solid rgba(255,255,255,0.9)',
          opacity: interpolate(frame, [at - 8, at - 2, at + 10, at + 16], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [at - 8, at, at + 4], [1.4, 0.85, 1], clamp),
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 64,
          height: 64,
          translate: '-50% -50%',
          borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.95)',
          opacity: interpolate(frame, [at, at + 16], [1, 0], clamp),
          scale: interpolate(frame, [at, at + 16], [1, 3], { ...clamp, easing: Easing.out(Easing.quad) }),
        }}
      />
    </div>
  );
};

/** Pass / Like reaction that pops beside the phone when the card is swiped. */
export const SwipeReaction = ({ at, until, x, y, kind }: { readonly at: number; readonly until: number; readonly x: number; readonly y: number; readonly kind: 'pass' | 'like' }) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  const color = kind === 'like' ? '#2E9E5B' : '#D64545'; // swipeTint
  const fade = interpolate(frame, [until, until + 10], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: '-50% -50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        ...pop,
        opacity: pop.opacity * fade,
      }}
    >
      <div
        style={{
          width: 132,
          height: 132,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 18px 40px ${color}55`,
        }}
      >
        {kind === 'like' ? (
          <svg width="64" height="64" viewBox="0 0 24 24">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" fill="#fff" />
          </svg>
        ) : (
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color }}>{kind === 'like' ? 'Like' : 'Pass'}</div>
    </div>
  );
};

const StepIcon = ({ icon }: { readonly icon: 'sparkle' | 'check' | 'arrow' }) =>
  icon === 'sparkle' ? (
    <SparkleIcon size={30} color={GRAPE_DEEP} />
  ) : (
    <svg width="30" height="30" viewBox="0 0 24 24">
      <path
        d={icon === 'check' ? 'M4 12.5l5 5L20 6.5' : 'M4 12h15M13 6l6 6-6 6'}
        fill="none"
        stroke={GRAPE_DEEP}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

/**
 * Agentic AI as a three-step flow: the assistant plans, the user reviews, then
 * it carries the plan out. A line draws down between the steps as each lands.
 */
export const AgentSteps = ({
  x,
  steps,
}: {
  readonly x: number;
  readonly steps: readonly { at: number; label: string; icon: 'sparkle' | 'check' | 'arrow' }[];
}) => {
  const frame = useCurrentFrame();
  const top = 430;
  const gap = 170;
  return (
    <>
      {steps.slice(1).map((s, i) => (
        <div
          key={s.label}
          style={{
            position: 'absolute',
            left: x - 2,
            top: top + i * gap + 40,
            width: 4,
            height: gap - 80,
            borderRadius: 2,
            background: POWDER,
            transformOrigin: 'top',
            scale: `1 ${interpolate(frame, [s.at - 16, s.at], [0, 1], clamp)}`,
          }}
        />
      ))}
      {steps.map((s, i) => (
        <Chip key={s.label} at={s.at} x={x} y={top + i * gap} accent={i === steps.length - 1} icon={<StepIcon icon={s.icon} />}>
          {s.label}
        </Chip>
      ))}
    </>
  );
};
