// src/components/ressources/card/ResourceStats.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Eye, Download, Share2 } from 'lucide-react-native';
import { useAppTheme } from '../../../theme/theme';

export default function ResourceStats({ views = 0, downloads = 0, shares = 0 }) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Eye color={theme.colors.textDisabled} size={14} />
        <Text style={[styles.statText, { color: theme.colors.textMuted }]}>{views}</Text>
      </View>
      <View style={styles.statItem}>
        <Download color={theme.colors.textDisabled} size={14} />
        <Text style={[styles.statText, { color: theme.colors.textMuted }]}>{downloads}</Text>
      </View>
      {/* Nouvelle statistique de partages */}
      <View style={styles.statItem}>
        <Share2 color={theme.colors.textDisabled} size={14} />
        <Text style={[styles.statText, { color: theme.colors.textMuted }]}>{shares}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '600' },
});