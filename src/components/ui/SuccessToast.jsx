// src/components/ui/SuccessToast.jsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hideSuccessToast } from '../../store/slices/uiSlice';

export default function SuccessToast() {
  const { isVisible, message } = useSelector((state) => state.ui.successToast);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-150);

  const closeToast = () => {
    dispatch(hideSuccessToast());
  };

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(insets.top + 15, { damping: 15, stiffness: 100 });
      
      const timer = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 300 }, () => {
          runOnJS(closeToast)();
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-150, { duration: 300 });
    }
  }, [isVisible, dispatch, insets.top, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View style={styles.toast}>
        <CheckCircle color="#FFFFFF" size={24} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 9999, 
    alignItems: 'center',
    elevation: 9999
  },
  toast: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#10B981', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    minWidth: '70%', 
    maxWidth: '90%', 
    gap: 12 
  },
  message: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700', 
    flexShrink: 1 
  }
});