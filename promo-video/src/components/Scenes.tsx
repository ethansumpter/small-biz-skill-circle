import type React from 'react';
import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { FONT } from '../fonts';
import { PulseRings } from './Decor';
import { IPhone17Pro } from './IPhone17Pro';
import { POWDER, RichText } from './RichText';

// Bond brand palette (react-app/docs/bond-brand-kit.md).
export const PLATINUM = '#F0F3F5';
export const GRAPE = '#544A63';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

/** Phone geometry shared with the decor positions in BondPromo.tsx. */
export const PHONE = { screenWidth: 346, top: 226, centreY: 616, halfWidth: 189 } as const;

/** Flat Platinum ground, the same colour as the screenshots' own background. */
const Ground = () => <AbsoluteFill style={{ backgroundColor: PLATINUM }} />;

const Headline = ({ text, delay = 2, stagger = 3, top = 96, size = 76 }: { readonly text: string; readonly delay?: number; readonly stagger?: number; readonly top?: number; readonly size?: number }) => (
  <Interactive.Div
    name="Headline"
    style={{
      position: 'absolute',
      top,
      left: 100,
      right: 100,
      textAlign: 'center',
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: GRAPE,
    }}
  >
    <RichText text={text} delay={delay} stagger={stagger} />
  </Interactive.Div>
);

/**
 * Headline above a phone that swings up into frame with a 3D tilt, then
 * slowly pushes in and sways. `decor` sits around the phone in scene space.
 */
const PhoneSceneInner = ({ headline, children, decor }: { readonly headline: string; readonly children: React.ReactNode; readonly decor?: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const spring = Easing.spring({ damping: 18, mass: 0.9 });
  const tiltX = interpolate(frame, [0, 34], [38, 0], { ...clamp, easing: spring });
  const swayY = Math.sin(frame / 40) * 3;
  return (
    <>
      <Ground />
      <PulseRings x={960} y={PHONE.centreY} size={720} start={10} period={70} />
      <Headline text={headline} />
      <div
        style={{
          position: 'absolute',
          top: PHONE.top,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          perspective: 2200,
          translate: interpolate(frame, [0, 30], ['0px 620px', '0px 0px'], { ...clamp, easing: spring }),
          scale: interpolate(frame, [0, durationInFrames], [1, 1.05], { ...clamp, output: 'perceptual-scale' }),
          transformOrigin: '50% 35%',
        }}
      >
        <div style={{ transform: `rotateX(${tiltX}deg) rotateY(${swayY}deg)`, transformOrigin: '50% 100%' }}>
          <IPhone17Pro name="iPhone 17 Pro" screenWidth={346}>
            {children}
          </IPhone17Pro>
        </div>
      </div>
      {decor}
    </>
  );
};

export const PhoneScene = Interactive.create({
  Component: PhoneSceneInner,
  layout: 'absolute-fill',
  schema: { headline: { type: 'string', default: '', description: 'Headline ([..] = emphasised, | = new line)' } },
});

/** Logo tile + name + line: the opening hook and the closing call to action. */
const BrandSceneInner = ({ line }: { readonly line: string }) => {
  const frame = useCurrentFrame();
  const bounce = Easing.spring({ damping: 9, mass: 0.8 });
  return (
    <>
      <Ground />
      <PulseRings x={960} y={330} size={420} start={14} period={56} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Img
          name="App icon"
          src={staticFile('logo/app-icon.png')}
          style={{
            width: 230,
            height: 230,
            borderRadius: 52,
            boxShadow: '0 30px 70px rgba(46,40,56,0.20), 0 8px 20px rgba(46,40,56,0.12)',
            scale: interpolate(frame, [0, 26], [0.3, 1], { ...clamp, easing: bounce, output: 'perceptual-scale' }),
            rotate: interpolate(frame, [0, 26], ['-18deg', '0deg'], { ...clamp, easing: bounce }),
            translate: interpolate(frame, [0, 26], ['0px -120px', '0px 0px'], { ...clamp, easing: bounce }),
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        />
        <div style={{ marginTop: 44, display: 'flex', fontFamily: FONT, fontWeight: 600, fontSize: 150, lineHeight: 1, color: GRAPE }}>
          {'Bond'.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: interpolate(frame, [10 + i * 3, 18 + i * 3], [0, 1], clamp),
                translate: `0px ${interpolate(frame, [10 + i * 3, 30 + i * 3], [60, 0], { ...clamp, easing: bounce })}px`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <Interactive.Div name="Line" style={{ marginTop: 36, fontFamily: FONT, fontWeight: 500, fontSize: 56, color: GRAPE }}>
          <RichText text={line} delay={26} stagger={4} />
        </Interactive.Div>
      </AbsoluteFill>
    </>
  );
};

export const BrandScene = Interactive.create({
  Component: BrandSceneInner,
  layout: 'absolute-fill',
  schema: { line: { type: 'string', default: '[Stronger Together]', description: 'Line under the name' } },
});

/** Close-up of the offer / looking-for card, each half highlighted in turn. */
const OfferCloseUpInner = () => {
  const frame = useCurrentFrame();
  // Text blocks inside the 800px-wide card (measured from the screenshot).
  const band = (at: number, top: number, height: number) => (
    <div
      style={{
        position: 'absolute',
        left: 20,
        top,
        width: 660,
        height,
        borderRadius: 16,
        background: POWDER,
        mixBlendMode: 'multiply',
        opacity: 0.55,
        scale: `${interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: out })} 1`,
        transformOrigin: 'left center',
      }}
    />
  );
  return (
    <>
      <Ground />
      <Headline text="They make [candles].|They need [quality containers]." />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 250 }}>
        <div
          style={{
            position: 'relative',
            width: 800,
            opacity: interpolate(frame, [4, 14], [0, 1], clamp),
            translate: interpolate(frame, [4, 30], ['0px 160px', '0px 0px'], { ...clamp, easing: Easing.spring({ damping: 16 }) }),
            rotate: interpolate(frame, [4, 30, 130], ['4deg', '0deg', '-1deg'], { ...clamp, easing: out }),
          }}
        >
          <Img
            name="Offer card"
            src={staticFile('crops/offer-card.png')}
            style={{ display: 'block', width: 800, borderRadius: 28, boxShadow: '0 40px 90px rgba(46,40,56,0.16), 0 10px 24px rgba(46,40,56,0.08)' }}
          />
          {band(22, 158, 108)}
          {band(44, 372, 166)}
        </div>
      </AbsoluteFill>
    </>
  );
};

export const OfferCloseUp = Interactive.create({ Component: OfferCloseUpInner, layout: 'absolute-fill' });

/**
 * "Your ceramic mugs. Their scented wax." The key words are highlighted, then
 * the two businesses' logos slide in and overlap into a match.
 */
const StatementInner = () => {
  const frame = useCurrentFrame();
  const settle = Easing.spring({ damping: 15 });
  const lift = interpolate(frame, [78, 104], [0, 1], { ...clamp, easing: out });
  const meet = (from: number, to: number) => interpolate(frame, [86, 116], [from, to], { ...clamp, easing: settle });
  const logo = (file: string, name: string, x: number): React.ReactNode => (
    <Img
      name={name}
      src={staticFile(`crops/${file}`)}
      style={{
        position: 'absolute',
        left: x - 150,
        top: 455,
        width: 300,
        height: 300,
        borderRadius: '50%',
        border: '8px solid #FFFFFF',
        boxShadow: '0 30px 60px rgba(46,40,56,0.20)',
        opacity: interpolate(frame, [86, 96], [0, 1], clamp),
      }}
    />
  );
  return (
    <>
      <Ground />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 112,
          lineHeight: 1.25,
          color: GRAPE,
          translate: `0px ${lift * -330}px`,
          scale: 1 - lift * 0.32,
        }}
      >
        <Interactive.Div name="Statement">
          <RichText text="Your [ceramic mugs].|Their [scented wax]." delay={4} stagger={6} markLag={10} />
        </Interactive.Div>
      </AbsoluteFill>

      {/* The match: two circles overlapping */}
      <PulseRings x={960} y={605} size={520} start={116} period={48} />
      {logo('kiln-avatar.png', 'Kiln & Clay logo', meet(-300, 960 - 118))}
      {logo('wick-avatar.png', 'Wick & Wild logo', meet(2220, 960 + 118))}
      <Interactive.Div
        name="Payoff"
        style={{
          position: 'absolute',
          top: 820,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 72,
          color: GRAPE,
        }}
      >
        <RichText text="One [new product]." delay={118} stagger={4} />
      </Interactive.Div>
    </>
  );
};

export const Statement = Interactive.create({ Component: StatementInner, layout: 'absolute-fill' });

/** The chat bubbles that seal the deal, popping in one by one. */
const ChatCloseUpInner = () => {
  const frame = useCurrentFrame();
  const bubble = (file: string, name: string, at: number, origin: string) => (
    <Img
      name={name}
      src={staticFile(`crops/${file}`)}
      style={{
        width: '100%',
        transformOrigin: origin,
        opacity: interpolate(frame, [at, at + 6], [0, 1], clamp),
        scale: interpolate(frame, [at, at + 18], [0.7, 1], { ...clamp, easing: Easing.spring({ damping: 12 }) }),
        translate: interpolate(frame, [at, at + 18], ['0px 50px', '0px 0px'], { ...clamp, easing: out }),
      }}
    />
  );
  return (
    <>
      <Ground />
      <Headline text="[One batch.] [Two shopfronts.]" stagger={10} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 170 }}>
        <div style={{ width: 1020, display: 'flex', flexDirection: 'column' }}>
          {bubble('chat-1.png', 'Bubble: rhubarb and fig', 14, '10% 50%')}
          {bubble('chat-2.png', 'Bubble: split 50/50', 34, '90% 50%')}
          {bubble('chat-3.png', 'Bubble: refill card', 54, '10% 50%')}
        </div>
      </AbsoluteFill>
    </>
  );
};

export const ChatCloseUp = Interactive.create({ Component: ChatCloseUpInner, layout: 'absolute-fill' });

/** Three phones fan out from the centre: network, the chat and Get More. */
const PhoneTrioInner = () => {
  const frame = useCurrentFrame();
  const spring = Easing.spring({ damping: 15 });
  const fan = interpolate(frame, [14, 44], [0, 1], { ...clamp, easing: spring });
  const drift = interpolate(frame, [44, 125], [0, 1], clamp);
  const shot = (file: string) => <Img src={staticFile(`screens/${file}`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
  const side = (dir: -1 | 1, file: string, name: string) => (
    <div
      style={{
        position: 'absolute',
        left: 960 - 152 + dir * (fan * 390 + drift * 16),
        top: 70 + (1 - fan) * 20,
        rotate: `${dir * (fan * 7 + drift * 1)}deg`,
        opacity: interpolate(frame, [12, 20], [0, 1], clamp),
        transformOrigin: '50% 90%',
      }}
    >
      <IPhone17Pro name={name} screenWidth={280}>
        {shot(file)}
      </IPhone17Pro>
    </div>
  );
  return (
    <>
      <Ground />
      <Headline text="Every great [collab] starts here" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, height: 900 }}>
        {side(-1, 'img_0166.png', 'Left phone')}
        {side(1, 'img_0171.png', 'Right phone')}
        <div
          style={{
            position: 'absolute',
            left: 960 - 174,
            top: 0,
            translate: interpolate(frame, [0, 26], ['0px 640px', '0px -10px'], { ...clamp, easing: spring }),
          }}
        >
          <IPhone17Pro name="Centre phone" screenWidth={320}>
            {shot('img_0161.png')}
          </IPhone17Pro>
        </div>
      </div>
    </>
  );
};

export const PhoneTrio = Interactive.create({ Component: PhoneTrioInner, layout: 'absolute-fill' });
