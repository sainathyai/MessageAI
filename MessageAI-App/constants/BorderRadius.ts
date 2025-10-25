/**
 * Border Radius System - MessageAI
 * 
 * Consistent corner rounding values
 * Creates a cohesive, modern look across all UI elements
 */

/**
 * Border Radius Scale
 * From sharp corners to fully rounded (pills/circles)
 */
export const BorderRadius = {
  /**
   * None - 0px
   * Use for: Sharp corners, no rounding
   */
  none: 0,

  /**
   * Extra Small - 4px
   * Use for: Very subtle rounding, tight elements
   */
  xs: 4,

  /**
   * Small - 8px
   * Use for: Input fields, small buttons, cards
   */
  sm: 8,

  /**
   * Medium - 12px
   * Use for: Standard buttons, cards, modals
   */
  md: 12,

  /**
   * Default - 16px
   * Use for: Most UI elements, comfortable rounding
   */
  default: 16,

  /**
   * Large - 20px
   * Use for: Message bubbles, large cards
   */
  lg: 20,

  /**
   * Extra Large - 24px
   * Use for: Large buttons, prominent elements
   */
  xl: 24,

  /**
   * Extra Extra Large - 32px
   * Use for: Very rounded elements, sheets
   */
  xxl: 32,

  /**
   * Full - 9999px
   * Use for: Pills, badges, circular avatars
   */
  full: 9999,
};

/**
 * Component-Specific Border Radius
 * Predefined radius values for common components
 */
export const ComponentRadius = {
  // Buttons
  button: BorderRadius.md,
  buttonSmall: BorderRadius.sm,
  buttonLarge: BorderRadius.default,
  buttonPill: BorderRadius.full,

  // Input fields
  input: BorderRadius.sm,
  textarea: BorderRadius.sm,

  // Cards
  card: BorderRadius.md,
  cardSmall: BorderRadius.sm,
  cardLarge: BorderRadius.default,

  // Modals & Sheets
  modal: BorderRadius.default,
  sheet: BorderRadius.lg,
  bottomSheet: {
    topLeft: BorderRadius.lg,
    topRight: BorderRadius.lg,
    bottomLeft: 0,
    bottomRight: 0,
  },

  // Message Bubbles
  messageBubble: BorderRadius.lg,        // 20px for modern, soft feel
  messageBubbleTail: BorderRadius.xs,    // 4px for the "tail" corner

  // Avatars & Images
  avatar: BorderRadius.full,              // Always circular
  avatarSquare: BorderRadius.sm,          // For square avatars
  image: BorderRadius.sm,                 // Regular images
  imageCard: BorderRadius.md,             // Images in cards

  // Badges & Pills
  badge: BorderRadius.full,
  pill: BorderRadius.full,
  tag: BorderRadius.xs,

  // Floating Action Button (FAB)
  fab: BorderRadius.full,
  fabMini: BorderRadius.full,

  // Chips
  chip: BorderRadius.full,
  chipSquare: BorderRadius.sm,

  // Containers
  container: BorderRadius.default,
  section: BorderRadius.md,

  // Overlays
  tooltip: BorderRadius.sm,
  popover: BorderRadius.md,
  dropdown: BorderRadius.sm,

  // Dividers & Separators
  divider: 0,

  // Search Bar
  searchBar: BorderRadius.full,
  searchBarSquare: BorderRadius.sm,

  // Progress Indicators
  progressBar: BorderRadius.full,
  progressBarSquare: BorderRadius.xs,

  // Switches & Toggles
  switch: BorderRadius.full,
  checkbox: BorderRadius.xs,

  // Media
  video: BorderRadius.sm,
  audioPlayer: BorderRadius.md,

  // Special
  skeleton: BorderRadius.sm,            // Loading skeletons
  highlight: BorderRadius.xs,           // Text highlights
};

/**
 * Message Bubble Radius Configuration
 * Special handling for chat bubbles with "tails"
 */
export const MessageBubbleRadius = {
  // Outgoing message (right side)
  outgoing: {
    topLeft: BorderRadius.lg,
    topRight: BorderRadius.lg,
    bottomLeft: BorderRadius.lg,
    bottomRight: BorderRadius.xs,        // Small radius for "tail" effect
  },

  // Incoming message (left side)
  incoming: {
    topLeft: BorderRadius.lg,
    topRight: BorderRadius.lg,
    bottomLeft: BorderRadius.xs,         // Small radius for "tail" effect
    bottomRight: BorderRadius.lg,
  },

  // First message in a sequence (no tail)
  first: {
    topLeft: BorderRadius.lg,
    topRight: BorderRadius.lg,
    bottomLeft: BorderRadius.lg,
    bottomRight: BorderRadius.lg,
  },

  // Middle message in a sequence (no tail, less rounding)
  middle: {
    topLeft: BorderRadius.sm,
    topRight: BorderRadius.sm,
    bottomLeft: BorderRadius.sm,
    bottomRight: BorderRadius.sm,
  },

  // Last message in a sequence (has tail)
  last: {
    topLeft: BorderRadius.sm,
    topRight: BorderRadius.sm,
    bottomLeft: BorderRadius.lg,
    bottomRight: BorderRadius.xs,        // Tail on outgoing
  },
};

/**
 * Helper function to create custom border radius
 * @param value - Radius value in pixels
 * @returns Border radius object for each corner
 */
export const customRadius = (value: number) => ({
  topLeft: value,
  topRight: value,
  bottomLeft: value,
  bottomRight: value,
});

/**
 * Helper function to create asymmetric radius
 * Useful for bottom sheets, custom shapes, etc.
 */
export const asymmetricRadius = ({
  topLeft = 0,
  topRight = 0,
  bottomLeft = 0,
  bottomRight = 0,
}: {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}) => ({
  borderTopLeftRadius: topLeft,
  borderTopRightRadius: topRight,
  borderBottomLeftRadius: bottomLeft,
  borderBottomRightRadius: bottomRight,
});

// Export default
export default BorderRadius;

