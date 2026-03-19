import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { getToken } from '../store/secureStoreAdapter';
import { setCredentials, setAuthLoading } from '../store/slices/authSlice';

// Imports des ecrans
import LoginPage from '../screens/auth/LoginPage';
import FeedScreen from '../screens/home/FeedScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Au demarrage, on verifie si un token est deja sauvegarde
        const token = await getToken('accessToken');
        if (token) {
          // Si oui, on le met dans Redux (l'utilisateur evite de se reconnecter)
          dispatch(setCredentials({ user: null, token })); 
        }
      } catch (error) {
        console.error('Erreur lors de la verification du token', error);
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    checkToken();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Groupe d'ecrans non connectes
        <Stack.Screen name="Login" component={LoginPage} />
      ) : (
        // Groupe d'ecrans connectes
        <Stack.Screen name="Feed" component={FeedScreen} />
      )}
    </Stack.Navigator>
  );
}