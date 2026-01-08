import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function OnboardingPermissions() {
    const router = useRouter();

    const handleCompleteOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/(tabs)');
        } catch (e) {
            console.error('Failed to save onboarding status', e);
            router.replace('/(tabs)');
        }
    };

    const handleEnableLocation = async () => {
        try {
            // Request permissions
            // We don't block the user if they deny, just ask and move on.
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
            }
            await handleCompleteOnboarding();
        } catch (error) {
            console.warn(error);
            await handleCompleteOnboarding();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location" size={64} color="#000" />
                </View>

                <Text style={styles.title}>Enable Location</Text>
                <Text style={styles.description}>
                    BlockHyre uses your location to show available tools in your neighborhood.
                    We define your "neighborhood" as a 5-mile radius around you.
                </Text>

                <View style={styles.benefitContainer}>
                    <Ionicons name="map-outline" size={24} color="#333" />
                    <Text style={styles.benefitText}>Find tools within walking distance</Text>
                </View>
                <View style={styles.benefitContainer}>
                    <Ionicons name="navigate-outline" size={24} color="#333" />
                    <Text style={styles.benefitText}>Easy pickup and return</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleEnableLocation}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Enable Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCompleteOnboarding}
                >
                    <Text style={styles.secondaryButtonText}>Not Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#f5f5f5',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#000',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    benefitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#fafafa',
        padding: 16,
        borderRadius: 16,
        width: '100%',
    },
    benefitText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    primaryButton: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
