//src/components/ui/SmartRefreshOverlay.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../theme/theme';

export default function SmartRefreshOverlay({ isVisible }) {
  const theme = useAppTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dots, setDots] = useState('');
  
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    let interval;
    if (isVisible) {
      setIsRendered(true);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, 
        useNativeDriver: true,
      }).start();

      interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 350);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsRendered(false);
        }
      });
      setDots('');
    }

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  if (!isRendered) {
    return null;
  }

  const isDarkMode = theme.colors.background === '#0F1113';
  
  // 'default' offre souvent le meilleur compromis de réfraction sur Android
  const blurTint = isDarkMode ? 'dark' : 'default';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          // Le secret du flou Facebook : une légère teinte de fond pour lisser le bruit
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)'
        }
      ]}
      pointerEvents="auto" 
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        tint={blurTint}
        intensity={90} // Un chouïa moins pour éviter les lags sur certains Android, tout en restant profond
      />

      <View style={styles.content}>
        <View style={styles.loaderCard}>
          <Text style={[styles.text, { color: theme.colors.primary }]}>
            Actualisation{dots}
          </Text>
        </View>
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
  loaderCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    // Un léger fond pour faire ressortir le texte du flou
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});