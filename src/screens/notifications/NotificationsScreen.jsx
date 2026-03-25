// src/screens/notifications/NotificationsScreen.jsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, BellRing } from 'lucide-react-native';
import { useAppTheme } from '../../theme/theme';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} from '../../store/api/notificationApiSlice';

export default function NotificationsScreen({ navigation }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery({ page: 1, limit: 20 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = data?.data?.notifications || [];

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id).unwrap();
      } catch (error) {
        console.log("Erreur markAsRead:", error);
      }
    }
    // TODO: Redirection intelligente selon le type de notification (ex: ouvrir une ressource precise)
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {}
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    return (
      <Pressable 
        onPress={() => handleNotificationPress(item)}
        style={({ pressed }) => [
          styles.notificationCard,
          { backgroundColor: isUnread ? theme.colors.primaryLight : theme.colors.surface },
          pressed && { opacity: 0.7 }
        ]}
      >
        <View style={styles.iconContainer}>
          <BellRing color={isUnread ? theme.colors.primaryDark : theme.colors.textMuted} size={20} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text, fontWeight: isUnread ? '700' : '600' }]}>
            {item.title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textMuted }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textDisabled }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      
      {/* HEADER CLASSIQUE FIXE */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={15}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        
        {notifications.length > 0 ? (
          <Pressable onPress={handleMarkAllAsRead} disabled={isMarkingAll} hitSlop={10}>
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <CheckCircle2 color={theme.colors.primary} size={24} />
            )}
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* LISTE */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {!isLoading && (
              <>
                <BellRing color={theme.colors.textDisabled} size={48} style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Vous n'avez aucune notification pour le moment.
                </Text>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  
  listContent: { paddingBottom: 40 },
  notificationCard: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 15, marginBottom: 4 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, alignSelf: 'center', marginLeft: 12 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});