//src/components/profile/UserProfileContent.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LayoutList, FileText } from 'lucide-react-native';

import PostCard from '../feed/PostCard';
import ResourceCard from '../ressources/ResourceCard';
import SkeletonPostCard from '../feed/SkeletonPostCard';
import SkeletonResourceCard from '../ressources/SkeletonResourceCard';

const { width } = Dimensions.get('window');

export default function UserProfileContent({ 
  activeTab, 
  setActiveTab, 
  posts, 
  resources, 
  isPostsLoading, 
  isResourcesLoading, 
  theme 
}) {
  const scrollRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    const index = activeTab === 'posts' ? 0 : 1;
    isProgrammaticScroll.current = true;
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    
    const timeout = setTimeout(() => { 
      isProgrammaticScroll.current = false; 
    }, 300);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const handleMomentumEnd = (event) => {
    if (isProgrammaticScroll.current) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveTab(index === 0 ? 'posts' : 'resources');
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleMomentumEnd}
      scrollEventThrottle={16}
      bounces={false}
      style={styles.container}
    >
      <View style={[styles.page, { width }]}>
        {isPostsLoading ? (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <View key={post._id} style={styles.cardWrapper}>
              <PostCard post={post} />
            </View>
          ))
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}>
              <LayoutList color={theme.colors.primary} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Aucune publication</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Cet utilisateur n'a pas encore partagé de pensée sur son fil.
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={[styles.page, { width }]}>
        {isResourcesLoading ? (
          <>
            <SkeletonResourceCard />
            <SkeletonResourceCard />
          </>
        ) : resources.length > 0 ? (
          resources.map((resource) => (
            <View key={resource._id} style={styles.cardWrapper}>
              <ResourceCard resource={resource} />
            </View>
          ))
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}>
              <FileText color={theme.colors.primary} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Aucune ressource</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Cet utilisateur n'a pas encore partagé de document éducatif.
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120, minHeight: 600 },
  cardWrapper: { marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyIconWrapper: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  emptyText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
});