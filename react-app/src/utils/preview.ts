import { showMessage } from '@/utils/dialog';

/**
 * Placeholder for actions the prototype doesn't perform (purchases, settings,
 * safety flows). Says so plainly rather than implying anything happened.
 */
export function notInPreview(feature: string) {
  showMessage(feature, "This isn't available in the Bond preview yet.");
}
