// src/components/ui/SmartRefreshOverlay.jsx
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
      // Apparition douce
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animation des 3 points (...)
      interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 300);
    } else {
      // Disparition douce
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setDots('');
    }

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  // Si l'overlay est invisible et que l'animation est finie, on ne rend rien pour ne pas bloquer les clics
  if (!isVisible && fadeAnim._value === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          backgroundColor: theme.colors.background, // Cache completement l'ecran
          opacity: fadeAnim 
        }
      ]}
      pointerEvents={isVisible ? "auto" : "none"} // Bloque les clics pendant l'actualisation
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
    zIndex: 9999, // Doit etre au dessus de tout
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});