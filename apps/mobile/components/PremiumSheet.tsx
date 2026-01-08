import React, { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { StyleSheet, View, Dimensions, Pressable, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate,
    runOnJS,
    withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PremiumSheetRef {
    show: () => void;
    hide: () => void;
    snapTo: (index: number) => void;
}

interface PremiumSheetProps {
    children: React.ReactNode;
    snapPoints: Array<number | string>; // Pixel values or percentages from bottom
}

export const PremiumSheet = forwardRef<PremiumSheetRef, PremiumSheetProps>(
    ({ children, snapPoints }, ref) => {
        const insets = useSafeAreaInsets();

        // Convert percentage strings to numbers
        const resolvedPoints = useMemo(() => {
            return snapPoints.map(p => {
                if (typeof p === 'string' && p.endsWith('%')) {
                    const pct = parseInt(p.replace('%', ''), 10) / 100;
                    return SCREEN_HEIGHT * pct;
                }
                return p as number;
            });
        }, [snapPoints]);

        // State
        const translateY = useSharedValue(SCREEN_HEIGHT);
        const active = useSharedValue(false);
        const context = useSharedValue(0);

        // Snap positions (Y coordinates from top)
        const snapOffsets = resolvedPoints.map(p => SCREEN_HEIGHT - p);
        const hiddenOffset = SCREEN_HEIGHT;

        const scrollTo = useCallback((destination: number) => {
            'worklet';
            active.value = destination !== hiddenOffset;
            translateY.value = withSpring(destination, {
                damping: 20,
                stiffness: 150,
                mass: 0.8,
            });
            if (destination !== hiddenOffset) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
        }, [translateY, active, hiddenOffset]);

        useImperativeHandle(ref, () => ({
            show: () => {
                scrollTo(snapOffsets[0]);
            },
            hide: () => {
                scrollTo(hiddenOffset);
            },
            snapTo: (index: number) => {
                if (snapOffsets[index] !== undefined) {
                    scrollTo(snapOffsets[index]);
                }
            },
        }));

        const gesture = Gesture.Pan()
            .onStart(() => {
                context.value = translateY.value;
            })
            .onUpdate((event) => {
                const draft = context.value + event.translationY;
                // Add resistance when pulling above the highest snap point
                const maxSnap = Math.min(...snapOffsets);
                if (draft < maxSnap) {
                    translateY.value = maxSnap + (draft - maxSnap) * 0.2;
                } else {
                    translateY.value = draft;
                }
            })
            .onEnd((event) => {
                const currentY = translateY.value;
                const velocity = event.velocityY;

                // Determine destination based on position and momentum
                const combinedPoints = [...snapOffsets, hiddenOffset];

                // Projection calculation for momentum
                const projection = currentY + (velocity * 0.1);

                let bestPoint = hiddenOffset;
                let minDelta = Infinity;

                for (const point of combinedPoints) {
                    const delta = Math.abs(projection - point);
                    if (delta < minDelta) {
                        minDelta = delta;
                        bestPoint = point;
                    }
                }

                scrollTo(bestPoint);
            });

        const rSheetStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [SCREEN_HEIGHT - 50, SCREEN_HEIGHT],
                [24, 0],
                Extrapolate.CLAMP
            );

            return {
                transform: [{ translateY: translateY.value }],
                borderRadius,
            };
        });

        const rBackdropStyle = useAnimatedStyle(() => {
            return {
                opacity: interpolate(
                    translateY.value,
                    [SCREEN_HEIGHT, Math.min(...snapOffsets)],
                    [0, 1],
                    Extrapolate.CLAMP
                ),
                pointerEvents: active.value ? 'auto' : 'none',
            };
        });

        return (
            <>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, rBackdropStyle]}>
                    <Pressable style={styles.flex} onPress={() => scrollTo(hiddenOffset)}>
                        <BlurView intensity={20} tint="dark" style={styles.flex} />
                    </Pressable>
                </Animated.View>

                {/* Sheet */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.sheet, rSheetStyle]}>
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>
                        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                            {children}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </>
        );
    }
);

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 999,
    },
    sheet: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: 0,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    handleContainer: {
        height: 30,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
