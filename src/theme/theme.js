import { Platform, useColorScheme } from 'react-native';

// 1. PALETTES DE COULEURS
const lightColors = {
  primary: '#2F80ED',
  primaryLight: '#DCE8FA',
  primaryDark: '#1D5CBB',
  secondary: '#F2994A',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1D1E',
  textMuted: '#68778D',
  textDisabled: '#A0AABF',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  success: '#27AE60',
  error: '#EB5757',
  warning: '#F2C94C',
  info: '#2D9CDB',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  primary: '#4791FF',
  primaryLight: '#1A2B42',
  primaryDark: '#0A1524',
  secondary: '#F2994A',
  background: '#0F1113',
  surface: '#1A1D1E',
  text: '#F8F9FA',
  textMuted: '#94A3B8',
  textDisabled: '#475569',
  border: '#2D3748',
  divider: '#1E293B',
  success: '#2ECC71',
  error: '#FF6B6B',
  warning: '#F1C40F',
  info: '#3498DB',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

// 2. CONSTANTES DE STRUCTURE (Accessibles statiquement)
export const spacing = {
  xxs: 4, xs: 8, s: 12, m: 16, l: 24, xl: 32, xxl: 40, xxxl: 48,
};

export const typography = {
  sizes: { h1: 32, h2: 24, h3: 20, h4: 18, body: 16, caption: 14, small: 12 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
};

export const borderRadius = { s: 4, m: 8, l: 12, xl: 20, round: 9999 };

// 3. FONCTION GÉNÉRATRICE
const getTheme = (scheme) => {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows: {
      none: { elevation: 0, shadowOpacity: 0 },
      small: Platform.select({
        ios: { shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 2 },
      }),
      medium: Platform.select({
        ios: { shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
        android: { elevation: 4 },
      }),
    },
  };
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return getTheme(scheme);
};