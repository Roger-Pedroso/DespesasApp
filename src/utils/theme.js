/**
 * Theme System - Centralização de cores, estilos e constantes visuais
 * Uso: import { COLORS, SHADOW, TYPOGRAPHY } from '../utils/theme';
 */

// ========== CORES PRINCIPAIS ==========
export const COLORS = {
  // Brand
  primary: '#6C5CE7',
  primaryDark: '#5F3DC4',
  primaryLight: '#8B7FD9',

  // Backgrounds
  background: '#F5F6FA',
  surface: '#ffffff',
  surfaceSecondary: '#FAFBFC',

  // Text
  text: '#2D3436',
  textSecondary: '#636E72',
  textTertiary: '#B2BEC3',
  textInverse: '#ffffff',

  // Borders
  border: '#DFE6E9',
  borderLight: '#F5F6FA',

  // Status
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#FF7675',
  info: '#0984E3',

  // Forms
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',

  // Payment Methods
  debito: '#6C5CE7',
  credito: '#00B894',
  pix: '#FF9FF3',
};

// ========== SHADOWS ==========
export const SHADOW = {
  none: {},

  // Extra small shadow
  xs: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  // Small shadow (cards, inputs)
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadow (highlighted cards)
  md: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Large shadow (modals, overlays)
  lg: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ========== TIPOGRAFIA ==========
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    color: COLORS.text,
  },

  h2: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    color: COLORS.text,
  },

  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: COLORS.text,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.text,
  },

  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: COLORS.text,
  },

  // Small
  small: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  smallBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: COLORS.text,
  },

  // Extra small
  xs: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: COLORS.textTertiary,
  },

  xsBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  // Label
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};

// ========== SPACING ==========
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ========== BORDER RADIUS ==========
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// ========== Z-INDEX ==========
export const Z_INDEX = {
  hidden: -1,
  base: 0,
  dropdown: 100,
  overlay: 200,
  modal: 300,
  tooltip: 400,
};

// ========== COMMON STYLE PATTERNS ==========
export const STYLES = {
  // Containers
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  flexBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flexColumn: {
    flexDirection: 'column',
  },

  flexRow: {
    flexDirection: 'row',
  },

  // Absolute positioning
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Full width/height
  fullFlex: {
    flex: 1,
  },

  fullWidth: {
    width: '100%',
  },

  fullHeight: {
    height: '100%',
  },
};

export default {
  COLORS,
  SHADOW,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  Z_INDEX,
  STYLES,
};
