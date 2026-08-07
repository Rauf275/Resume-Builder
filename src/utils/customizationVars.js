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

// html2canvas (used for PDF/image export) has no parser for the CSS Color 4
// `color-mix()` function — templates that relied on it in a layout-critical
// spot (Bulletin, Aurora, Contemporary, Skyline, Timeline) would throw during
// export and silently fail to download. We precompute the same tint/shade
// colors here in JS and hand them over as plain rgb()/rgba() custom
// properties instead, so every renderer (browser and html2canvas alike) gets
// a color it actually understands.
function hexToRgb(hex) {
  const clean = (hex || '').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Mirrors `color-mix(in srgb, colorA pct%, colorB)`.
function mix(hexA, pct, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = pct / 100;
  const r = Math.round(a.r * t + b.r * (1 - t));
  const g = Math.round(a.g * t + b.g * (1 - t));
  const bl = Math.round(a.b * t + b.b * (1 - t));
  return `rgb(${r}, ${g}, ${bl})`;
}

// Mirrors `color-mix(in srgb, colorA pct%, transparent)`.
function mixAlpha(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${pct / 100})`;
}

export function buildResumeCSSVars(customization) {
  const accent = customization.accentColor;
  return {
    '--res-accent': accent,
    '--res-secondary': customization.secondaryColor,
    '--res-font': FONT_STACKS[customization.font] || FONT_STACKS['Public Sans'],
    '--res-font-size': `${customization.fontSize}px`,
    '--res-line-height': customization.lineHeight,
    '--res-heading-scale': customization.headingScale,
    '--res-font-weight': customization.fontWeight || 400,

    // Precomputed tints/shades — see note above. Percentages match what each
    // template used to pass straight to color-mix(); the Bulletin sidebar
    // ones are raised a bit (7%→18%, 20%→40%) so the chosen accent color
    // actually reads as that color on the page's largest colored surface,
    // instead of a barely-there hint of it.
    '--res-tag-bg': mix(accent, 14, '#ffffff'),
    '--res-tag-text': mix(accent, 70, '#000000'),
    '--res-bulletin-side-bg': mix(accent, 18, '#F7F5F0'),
    '--res-bulletin-side-border': mix(accent, 40, '#E9E5DA'),
    '--res-aurora-side-bg': mix(accent, 8, '#ffffff'),
    '--res-aurora-side-border': mix(accent, 22, '#ffffff'),
    '--res-aurora-shadow': mixAlpha(accent, 30),
    '--res-contemporary-grad': mix(accent, 10, '#ffffff'),
    '--res-skyline-side-bg': mix(accent, 7, '#ffffff'),
    '--res-skyline-side-border': mix(accent, 20, '#ffffff'),
    '--res-timeline-border': mix(accent, 30, '#ffffff'),
  };
}
