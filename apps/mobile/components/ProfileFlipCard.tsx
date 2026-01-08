import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    useDerivedValue
} from 'react-native-reanimated';
import {
    User,
    CheckCircle,
    Wrench,
    TrendingUp,
    Award,
    RotateCw,
    Info,
    DollarSign,
    ShieldCheck,
    Hammer // Fallback for Wrench for clarity if needed, but Wrench is there.
} from 'lucide-react-native';

const SPRING_CONFIG = {
    mass: 1.2,
    stiffness: 60,
    damping: 12,
    velocity: 0.2,
} as const;

interface ProfileFlipCardProps {
    user: {
        name: string;
        verified: boolean;
        totalRentals: number;
        rating: number;
    };
    isOwner: boolean;
}

export default function ProfileFlipCard({ user, isOwner }: ProfileFlipCardProps) {
    const { width: screenWidth } = useWindowDimensions();
    const [isFlipped, setIsFlipped] = useState(false);

    // Dynamic dimensions maintaining aspect ratio 1.6
    const cardWidth = screenWidth - 40; // 20px padding on each side
    const cardHeight = cardWidth / 1.6;

    const progress = useDerivedValue(() => {
        return withSpring(isFlipped ? 1 : 0, SPRING_CONFIG);
    }, [isFlipped]);

    const handleFlip = () => {
        setIsFlipped((prev) => !prev);
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [0, 1], [0, 180]);
        const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.95, 1]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateY}deg` },
                { scale },
            ],
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [0, 1], [180, 360]);
        const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.95, 1]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateY}deg` },
                { scale },
            ],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };
    });

    const renderStars = (rating: number) => {
        return (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                <View style={[styles.starBadge]}>
                    <Text style={styles.starText}>★</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { height: cardHeight }]}>
            <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>

                {/* Front Side */}
                <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle]}>
                    <Pressable onPress={handleFlip} style={styles.touchableArea}>
                        <View style={styles.cardHeader}>
                            <View style={styles.avatarContainer}>
                                <User size={48} color="#64748B" />
                                {user.verified && (
                                    <View style={styles.badgeContainer}>
                                        <CheckCircle size={14} color="#FFFFFF" fill="#10B981" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userRole}>Verified Member</Text>
                            </View>
                            <View style={styles.flipIcon}>
                                <RotateCw size={20} color="#94A3B8" />
                            </View>
                        </View>

                        <View style={styles.statsWrapper}>
                            <View style={styles.statsContainer}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{user.totalRentals}</Text>
                                    <Text style={styles.statLabel}>Rentals</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.statBox}>
                                    {renderStars(user.rating)}
                                    <Text style={styles.statLabel}>Rating</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>2</Text>
                                    <Text style={styles.statLabel}>Years</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tapTip}>
                            <Text style={styles.tapTipText}>Tap to see tool stats</Text>
                        </View>
                    </Pressable>
                </Animated.View>

                {/* Back Side */}
                <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
                    <Pressable onPress={handleFlip} style={styles.touchableArea}>
                        <View style={styles.backHeader}>
                            <Text style={styles.backTitle}>
                                {isOwner ? 'Tool Rental Insights' : 'Renter Activity'}
                            </Text>
                            <View style={styles.flipIconBack}>
                                <RotateCw size={20} color="#FFFFFF" />
                            </View>
                        </View>

                        {isOwner ? (
                            /* OWNER STATS */
                            <View style={styles.backContent}>
                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <TrendingUp size={20} color="#FFD700" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Total Earnings</Text>
                                        <Text style={styles.insightValue}>$1,250.00</Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <Award size={20} color="#60A5FA" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Top Performer</Text>
                                        <Text style={styles.insightValue}>DeWalt Power Drill</Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <Info size={20} color="#F87171" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Response Rate</Text>
                                        <Text style={styles.insightValue}>98% (Usually &lt; 1hr)</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            /* RENTER STATS */
                            <View style={styles.backContent}>
                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <DollarSign size={20} color="#4ADE80" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Est. Savings</Text>
                                        <Text style={styles.insightValue}>$450.00</Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <Hammer size={20} color="#FACC15" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Favorite Category</Text>
                                        <Text style={styles.insightValue}>Power Tools</Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <View style={styles.insightIconConfig}>
                                        <ShieldCheck size={20} color="#60A5FA" />
                                    </View>
                                    <View>
                                        <Text style={styles.insightLabel}>Trust Score</Text>
                                        <Text style={styles.insightValue}>100% (Reliable)</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
        justifyContent: 'center',
    },
    cardContainer: {
        position: 'relative',
    },
    card: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    touchableArea: {
        flex: 1,
    },
    frontCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    backCard: {
        backgroundColor: '#1E293B', // Dark slate blue
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        position: 'relative',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#10B981',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    flipIcon: {
        padding: 8,
    },
    flipIconBack: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    statsWrapper: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: '#E2E8F0',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    starBadge: {

    },
    starText: {
        fontSize: 16,
        color: '#F59E0B',
    },
    tapTip: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
    },
    tapTipText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    // Back styles
    backHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 8,
    },
    backTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    backContent: {
        gap: 8,
    },
    insightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    insightIconConfig: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightLabel: {
        fontSize: 11,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    insightValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
