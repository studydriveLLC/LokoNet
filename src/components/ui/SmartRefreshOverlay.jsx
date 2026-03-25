//src/components/ui/SmartRefreshOverlay.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../../theme/theme';

export default function SmartRefreshOverlay({ isVisible }) {
  const theme = useAppTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dots, setDots] = useState('');

  useEffect(() => {
    let interval;
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 300);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setDots('');
    }

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  // CORRECTION : Au lieu de ne rien rendre brutalement (return null), 
  // on utilise un opacite 0 et pointerEvents="none". 
  // C'est beaucoup plus robuste et evite les bugs visuels.
  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnim 
        }
      ]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text style={[styles.text, { color: theme.colors.primary }]}>
        Actualisation{dots}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});