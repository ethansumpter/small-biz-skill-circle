import { Composition } from 'remotion';

import { BondPromo } from './BondPromo';
import './fonts';

// 12 scenes (1500 frames) minus overlaps: 3 circle reveals × 26, 6 slides × 22, 2 zooms × 20 = 1250 frames (41.7 s).
export const RemotionRoot = () => (
  <Composition id="BondPromo" component={BondPromo} durationInFrames={1250} fps={30} width={1920} height={1080} />
);
