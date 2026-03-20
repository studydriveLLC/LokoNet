import { Platform, useColorScheme } from 'react-native';

// 1. PALETTES DE COULEURS
// Définies selon les spécifications strictes du projet
const lightColors = {
  // Couleurs Fondamentales
  background: '#F2E6E4', // Blanc un peu cassé (Fond global)
  primary: '#5170FF',    // Bleu (Cartes, boutons, composants sur le fond)
  surface: '#FFFFFF',    // Blanc pur (Éléments à l'intérieur des composants bleus)
  
  // Variantes et contrastes
  primaryDark: '#3A52CC',
  primaryLight: '#8A9FFF',
  
  // Textes (Contraste maximal assuré)
  text: '#0A1524',          // Texte principal (sur fond #F2E6E4 ou #FFFFFF)
  textOnPrimary: '#FFFFFF', // Texte sur fond primaire (#5170FF)
  textMuted: '#4A5568',     // Texte secondaire ou désactivé
  textDisabled: '#A0AABF',
  
  // Bordures et séparateurs (Effet liquid glass et subtilité)
  border: 'rgba(81, 112, 255, 0.15)', // Bordure légèrement bleutée
  divider: 'rgba(10, 21, 36, 0.05)',
  
  // Feedbacks sémantiques
  success: '#27AE60',
  error: '#EB5757',
  warning: '#F2C94C',
  info: '#2D9CDB',
  
  // Transparences et Modales (Liquid Glass System)
  transparent: 'transparent',
  overlay: 'rgba(10, 21, 36, 0.5)',           // Arrière-plan pour flouter l'app (Modales)
  glassBackground: 'rgba(255, 255, 255, 0.75)', // Fond flouté pour composants
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

// Mode Nuit (Logique préparatoire)
const darkColors = {
  background: '#0F1113', 
  primary: '#5170FF',    // Le bleu reste identitaire
  surface: '#1A1D1E',
  
  primaryDark: '#3A52CC',
  primaryLight: '#8A9FFF',
  
  text: '#F2E6E4',       // Le blanc cassé devient le texte principal
  textOnPrimary: '#FFFFFF',
  textMuted: '#94A3B8',
  textDisabled: '#475569',
  
  border: 'rgba(81, 112, 255, 0.25)',
  divider: 'rgba(242, 230, 228, 0.05)',
  
  success: '#2ECC71',
  error: '#FF6B6B',
  warning: '#F1C40F',
  info: '#3498DB',
  
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.8)',
  glassBackground: 'rgba(26, 29, 30, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

// 2. CONSTANTES DE STRUCTURE (Accessibles statiquement)
export const spacing = {
  xxs: 4, xs: 8, s: 12, m: 16, l: 24, xl: 32, xxl: 40, xxxl: 48,
};

export const typography = {
  sizes: { h1: 32, h2: 24, h3: 20, h4: 18, body: 16, caption: 14, small: 12 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
};

export const borderRadius = { s: 4, m: 8, l: 12, xl: 20, xxl: 24, round: 9999 };

// 3. FONCTION GÉNÉRATRICE ET OMBRES IMMERSIVES
const getTheme = (scheme) => {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows: {
      none: { elevation: 0, shadowOpacity: 0 },
      // Ombres douces pour l'effet flottant (Liquid Glass / Immersif)
      small: Platform.select({
        ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
        android: { elevation: 3, shadowColor: colors.primary },
      }),
      medium: Platform.select({
        ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
        android: { elevation: 6, shadowColor: colors.primary },
      }),
      large: Platform.select({
        ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 24 },
        android: { elevation: 10, shadowColor: colors.primary },
      }),
    },
  };
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return getTheme(scheme);
};