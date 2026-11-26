import type React from 'react';
import { Interactive } from 'remotion';

/**
 * iPhone 17 Pro frame drawn in CSS (silver aluminium unibody, thin black
 * bezel, Dynamic Island, action button, volume, side button and Camera
 * Control). `screenWidth` sets the size; the screen keeps the 1170×2532
 * screenshot ratio. Children fill the screen.
 */
const SCREEN_RATIO = 2532 / 1170;

const IPhone17ProInner = ({
  screenWidth,
  children,
  style,
}: {
  readonly screenWidth: number;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}) => {
  const s = screenWidth;
  const screenH = s * SCREEN_RATIO;
  const bezel = s * 0.026; // black glass border around the display
  const band = s * 0.02; // aluminium edge
  const bodyW = s + 2 * (bezel + band);
  const bodyH = screenH + 2 * (bezel + band);
  const screenRadius = s * 0.135;
  const innerRadius = screenRadius + bezel;
  const outerRadius = innerRadius + band;

  const aluminium =
    'linear-gradient(90deg, #8E9198 0%, #D9DBDF 6%, #F4F5F7 14%, #C9CBD0 30%, #E6E7EA 50%, #C9CBD0 70%, #F4F5F7 86%, #D9DBDF 94%, #8E9198 100%)';
  const buttonW = s * 0.012;
  const button = (side: 'left' | 'right', top: number, height: number): React.CSSProperties => ({
    position: 'absolute',
    [side]: -buttonW + 1,
    top: bodyH * top,
    width: buttonW,
    height: bodyH * height,
    borderRadius: buttonW,
    background: 'linear-gradient(90deg, #A7AAB0, #E9EAED 50%, #A7AAB0)',
    boxShadow: 'inset 0 0 1px rgba(0,0,0,0.35)',
  });

  return (
    <div style={{ position: 'relative', width: bodyW, height: bodyH, ...style }}>
      {/* Side buttons sit behind the body */}
      <div style={button('left', 0.175, 0.045)} /> {/* Action button */}
      <div style={button('left', 0.245, 0.075)} /> {/* Volume up */}
      <div style={button('left', 0.335, 0.075)} /> {/* Volume down */}
      <div style={button('right', 0.255, 0.11)} /> {/* Side button */}
      <div style={{ ...button('right', 0.56, 0.06), width: buttonW * 0.7, right: -buttonW * 0.7 + 1, background: 'linear-gradient(90deg, #9DA0A6, #C9CBD0)' }} /> {/* Camera Control */}

      {/* Aluminium body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: outerRadius,
          background: aluminium,
          boxShadow:
            '0 60px 120px rgba(46,40,56,0.22), 0 18px 40px rgba(46,40,56,0.16), inset 0 0 0 1px rgba(255,255,255,0.6), inset 0 0 2px 1px rgba(0,0,0,0.25)',
        }}
      />
      {/* Black bezel */}
      <div
        style={{
          position: 'absolute',
          inset: band,
          borderRadius: innerRadius,
          background: '#0B0B0D',
        }}
      />
      {/* Display */}
      <div
        style={{
          position: 'absolute',
          left: band + bezel,
          top: band + bezel,
          width: s,
          height: screenH,
          borderRadius: screenRadius,
          overflow: 'hidden',
          background: '#F0F3F5',
        }}
      >
        {children}
        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: s * 0.028,
            left: '50%',
            width: s * 0.31,
            height: s * 0.09,
            marginLeft: -s * 0.155,
            borderRadius: s * 0.045,
            background: '#000',
          }}
        />
        {/* Faint glass reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

export const IPhone17Pro = Interactive.create({
  Component: IPhone17ProInner,
  layout: 'none',
  schema: {
    screenWidth: { type: 'number', default: 380, min: 100, max: 1200, description: 'Screen width (px)', hiddenFromList: false },
  },
});
