//src/screens/profile/UserProfileScreen.jsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, Modal, Image, Vibration } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreHorizontal, AlertTriangle, X, Plus, Upload, Link as LinkIcon, Share2 } from 'lucide-react-native';
import { useSelector } from 'react-redux';

import { useAppTheme } from '../../theme/theme';
import { useGetUserProfileQuery } from '../../store/api/userApiSlice';
import { useGetResourcesQuery } from '../../store/api/resourceApiSlice';
import { useGetUserPostsQuery } from '../../store/api/postApiSlice'; 

import UserProfileHero from '../../components/profile/UserProfileHero';
import UserProfileContent from '../../components/profile/UserProfileContent';
import ProfileTabBar from '../../components/profile/ProfileTabBar';
import UserProfileSkeleton from '../../components/profile/UserProfileSkeleton';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ScrollToTopButton from '../../components/ui/ScrollToTopButton';
import BottomSheet from '../../components/ui/BottomSheet';

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const currentUser = useSelector((state) => state.auth.user);
  
  const scrollViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const scrollY = useSharedValue(0);

  const { data: profile, isLoading: isProfileLoading, isFetching: isProfileFetching, refetch: refetchProfile, isError } = useGetUserProfileQuery(userId, { skip: !userId });
  const { data: resources, isLoading: isResourcesLoading, refetch: refetchResources } = useGetResourcesQuery({ uploadedBy: userId }, { skip: !userId });
  const { data: posts, isLoading: isPostsLoading, refetch: refetchPosts } = useGetUserPostsQuery({ userId: userId }, { skip: !userId });

  const isMe = currentUser?._id === profile?._id;
  const safeResources = resources || [];
  const safePosts = posts || [];
  const actualResourceCount = profile?.publicStats?.documents ?? safeResources.length ?? 0;
  const actualPostCount = profile?.publicStats?.posts ?? safePosts.length ?? 0;

  const PROFILE_TABS = [
    { key: 'posts', label: 'Publications' },
    { key: 'resources', label: 'Ressources' }
  ];

  const handleRefresh = async () => {
    refetchProfile();
    refetchPosts();
    refetchResources();
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { 
      if (scrollY && event && event.contentOffset) {
        scrollY.value = event.contentOffset.y; 
      }
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const sv = scrollY ? scrollY.value : 0;
    const opacity = interpolate(sv, [120, 160], [0, 1], Extrapolation.CLAMP);
    return { opacity, pointerEvents: opacity > 0.5 ? 'auto' : 'none' };
  });

  const backButtonStyle = useAnimatedStyle(() => {
    const sv = scrollY ? scrollY.value : 0;
    const opacity = interpolate(sv, [120, 160], [1, 0], Extrapolation.CLAMP);
    return { opacity, pointerEvents: opacity > 0.5 ? 'auto' : 'none' };
  });

  const headerAvatarStyle = useAnimatedStyle(() => {
    const sv = scrollY ? scrollY.value : 0;
    const opacity = interpolate(sv, [160, 200], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(sv, [160, 200], [0.8, 1], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const fabStyle = useAnimatedStyle(() => {
    const sv = scrollY ? scrollY.value : 0;
    const opacity = interpolate(sv, [200, 300], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(sv, [200, 300], [20, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }], zIndex: sv > 250 ? 100 : -1 };
  });

  if (isProfileLoading) return <UserProfileSkeleton />;

  if (isError || !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <AlertTriangle color={theme.colors.error} size={56} style={{ marginBottom: 16 }} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Profil introuvable</Text>
        <AnimatedButton title="Retour" onPress={() => navigation.goBack()} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Modal visible={isAvatarModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsAvatarModalVisible(false)}>
        <View style={styles.modalBackground}>
          <Pressable onPress={() => setIsAvatarModalVisible(false)} style={[styles.closeModalButton, { top: insets.top + 20 }]}>
            <X color="#FFF" size={32} />
          </Pressable>
          <Image source={{ uri: profile.avatar || 'https://ui-avatars.com/api/?name=User' }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>

      <BottomSheet visible={isMenuVisible} onClose={() => setIsMenuVisible(false)}>
        <View style={styles.menuContent}>
          <Pressable style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} onPress={() => setIsMenuVisible(false)}>
            <LinkIcon color={theme.colors.text} size={22} />
            <Text style={[styles.menuText, { color: theme.colors.text }]}>Copier le lien du profil</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => setIsMenuVisible(false)}>
            <Share2 color={theme.colors.text} size={22} />
            <Text style={[styles.menuText, { color: theme.colors.text }]}>Partager le profil</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top + 10, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }, stickyHeaderStyle]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={15}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Animated.Image source={{ uri: profile.avatar || 'https://ui-avatars.com/api/?name=User' }} style={[styles.headerSmallAvatar, headerAvatarStyle]} />
          <Text style={[styles.stickyName, { color: theme.colors.text }]} numberOfLines={1}>
            {profile.pseudo || profile.firstName}
          </Text>
        </View>
        <Pressable onPress={() => setIsMenuVisible(true)} style={styles.iconButton} hitSlop={15}>
          <MoreHorizontal color={theme.colors.text} size={24} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.absoluteHeader, { top: insets.top + 10 }, backButtonStyle]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.blurButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]} hitSlop={15}>
          <ArrowLeft color="#FFF" size={24} />
        </Pressable>
        <Pressable onPress={() => setIsMenuVisible(true)} style={[styles.blurButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]} hitSlop={15}>
          <MoreHorizontal color="#FFF" size={24} />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isProfileFetching} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        stickyHeaderIndices={[1]}
      >
        <UserProfileHero 
          profile={profile} 
          scrollY={scrollY} 
          onAvatarPress={() => setIsAvatarModalVisible(true)}
          postCount={actualPostCount}
          resourceCount={actualResourceCount}
        />

        <ProfileTabBar 
          tabs={PROFILE_TABS} 
          activeTab={activeTab} 
          onTabPress={setActiveTab} 
        />

        <UserProfileContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          posts={safePosts}
          resources={safeResources}
          isPostsLoading={isPostsLoading}
          isResourcesLoading={isResourcesLoading}
          theme={theme}
        />
      </Animated.ScrollView>

      <Animated.View style={[styles.fabContainer, fabStyle]}>
        {isMe ? (
          <Pressable 
            style={[styles.smartFab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
            onPress={() => Vibration.vibrate(40)}
          >
            {activeTab === 'posts' ? (
              <Animated.View key="post" entering={FadeIn} exiting={FadeOut}>
                <Plus color="#FFF" size={26} />
              </Animated.View>
            ) : (
              <Animated.View key="res" entering={FadeIn} exiting={FadeOut}>
                <Upload color="#FFF" size={24} />
              </Animated.View>
            )}
          </Pressable>
        ) : (
          <ScrollToTopButton onPress={scrollToTop} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  absoluteHeader: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 100 },
  blurButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, zIndex: 90 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', marginHorizontal: 16 },
  headerSmallAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stickyName: { fontSize: 18, fontWeight: '800' },
  errorText: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeModalButton: { position: 'absolute', right: 20, zIndex: 10, padding: 8 },
  fullScreenImage: { width: '100%', height: '80%' },
  fabContainer: { position: 'absolute', bottom: 30, right: 20 },
  smartFab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  menuContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  menuText: { fontSize: 16, fontWeight: '600', marginLeft: 16 },
});