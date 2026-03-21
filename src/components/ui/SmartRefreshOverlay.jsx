import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

const Dot = ({ delay, color }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(0.8, { duration: 300 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
};

export default function SmartRefreshOverlay({ isVisible }) {
  const theme = useAppTheme();

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.dotsContainer}>
          <Dot delay={0} color={theme.colors.primary} />
          <Dot delay={150} color={theme.colors.primary} />
          <Dot delay={300} color={theme.colors.primary} />
        </View>
        <Text style={[styles.text, { color: theme.colors.text }]}>Actualisation</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 990, // Sous le header qui est a 1000, mais au-dessus de la liste
    elevation: 990,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    transform: [{ translateY: -30 }], 
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});