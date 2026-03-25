// src/components/ressources/card/ResourceAuthor.jsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import RoleBadge from '../../ui/RoleBadge';
import { useAppTheme } from '../../../theme/theme';

// Formateur de temps relatif natif (zéro dépendance lourde)
const timeAgo = (dateInput) => {
  if (!dateInput) return '';
  const seconds = Math.floor((new Date() - new Date(dateInput)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' an(s)';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' mois';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' j';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' h';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' min';
  return "À l'instant";
};

export default function ResourceAuthor({ user, createdAt }) {
  const theme = useAppTheme();
  
  if (!user) return null;
  const avatarUrl = user.avatar || 'https://ui-avatars.com/api/?name=User&background=random';

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.pseudo, { color: theme.colors.text }]} numberOfLines={1}>
            {user.pseudo || 'Utilisateur anonyme'}
          </Text>
          <RoleBadge role={user.role} isVerified={user.isVerified} customBadge={user.badge} size={14} />
        </View>
        <Text style={[styles.date, { color: theme.colors.textMuted }]}>
          {timeAgo(createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#E1E8ED' },
  textContainer: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  pseudo: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 12, marginTop: 2 }
});