// src/components/profile/LogoutModal.jsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAppTheme } from '../../theme/theme';

export default function LogoutModal({ visible, onClose, onConfirm, isLoading }) {
  const theme = useAppTheme();

  return (
    <Modal 
      transparent={true} 
      visible={visible} 
      animationType="fade" 
      onRequestClose={isLoading ? null : onClose}
    >
      <View style={styles.overlay}>
        {/* Le fond cliquable pour annuler (désactivé pendant le chargement) */}
        <Pressable 
          style={styles.backdrop} 
          onPress={isLoading ? null : onClose} 
        />
        
        {/* La boîte de dialogue */}
        <View style={[styles.modalBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(235, 87, 87, 0.1)' }]}>
            <LogOut color={theme.colors.error} size={32} />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>Deconnexion</Text>
          <Text style={[styles.message, { color: theme.colors.textMuted }]}>
            Etes-vous sur de vouloir vous deconnecter ? Vous devrez saisir a nouveau vos identifiants pour acceder a vos ressources.
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[
                styles.cancelBtn, 
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                isLoading && { opacity: 0.5 }
              ]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelText, { color: theme.colors.text }]}>Annuler</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.confirmBtn, 
                { backgroundColor: theme.colors.error },
                isLoading && { opacity: 0.8 }
              ]} 
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.surface} size="small" />
              ) : (
                <Text style={[styles.confirmText, { color: theme.colors.surface }]}>Me deconnecter</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { 
    width: '85%', 
    maxWidth: 400, 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconWrapper: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  buttonContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1 },
  cancelText: { fontSize: 15, fontWeight: '700' },
  confirmBtn: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  confirmText: { fontSize: 15, fontWeight: '700' },
});