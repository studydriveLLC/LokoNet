// src/components/ressources/card/ResourceFormatBadge.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../theme/theme';

const formatBytesToMB = (bytes) => {
  if (!bytes) return '0';
  return (bytes / (1024 * 1024)).toFixed(1);
};

const getFormatColor = (format, themePrimary) => {
  switch (format?.toLowerCase()) {
    case 'pdf': return '#E25950';
    case 'docx': case 'doc': return '#2B579A';
    case 'xlsx': case 'xls': return '#217346';
    case 'ppt': case 'pptx': return '#D24726';
    default: return themePrimary;
  }
};

export default function ResourceFormatBadge({ format, fileSize, fileSizeMBFallback }) {
  const theme = useAppTheme();
  
  const fileSizeMB = fileSize ? formatBytesToMB(fileSize) : fileSizeMBFallback || '0';
  const formatColor = getFormatColor(format, theme.colors.primary);

  return (
    <View style={styles.formatBadgeContainer}>
      <View style={[styles.formatDot, { backgroundColor: formatColor }]} />
      <Text style={[styles.formatText, { color: theme.colors.textMuted }]}>
        {format?.toUpperCase()} - {fileSizeMB} MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formatBadgeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 4 
  },
  formatDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  formatText: { 
    fontSize: 12, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
});