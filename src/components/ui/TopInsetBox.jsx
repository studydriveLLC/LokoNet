import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/theme';

export default function TopInsetBox() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  if (insets.top === 0) return null;

  return (
    <View 
      style={[
        styles.shield, 
        { height: insets.top, backgroundColor: theme.colors.background }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  shield: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});