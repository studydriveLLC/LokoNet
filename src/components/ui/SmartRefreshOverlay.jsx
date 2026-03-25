// src/components/ui/SmartRefreshOverlay.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../theme/theme';

export default function SmartRefreshOverlay({ isVisible }) {
  const theme = useAppTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dots, setDots] = useState('');
  
  // Etat pour savoir si le composant doit physiquement exister
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    let interval;
    if (isVisible) {
      // 1. On s'assure que le composant est dans l'ecran
      setIsRendered(true);
      
      // 2. On lance l'animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 350);
    } else {
      // 1. On lance l'animation de disparition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // 2. SEULEMENT quand l'animation est finie, on detruit physiquement le composant
        if (finished) {
          setIsRendered(false);
        }
      });
      setDots('');
    }

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  // Si le composant ne doit pas etre rendu, on renvoie null brutalement.
  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="auto" 
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        tint={theme.dark ? "dark" : "light"}
        intensity={90} // CORRECTION : Intensite passee de 40 a 90 pour un blur tres accentue
      />

      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.colors.primary }]}>
          Actualisation{dots}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});