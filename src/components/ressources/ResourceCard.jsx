// src/components/ressources/ResourceCard.jsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Eye, Share2, MoreVertical } from 'lucide-react-native';
import DownloadProgress from './DownloadProgress';
import ResourceAuthor from './card/ResourceAuthor';
import ResourceStats from './card/ResourceStats';
import ResourceFormatBadge from './card/ResourceFormatBadge';
import ResourceMetaTags from './card/ResourceMetaTags';
import { useAppTheme } from '../../theme/theme';

export default function ResourceCard({
  resource,
  downloadState,
  onDownloadAction,
  onOptions,
  onView,
  onShare 
}) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.internalPadding}>
        
        <View style={styles.headerRow}>
          <ResourceAuthor user={resource.uploadedBy} createdAt={resource.createdAt} />
          <Pressable onPress={() => onOptions && onOptions(resource)} hitSlop={15} style={styles.optionsBtn}>
            <MoreVertical color={theme.colors.textMuted} size={20} />
          </Pressable>
        </View>

        <Pressable 
          onPress={() => onView && onView(resource)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.contentArea]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {resource.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={3}>
            {resource.description}
          </Text>
          
          <View style={styles.tagsContainer}>
            <ResourceFormatBadge 
              format={resource.format} 
              fileSize={resource.fileSize} 
              fileSizeMBFallback={resource.fileSizeMB} 
            />
            <ResourceMetaTags level={resource.level} category={resource.category} />
          </View>
        </Pressable>

        <View style={styles.footerRow}>
          <View style={styles.actionContainer}>
            <View style={styles.buttonsRow}>
              <Pressable 
                onPress={() => onView && onView(resource)}
                style={({ pressed }) => [
                  styles.viewButton, 
                  { backgroundColor: theme.colors.primaryLight, opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Eye color={theme.colors.primaryDark} size={16} />
                <Text style={[styles.viewButtonText, { color: theme.colors.primaryDark }]}>
                  Consulter
                </Text>
              </Pressable>

              {onShare && (
                <Pressable onPress={() => onShare(resource)} style={styles.iconButton}>
                  <Share2 color={theme.colors.textMuted} size={20} />
                </Pressable>
              )}
            </View>

            <View style={styles.statsRow}>
              <ResourceStats 
                views={resource.views} 
                downloads={resource.downloads} 
                shares={resource.shares} 
              />
            </View>
          </View>

          <View style={styles.downloadContainer}>
            <DownloadProgress
              status={downloadState?.status || 'idle'}
              progress={downloadState?.progress || 0}
              onPress={() => onDownloadAction && onDownloadAction(resource)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, paddingTop: 16, paddingBottom: 16, borderRadius: 24, borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0 },
  internalPadding: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optionsBtn: { paddingLeft: 10 },
  contentArea: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8, lineHeight: 24 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  actionContainer: { flexDirection: 'column', gap: 10, flex: 1, paddingRight: 10 },
  buttonsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statsRow: { marginTop: 2 }, 
  
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  viewButtonText: { fontSize: 13, fontWeight: '700' },
  iconButton: { padding: 6, borderRadius: 8, backgroundColor: 'transparent' },
  
  downloadContainer: { paddingBottom: 4 }
});