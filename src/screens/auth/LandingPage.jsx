import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Info, Mail, Facebook, Instagram } from 'lucide-react-native';

// Import des composants modulaires
import { useAppTheme } from '../../theme/theme';
import MagneticWrapper from '../../components/animation/MagneticWrapper';
import { TikTokIcon, WhatsAppIcon } from '../../components/ui/SVGIcons';

export default function LandingPage() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();

  // Moteur de pulsation pour le bouton central (CTA)
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Initialisation de la pulsation infinie et douce
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1, // Infini
      true // Reverse
    );
  }, [pulseScale]);

  // Style animé du CTA (Scale + Liquid Glow interpolé)
  const animatedCtaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    shadowOpacity: interpolate(pulseScale.value, [1, 1.04], [0.15, 0.4]),
    shadowRadius: interpolate(pulseScale.value, [1, 1.04], [8, 16]),
  }));

  // Gestionnaire générique d'ouverture de liens externes
  const handleOpenLink = async (url) => {
    if (!url) {
      console.warn("LandingPage: Tentative d'ouverture d'un lien undefined.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`LandingPage: Impossible d'ouvrir l'URL: ${url}`);
      }
    } catch (error) {
      console.error("LandingPage: Erreur lors de l'ouverture du lien :", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Conteneur principal flexible gérant la répartition spatiale sans scroll */}
      <View style={styles.contentWrapper}>
        
        {/* SECTION SUPERIEURE (Header) */}
        <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.topNav}>
          <MagneticWrapper>
            <View style={styles.navButton}>
              <Info size={20} color={theme.colors.primary} />
              <Text style={[styles.navText, { color: theme.colors.text }]}>À propos</Text>
            </View>
          </MagneticWrapper>
          
          <MagneticWrapper>
            <View style={styles.navButton}>
              <Mail size={20} color={theme.colors.primary} />
              <Text style={[styles.navText, { color: theme.colors.text }]}>Nous contacter</Text>
            </View>
          </MagneticWrapper>
        </Animated.View>

        {/* SECTION CENTRALE (Contenu) */}
        <View style={styles.centerContent}>
          <Animated.View 
            // Apparition douce : fondu vertical lent sans rebond
            entering={FadeInDown.duration(1200).delay(300)} 
            style={styles.brandContainer}
          >
            <Text style={[styles.title, { color: theme.colors.primary }]}>StudyDrive</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              La plateforme ultime pour unifier la communauté estudiantine.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1200).delay(500)} style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>
              Né d'une volonté de centraliser l'entraide, StudyDrive n'est pas qu'une simple application. 
              C'est un espace collaboratif pensé par des étudiants, pour des étudiants. 
              Partagez vos ressources, interagissez et évoluez ensemble.
            </Text>
          </Animated.View>

          {/* SECTION D'ACTION (Boutons) */}
          <Animated.View entering={FadeInUp.duration(1000).delay(700)} style={styles.actionContainer}>
            {/* Conteneur animé pour la pulsation et le glow */}
            <Animated.View style={[styles.ctaWrapper, theme.shadows.medium, animatedCtaStyle]}>
              <Pressable 
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.xl }]}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={[styles.primaryButtonText, { color: theme.colors.surface }]}>
                  Rejoindre la Communauté
                </Text>
              </Pressable>
            </Animated.View>

            <Pressable 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Déjà membre ? <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Se connecter</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* SECTION INFERIEURE (Footer) */}
        <Animated.View entering={FadeInUp.duration(800).delay(900)} style={[styles.footer, { borderTopColor: theme.colors.divider }]}>
          <View style={styles.socialContainer}>
            <MagneticWrapper onPress={() => handleOpenLink(process.env.EXPO_PUBLIC_FACEBOOK_LINK)}>
              <Facebook size={24} color={theme.colors.textMuted} />
            </MagneticWrapper>
            
            <MagneticWrapper onPress={() => handleOpenLink(process.env.EXPO_PUBLIC_INSTAGRAM_LINK)}>
              <Instagram size={24} color={theme.colors.textMuted} />
            </MagneticWrapper>

            <MagneticWrapper onPress={() => handleOpenLink(process.env.EXPO_PUBLIC_TIKTOK_LINK)}>
              <TikTokIcon size={24} color={theme.colors.textMuted} />
            </MagneticWrapper>

            <MagneticWrapper onPress={() => handleOpenLink(process.env.EXPO_PUBLIC_WHATSAPP_LINK)}>
              <WhatsAppIcon size={24} color={theme.colors.textMuted} />
            </MagneticWrapper>
          </View>
          
          <Text style={[styles.copyright, { color: theme.colors.textDisabled }]}>
            © {currentYear} StudyDrive. Tous droits réservés.
          </Text>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    // justifySpaceBetween assure la répartition Haut/Centre/Bas pour éviter le scroll
    justifyContent: 'space-between', 
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60, // Maintien de l'espacement UX validé précédemment
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1, 
    justifyContent: 'center',
  },
  brandContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    alignItems: 'center',
    gap: 16,
  },
  ctaWrapper: {
    width: '100%',
    // Ombre forcée sur la couleur primaire pour l'effet Liquid Glow
    shadowColor: '#5170FF', 
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    padding: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  copyright: {
    fontSize: 12,
  },
});