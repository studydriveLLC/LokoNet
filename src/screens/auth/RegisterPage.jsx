import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegisterMutation } from '../../store/api/authApiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { showErrorToast } from '../../store/slices/uiSlice';
import { saveToken } from '../../store/secureStoreAdapter';
import { useAppTheme } from '../../theme/theme';
import AnimatedInput from '../../components/ui/AnimatedInput';
import AnimatedButton from '../../components/ui/AnimatedButton';

export default function RegisterPage({ navigation }) {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', pseudo: '', phone: '', email: '', university: '', password: '',
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, pseudo, phone, email, university, password } = formData;
    
    if (!firstName.trim() || !lastName.trim() || !pseudo.trim() || 
        !phone.trim() || !email.trim() || !university.trim() || !password.trim()) {
      dispatch(showErrorToast({ message: 'Veuillez remplir tous les champs.' }));
      return;
    }

    try {
      const response = await register(formData).unwrap();
      const { accessToken, user } = response.data;
      await saveToken('accessToken', accessToken);
      dispatch(setCredentials({ user, token: accessToken }));
    } catch (error) {
      const errorMessage = error?.data?.errors?.[0]?.message || error?.data?.message || 'Erreur d\'inscription.';
      dispatch(showErrorToast({ message: errorMessage }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>Rejoindre StudyDrive</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Créez votre compte étudiant pour accéder au campus.
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInputContainer}>
              <AnimatedInput label="Prénom" value={formData.firstName} onChangeText={(val) => handleChange('firstName', val)} />
            </View>
            <View style={styles.halfInputContainer}>
              <AnimatedInput label="Nom" value={formData.lastName} onChangeText={(val) => handleChange('lastName', val)} />
            </View>
          </View>

          <AnimatedInput label="Pseudo" value={formData.pseudo} onChangeText={(val) => handleChange('pseudo', val)} autoCapitalize="none" />
          <AnimatedInput label="Email" value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" autoCapitalize="none" />
          <AnimatedInput label="Téléphone" value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
          <AnimatedInput label="Université" value={formData.university} onChangeText={(val) => handleChange('university', val)} />
          <AnimatedInput label="Mot de passe" value={formData.password} onChangeText={(val) => handleChange('password', val)} secureTextEntry={true} />

          <View style={styles.actionContainer}>
            <AnimatedButton title="S'inscrire" onPress={handleRegister} isLoading={isLoading} />
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()} activeOpacity={0.6}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInputContainer: { flex: 1 },
  actionContainer: { marginTop: 12 },
  linkButton: { marginTop: 32, alignItems: 'center', padding: 12 },
  linkText: { fontSize: 16, fontWeight: '600' }
});