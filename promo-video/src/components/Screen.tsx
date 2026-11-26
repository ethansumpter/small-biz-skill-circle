import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/**
 * A screenshot filling the phone display. With `fadeInAt`, it cross-fades in
 * over the screen below it (used to step through app states).
 */
export const Screen = ({ file, fadeInAt }: { readonly file: string; readonly fadeInAt?: number }) => {
  const frame = useCurrentFrame();
  const opacity =
    fadeInAt === undefined
      ? 1
      : interpolate(frame, [fadeInAt, fadeInAt + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Img
      name={file}
      src={staticFile(`screens/${file}`)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity }}
    />
  );
};
