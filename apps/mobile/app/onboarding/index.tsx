import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Hammer, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Light Mode Palette
const COLORS = {
  background: '#FFFFFF',
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  primary: '#2563EB', // Blue 600
  surface: '#FFFFFF',
  surfaceBorder: '#E2E8F0', // Slate 200
  overlayStart: 'transparent',
  overlayEnd: '#FFFFFF',
};

export default function OnboardingWelcome() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding/how-it-works');
  };

  const handleBrowse = () => {
    // Prevent infinite navigation loop by clearing stack before replacing
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Hammer size={32} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.brandName}>BlockHire</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Hero Image Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgvW2VCeti7uUokiLBrL0ZTtb75uDwT4e6BcNB6bPmqbHUPKAwwYE0cFaMqhfn-cu2uVV8uqLL1nGk0L-pRfOKJBD0cuWqc7WdSAv0oqYQJ3vDl7JqwQvFfscIoP6PIVdYTqOnUMd-_36zWkI84otPLwHY1OJYabVz9BKsdNps0Xtc8SCJbMeeBb-2LpE6WdnArpDC_jM4ToX6NNhhbrMuaGZA9PRiEZVh2TkCuEiVZ0rMJ00Az1kMfxvnPJFAoXonN4vvC3O0JNM' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
                style={styles.gradientOverlay}
              />

              {/* Badge */}
              <View style={styles.badge}>
                <MapPin size={14} color={COLORS.primary} strokeWidth={3} />
                <Text style={styles.badgeText}>2-MILE RADIUS</Text>
              </View>

              {/* Card Text */}
              <View style={styles.cardOverlayContent}>
                <Text style={styles.cardTitle}>The Distributed Factory</Text>
                <Text style={styles.cardSubtitle}>
                  Turn your neighborhood into a shared workshop. Build faster, together.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBrowse}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>BROWSE LOCAL TOOLS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/onboarding/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  cardContainer: {
    width: width - 40,
    aspectRatio: 4 / 5,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: 'white',
    marginBottom: 24,
  },
  card: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  badge: {
    position: 'absolute',
    top: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  cardOverlayContent: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    maxWidth: 280,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  primaryButton: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loginButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
