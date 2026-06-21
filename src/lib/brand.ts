/**
 * Brand color tokens — always reference CSS variables from globals.css.
 * Use in inline styles, charts, and JS where Tailwind classes are not available.
 */
export const brand = {
  green: 'var(--brand-green)',
  greenDark: 'var(--brand-green-dark)',
  greenDeep: 'var(--brand-green-deep)',
  mint: 'var(--brand-mint)',
  yellow: 'var(--brand-yellow)',
  ink: 'var(--brand-ink)',
  white: 'var(--brand-white)',
  surface: 'var(--brand-surface)',
  canvas: 'var(--brand-canvas)',
  pageBg: 'var(--brand-page-bg)',
  mintWash: 'var(--brand-mint-wash)',
  muted: 'var(--brand-muted)',
  mutedLight: 'var(--brand-muted-light)',
  border: 'var(--brand-border)',
  greenDarker: 'var(--brand-green-darker)',
  greenFooter: 'var(--brand-green-footer)',
  mintHover: 'var(--brand-mint-hover)',
  videoBg: 'var(--brand-video-bg)',
  cardTint: 'var(--brand-card-tint)',
  loginHighlight: 'var(--brand-login-highlight)',
  gradientLight: 'var(--brand-gradient-light)',
  gradientMid: 'var(--brand-gradient-mid)',
} as const;

/** Chart palette using brand variables */
export const brandChartColors = [
  brand.green,
  brand.mint,
  brand.greenDark,
  'var(--brand-mint-soft)',
  brand.yellow,
  'var(--brand-mint-medium)',
] as const;
