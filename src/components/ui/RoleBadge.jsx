// src/components/ui/RoleBadge.jsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ShieldAlert, ShieldCheck, BadgeCheck } from 'lucide-react-native';
import { useAppTheme } from '../../theme/theme';

export default function RoleBadge({ role, isVerified, size = 15 }) {
  const theme = useAppTheme();

  let badgeConfig = null;

  if (role === 'superadmin') {
    const solidGold = '#F59E0B'; 
    badgeConfig = {
      Icon: ShieldAlert,
      color: solidGold,
      backgroundColor: '#FEF3C7', // Fond plein sans bordure
    };
  } else if (role === 'admin') {
    const adminColor = theme.colors.primaryDark || theme.colors.primary;
    badgeConfig = {
      Icon: ShieldCheck,
      color: adminColor,
      backgroundColor: theme.colors.primaryLight,
    };
  } else if (isVerified) {
    const solidBlue = '#0EA5E9'; 
    badgeConfig = {
      Icon: BadgeCheck,
      color: solidBlue,
      backgroundColor: '#E0F2FE',
    };
  }

  if (!badgeConfig) return null;

  const { Icon, color, backgroundColor } = badgeConfig;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Icon 
        color={color} 
        size={size} 
        strokeWidth={2.5} 
        fill={`${color}40`} // Remplissage interne pour l'effet de densite
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    // Zéro bordure pour un rendu propre et moderne
    borderWidth: 0, 
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  }
});