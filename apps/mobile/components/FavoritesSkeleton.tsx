import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Match the 24px padding logic from the favorites screen
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // (Screen - 24*2 padding - 16 gap) / 2

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

    return <Animated.View style={[style, styles.bone, animatedStyle]} />;
};

export const FavoritesSkeletonCard = () => {
    return (
        <View style={styles.cardContainer}>
            <Bone style={styles.imagePlaceholder} />
            {/* Heart placeholder */}
            <Bone style={styles.heartPlaceholder} />

            <View style={styles.contentContainer}>
                <Bone style={styles.titlePlaceholder} />
                <Bone style={styles.locationPlaceholder} />
                <View style={styles.priceRow}>
                    <Bone style={styles.pricePlaceholder} />
                    <Bone style={styles.perDayPlaceholder} />
                </View>
            </View>
        </View>
    );
};

export const FavoritesSkeletonGrid = () => {
    // Show 6 cards (3 rows of 2)
    const cards = [0, 1, 2, 3, 4, 5];
    const rows: number[][] = [];
    for (let i = 0; i < cards.length; i += 2) {
        rows.push(cards.slice(i, i + 2));
    }

    return (
        <View style={styles.gridContainer}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                    {row.map((cardIndex) => (
                        <FavoritesSkeletonCard key={cardIndex} />
                    ))}
                    {row.length === 1 && <View style={styles.cardSpacer} />}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: 24, // Matches the screen padding
        paddingTop: 16,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardSpacer: {
        width: CARD_WIDTH,
    },
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'transparent',
        position: 'relative',
    },
    bone: {
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        marginBottom: 12,
    },
    heartPlaceholder: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        zIndex: 10,
    },
    contentContainer: {
        flex: 1,
        gap: 8,
    },
    titlePlaceholder: {
        height: 20,
        width: '80%',
        marginBottom: 4,
    },
    locationPlaceholder: {
        height: 14,
        width: '60%',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 'auto',
        gap: 4,
    },
    pricePlaceholder: {
        height: 24,
        width: 40,
        borderRadius: 6,
    },
    perDayPlaceholder: {
        height: 14,
        width: 30,
        borderRadius: 4,
    },
});
