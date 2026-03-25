// src/components/ressources/card/ResourceAuthor.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import RoleBadge from '../../ui/RoleBadge';
import { useAppTheme } from '../../../theme/theme';

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
  return "A l'instant";
};

export default function ResourceAuthor({ user, createdAt }) {
  const theme = useAppTheme();
  const [relativeTime, setRelativeTime] = useState(timeAgo(createdAt));

  // UX Bank Grade : Actualisation autonome toutes les minutes sans bloquer le thread principal
  useEffect(() => {
    setRelativeTime(timeAgo(createdAt)); 
    
    const intervalId = setInterval(() => {
      setRelativeTime(timeAgo(createdAt));
    }, 60000); // 60 000 ms = 1 minute exacte

    // Nettoyage vital pour eviter les fuites de memoire quand la carte n'est plus a l'ecran
    return () => clearInterval(intervalId);
  }, [createdAt]);
  
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
          {relativeTime}
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