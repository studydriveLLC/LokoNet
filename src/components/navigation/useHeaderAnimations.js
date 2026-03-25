// src/components/navigation/useHeaderAnimations.js
import { interpolate, Extrapolate, useAnimatedStyle } from 'react-native-reanimated';

export const HEADER_MAX_HEIGHT = 130;
export const HEADER_MIN_HEIGHT = 60;
export const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export function useHeaderAnimations(scrollY, insets) {
  const headerHeight = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT], Extrapolate.CLAMP);
    return {
      height: height + insets.top,
      paddingTop: insets.top,
    };
  });

  // Animation de la grande barre de recherche (s'efface et monte)
  const largeSearchOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP)
  }));

  const largeSearchTranslateY = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -20], Extrapolate.CLAMP) }]
  }));

  // Animation de la loupe miniature (apparait et glisse depuis la droite)
  const miniSearchOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP)
  }));

  const miniSearchTranslateX = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [15, 0], Extrapolate.CLAMP) }]
  }));

  return {
    headerHeight,
    largeSearchOpacity,
    largeSearchTranslateY,
    miniSearchOpacity,
    miniSearchTranslateX,
  };
}