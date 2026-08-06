export const FONT_STACKS = {
  // Sans-serif
  'Public Sans': "'Public Sans', -apple-system, sans-serif",
  'Inter': "'Inter', -apple-system, sans-serif",
  'Manrope': "'Manrope', -apple-system, sans-serif",
  'DM Sans': "'DM Sans', -apple-system, sans-serif",
  'Source Sans 3': "'Source Sans 3', -apple-system, sans-serif",
  'IBM Plex Sans': "'IBM Plex Sans', -apple-system, sans-serif",
  'Lato': "'Lato', -apple-system, sans-serif",
  'Nunito Sans': "'Nunito Sans', -apple-system, sans-serif",
  // Serif
  'Fraunces': "'Fraunces', Georgia, serif",
  'Merriweather': "'Merriweather', Georgia, serif",
  'Georgia': "'Georgia', 'Times New Roman', serif",
  // Monospace
  'JetBrains Mono': "'JetBrains Mono', monospace",
};

export function buildResumeCSSVars(customization) {
  return {
    '--res-accent': customization.accentColor,
    '--res-secondary': customization.secondaryColor,
    '--res-font': FONT_STACKS[customization.font] || FONT_STACKS['Public Sans'],
    '--res-font-size': `${customization.fontSize}px`,
    '--res-line-height': customization.lineHeight,
    '--res-heading-scale': customization.headingScale,
    '--res-font-weight': customization.fontWeight || 400,
  };
}
