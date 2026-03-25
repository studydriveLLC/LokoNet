//src/screens/notifications/NotificationsScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, BellRing, Trash2, X } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { useAppTheme } from '../../theme/theme';
import { showSuccessToast, showErrorToast } from '../../store/slices/uiSlice';
import ScrollToTopButton from '../../components/ui/ScrollToTopButton';
import SkeletonNotificationCard from '../../components/notifications/SkeletonNotificationCard';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteMultipleNotificationsMutation,
  useDeleteAllNotificationsMutation
} from '../../store/api/notificationApiSlice';

const EmptyStateAnimation = ({ theme }) => {
  const floatAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [floatAnim, pulseAnim]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }]
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 1.5 - pulseAnim.value 
  }));

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.animationWrapper}>
        <Animated.View style={[styles.pulseCircle, { backgroundColor: theme.colors.primary }, shadowStyle]} />
        <Animated.View style={iconStyle}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}>
            <BellRing color={theme.colors.primary} size={36} />
          </View>
        </Animated.View>
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Tout est calme par ici</Text>
      <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
        Vous n'avez aucune notification pour le moment. Nous vous previendrons des qu'il y a du nouveau.
      </Text>
    </View>
  );
};

export default function NotificationsScreen({ navigation }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const listRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery({ page: 1, limit: 50 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteOne] = useDeleteNotificationMutation();
  const [deleteMultiple, { isLoading: isDeletingMultiple }] = useDeleteMultipleNotificationsMutation();
  const [deleteAll, { isLoading: isDeletingAll }] = useDeleteAllNotificationsMutation();

  const notifications = data?.data?.notifications || [];
  const isSelectionMode = selectedIds.length > 0;

  const handleNotificationPress = async (notification) => {
    if (isSelectionMode) {
      toggleSelection(notification._id);
      return;
    }
    
    if (!notification.isRead) {
      try { await markAsRead(notification._id).unwrap(); } catch (error) {}
    }

    if (notification.dataPayload && notification.dataPayload.screen) {
      const { screen, ...params } = notification.dataPayload;
      navigation.navigate(screen, params);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleDeleteOne = async (id) => {
    try {
      await deleteOne(id).unwrap(); 
    } catch (error) {
      dispatch(showErrorToast({ message: "Erreur lors de la suppression." }));
    }
  };

  const handleDeleteMultiple = async () => {
    if (isDeletingMultiple) return;
    try {
      await deleteMultiple(selectedIds).unwrap();
      setSelectedIds([]);
      dispatch(showSuccessToast({ message: "Notifications supprimees." }));
    } catch (error) {
      dispatch(showErrorToast({ message: "Erreur lors de la suppression." }));
    }
  };

  const handleDeleteAll = async () => {
    if (isDeletingAll) return;
    try {
      await deleteAll().unwrap();
      dispatch(showSuccessToast({ message: "Corbeille videe avec succes." }));
    } catch (error) {
      dispatch(showErrorToast({ message: "Erreur lors de la suppression." }));
    }
  };

  const renderRightActions = (id) => {
    return (
      <Pressable style={[styles.deleteSwipeAction, { backgroundColor: theme.colors.error }]} onPress={() => handleDeleteOne(id)}>
        <Trash2 color={theme.colors.surface} size={24} />
      </Pressable>
    );
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    const isSelected = selectedIds.includes(item._id);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item._id)} overshootRight={false}>
        <Pressable 
          onLongPress={() => toggleSelection(item._id)}
          onPress={() => handleNotificationPress(item)}
          style={({ pressed }) => [
            styles.notificationBubble,
            { backgroundColor: isUnread ? theme.colors.primaryLight : theme.colors.surface },
            isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
            !isSelected && { borderColor: theme.colors.border, borderWidth: 1 },
            pressed && { opacity: 0.8 }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: isUnread ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)' }]}>
            <BellRing color={isUnread ? theme.colors.primaryDark : theme.colors.textMuted} size={20} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.text, fontWeight: isUnread ? '700' : '600' }]}>{item.title || "Notification"}</Text>
            <Text style={[styles.message, { color: theme.colors.textMuted }]} numberOfLines={2}>{item.content || item.message}</Text>
            <Text style={[styles.time, { color: theme.colors.textDisabled }]}>{new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
          {isSelected && <View style={[styles.selectedOverlay, { backgroundColor: theme.colors.primary }]}><CheckCircle2 color={theme.colors.surface} size={16} /></View>}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={15}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isSelectionMode ? `${selectedIds.length} selectionnee(s)` : 'Notifications'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {isSelectionMode ? (
            <>
              <Pressable onPress={handleDeleteMultiple} disabled={isDeletingMultiple} style={styles.headerBtn} hitSlop={10}>
                {isDeletingMultiple ? <ActivityIndicator size="small" color={theme.colors.error} /> : <Trash2 color={theme.colors.error} size={24} />}
              </Pressable>
              <Pressable onPress={() => setSelectedIds([])} disabled={isDeletingMultiple} style={styles.headerBtn} hitSlop={10}>
                <X color={theme.colors.text} size={24} />
              </Pressable>
            </>
          ) : (
            <>
              {notifications.length > 0 && (
                <Pressable onPress={handleDeleteAll} disabled={isDeletingAll} style={styles.headerBtn} hitSlop={10}>
                  {isDeletingAll ? <ActivityIndicator size="small" color={theme.colors.error} /> : <Trash2 color={theme.colors.error} size={22} />}
                </Pressable>
              )}
              {notifications.some(n => !n.isRead) && (
                <Pressable onPress={() => markAllAsRead()} disabled={isMarkingAll} style={styles.headerBtn} hitSlop={10}>
                  {isMarkingAll ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <CheckCircle2 color={theme.colors.primary} size={24} />}
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={() => (
          isLoading ? (
            <View>
              {[1, 2, 3, 4, 5, 6].map((key) => <SkeletonNotificationCard key={key} />)}
            </View>
          ) : (
            <EmptyStateAnimation theme={theme} />
          )
        )}
      />

      {showScrollTop && (
        <View style={styles.fabContainer}>
          <ScrollToTopButton onPress={scrollToTop} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  listContent: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  notificationBubble: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 15, marginBottom: 4 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 12 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, alignSelf: 'center', marginLeft: 12 },
  deleteSwipeAction: { justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 12, borderRadius: 16, height: '90%', alignSelf: 'center', marginRight: 2 },
  selectedOverlay: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 100 },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  animationWrapper: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  pulseCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, opacity: 0.2 },
  iconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});