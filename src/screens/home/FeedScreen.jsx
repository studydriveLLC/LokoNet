import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, DeviceEventEmitter, Text, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AnimatedHeader from '../../components/navigation/AnimatedHeader';
import PostCard from '../../components/feed/PostCard';
import CommentsModal from '../../components/feed/CommentsModal';
import PostDescriptionModal from '../../components/feed/PostDescriptionModal';
import ShareModal from '../../components/feed/ShareModal';
import PostOptionsModal from '../../components/feed/PostOptionsModal';
import { useGetFeedQuery, useToggleLikeMutation } from '../../store/api/postApiSlice';
import { useAppTheme } from '../../theme/theme';

const mapPostFromBackend = (post) => {
  const media = (post.content?.mediaUrls || []).map((url) => ({
    type: post.content?.mediaType || 'image',
    url: url,
  }));

  return {
    _id: post._id,
    author: {
      pseudo: post.author?.pseudo || 'Utilisateur',
      avatar: post.author?.avatar || null,
      hasBadge: post.author?.badgeType !== 'none' && post.author?.badgeType !== undefined,
      firstName: post.author?.firstName || '',
      lastName: post.author?.lastName || '',
      university: post.author?.university || '',
    },
    date: formatDate(post.createdAt),
    description: post.content?.text || '',
    likes: post.stats?.likes || 0,
    comments: post.stats?.comments || 0,
    shares: post.stats?.shares || 0,
    isLikedByMe: post.isLikedByMe || false,
    media: media,
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export default function FeedScreen({ navigation }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const user = useSelector((state) => state.auth.user);
  const listRef = useRef(null);

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [activeDescPost, setActiveDescPost] = useState(null);
  const [activeSharePost, setActiveSharePost] = useState(null);
  const [activeOptionsPost, setActiveOptionsPost] = useState(null);

  const {
    data: posts = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetFeedQuery();

  const [toggleLike] = useToggleLikeMutation();
  const transformedPosts = posts.map(mapPostFromBackend);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Smart tab press - refresh + scroll to top securise
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('SMART_TAB_PRESS', (event) => {
      if (event.routeName !== 'PourToi') return;
      
      if (listRef.current) {
        if (typeof listRef.current.scrollToOffset === 'function') {
          listRef.current.scrollToOffset({ offset: 0, animated: true });
        } else if (listRef.current.getNode && typeof listRef.current.getNode().scrollToOffset === 'function') {
          listRef.current.getNode().scrollToOffset({ offset: 0, animated: true });
        }
      }
      
      refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  const handleLike = async (postId) => {
    try {
      await toggleLike(postId).unwrap();
    } catch (error) {
      console.log('Erreur like:', error);
    }
  };

  const handleDelete = async (postId) => {
    console.log('Supprimer post:', postId);
  };

  const renderContent = () => {
    if (isLoading && !posts.length) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Chargement du feed...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Erreur lors du chargement
          </Text>
          <Text style={[styles.retryText, { color: theme.colors.primary }]} onPress={refetch}>
            Appuyez pour reessayer
          </Text>
        </View>
      );
    }

    if (!transformedPosts.length) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Aucune publication pour le moment.
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textDisabled }]}>
            Soyez le premier a publier quelque chose !
          </Text>
        </View>
      );
    }

    return (
      <Animated.FlatList
        ref={listRef}
        data={transformedPosts}
        keyExtractor={(item) => item._id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={{
          paddingTop: 140 + insets.top,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?._id}
            onOpenComments={() => setActiveCommentPost(item)}
            onOpenDescription={() => setActiveDescPost(item)}
            onOpenShare={() => setActiveSharePost(item)}
            onOpenOptions={() => setActiveOptionsPost(item)}
            onLike={() => handleLike(item._id)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AnimatedHeader scrollY={scrollY} title="Pour Toi" navigation={navigation} />
      {renderContent()}

      <CommentsModal
        visible={!!activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        post={activeCommentPost}
      />

      <PostDescriptionModal
        visible={!!activeDescPost}
        onClose={() => setActiveDescPost(null)}
        author={activeDescPost?.author}
        date={activeDescPost?.date}
        description={activeDescPost?.description}
      />

      <ShareModal
        visible={!!activeSharePost}
        onClose={() => setActiveSharePost(null)}
        postId={activeSharePost?._id}
      />

      <PostOptionsModal
        visible={!!activeOptionsPost}
        onClose={() => setActiveOptionsPost(null)}
        isMyPost={activeOptionsPost?.author?.pseudo === user?.pseudo}
        onDelete={() => handleDelete(activeOptionsPost?._id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 140,
    paddingHorizontal: 32,
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  retryText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  emptyText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { marginTop: 8, fontSize: 14, textAlign: 'center' },
});