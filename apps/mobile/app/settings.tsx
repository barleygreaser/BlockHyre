import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronRight,
    Bell,
    Lock,
    Moon,
    Smartphone,
    FileText,
    LogOut,
    X,
    Shield,
    Scale,
    Book,
    HelpCircle,
    MessageCircle,
    User,
    Mail
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [pushEnabled, setPushEnabled] = React.useState(true);

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) {
                                console.error("Error signing out:", error);
                                Alert.alert("Error", "Failed to log out. Please try again.");
                                return;
                            }
                            // Reset navigation to the onboarding stack
                            router.replace('/onboarding');
                        } catch (err) {
                            console.error("Unexpected error during logout:", err);
                        }
                    }
                }
            ]
        );
    };

    const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    const SettingsItem = ({
        icon: Icon,
        label,
        value,
        isDestructive = false,
        onPress,
        hasToggle = false,
        isToggled = false,
        onToggle
    }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={hasToggle ? () => onToggle(!isToggled) : onPress}
            activeOpacity={hasToggle ? 1 : 0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
                    <Icon size={20} color={isDestructive ? '#EF4444' : '#64748B'} />
                </View>
                <Text style={[styles.itemLabel, isDestructive && styles.destructiveText]}>{label}</Text>
            </View>

            {hasToggle ? (
                <Switch
                    value={isToggled}
                    onValueChange={onToggle}
                    trackColor={{ false: '#E2E8F0', true: '#FF6700' }}
                    thumbColor={'#FFFFFF'}
                />
            ) : (
                <View style={styles.itemRight}>
                    {value && <Text style={styles.itemValue}>{value}</Text>}
                    <ChevronRight size={20} color="#CBD5E1" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 10) }]}>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <View style={styles.closeButtonCircle}>
                        <X size={20} color="#64748B" />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <SettingsSection title="Preferences">
                    <SettingsItem
                        icon={Bell}
                        label="Push Notifications"
                        hasToggle
                        isToggled={pushEnabled}
                        onToggle={setPushEnabled}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Moon}
                        label="Dark Mode"
                        hasToggle
                        isToggled={isDarkMode}
                        onToggle={setIsDarkMode}
                    />
                </SettingsSection>

                <SettingsSection title="Account">
                    <SettingsItem
                        icon={Smartphone}
                        label="Phone Number"
                        value="+1 (555) ***-**99"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Lock}
                        label="Change Password"
                        onPress={() => { }}
                    />
                </SettingsSection>

                <SettingsSection title="Support & Community">
                    <SettingsItem
                        icon={Mail}
                        label="Contact Blockhyre"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={MessageCircle}
                        label="Community Guidelines"
                        onPress={() => { }}
                    />

                </SettingsSection>

                <SettingsSection title="Legal">
                    <SettingsItem
                        icon={FileText}
                        label="Terms of Service"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={FileText}
                        label="Privacy Policy"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Book}
                        label="Liability Policy"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Shield}
                        label="Peace Fund"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Scale}
                        label="Dispute Tribunal"
                        onPress={() => { }}
                    />
                </SettingsSection>

                <SettingsSection title="About">
                    <SettingsItem
                        icon={User}
                        label="About Blockhyre"
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <SettingsItem
                        icon={Book}
                        label="Developer: View Onboarding"
                        onPress={() => {
                            // Reset local storage for testing
                            // AsyncStorage.removeItem('hasSeenOnboarding');
                            router.push('/onboarding');
                        }}
                    />
                </SettingsSection>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <LogOut size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>Version 1.0.0 (Build 142)</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center title by default
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        position: 'relative',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        bottom: 12, // Align from bottom relative to container height to avoid calc
        zIndex: 10,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    destructiveIcon: {
        backgroundColor: '#FEF2F2',
    },
    itemLabel: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    destructiveText: {
        color: '#EF4444',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemValue: {
        fontSize: 15,
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 60, // Align with text start
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FEF2F2',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        color: '#94A3B8',
        fontSize: 13,
    },
});
