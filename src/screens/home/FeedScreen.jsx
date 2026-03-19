import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { deleteToken } from '../../store/secureStoreAdapter';
import { theme } from '../../theme/theme'; // Import du theme

export default function FeedScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await deleteToken('accessToken');
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flux d'actualite</Text>
      <Text style={styles.subtitle}>
        Connecte en tant que : {user?.pseudo || 'Utilisateur'}
      </Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Se deconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  title: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.body,
  }
});