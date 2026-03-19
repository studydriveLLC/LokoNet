import React, { useRef } from 'react';
import { Text, Animated, StyleSheet, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../../theme/theme';

export default function AnimatedButton({ title, onPress, isLoading, disabled, style }) {
  const theme = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      <Animated.View style={[
        styles.button,
        { backgroundColor: theme.colors.primary },
        (disabled && !isLoading) && { backgroundColor: theme.colors.textDisabled },
        style,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={[styles.text, { color: theme.colors.surface }]}>{title}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.m,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    elevation: 4,
  },
  text: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
  },
});