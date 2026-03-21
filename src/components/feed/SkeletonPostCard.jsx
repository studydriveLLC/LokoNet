import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

export default function SkeletonPostCard() {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, animatedStyle]}>
      
      <View style={styles.internalPadding}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.border }]} />
          <View style={styles.headerText}>
            <View style={[styles.nameLine, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
          </View>
          <View style={[styles.optionsDot, { backgroundColor: theme.colors.border }]} />
        </View>
        
        <View style={[styles.descLine, { backgroundColor: theme.colors.border, width: '90%' }]} />
        <View style={[styles.descLine, { backgroundColor: theme.colors.border, width: '70%', marginBottom: 16 }]} />
      </View>

      <View style={[styles.mediaBlock, { backgroundColor: theme.colors.border }]} />

      <View style={styles.internalPadding}>
        <View style={styles.actionsRow}>
          <View style={styles.actionGroup}>
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.border }]} />
          </View>
        </View>
      </View>
      
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, paddingTop: 16, paddingBottom: 16, borderRadius: 24, borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0 },
  internalPadding: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  headerText: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  nameLine: { height: 14, borderRadius: 7, width: '40%', marginBottom: 8 },
  dateLine: { height: 10, borderRadius: 5, width: '25%' },
  optionsDot: { width: 24, height: 24, borderRadius: 12 },
  descLine: { height: 12, borderRadius: 6, marginBottom: 8 },
  mediaBlock: { width: '100%', height: 250, marginBottom: 16 },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 20 },
  actionIcon: { width: 32, height: 32, borderRadius: 16 },
});