/**
 * Typography System - MessageAI
 * 
 * Consistent font sizes, weights, and line heights
 * Based on a 4px baseline grid for vertical rhythm
 */

import { TextStyle } from 'react-native';

/**
 * Font Weights
 * Using standard system font weights
 */
export const FontWeight = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
};

/**
 * Typography Scale
 * Each variant includes: fontSize, fontWeight, lineHeight
 */
export const Typography = {
  // ============================================
  // HEADINGS
  // ============================================
  
  h1: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,
  
  h2: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
    letterSpacing: -0.25,
  } as TextStyle,
  
  h3: {
    fontSize: 20,
    fontWeight: FontWeight.semiBold,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,
  
  h4: {
    fontSize: 18,
    fontWeight: FontWeight.semiBold,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  
  h5: {
    fontSize: 16,
    fontWeight: FontWeight.semiBold,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,
  
  // ============================================
  // BODY TEXT
  // ============================================
  
  body: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  
  bodyLarge: {
    fontSize: 18,
    fontWeight: FontWeight.regular,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,
  
  bodySmall: {
    fontSize: 14,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,
  
  bodyBold: {
    fontSize: 16,
    fontWeight: FontWeight.semiBold,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  
  // ============================================
  // CAPTIONS & LABELS
  // ============================================
  
  caption: {
    fontSize: 14,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: 0.25,
  } as TextStyle,
  
  captionBold: {
    fontSize: 14,
    fontWeight: FontWeight.semiBold,
    lineHeight: 20,
    letterSpacing: 0.25,
  } as TextStyle,
  
  label: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,
  
  // ============================================
  // SMALL TEXT
  // ============================================
  
  small: {
    fontSize: 12,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
    letterSpacing: 0.25,
  } as TextStyle,
  
  smallBold: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    lineHeight: 16,
    letterSpacing: 0.25,
  } as TextStyle,
  
  tiny: {
    fontSize: 10,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
    letterSpacing: 0.25,
  } as TextStyle,
  
  // ============================================
  // BUTTON TEXT
  // ============================================
  
  button: {
    fontSize: 16,
    fontWeight: FontWeight.semiBold,
    lineHeight: 24,
    letterSpacing: 0.5,
  } as TextStyle,
  
  buttonLarge: {
    fontSize: 18,
    fontWeight: FontWeight.semiBold,
    lineHeight: 26,
    letterSpacing: 0.5,
  } as TextStyle,
  
  buttonSmall: {
    fontSize: 14,
    fontWeight: FontWeight.semiBold,
    lineHeight: 20,
    letterSpacing: 0.5,
  } as TextStyle,
  
  // ============================================
  // SPECIALIZED TEXT
  // ============================================
  
  // For timestamps in chat
  timestamp: {
    fontSize: 12,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,
  
  // For message preview in chat list
  messagePreview: {
    fontSize: 14,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,
  
  // For message text in bubbles
  messageText: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,
  
  // For contact/user names
  contactName: {
    fontSize: 16,
    fontWeight: FontWeight.semiBold,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,
  
  // For placeholder text
  placeholder: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  
  // For error messages
  error: {
    fontSize: 14,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,
  
  // For helper text
  helper: {
    fontSize: 12,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
    letterSpacing: 0.25,
  } as TextStyle,
  
  // For badge counts
  badge: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,
  
  // For app logo text
  logo: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
    letterSpacing: -0.5,
  } as TextStyle,
  
  // For input fields
  input: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
};

/**
 * Font Sizes (for direct use)
 */
export const FontSize = {
  tiny: 10,
  small: 12,
  caption: 14,
  body: 16,
  h5: 16,
  bodyLarge: 18,
  h4: 18,
  h3: 20,
  h2: 24,
  h1: 32,
  hero: 40,
};

/**
 * Line Heights (for direct use)
 */
export const LineHeight = {
  tight: 1.2,    // 20% more than font size
  normal: 1.5,   // 50% more than font size
  relaxed: 1.75, // 75% more than font size
  loose: 2,      // 100% more than font size
};

/**
 * Letter Spacing (for direct use)
 */
export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
};

// Export default
export default Typography;

