//src/components/profile/UserProfileSkeleton.jsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

export default function UserProfileSkeleton() {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <View style={[styles.cover, { backgroundColor: theme.colors.border }]} />
        <View style={styles.content}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.background }]} />
          <View style={[styles.name, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.bio, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.statsRow, { backgroundColor: 'rgba(0,0,0,0.02)' }]}>
            <View style={[styles.statItem, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.statItem, { backgroundColor: theme.colors.border }]} />
          </View>
          <View style={styles.actionRow}>
            <View style={[styles.button, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.button, { backgroundColor: theme.colors.border }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { height: 160, width: '100%' },
  content: { paddingHorizontal: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginTop: -50, borderWidth: 4, marginBottom: 16 },
  name: { width: 160, height: 24, borderRadius: 12, marginBottom: 16 },
  bio: { width: 250, height: 16, borderRadius: 8, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 40, marginBottom: 24, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 16 },
  statItem: { width: 40, height: 40, borderRadius: 8 },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  button: { flex: 1, height: 44, borderRadius: 22 },
});