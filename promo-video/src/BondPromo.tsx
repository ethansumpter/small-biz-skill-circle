import { linearTiming, springTiming, TransitionSeries } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { Easing } from 'remotion';

import { AgentSteps, Chip, SparkleIcon, SwipeReaction, Tap, TouchDot, Twinkle } from './components/Decor';
import { BrandScene, ChatCloseUp, OfferCloseUp, PhoneScene, PhoneTrio, PLATINUM, Statement } from './components/Scenes';
import { Screen } from './components/Screen';
import { circlesReveal, zoomThrough } from './transitions';

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const LEFT = 500; // decor x either side of the phone
const RIGHT = 1420;

const Pin = () => (
  <svg width="30" height="30" viewBox="0 0 24 24">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="#544A63" strokeWidth="2.2" />
    <circle cx="12" cy="10" r="2.6" fill="#544A63" />
  </svg>
);
const Check = () => (
  <svg width="30" height="30" viewBox="0 0 24 24">
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#2E2838" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Bond promo: 12 scenes following assets/video-example-shots, using the app
 * screenshots in an iPhone 17 Pro frame. 30 fps, 1920×1080. Transitions:
 * overlapping circles (the match motif), slides between phone scenes and a
 * zoom-through into the close-ups.
 */
export const BondPromo = () => (
  <TransitionSeries style={{ backgroundColor: PLATINUM }}>
    <TransitionSeries.Sequence name="01 Hook" durationInFrames={100}>
      <BrandScene name="Hook" line="[Stronger Together]" />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={circlesReveal()} timing={linearTiming({ durationInFrames: 26, easing: inOut })} />

    <TransitionSeries.Sequence name="02 Find a partner" durationInFrames={105}>
      <PhoneScene
        name="Find a partner"
        headline="Find a [local] business partner"
        decor={
          <>
            <Chip at={30} x={LEFT} y={520} icon={<Pin />}>
              Leeds
            </Chip>
            <Chip at={44} x={RIGHT} y={700}>
              17 businesses to see
            </Chip>
          </>
        }
      >
        <Screen file="img_0157.png" />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="03 Swipe" durationInFrames={150}>
      <PhoneScene
        name="Swipe"
        headline="Swipe through [local businesses]"
        decor={
          <>
            <SwipeReaction kind="pass" at={30} until={58} x={LEFT + 40} y={620} />
            <SwipeReaction kind="like" at={92} until={160} x={RIGHT - 40} y={620} />
          </>
        }
      >
        <Screen file="img_0157.png" />
        <Screen file="img_0159.png" fadeInAt={26} />
        <Screen file="img_0157.png" fadeInAt={54} />
        <Screen file="img_0158.png" fadeInAt={88} />
        <TouchDot show={14} hide={104} frames={[20, 34, 50, 64, 82, 98]} xs={[50, 22, 22, 50, 50, 80]} ys={[55, 57, 57, 55, 55, 53]} />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="04 Perfect match" durationInFrames={120}>
      <PhoneScene
        name="Perfect match"
        headline="Find the [perfect match]"
        decor={
          <>
            <Chip at={16} x={LEFT} y={470} accent icon={<SparkleIcon size={30} color="#2E2838" />}>
              AI matching
            </Chip>
            <Chip at={64} x={RIGHT} y={640}>
              Home fragrance · Leeds
            </Chip>
            <Chip at={78} x={LEFT} y={780}>
              Verified · ★ 4.8
            </Chip>
          </>
        }
      >
        <Screen file="img_0165.png" />
        <Screen file="img_0160.png" fadeInAt={58} />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={zoomThrough()} timing={linearTiming({ durationInFrames: 20, easing: inOut })} />

    <TransitionSeries.Sequence name="05 Candles close-up" durationInFrames={130}>
      <OfferCloseUp name="Candles close-up" />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={circlesReveal()} timing={linearTiming({ durationInFrames: 26, easing: inOut })} />

    <TransitionSeries.Sequence name="06 Mugs and wax" durationInFrames={170}>
      <Statement name="Mugs and wax" />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="07 AI help" durationInFrames={135}>
      <PhoneScene
        name="AI help"
        headline="AI that plans, then [acts for you]"
        decor={
          <>
            <Twinkle at={18} x={640} y={380} size={44} />
            <Twinkle at={24} x={1210} y={290} size={40} color="#A2B2D8" />
            <Twinkle at={30} x={600} y={720} size={64} color="#A2B2D8" />
            <Twinkle at={36} x={700} y={560} size={30} />
            <Twinkle at={42} x={690} y={940} size={30} />
            <Twinkle at={48} x={1200} y={960} size={28} />
            <AgentSteps
              x={RIGHT + 30}
              steps={[
                { at: 30, label: 'Plans your campaign', icon: 'sparkle' },
                { at: 56, label: 'You review it', icon: 'check' },
                { at: 82, label: 'It goes live', icon: 'arrow' },
              ]}
            />
          </>
        }
      >
        <Screen file="img_0162.png" />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="08 Pitch" durationInFrames={110}>
      <PhoneScene
        name="Pitch"
        headline="Pitch a [collaboration]"
        decor={
          <>
            <Chip at={40} x={LEFT} y={560}>
              Cross-promotion
            </Chip>
            <Chip at={76} x={RIGHT} y={720} accent icon={<Check />}>
              Proposal sent
            </Chip>
          </>
        }
      >
        <Screen file="img_0160.png" />
        <Screen file="img_0169.png" fadeInAt={26} />
        <Tap at={68} x={50} y={93} />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="09 Plan the drop" durationInFrames={105}>
      <PhoneScene
        name="Plan the drop"
        headline="Plan the first [product drop]"
        decor={
          <>
            <Chip at={18} x={LEFT} y={430}>
              3 mug sizes
            </Chip>
            <Chip at={32} x={RIGHT} y={530}>
              Rhubarb & fig
            </Chip>
            <Chip at={46} x={LEFT} y={690}>
              50/50 split
            </Chip>
            <Chip at={60} x={RIGHT} y={810}>
              Refill card
            </Chip>
          </>
        }
      >
        <Screen file="img_0161.png" />
      </PhoneScene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={zoomThrough()} timing={linearTiming({ durationInFrames: 20, easing: inOut })} />

    <TransitionSeries.Sequence name="10 Two shopfronts" durationInFrames={120}>
      <ChatCloseUp name="Two shopfronts" />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })} />

    <TransitionSeries.Sequence name="11 Every collab" durationInFrames={125}>
      <PhoneTrio name="Every collab" />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={circlesReveal()} timing={linearTiming({ durationInFrames: 26, easing: inOut })} />

    <TransitionSeries.Sequence name="12 CTA" durationInFrames={130}>
      <BrandScene name="CTA" line="Find your [perfect business collab]" />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
