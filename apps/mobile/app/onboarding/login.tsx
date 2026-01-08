import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginModal() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    const handleLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // Implement actual login logic here
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Welcome to BlockHyre</Text>
                    <Text style={styles.subtitle}>Sign in to start renting and listing tools.</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.appleButton]}
                        onPress={() => handleLogin('Apple')}
                    >
                        <Ionicons name="logo-apple" size={20} color="#000" style={styles.buttonIcon} />
                        <Text style={styles.appleButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.googleButton]}
                        onPress={() => handleLogin('Google')}
                    >
                        <Ionicons name="logo-google" size={20} color="#000" style={styles.buttonIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.emailButton]}
                        onPress={() => handleLogin('Email')}
                    >
                        <Ionicons name="mail" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.emailButtonText}>Continue with Email</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a', // Dark theme for auth modal
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'flex-end',
        paddingVertical: 16,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    titleContainer: {
        marginTop: 40,
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#ccc',
    },
    actions: {
        gap: 16,
    },
    button: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        marginRight: 10,
    },
    appleButton: {
        backgroundColor: '#fff',
    },
    appleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#fff',
    },
    googleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    emailButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    emailButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#666',
        marginHorizontal: 16,
    },
});
