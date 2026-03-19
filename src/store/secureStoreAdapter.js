import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Adaptateur de stockage hybride
 * Mobile (iOS/Android) : Utilise le SecureStore (chiffrement natif)
 * Web : Utilise AsyncStorage (localStorage) car SecureStore n'est pas supporté
 */

export const saveToken = async (key, value) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`[SecureStoreAdapter] Erreur lors de la sauvegarde de ${key}:`, error);
  }
};

export const getToken = async (key) => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStoreAdapter] Erreur lors de la récupération de ${key}:`, error);
    return null;
  }
};

export const deleteToken = async (key) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStoreAdapter] Erreur lors de la suppression de ${key}:`, error);
  }
};