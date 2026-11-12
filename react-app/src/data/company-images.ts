import type { ImageSourcePropType } from 'react-native';

import type { Company } from '@/data/companies';

/**
 * Company logo images in assets/images/companies/, picked up automatically at
 * bundle time. A file matches a company when its name (minus extension) equals
 * the name in that company's `profileImage`, so .png, .jpg and .webp all work.
 * Restart `npx expo start` after adding or removing an image.
 */
const context = require.context('../../assets/images/companies', false, /\.(png|jpe?g|webp)$/i);

const stem = (path: string) => path.split('/').pop()!.replace(/\.[^.]+$/, '');

const imagesByStem = new Map<string, ImageSourcePropType>(
  context.keys().map((key) => [stem(key), context(key) as ImageSourcePropType]),
);

/** The company's logo, or undefined if no image file exists for it yet. */
export function getCompanyImage(company: Pick<Company, 'profileImage'>): ImageSourcePropType | undefined {
  return imagesByStem.get(stem(company.profileImage));
}
