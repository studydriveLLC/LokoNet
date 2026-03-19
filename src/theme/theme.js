import { Platform } from 'react-native';

// 1. PALETTE DE COULEURS (Adaptée pour StudyDrive)
export const colors = {
  // Couleurs de marque
  primary: '#2F80ED',       // Bleu académique
  primaryLight: '#DCE8FA',  // Bleu très clair (pour les fonds de badges ou boutons secondaires)
  primaryDark: '#1D5CBB',   // Bleu foncé (pour les états pressés)
  
  secondary: '#F2994A',     // Orange dynamique (notifications, actions importantes)
  secondaryLight: '#FCE7D4',
  secondaryDark: '#C97732',

  // Couleurs de fond et de surface
  background: '#F8F9FA',    // Gris très clair, reposant pour la lecture
  surface: '#FFFFFF',       // Blanc pur pour les cartes et modales
  surfaceHighlight: '#F2F4F7', // Blanc cassé pour les survols ou sélections

  // Texte
  text: '#1A1D1E',          // Noir doux (meilleur contraste que le noir pur)
  textMuted: '#68778D',     // Gris pour les sous-titres, dates, légendes
  textDisabled: '#A0AABF',  // Gris clair pour le texte inactif

  // Bordures et séparateurs
  border: '#E2E8F0',
  divider: '#EDF2F7',

  // Couleurs sémantiques (Statuts)
  success: '#27AE60',       // Validations, notes positives
  successLight: '#D4EFDF',
  error: '#EB5757',         // Erreurs, suppressions
  errorLight: '#FADBD8',
  warning: '#F2C94C',       // Avertissements
  warningLight: '#FCF3D1',
  info: '#2D9CDB',          // Informations système
  infoLight: '#D5EBF7',

  // Utilitaires
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)', // Pour le fond des modales
};

// 2. ESPACEMENTS (Basés sur une grille de 4px)
export const spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,    // Espacement standard
  l: 24,    // Marges externes standard
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// 3. TYPOGRAPHIE
export const typography = {
  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,     // Texte de lecture principal (cours, posts)
    caption: 14,  // Petit texte (dates, boutons secondaires)
    small: 12,    // Micro-texte (mentions légales, tags)
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// 4. BORDURES (Border Radius)
export const borderRadius = {
  s: 4,
  m: 8,     // Arrondi standard pour inputs et boutons
  l: 12,    // Arrondi pour les cartes
  xl: 20,   // Arrondi pour les modales ou bottoms sheets
  round: 9999, // Pilules ou Avatars
};

// 5. OMBRES (Cross-platform: iOS & Android)
// C'est ici que la magie opère pour avoir un rendu pro sur les deux plateformes
export const shadows = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },
  small: Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }),
};

// 6. EXPORT GLOBAL
// Permet d'importer tout le thème d'un coup : import theme from '../../theme/theme';
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;