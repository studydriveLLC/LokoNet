//src/components/profile/ProfileTabBar.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const TAB_BAR_WIDTH = width - (HORIZONTAL_PADDING * 2);

export default function ProfileTabBar({ tabs, activeTab, onTabPress }) {
  const theme = useAppTheme();
  const indicatorPosition = useSharedValue(0);
  
  const tabWidth = TAB_BAR_WIDTH / tabs.length;

  useEffect(() => {
    const index = tabs.findIndex(t => t.key === activeTab);
    if (index !== -1) {
      indicatorPosition.value = withSpring(index * tabWidth, { 
        damping: 20, 
        stiffness: 250,
        mass: 0.8
      });
    }
  }, [activeTab, tabs, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
    };
  });

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Animated.View style={[styles.indicator, { backgroundColor: theme.colors.primary }, indicatorStyle]} />
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable 
              key={tab.key} 
              style={styles.tab} 
              onPress={() => onTabPress(tab.key)}
            >
              <Text style={[
                styles.tabText, 
                { color: isActive ? '#FFFFFF' : theme.colors.textMuted },
                isActive && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
    zIndex: 50,
  },
  container: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 23,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  }
});