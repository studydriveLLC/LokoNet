import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/api/authApiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { saveToken } from '../../store/secureStoreAdapter';
import { theme } from '../../theme/theme'; // Import du theme unifie

export default function LoginPage() {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await login({ identifier, password }).unwrap();
      const { accessToken, user } = response.data;

      await saveToken('accessToken', accessToken);
      dispatch(setCredentials({ user, token: accessToken }));

    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert(
        'Erreur', 
        error?.data?.message || 'Identifiants incorrects ou erreur serveur.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>StudyDrive</Text>
          <Text style={styles.subtitle}>Connectez-vous pour acceder au campus.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Identifiant (Email, Pseudo ou Tel)</Text>
          <TextInput
            style={styles.input}
            placeholder="etudiant@univ.edu"
            placeholderTextColor={theme.colors.textDisabled}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor={theme.colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  header: {
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
    fontWeight: theme.typography.weights.semibold,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    ...theme.shadows.small, // Magie : Ombre subtile native
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginTop: theme.spacing.s,
    height: 56,
    justifyContent: 'center',
    ...theme.shadows.medium, // Magie : Ombre plus prononcee pour le call-to-action
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
  },
});