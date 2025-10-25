/**
 * Color Palette - MessageAI Teal Theme
 * 
 * Modern, professional color scheme with teal as primary color
 * Designed for clarity, accessibility, and a premium feel
 */

export const Colors = {
  // ============================================
  // PRIMARY COLORS (Teal Theme)
  // ============================================
  primary: '#007A7A',           // Main teal - buttons, outgoing bubbles
  primaryLight: '#00A5A5',      // Lighter teal - hover states, dark mode
  primaryDark: '#005A5A',       // Darker teal - pressed states
  primaryFaded: '#E5F4F4',      // Very light teal - backgrounds
  
  // ============================================
  // ACCENT COLORS (Cyan for AI Features)
  // ============================================
  accent: '#00C49A',            // Vibrant cyan - AI features, FAB, notifications
  accentLight: '#33D4B0',       // Lighter cyan - hover
  accentDark: '#009B7A',        // Darker cyan - pressed
  accentFaded: '#E5F9F4',       // Very light cyan - AI feature backgrounds
  
  // ============================================
  // ALTERNATE ACCENT (Violet for Variety)
  // ============================================
  violet: '#7B42F6',            // Purple accent - special features
  violetLight: '#9B6BF8',       // Lighter purple
  violetDark: '#5B22D6',        // Darker purple
  
  // ============================================
  // NEUTRALS (Soft & Professional)
  // ============================================
  background: '#F5F7FA',        // App background (soft gray, not pure white)
  surface: '#FFFFFF',           // Cards, modals, sheets
  surfaceSecondary: '#E5E9F0',  // Incoming message bubbles, secondary surfaces
  surfaceTertiary: '#F0F2F5',   // Tertiary backgrounds
  
  // ============================================
  // TEXT COLORS
  // ============================================
  textPrimary: '#333333',       // Main text (not pure black - easier on eyes)
  textSecondary: '#757575',     // Secondary text (timestamps, captions)
  textTertiary: '#9E9E9E',      // Placeholder text, disabled text
  textOnPrimary: '#FFFFFF',     // Text on primary color (white on teal)
  textOnAccent: '#FFFFFF',      // Text on accent color
  textOnDark: '#FFFFFF',        // Text on dark backgrounds
  
  // ============================================
  // MESSAGE BUBBLES
  // ============================================
  outgoingBubble: '#007A7A',    // Your messages (primary teal)
  outgoingBubbleText: '#FFFFFF', // Text on outgoing bubbles
  incomingBubble: '#E5E9F0',    // Their messages (light gray)
  incomingBubbleText: '#333333', // Text on incoming bubbles
  
  // ============================================
  // FUNCTIONAL COLORS
  // ============================================
  success: '#4CAF50',           // Success states, online status
  successLight: '#81C784',      // Light success
  successDark: '#388E3C',       // Dark success
  
  warning: '#FF9800',           // Warning states, away status
  warningLight: '#FFB74D',      // Light warning
  warningDark: '#F57C00',       // Dark warning
  
  error: '#F44336',             // Error states, offline, delete
  errorLight: '#E57373',        // Light error
  errorDark: '#D32F2F',         // Dark error
  
  info: '#2196F3',              // Info states, notifications
  infoLight: '#64B5F6',         // Light info
  infoDark: '#1976D2',          // Dark info
  
  // ============================================
  // BORDERS & DIVIDERS
  // ============================================
  border: '#E0E0E0',            // Default border color
  borderLight: '#F0F0F0',       // Light borders
  borderDark: '#BDBDBD',        // Darker borders, focus states
  divider: '#EEEEEE',           // List dividers, separators
  
  // ============================================
  // SHADOWS & OVERLAYS
  // ============================================
  shadow: 'rgba(0, 0, 0, 0.1)',      // Default shadow
  shadowDark: 'rgba(0, 0, 0, 0.2)',  // Elevated elements
  shadowLight: 'rgba(0, 0, 0, 0.05)', // Subtle shadows
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlays, dimmed backgrounds
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Light overlay
  
  // ============================================
  // STATUS INDICATORS
  // ============================================
  online: '#4CAF50',            // User is online
  offline: '#9E9E9E',           // User is offline
  away: '#FF9800',              // User is away
  busy: '#F44336',              // User is busy/DND
  typing: '#007A7A',            // Typing indicator (primary)
  
  // ============================================
  // NOTIFICATION BADGES
  // ============================================
  badge: '#00C49A',             // Unread count badge (accent)
  badgeText: '#FFFFFF',         // Text on badge
  
  // ============================================
  // SPECIAL STATES
  // ============================================
  highlight: '#FFF9C4',         // Search highlight, selected text
  link: '#2196F3',              // Clickable links
  linkVisited: '#9C27B0',       // Visited links
  
  // ============================================
  // TRANSPARENT VARIANTS (for overlays)
  // ============================================
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  // Semi-transparent whites (for dark backgrounds)
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white90: 'rgba(255, 255, 255, 0.9)',
  
  // Semi-transparent blacks (for light backgrounds)
  black10: 'rgba(0, 0, 0, 0.1)',
  black20: 'rgba(0, 0, 0, 0.2)',
  black30: 'rgba(0, 0, 0, 0.3)',
  black50: 'rgba(0, 0, 0, 0.5)',
  black70: 'rgba(0, 0, 0, 0.7)',
  black90: 'rgba(0, 0, 0, 0.9)',
};

/**
 * Dark Mode Colors
 * Optional dark theme variant
 */
export const DarkColors = {
  // Primary (lighter teal for dark mode)
  primary: '#00A5A5',
  primaryLight: '#33D4B0',
  primaryDark: '#007A7A',
  primaryFaded: '#1A2F2F',
  
  // Accent
  accent: '#33D4B0',
  accentLight: '#5DDEC0',
  accentDark: '#00C49A',
  accentFaded: '#1A2F2A',
  
  // Neutrals
  background: '#121212',        // Almost black
  surface: '#1E1E1E',          // Cards
  surfaceSecondary: '#2A2A2A',  // Incoming bubbles
  surfaceTertiary: '#353535',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#757575',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  textOnDark: '#FFFFFF',
  
  // Bubbles
  outgoingBubble: '#00A5A5',
  outgoingBubbleText: '#FFFFFF',
  incomingBubble: '#2A2A2A',
  incomingBubbleText: '#FFFFFF',
  
  // Functional
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',
  
  // Borders
  border: '#3A3A3A',
  borderLight: '#2A2A2A',
  borderDark: '#4A4A4A',
  divider: '#2A2A2A',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Status
  online: '#81C784',
  offline: '#757575',
  away: '#FFB74D',
  busy: '#E57373',
  typing: '#00A5A5',
  
  // Badge
  badge: '#33D4B0',
  badgeText: '#000000',
  
  // Special
  highlight: '#FFF9C4',
  link: '#64B5F6',
  linkVisited: '#BA68C8',
  
  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white90: 'rgba(255, 255, 255, 0.9)',
  
  black10: 'rgba(0, 0, 0, 0.1)',
  black20: 'rgba(0, 0, 0, 0.2)',
  black30: 'rgba(0, 0, 0, 0.3)',
  black50: 'rgba(0, 0, 0, 0.5)',
  black70: 'rgba(0, 0, 0, 0.7)',
  black90: 'rgba(0, 0, 0, 0.9)',
};

// Export light theme as default
export default Colors;

