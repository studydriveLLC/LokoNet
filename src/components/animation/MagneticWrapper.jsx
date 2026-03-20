import React from 'react';
import { Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

/**
 * MagneticWrapper
 * Applique une micro-interaction de compression (scale) et rotation légère
 * lors de la pression, créant une sensation tactile "magnétique" et premium.
 */
export default function MagneticWrapper({ children, onPress, disabled = false }) {
  // Valeurs partagées pour Reanimated
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Configuration de ressort (Spring) pour un retour organique
  const springConfig = { damping: 10, stiffness: 300 };

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.88, springConfig); // Compression légèrement moins forte
    rotate.value = withSpring(-3, springConfig); // Légère rotation gauche
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, springConfig); // Retour à la normale
    rotate.value = withSpring(0, springConfig);
  };

  // Style animé réactif
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));

  return (
    <Pressable 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={onPress}
      disabled={disabled}
      // Zone de clic étendue par défaut pour l'accessibilité
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}