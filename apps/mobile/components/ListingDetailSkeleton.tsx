import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 340;

const Bone = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.bone, style, animatedStyle]} />;
};

export const ListingDetailSkeleton = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Image Skeleton */}
            <View style={styles.heroContainer}>
                <Bone style={styles.heroImage} />
            </View>

            {/* Content Body */}
            <View style={styles.contentBody}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Bone style={styles.title} />
                    <View style={styles.metaRow}>
                        <Bone style={styles.ratingBadge} />
                        <Bone style={styles.distanceBadge} />
                    </View>
                </View>

                {/* Owner Section */}
                <View style={styles.ownerSection}>
                    <View style={styles.ownerLeft}>
                        <Bone style={styles.ownerAvatar} />
                        <View style={styles.ownerInfo}>
                            <Bone style={styles.ownerName} />
                            <Bone style={styles.ownerResponse} />
                        </View>
                    </View>
                    <Bone style={styles.viewProfileButton} />
                </View>

                {/* Description Section */}
                <View style={styles.descriptionSection}>
                    <Bone style={styles.sectionTitle} />
                    <Bone style={styles.descriptionLine} />
                    <Bone style={styles.descriptionLine} />
                    <Bone style={[styles.descriptionLine, { width: '60%' }]} />
                </View>

                {/* Specs Grid */}
                <View style={styles.specsGrid}>
                    <View style={styles.specBoxWrapper}>
                        <Bone style={styles.specBox} />
                    </View>
                    <View style={styles.specBoxWrapper}>
                        <Bone style={styles.specBox} />
                    </View>
                    <View style={styles.specBoxWrapper}>
                        <Bone style={styles.specBox} />
                    </View>
                    <View style={styles.specBoxWrapper}>
                        <Bone style={styles.specBox} />
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={[styles.calendarSection, { marginBottom: insets.bottom + 100 }]}>
                    <Bone style={styles.sectionTitle} />
                    <View style={styles.dateInputs}>
                        <Bone style={styles.dateInput} />
                        <Bone style={styles.dateInput} />
                    </View>
                    <Bone style={styles.calendarPlaceholder} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    bone: {
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    heroContainer: {
        height: HERO_HEIGHT,
        width: SCREEN_WIDTH,
        marginBottom: -24,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    contentBody: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    titleSection: {
        marginBottom: 24,
    },
    title: {
        height: 32,
        width: '80%',
        marginBottom: 12,
        borderRadius: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    ratingBadge: {
        width: 60,
        height: 24,
        borderRadius: 6,
    },
    distanceBadge: {
        width: 100,
        height: 24,
        borderRadius: 6,
    },
    ownerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 24,
    },
    ownerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ownerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    ownerInfo: {
        gap: 8,
    },
    ownerName: {
        width: 140,
        height: 16,
        borderRadius: 4,
    },
    ownerResponse: {
        width: 100,
        height: 12,
        borderRadius: 4,
    },
    viewProfileButton: {
        width: 90,
        height: 32,
        borderRadius: 16,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        width: 120,
        height: 20,
        borderRadius: 4,
        marginBottom: 16,
    },
    descriptionLine: {
        width: '100%',
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
    },
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    specBoxWrapper: {
        width: (SCREEN_WIDTH - 40 - 12) / 2, // 2 columns with padding
        marginBottom: 12,
    },
    specBox: {
        width: '100%',
        height: 80,
        borderRadius: 12,
    },
    calendarSection: {
        marginTop: 8,
    },
    dateInputs: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        height: 60,
        borderRadius: 12,
    },
    calendarPlaceholder: {
        width: '100%',
        height: 320,
        borderRadius: 16,
    },
});
