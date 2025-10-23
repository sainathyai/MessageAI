/**
 * Constants Index
 * Central export point for all design system constants
 */

export {
  Colors,
  DarkColors,
} from './Colors';

export {
  Typography,
  FontWeight,
  FontSize,
  LineHeight,
  LetterSpacing,
} from './Typography';

export {
  Spacing,
  Padding,
  Margin,
  Gap,
  SafeArea,
  IconSize,
  AvatarSize,
  HitSlop,
  spacing,
  BASE_SPACING,
} from './Spacing';

export {
  BorderRadius,
  ComponentRadius,
  MessageBubbleRadius,
  customRadius,
  asymmetricRadius,
} from './BorderRadius';

// Re-export as named exports for convenience
import { Colors } from './Colors';
import { Typography } from './Typography';
import { Spacing } from './Spacing';
import { BorderRadius } from './BorderRadius';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
};

export default Theme;

