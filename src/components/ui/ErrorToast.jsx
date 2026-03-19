import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { hideErrorToast } from '../../store/slices/uiSlice';
import { useAppTheme } from '../../theme/theme';

export default function ErrorToast() {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { isVisible, message } = useSelector((state) => state.ui.errorToast);
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 20,
        useNativeDriver: true,
        speed: 12,
      }).start();

      const timer = setTimeout(() => {
        dispatch(hideErrorToast());
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, dispatch, translateY]);

  if (!isVisible && translateY._value === -150) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <SafeAreaView edges={['top']}>
        <View style={[styles.toastBox, { backgroundColor: theme.colors.error }]}>
          <Text style={[styles.text, { color: theme.colors.surface }]}>{message}</Text>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 16,
  },
  toastBox: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});