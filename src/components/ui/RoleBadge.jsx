// src/components/ui/RoleBadge.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShieldAlert, ShieldCheck, BadgeCheck } from 'lucide-react-native';
import { useAppTheme } from '../../theme/theme';

export default function RoleBadge({ role, isVerified, customBadge, size = 16 }) {
  const theme = useAppTheme();

  // Niveau 1 : Super Admin (Badge Or exclusif)
  if (role === 'superadmin') {
    return (
      <View style={styles.badgeContainer}>
        <ShieldAlert color="#FFD700" size={size} />
      </View>
    );
  }

  // Niveau 2 : Admin (Badge d'autorité aux couleurs de l'app)
  if (role === 'admin') {
    return (
      <View style={styles.badgeContainer}>
        <ShieldCheck color={theme.colors.primary} size={size} />
      </View>
    );
  }

  // Niveau 3 : Utilisateur vérifié (Style classique certifié)
  if (isVerified) {
    return (
      <View style={styles.badgeContainer}>
        <BadgeCheck color="#1DA1F2" size={size} />
      </View>
    );
  }

  // (Optionnel) Niveau 4 : Badges personnalisés stockés en base
  if (customBadge) {
    // Logique future pour des badges d'événements etc.
  }

  return null;
}

const styles = StyleSheet.create({
  badgeContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  }
});