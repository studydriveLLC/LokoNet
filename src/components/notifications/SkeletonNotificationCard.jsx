//src/components/notifications/SkeletonNotificationCard.jsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

export default function SkeletonNotificationCard() {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, animatedStyle]}>
      <View style={[styles.avatarSkeleton, { backgroundColor: theme.colors.border }]} />
      <View style={styles.textContainer}>
        <View style={[styles.titleSkeleton, { backgroundColor: theme.colors.border }]} />
        <View style={[styles.messageSkeleton, { backgroundColor: theme.colors.border }]} />
        <View style={[styles.timeSkeleton, { backgroundColor: theme.colors.border }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    overflow: 'hidden' 
  },
  avatarSkeleton: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  textContainer: { flex: 1, justifyContent: 'center', gap: 8 },
  titleSkeleton: { width: '40%', height: 16, borderRadius: 4 },
  messageSkeleton: { width: '90%', height: 14, borderRadius: 4 },
  timeSkeleton: { width: '25%', height: 12, borderRadius: 4 },
});