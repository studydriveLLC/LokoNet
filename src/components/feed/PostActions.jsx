import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useAppTheme } from '../../theme/theme';

export default function PostActions({
  likesCount,
  commentsCount,
  sharesCount,
  isLikedByMe,
  onCommentPress,
  onSharePress,
  onLikePress,
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ActionItem
        icon={<Heart size={20} color={isLikedByMe ? theme.colors.error : theme.colors.textMuted} fill={isLikedByMe ? theme.colors.error : 'transparent'} />}
        count={likesCount}
        onPress={onLikePress}
        theme={theme}
      />
      <ActionItem
        icon={<MessageCircle size={20} color={theme.colors.textMuted} />}
        count={commentsCount}
        onPress={onCommentPress}
        theme={theme}
      />
      <ActionItem
        icon={<Share2 size={20} color={theme.colors.textMuted} />}
        count={sharesCount}
        onPress={onSharePress}
        theme={theme}
      />
    </View>
  );
}

const ActionItem = ({ icon, count, onPress, theme }) => (
  <Pressable style={styles.actionButton} onPress={onPress}>
    {icon}
    <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
      {count > 0 ? count : '0'}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  }
});