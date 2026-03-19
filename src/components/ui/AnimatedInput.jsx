import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Platform } from 'react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../../theme/theme';

export default function AnimatedInput({ 
  label, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, style 
}) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value === '' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value !== '') ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: spacing.m,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [20, spacing.xs],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [typography.sizes.body, typography.sizes.small],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textMuted, theme.colors.primary],
    }),
  };

  const borderColor = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[
        styles.inputWrapper, 
        { borderColor, backgroundColor: theme.colors.surface }
      ]}>
        {/* pointerEvents="none" empeche le label de bloquer le clic sur Web */}
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}
        </Animated.Text>
        <TextInput
          style={[
            styles.input, 
            { color: theme.colors.text },
            Platform.OS === 'web' && { outlineStyle: 'none' } // Retire la bordure bleue web
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          selectionColor={theme.colors.primary}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.m,
    height: 64,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  input: {
    fontSize: typography.sizes.body,
    padding: 0,
    margin: 0,
    height: 24,
  },
});