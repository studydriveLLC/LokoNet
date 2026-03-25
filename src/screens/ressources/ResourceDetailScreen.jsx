//src/screens/ressources/ResourceDetailScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Linking, Image, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Download, FileText, Eye, Share2, AlertTriangle, MessageSquare, Clock, File } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';
import { useGetResourceQuery, useLogViewMutation, useLogDownloadMutation, useLogShareMutation } from '../../store/api/resourceApiSlice';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ResourceAuthor from '../../components/ressources/card/ResourceAuthor';
import { showErrorToast, showSuccessToast } from '../../store/slices/uiSlice';

export default function ResourceDetailScreen({ route }) {
  const { resourceId } = route.params;
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [previewError, setPreviewError] = useState(false);

  const { data: resource, isLoading, error } = useGetResourceQuery(resourceId, {
    skip: !resourceId
  });
  
  const [logView] = useLogViewMutation();
  const [logDownload] = useLogDownloadMutation();
  const [logShare] = useLogShareMutation();

  useEffect(() => {
    if (resourceId) {
      logView(resourceId).catch(() => {});
    }
  }, [resourceId, logView]);

  const getPreviewUrl = () => {
    if (!resource?.fileUrl || !resource?.format) return null;
    
    const fmt = resource.format.toLowerCase();
    
    if (fmt === 'jpg' || fmt === 'jpeg' || fmt === 'png') {
      return resource.fileUrl;
    }
    
    if (fmt === 'pdf' && resource.fileUrl.includes('cloudinary.com')) {
      return resource.fileUrl.replace('.pdf', '.jpg').replace('/upload/', '/upload/w_400,h_500,c_fill,pg_1/');
    }
    
    return null;
  };

  const handleDownload = async () => {
    if (!resource?.fileUrl) {
      dispatch(showErrorToast({ message: "Le fichier n'est pas encore disponible." }));
      return;
    }
    try {
      await logDownload(resourceId).unwrap();
      const supported = await Linking.canOpenURL(resource.fileUrl);
      if (supported) {
        await Linking.openURL(resource.fileUrl);
        dispatch(showSuccessToast({ message: "Ouverture du document..." }));
      } else {
        dispatch(showErrorToast({ message: "Impossible d'ouvrir ce lien." }));
      }
    } catch (err) {
      dispatch(showErrorToast({ message: "Erreur lors de la préparation du fichier." }));
    }
  };

  const handleShare = async () => {
    if (!resource?.fileUrl) return;
    
    try {
      const shareOptions = {
        title: resource.title,
        message: `Regarde ce document sur LokoNet : "${resource.title}". \nCatégorie : ${resource.category} - Niveau : ${resource.level}.\nConsulter ici :`,
        url: resource.fileUrl,
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        try {
          await logShare(resourceId).unwrap();
          dispatch(showSuccessToast({ message: "Merci du partage !" }));
        } catch (apiErr) {
        }
      }
    } catch (error) {
      dispatch(showErrorToast({ message: "Impossible d'ouvrir le partage." }));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !resource) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <AlertTriangle color={theme.colors.error} size={56} style={{ marginBottom: 16 }} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Document introuvable</Text>
        <Text style={[styles.errorSubText, { color: theme.colors.textMuted }]}>Il a peut-être été supprimé ou son accès est restreint.</Text>
        <AnimatedButton title="Retourner à l'accueil" onPress={() => navigation.goBack()} style={{ marginTop: 32 }} />
      </View>
    );
  }

  const previewUrl = getPreviewUrl();
  const showVisualFallback = !previewUrl || previewError;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconButton, { backgroundColor: theme.colors.background }]} hitSlop={15}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détail</Text>
        
        <Pressable onPress={handleShare} style={[styles.iconButton, { backgroundColor: theme.colors.background }]} hitSlop={15}>
          <Share2 color={theme.colors.primary} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.heroSection}>
          <View style={[styles.previewContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: '#000' }]}>
            {showVisualFallback ? (
              <View style={[styles.fallbackContent, { backgroundColor: theme.colors.primaryLight }]}>
                <File color={theme.colors.primary} size={48} strokeWidth={1.5} />
                <Text style={[styles.fallbackFmt, { color: theme.colors.primaryDark, backgroundColor: theme.colors.surface }]}>
                    {resource.format?.toUpperCase()}
                </Text>
              </View>
            ) : (
              <Image 
                source={{ uri: previewUrl }} 
                style={styles.previewImage} 
                resizeMode="cover"
                onError={() => setPreviewError(true)}
              />
            )}
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {resource.title}
          </Text>
          <View style={styles.tagsContainer}>
            <Text style={[styles.categoryTag, { color: theme.colors.primaryDark, backgroundColor: theme.colors.primaryLight }]}>
              {resource.category}
            </Text>
            <View style={[styles.levelTag, { borderColor: theme.colors.border }]}>
              <Text style={[styles.levelText, { color: theme.colors.textMuted }]}>{resource.level}</Text>
            </View>
          </View>
        </Animated.View>

        {/* CORRECTION DES PROPS ICI */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <ResourceAuthor user={resource.uploadedBy} createdAt={resource.createdAt} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(300)} style={[styles.statsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.background }]}>
              <Eye color={theme.colors.primary} size={20} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{resource.views || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Vues</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.background }]}>
              <Download color={theme.colors.primary} size={20} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{resource.downloads || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Téléch.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.background }]}>
              <Share2 color={theme.colors.primary} size={20} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{resource.shares || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Partages</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(400)} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À propos de ce document</Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>
            {resource.description || "L'auteur n'a pas fourni de description supplémentaire pour ce document."}
          </Text>
          
          <View style={[styles.dateRow, { borderTopColor: theme.colors.border }]}>
            <Clock color={theme.colors.textDisabled} size={16} />
            <Text style={[styles.dateText, { color: theme.colors.textDisabled }]}>
              Ajouté le {new Date(resource.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>

      <View style={[styles.stickyBottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <AnimatedButton 
          title="Consulter le document" 
          onPress={handleDownload}
          icon={<FileText color={theme.colors.surface} size={22} />}
          variant="primary"
          style={styles.mainButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, zIndex: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
  
  heroSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  previewContainer: { width: 140, height: 180, borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 20, elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  previewImage: { width: '100%', height: '100%' },
  fallbackContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  fallbackFmt: { position: 'absolute', bottom: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: '800', overflow: 'hidden' },

  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 16, lineHeight: 32 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  categoryTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 13, fontWeight: '700', overflow: 'hidden' },
  levelTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  levelText: { fontSize: 13, fontWeight: '600' },
  
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  
  statsCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statDivider: { width: 1, height: '60%', backgroundColor: 'rgba(0,0,0,0.05)', alignSelf: 'center' },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 20 },
  
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 16, borderTopWidth: 1 },
  dateText: { fontSize: 13, fontWeight: '500' },
  
  stickyBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10 },
  mainButton: { width: '100%', height: 56, borderRadius: 16 },
  
  errorText: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  errorSubText: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }
});