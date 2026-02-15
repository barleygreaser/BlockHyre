import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import BottomSheet, {
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetTextInput
} from '@gorhom/bottom-sheet';

// Brand Colors
const COLORS = {
    primary: '#2563EB',
    background: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    inputBg: '#F8FAFC',
};

export default function LoginSheet() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Ref for the BottomSheet
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        router.back();
    }, [router]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const handleLogin = async (provider: string) => {
        Haptics.selectionAsync();
        if (provider === 'Email' && !showEmailForm) {
            setShowEmailForm(true);
            return;
        }

        if (provider === 'Email') {
            if (!email || !password) {
                Alert.alert('Error', 'Please enter both email and password');
                return;
            }
            setLoading(true);
            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                bottomSheetRef.current?.close();
            } catch (error: any) {
                Alert.alert('Login Failed', error.message);
            } finally {
                setLoading(false);
            }
            return;
        }
        Alert.alert('Not Implemented', provider + ' login is not yet implemented.');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
                onClose={handleClose}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.dragHandle}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <View style={{ width: 24 }} />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to continue renting.</Text>
                        </View>
                        <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ minHeight: 100 }}>
                        {!showEmailForm ? (
                            <Animated.View
                                entering={FadeIn.duration(200)}
                                exiting={FadeOut.duration(150)}
                                style={styles.socialButtons}
                            >
                                <TouchableOpacity style={[styles.button, styles.appleButton]} onPress={() => handleLogin('Apple')}>
                                    <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={() => handleLogin('Google')}>
                                    <Ionicons name="logo-google" size={20} color={COLORS.text} style={styles.buttonIcon} />
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>or</Text>
                                    <View style={styles.line} />
                                </View>

                                <TouchableOpacity style={[styles.button, styles.emailOutlineButton]} onPress={() => handleLogin('Email')}>
                                    <Ionicons name="mail" size={20} color={COLORS.text} style={styles.buttonIcon} />
                                    <Text style={styles.emailOutlineButtonText}>Sign in with Email</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            <Animated.View
                                entering={FadeIn.duration(300)}
                                exiting={FadeOut.duration(150)}
                                style={styles.emailForm}
                            >
                                <BottomSheetTextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <BottomSheetTextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => handleLogin('Email')} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        Keyboard.dismiss();
                                        setShowEmailForm(false);
                                    }}
                                    style={styles.backLink}
                                >
                                    <Text style={styles.backLinkText}>Use Social Login</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    sheetBackground: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
    },
    dragHandle: {
        backgroundColor: '#E2E8F0',
        width: 40,
        height: 4,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 22, // Slightly smaller to fit header row
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    socialButtons: { gap: 12 },
    emailForm: { gap: 12 },
    button: {
        height: 52,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: { marginRight: 10 },
    appleButton: { backgroundColor: '#000000' },
    appleButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    googleButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    googleButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    primaryButton: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    emailOutlineButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    emailOutlineButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    input: {
        height: 52,
        backgroundColor: COLORS.inputBg,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        // Important for consistency across inputs
        lineHeight: 20,
    },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
    line: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { color: '#94A3B8', marginHorizontal: 16, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    backLink: { alignItems: 'center', padding: 12 },
    backLinkText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
});