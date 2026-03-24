import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Eye, Download as DownloadIcon, MoreVertical } from 'lucide-react-native';
import DownloadProgress from './DownloadProgress';
import { useAppTheme } from '../../theme/theme';

const formatBytesToMB = (bytes) => {
  if (!bytes) return '0';
  return (bytes / (1024 * 1024)).toFixed(1);
};

const getFormatColor = (format, themePrimary) => {
  switch (format?.toLowerCase()) {
    case 'pdf':
      return '#E25950';
    case 'docx':
    case 'doc':
      return '#2B579A';
    case 'xlsx':
    case 'xls':
      return '#217346';
    default:
      return themePrimary;
  }
};

export default function ResourceCard({
  resource,
  downloadState,
  onDownloadAction,
  onOptions,
  onView,
}) {
  const theme = useAppTheme();

  const fileSizeMB = resource.fileSize
    ? formatBytesToMB(resource.fileSize)
    : resource.fileSizeMB || '0';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.internalPadding}>
        <View style={styles.headerRow}>
          <View style={styles.formatBadgeContainer}>
            <View style={[styles.formatDot, { backgroundColor: getFormatColor(resource.format, theme.colors.primary) }]} />
            <Text style={[styles.formatText, { color: theme.colors.textMuted }]}>
              {resource.format?.toUpperCase()} - {fileSizeMB} MB
            </Text>
          </View>
          <Pressable onPress={() => onOptions && onOptions(resource)} hitSlop={15}>
            <MoreVertical color={theme.colors.textMuted} size={20} />
          </Pressable>
        </View>

        {/* Maintien du clic sur le texte pour les utilisateurs habitues (raccourci) */}
        <Pressable 
          onPress={() => onView && onView(resource)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.contentRow]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {resource.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={3}>
            {resource.description}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <View style={styles.leftFooter}>
            
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primaryDark }]}>
                  {resource.level}
                </Text>
              </View>
              {resource.category && (
                <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {resource.category}
                  </Text>
                </View>
              )}
            </View>

            {/* Nouvelle zone d'action explicite et statistiques regroupees */}
            <View style={styles.actionStatsRow}>
              <Pressable 
                onPress={() => onView && onView(resource)}
                style={({ pressed }) => [
                  styles.viewButton, 
                  { 
                    backgroundColor: theme.colors.primaryLight,
                    opacity: pressed ? 0.7 : 1 
                  }
                ]}
              >
                <Eye color={theme.colors.primaryDark} size={16} />
                <Text style={[styles.viewButtonText, { color: theme.colors.primaryDark }]}>
                  Voir le document
                </Text>
              </Pressable>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Eye color={theme.colors.textDisabled} size={14} />
                  <Text style={[styles.statText, { color: theme.colors.textMuted }]}>
                    {resource.views || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <DownloadIcon color={theme.colors.textDisabled} size={14} />
                  <Text style={[styles.statText, { color: theme.colors.textMuted }]}>
                    {resource.downloads || 0}
                  </Text>
                </View>
              </View>
            </View>

          </View>

          <DownloadProgress
            status={downloadState?.status || 'idle'}
            progress={downloadState?.progress || 0}
            onPress={() => onDownloadAction && onDownloadAction(resource)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, paddingTop: 16, paddingBottom: 16, borderRadius: 24, borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0 },
  internalPadding: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formatBadgeContainer: { flexDirection: 'row', alignItems: 'center' },
  formatDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  formatText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  contentRow: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8, lineHeight: 24 },
  description: { fontSize: 14, lineHeight: 22 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  leftFooter: { flex: 1, paddingRight: 10 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700', maxWidth: 120 },
  actionStatsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  viewButtonText: { fontSize: 14, fontWeight: '700' },
  statsContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '600' },
});