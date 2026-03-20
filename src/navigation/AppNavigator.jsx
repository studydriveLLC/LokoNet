import React, { useEffect } from 'react';
// On repasse sur le stack JS pour un contrôle total des courbes d'animation
import { createStackNavigator, TransitionPresets, CardStyleInterpolators } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View, StyleSheet, Easing } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import { getToken } from '../store/secureStoreAdapter';
import { setCredentials, setAuthLoading } from '../store/slices/authSlice';
import { useAppTheme } from '../theme/theme';

import LandingPage from '../screens/auth/LandingPage';
import LoginPage from '../screens/auth/LoginPage';
import RegisterPage from '../screens/auth/RegisterPage';
import MainTabNavigator from './MainTabNavigator'; 
import MenuScreen from '../screens/profile/MenuScreen';
import ErrorToast from '../components/ui/ErrorToast';
import TopInsetBox from '../components/ui/TopInsetBox';

const Stack = createStackNavigator();

// Configuration du "ressort" pour une ouverture nerveuse (0.2s environ)
const fastSpringConfig = {
  animation: 'spring',
  config: {
    stiffness: 1500, // Très rigide pour la vitesse
    damping: 150,    // Peu d'oscillation pour la netteté
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

export default function AppNavigator() {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken('accessToken');
        if (token) {
          dispatch(setCredentials({ user: null, token })); 
        }
      } catch (error) {
        console.error('Erreur token', error);
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    checkToken();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.mainWrapper, { backgroundColor: theme.colors.background }]}>
        <TopInsetBox />
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            // Interpolateur de glissement latéral ultra-fluide
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: fastSpringConfig,
              close: fastSpringConfig,
            },
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Landing" component={LandingPage} />
              <Stack.Screen name="Register" component={RegisterPage} />
              <Stack.Screen name="Login" component={LoginPage} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />
              <Stack.Screen 
                name="Menu" 
                component={MenuScreen} 
                options={{ 
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                  // On force une couleur de fond pour éviter les flashs blancs pendant la transition
                  cardStyle: { backgroundColor: theme.colors.background }
                }} 
              />
            </>
          )}
        </Stack.Navigator>
        <ErrorToast />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
});