// ─── Premium Dark-Mode Theme ─────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#6366f1',       // Indigo vibrant
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  primaryGlow: 'rgba(99,102,241,0.18)',

  accent: '#f472b6',        // Pink accent
  accentGlow: 'rgba(244,114,182,0.18)',

  success: '#22c55e',
  successBg: 'rgba(34,197,94,0.12)',
  successBorder: 'rgba(34,197,94,0.3)',

  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.12)',
  dangerBorder: 'rgba(239,68,68,0.3)',

  info: '#38bdf8',
  infoBg: 'rgba(56,189,248,0.12)',
  infoBorder: 'rgba(56,189,248,0.3)',

  warning: '#fb923c',
  warningBg: 'rgba(251,146,60,0.12)',

  // Dark background system
  bg: '#0f0f13',
  bgCard: '#1a1a24',
  bgElevated: '#22223a',
  surface: '#16162a',
  surfaceHigh: '#20203a',

  // Glass
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassBorderLight: 'rgba(255,255,255,0.14)',

  // Text
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  onPrimary: '#ffffff',

  // Gradient stops (used as string references)
  gradientStart: '#1e1b4b',
  gradientEnd: '#0f0f13',

  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.15)',

  // Google brand
  googleRed: '#EA4335',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  glow: {
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
};

// Gradient definitions (for use with LinearGradient or manual stops)
export const gradients = {
  hero: ['#1e1b4b', '#0f172a', '#0f0f13'],
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'],
  primary: ['#818cf8', '#6366f1', '#4f46e5'],
  success: ['rgba(34,197,94,0.2)', 'rgba(34,197,94,0.05)'],
  danger: ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.05)'],
};