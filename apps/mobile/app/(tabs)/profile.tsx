import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    UserCircle,
    CreditCard,
    Info,
    HelpCircle,
    Wrench,
    DollarSign,
    Landmark,
    Shield,
    ChevronRight,
    LogOut,
    Settings,
} from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    useAnimatedProps,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ProfileFlipCard from '../../components/ProfileFlipCard';
import ProfileModeToggle from '../../components/ProfileModeToggle';
import NeighborhoodCard from '../../components/NeighborhoodCard';

// Reusable MenuItem Component
interface MenuItemProps {
    icon: React.ElementType;
    title: string;
    destination: string;
    onPress?: () => void;
}

function MenuItem({ icon: Icon, title, destination, onPress }: MenuItemProps) {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <Icon size={20} color="#64748B" />
                <Text style={styles.menuItemTitle}>{title}</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isOwner, setIsOwner] = useState(true);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const HEADER_HEIGHT = 44;
    const SCROLL_DISTANCE = 40; // Distance to scroll before sticky header fully appears

    // Sticky Header Background Opacity
    // Fades in as we scroll past the large title
    const headerParams = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [25, 45],
            [0, 1],
            Extrapolation.CLAMP
        );
        return {
            opacity,
        };
    });

    // We can also have the blur intensity animate if we want, but opacity on the view is usually smoother for performance
    // or just keep intensity fixed and fade the view.

    // Sticky Header Title Opacity
    // Should match the background or come slightly later
    const headerTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [35, 55],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Large Title Opacity
    // Fades out as we scroll up
    const largeTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, SCROLL_DISTANCE],
            [1, 0],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [0, SCROLL_DISTANCE],
            [0, -10],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    // Mock user data
    const user = {
        name: 'Christopher R.',
        verified: true,
        totalRentals: 8,
        rating: 5.0,
    };

    // Menu items
    const renterMenuItems = [
        { icon: UserCircle, title: 'Personal Info', destination: '/profile/personal-info' },
        { icon: CreditCard, title: 'Payments', destination: '/profile/payments' },
        { icon: Info, title: 'How it Works', destination: '/how-it-works' },
        { icon: HelpCircle, title: 'Get Help', destination: '/support' },
    ];

    const ownerMenuItems = [
        { icon: Wrench, title: 'My Listings', destination: '/owner/listings' },
        { icon: DollarSign, title: 'Earnings', destination: '/owner/earnings' },
        { icon: Landmark, title: 'Stripe Payouts', destination: '/owner/stripe' },
        { icon: Shield, title: 'Community Guidelines', destination: '/community-guidelines' },
    ];

    const currentMenuItems = isOwner ? ownerMenuItems : renterMenuItems;
    const sectionTitle = isOwner ? 'Owner Settings' : 'Renter Settings';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Scrollable Content */}
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: insets.top + HEADER_HEIGHT + 20, // Initial spacing for Large Header
                    paddingBottom: 40,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Large Header Content */}
                <Animated.View style={[styles.largeHeaderContainer, largeTitleStyle]}>
                    <Text style={styles.largeHeaderTitle}>Profile</Text>
                </Animated.View>

                {/* Main Profile Card */}
                <ProfileFlipCard user={user} isOwner={isOwner} />

                {/* Mode Switcher */}
                <View style={styles.toggleContainer}>
                    <ProfileModeToggle isOwner={isOwner} onToggle={setIsOwner} />
                </View>



                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                    <View style={styles.menuGroup}>
                        {currentMenuItems.map((item, index) => (
                            <View key={item.title}>
                                <MenuItem
                                    icon={item.icon}
                                    title={item.title}
                                    destination={item.destination}
                                    onPress={() => { }}
                                />
                                {index < currentMenuItems.length - 1 && (
                                    <View style={styles.menuDivider} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* My Neighborhood Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <NeighborhoodCard
                        neighborhoodName="Woodstock, GA"
                        radiusMiles={2.0}
                        isVerified={true}
                    />
                </View>

                {/* Logout */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        activeOpacity={0.7}
                    >
                        <LogOut size={20} color="#DC2626" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>

            {/* Sticky Header (Absolute) */}
            {/* The BlurView itself fades in/out */}
            <Animated.View
                style={[
                    styles.stickyHeaderContainer,
                    { height: insets.top + HEADER_HEIGHT },
                    headerParams
                ]}
            >
                <BlurView
                    tint="light"
                    intensity={90}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.stickyHeaderContent, { marginTop: insets.top, height: HEADER_HEIGHT }]}>
                    <Animated.Text style={[styles.stickyHeaderTitle, headerTitleStyle]}>
                        Profile
                    </Animated.Text>
                    <View style={styles.headerBorder} />
                </View>
            </Animated.View>

            {/* Settings Button - Always Visible, always on top */}
            <TouchableOpacity
                style={[
                    styles.settingsButton,
                    { top: insets.top + (HEADER_HEIGHT - 40) / 2 } // Center vertically in the 44px header space
                ]}
                activeOpacity={0.7}
                onPress={() => router.push('/settings')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <Settings size={24} color="#111827" />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    scrollView: {
        flex: 1,
    },
    largeHeaderContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    largeHeaderTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    stickyHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        // Background color fallback?
        // backgroundColor: 'rgba(255,255,255,0.8)',
    },
    stickyHeaderContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyHeaderTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    headerBorder: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    settingsButton: {
        position: 'absolute',
        right: 20,
        zIndex: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    // ... existing content styles
    toggleContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 8,
        alignItems: 'center',
    },
    menuSection: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        minHeight: 44,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 48,
    },
    logoutSection: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        minHeight: 44,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
    },
});
