import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logout } from '../../store/slices/authSlice';
import { deleteToken } from '../../store/secureStoreAdapter';
import { useAppTheme, spacing, typography, borderRadius } from '../../theme/theme';

export default function FeedScreen() {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await deleteToken('accessToken');
    dispatch(logout());
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          { paddingTop: insets.top + spacing.xl } // Padding dynamique sous la barre d'état
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Flux d'actualité</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Connecté en tant que : {user?.pseudo || 'Utilisateur'}
        </Text>
        
        {/* Fausses cartes temporaires pour tester le scroll */}
        {[1, 2, 3, 4].map((item) => (
          <View 
            key={item} 
            style={[
              styles.dummyPost, 
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
            ]}
          >
            <Text style={{ color: theme.colors.textMuted }}>Espace pour le post #{item}</Text>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.error }]} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    marginBottom: spacing.xl,
  },
  dummyPost: {
    height: 200,
    borderWidth: 1,
    borderRadius: borderRadius.l,
    marginBottom: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  button: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: borderRadius.m,
    elevation: 2,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.body,
  }
});