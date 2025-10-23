/**
 * Spacing System - MessageAI
 * 
 * Consistent spacing values based on an 8px grid
 * Provides visual rhythm and balance across the app
 */

/**
 * Base spacing unit (8px)
 * All spacing should be multiples of this value
 */
export const BASE_SPACING = 8;

/**
 * Spacing Scale
 * Based on 8px grid system for consistency
 */
export const Spacing = {
  /**
   * Extra Extra Small - 2px
   * Use for: Very tight spacing, minor adjustments
   */
  xxs: 2,

  /**
   * Extra Small - 4px
   * Use for: Icon padding, very tight gaps
   */
  xs: 4,

  /**
   * Small - 8px (1x base)
   * Use for: Tight padding, small gaps between elements
   */
  sm: 8,

  /**
   * Medium - 12px
   * Use for: Default gap between related items
   */
  md: 12,

  /**
   * Default - 16px (2x base)
   * Use for: Standard padding, default gaps
   */
  default: 16,

  /**
   * Large - 24px (3x base)
   * Use for: Comfortable spacing, section padding
   */
  lg: 24,

  /**
   * Extra Large - 32px (4x base)
   * Use for: Wide spacing, major sections
   */
  xl: 32,

  /**
   * Extra Extra Large - 48px (6x base)
   * Use for: Very wide spacing, page margins
   */
  xxl: 48,

  /**
   * Huge - 64px (8x base)
   * Use for: Maximum spacing, large gaps
   */
  huge: 64,
};

/**
 * Padding Presets
 * Common padding combinations for different UI elements
 */
export const Padding = {
  // Screen/Container padding
  screen: {
    horizontal: Spacing.default,
    vertical: Spacing.lg,
  },

  // Card padding
  card: {
    horizontal: Spacing.default,
    vertical: Spacing.default,
  },

  // Button padding
  button: {
    horizontal: Spacing.lg,
    vertical: Spacing.md,
  },

  buttonSmall: {
    horizontal: Spacing.default,
    vertical: Spacing.sm,
  },

  buttonLarge: {
    horizontal: Spacing.xl,
    vertical: Spacing.default,
  },

  // Input field padding
  input: {
    horizontal: Spacing.default,
    vertical: Spacing.md,
  },

  // List item padding
  listItem: {
    horizontal: Spacing.default,
    vertical: Spacing.md,
  },

  // Modal padding
  modal: {
    horizontal: Spacing.lg,
    vertical: Spacing.lg,
  },

  // Badge padding
  badge: {
    horizontal: Spacing.sm,
    vertical: Spacing.xxs,
  },
};

/**
 * Margin Presets
 * Common margin combinations
 */
export const Margin = {
  // Section margins
  section: {
    bottom: Spacing.lg,
  },

  // Element margins
  element: {
    bottom: Spacing.default,
  },

  // Tight margins
  tight: {
    bottom: Spacing.sm,
  },

  // Wide margins
  wide: {
    bottom: Spacing.xl,
  },
};

/**
 * Gap Presets
 * For Flexbox/Grid gaps between children
 */
export const Gap = {
  /**
   * Tight gap - 4px
   * Use for: Closely related items
   */
  tight: Spacing.xs,

  /**
   * Default gap - 8px
   * Use for: Standard spacing between items
   */
  default: Spacing.sm,

  /**
   * Comfortable gap - 12px
   * Use for: More breathing room
   */
  comfortable: Spacing.md,

  /**
   * Wide gap - 16px
   * Use for: Well-separated items
   */
  wide: Spacing.default,

  /**
   * Extra wide gap - 24px
   * Use for: Major sections
   */
  extraWide: Spacing.lg,
};

/**
 * Safe Area Insets
 * For handling notches and rounded corners
 */
export const SafeArea = {
  top: 44,      // iPhone notch
  bottom: 34,   // iPhone home indicator
  horizontal: Spacing.default,
};

/**
 * Icon Sizes
 * Standard icon dimensions
 */
export const IconSize = {
  tiny: 12,
  small: 16,
  default: 24,
  medium: 32,
  large: 48,
  xlarge: 64,
  huge: 96,
};

/**
 * Avatar Sizes
 * Standard avatar dimensions
 */
export const AvatarSize = {
  tiny: 24,
  small: 32,
  default: 40,
  medium: 48,
  large: 64,
  xlarge: 80,
  huge: 120,
};

/**
 * Hit Slop
 * Minimum touch target size (Apple: 44x44, Android: 48x48)
 */
export const HitSlop = {
  default: {
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
  },
  small: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
  large: {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
  },
};

/**
 * Helper function to calculate spacing
 * @param multiplier - Multiple of base spacing (8px)
 * @returns Spacing value in pixels
 */
export const spacing = (multiplier: number): number => {
  return BASE_SPACING * multiplier;
};

// Export default
export default Spacing;

