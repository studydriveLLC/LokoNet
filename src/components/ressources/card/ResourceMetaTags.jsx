// src/components/ressources/card/ResourceMetaTags.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GraduationCap, Folder } from 'lucide-react-native';
import { useAppTheme } from '../../../theme/theme';

export default function ResourceMetaTags({ level, category }) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
        <GraduationCap color={theme.colors.primaryDark} size={14} />
        <Text style={[styles.badgeText, { color: theme.colors.primaryDark }]}>{level}</Text>
      </View>

      {category && (
        <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
          <Folder color={theme.colors.textMuted} size={14} />
          <Text style={[styles.badgeText, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {category}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700', maxWidth: 120 },
});