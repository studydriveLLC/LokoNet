import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedBackButton({ onPress, customColor, customBackgroundColor }) {
  const theme = useAppTheme();
  const navigation = useNavigation();
  
  // Valeurs partagées pour l'animation à 60 FPS
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Moteur d'animation (Physique de ressort)
  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(0.7, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  // Logique de navigation intelligente
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Style animé réactif
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Résolution des couleurs selon le contexte
  const iconColor = customColor || theme.colors.primary;
  const backgroundColor = customBackgroundColor || theme.colors.surface;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // Zone de clic étendue pour le pouce
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.round,
        },
        theme.shadows.small,
        animatedStyle,
      ]}
    >
      <ArrowLeft size={24} color={iconColor} strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});