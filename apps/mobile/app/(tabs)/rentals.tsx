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
import { Settings, Activity, History, AlertTriangle, ChevronRight, Plus, Heart } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import ProfileModeToggle from '../../components/ProfileModeToggle';
import ListingStatsBoxes from '../../components/ListingStatsBoxes';
import RentalStatusWidget from '../../components/RentalStatusWidget';
import UpcomingBookingsWidget from '../../components/UpcomingBookingsWidget';
import PendingRequestsWidget from '../../components/PendingRequestsWidget';
import IncomingRequestsWidget from '../../components/IncomingRequestsWidget';

// Reuse MenuItem from profile (or move to shared component later)
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

export default function RentalsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [isOwner, setIsOwner] = useState(true);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const HEADER_HEIGHT = 44;
    const SCROLL_DISTANCE = 40;

    // Sticky Header Background Opacity
    const headerParams = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [25, 45],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    const headerTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [35, 55],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: insets.top + HEADER_HEIGHT + 20,
                    paddingBottom: Platform.OS === 'ios' ? 130 : 100,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.largeHeaderContainer, largeTitleStyle]}>
                    <Text style={styles.largeHeaderTitle}>Dashboard</Text>
                </Animated.View>

                {/* Mode Switcher */}
                <View style={styles.toggleContainer}>
                    <ProfileModeToggle isOwner={isOwner} onToggle={setIsOwner} />
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {isOwner ? (
                        <>
                            {/* Incoming Rental Requests */}
                            <IncomingRequestsWidget requestCount={1} />

                            <ListingStatsBoxes totalBookings={12} toolsListed={5} />

                            <Text style={styles.sectionHeader}>Manage Listings</Text>

                            {/* Menu Section for Listings */}
                            <View style={styles.menuGroup}>
                                <MenuItem
                                    icon={History}
                                    title="Lending History"
                                    destination="/rentals/history"
                                />
                                <View style={styles.menuDivider} />
                                <MenuItem
                                    icon={AlertTriangle}
                                    title="Disputes"
                                    destination="/rentals/disputes"
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Rental Status Alerts */}
                            <RentalStatusWidget overdueCount={1} dueTodayCount={2} />

                            {/* Active Rentals Button */}
                            <TouchableOpacity style={styles.dashboardButton} activeOpacity={0.8}>
                                <View style={[styles.dashboardIconContainer, { backgroundColor: '#F0FDF4' }]}>
                                    <Activity size={24} color="#16A34A" />
                                </View>
                                <View style={styles.dashboardTextContainer}>
                                    <Text style={styles.dashboardButtonTitle}>Active Rentals</Text>
                                    <Text style={styles.dashboardButtonSubtitle}>3 currently active</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Upcoming Bookings Widget */}
                            <UpcomingBookingsWidget count={0} />

                            {/* Pending Requests Widget */}
                            <PendingRequestsWidget />

                            {/* Discovery Section */}
                            <Text style={styles.sectionHeader}>Saved</Text>
                            <View style={styles.menuGroup}>
                                <MenuItem
                                    icon={Heart}
                                    title="Favorite Tools"
                                    destination="/favorites"
                                    onPress={() => {
                                        // router.push('/favorites') 
                                    }}
                                />
                                <View style={styles.menuDivider} />
                                <MenuItem
                                    icon={History}
                                    title="Rental History"
                                    destination="/rentals/history"
                                    onPress={() => {
                                        // router.push('/rentals/history')
                                    }}
                                />
                            </View>
                        </>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Sticky Header */}
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
                        Dashboard
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
            >
                <Settings size={24} color="#111827" />
            </TouchableOpacity>

            {/* FAB - Add Tool (Visible only in Listings mode) */}
            {isOwner && (
                <TouchableOpacity
                    style={[styles.fab, { bottom: Platform.OS === 'ios' ? 110 : 90 }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        // Action for adding a tool
                        router.push('/add-tool');
                    }}
                >
                    <Plus size={22} color="#FFFFFF" />
                    <Text style={styles.fabText}>Add Tool</Text>
                </TouchableOpacity>
            )}
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
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contentText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    toggleContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 8,
        alignItems: 'center',
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 24,
        marginBottom: 10,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Reuse style concept from ListingStatsBoxes for consistency
    dashboardButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    dashboardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    dashboardTextContainer: {
        flex: 1,
    },
    dashboardButtonTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    dashboardButtonSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    // Menu Styles (copied from profile.tsx for now)
    menuGroup: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        marginBottom: 20,
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
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        backgroundColor: '#FF6700', // Safety Orange
        height: 56,
        paddingHorizontal: 24,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6700', // Orange shadow glow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 50,
        gap: 8,
    },
    fabText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
