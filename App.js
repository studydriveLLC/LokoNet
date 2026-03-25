//App.js
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

// --- POLYFILLS GLOBAUX POUR REACT NATIVE ---
if (typeof global.AbortSignal === 'undefined') {
  global.AbortSignal = class AbortSignal {};
}
if (typeof global.AbortSignal.abort !== 'function') {
  global.AbortSignal.abort = function(reason) {
    const controller = new AbortController();
    controller.abort(reason);
    return controller.signal;
  };
}
if (typeof global.AbortSignal.timeout !== 'function') {
  global.AbortSignal.timeout = function(time) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('TimeoutError')), time);
    return controller.signal;
  };
}
// -------------------------------------------

import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppTheme } from './src/theme/theme';
import { navigationRef } from './src/navigation/NavigationService';

// Configuration du gestionnaire de notifications en arriere-plan/premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const scheme = useColorScheme();
  const theme = useAppTheme();

  const baseNavigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  useEffect(() => {
    // L'API renvoie un objet de souscription (subscription) que l'on stocke
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const payload = response.notification.request.content.data;
      
      if (payload && payload.type === 'RESOURCE_LINK' && payload.resourceId) {
        // Redirection directe via notre reference de navigation globale
        if (navigationRef.isReady()) {
          navigationRef.navigate(payload.screen || 'ResourceDetail', { resourceId: payload.resourceId });
        }
      }
    });

    return () => {
      // Nettoyage correct en appelant la methode .remove() de l'objet
      if (responseSubscription) {
        responseSubscription.remove();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} translucent={true} />
        <NavigationContainer theme={navigationTheme} ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}