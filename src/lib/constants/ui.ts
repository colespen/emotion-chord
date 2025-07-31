// UI Constants and Styling
export const COLORS = {
  PRIMARY: '#4044ff',
  PRIMARY_HOVER: '#5b52f0',
  BACKGROUND: '#0d1117',
  CARD_BACKGROUND: '#161b22',
  BORDER: '#30363d',
  TEXT_PRIMARY: '#f0f6fc',
  TEXT_SECONDARY: '#7d8590',
  TEXT_MUTED: '#6e7681',
  BUTTON_SECONDARY: '#21262d',
  ERROR: '#da3633',
  SUCCESS: '#238636',
} as const;

// CSS Filters for brand color transformation
export const CSS_FILTERS = {
  BRAND_COLOR: 'brightness(0) saturate(100%) invert(29%) sepia(99%) saturate(4947%) hue-rotate(235deg) brightness(104%) contrast(107%)',
} as const;

// Component sizing
export const LOGO_SIZES = {
  XSMALL: { width: 14, height: 28 },
  SMALL: { width: 20, height: 40 },
  MEDIUM: { width: 32, height: 64 },
  LARGE: { width: 48, height: 96 },
} as const;
