import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Hammer } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function OnboardingSignup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);

    const handleSkip = () => {
        if (router.canDismiss()) {
            router.dismiss();
        }
        router.replace('/(tabs)/');
    };

    const handleLoginNavigation = () => {
        router.push('/onboarding/login');
    };

    const handleSignup = async (provider: string) => {
        if (provider === 'Email' && !showEmailForm) {
            setShowEmailForm(true);
            return;
        }

        if (provider === 'Email') {
            if (!email || !password || !fullName) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
            }
            setLoading(true);
            try {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;

                Alert.alert('Success', 'Account created! Please check your email to verify your account.', [
                    { text: 'OK', onPress: () => router.replace('/onboarding/login') }
                ]);
            } catch (error: any) {
                Alert.alert('Signup Failed', error.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        console.log(`Signup with ${provider}`);
        Alert.alert('Not Implemented', `${provider} signup is not yet implemented.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.content}>

                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Hammer size={32} color="#2563EB" />
                        </View>
                        <Text style={styles.title}>Join BlockHyre</Text>
                        <Text style={styles.subtitle}>
                            Create an account to verify your identity and start renting tools securely.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        {!showEmailForm && (
                            <View style={styles.socialButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.appleButton]}
                                    onPress={() => handleSignup('Apple')}
                                >
                                    <Ionicons name="logo-apple" size={20} color="#000" style={styles.buttonIcon} />
                                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.googleButton]}
                                    onPress={() => handleSignup('Google')}
                                >
                                    <Ionicons name="logo-google" size={20} color="#000" style={styles.buttonIcon} />
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>or</Text>
                                    <View style={styles.line} />
                                </View>
                            </View>
                        )}

                        {showEmailForm ? (
                            <View style={styles.emailForm}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={() => handleSignup('Email')}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Create Account</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowEmailForm(false)} style={styles.backLink}>
                                    <Text style={styles.backLinkText}>Use Social Login</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.emailOutlineButton]}
                                onPress={() => handleSignup('Email')}
                            >
                                <Ionicons name="mail" size={20} color="#000" style={styles.buttonIcon} />
                                <Text style={styles.emailOutlineButtonText}>Sign up with Email</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={handleLoginNavigation} style={styles.loginLink}>
                            <Text style={styles.loginLinkText}>
                                Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipButtonText}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
    },
    formSection: {
        flex: 1,
        justifyContent: 'center',
    },
    socialButtons: {
        gap: 16,
    },
    emailForm: {
        gap: 16,
    },
    button: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 10,
    },
    appleButton: {
        backgroundColor: '#000000',
    },
    appleButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    googleButtonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#2563EB',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    emailOutlineButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emailOutlineButtonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        height: 56,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 24,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        color: '#0F172A',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        color: '#94A3B8',
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    backLink: {
        alignItems: 'center',
        padding: 8,
    },
    backLinkText: {
        color: '#64748B',
        fontWeight: '500',
    },
    footer: {
        marginTop: 'auto',
        gap: 24,
        alignItems: 'center',
    },
    loginLink: {
        padding: 8,
    },
    loginLinkText: {
        color: '#64748B',
        fontSize: 16,
    },
    loginLinkBold: {
        color: '#2563EB',
        fontWeight: '700',
    },
    skipButton: {
        padding: 8,
    },
    skipButtonText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
});
