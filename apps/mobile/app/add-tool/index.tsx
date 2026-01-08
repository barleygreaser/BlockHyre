import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, StatusBar, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedReaction,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { Dots } from '../../components/add-tool/Dots';
import { StepButtons } from '../../components/add-tool/StepButtons';
import ToolDetailsStep from '../../components/add-tool/ToolDetailsStep';
import ToolImagesStep from '../../components/add-tool/ToolImagesStep';
import SubmitConfirmationDrawer from '../../components/add-tool/SubmitConfirmationDrawer';

export default function AddToolScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeIndex = useSharedValue(0);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const STEPS_COUNT = 2;
    const scrollY = useSharedValue(0);

    const HEADER_HEIGHT = 44;
    const SCROLL_DISTANCE = 40;

    // Step 0 -> "Next: Details & Images"
    // Step 1 -> "Review & Submit"
    const rightLabel = activeStepIndex === 0
        ? 'Next: Details & Images'
        : 'Review & Submit';

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Sticky Header Background Opacity
    const headerOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [SCROLL_DISTANCE, SCROLL_DISTANCE + 20],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Sticky Header Title Opacity
    const headerTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [SCROLL_DISTANCE + 10, SCROLL_DISTANCE + 30],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Large Title Opacity
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

    const handleSubmit = () => {
        // Modal handles the loading/success states
        // This just closes the modal and navigates back
        setShowConfirmation(false);
        router.back();
    };

    const increaseActiveIndex = useCallback(() => {
        Haptics.selectionAsync();
        const nextIndex = activeIndex.value + 1;
        if (nextIndex < STEPS_COUNT) {
            activeIndex.value = nextIndex;
        } else {
            // Show confirmation on final step
            setShowConfirmation(true);
        }
    }, [activeIndex]);

    const decreaseActiveIndex = useCallback(() => {
        Haptics.selectionAsync();
        activeIndex.value = Math.max(0, activeIndex.value - 1);
    }, [activeIndex]);

    useAnimatedReaction(
        () => activeIndex.value,
        (index) => {
            runOnJS(setActiveStepIndex)(index);
        },
        []
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" />

            {/* Scrollable Content */}
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: insets.top + HEADER_HEIGHT + 20,
                    paddingBottom: 40,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Large Header Content */}
                <Animated.View style={[styles.largeHeaderContainer, largeTitleStyle]}>
                    <Text style={styles.largeHeaderTitle}>Add a Tool</Text>
                </Animated.View>

                {/* Content Area */}
                <View style={styles.content}>
                    {activeStepIndex === 0 ? (
                        <ToolDetailsStep />
                    ) : (
                        <ToolImagesStep />
                    )}
                </View>
            </Animated.ScrollView>

            {/* Sticky Header (Absolute) */}
            <Animated.View
                style={[
                    styles.stickyHeaderContainer,
                    { height: insets.top + HEADER_HEIGHT },
                    headerOpacity
                ]}
            >
                <BlurView
                    tint="light"
                    intensity={90}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.stickyHeaderContent, { marginTop: insets.top, height: HEADER_HEIGHT }]}>
                    <Animated.Text style={[styles.stickyHeaderTitle, headerTitleStyle]}>
                        Add a Tool
                    </Animated.Text>
                    <View style={styles.headerBorder} />
                </View>
            </Animated.View>

            {/* Close Button - Always Visible */}
            <TouchableOpacity
                style={[
                    styles.closeButton,
                    { top: insets.top + (HEADER_HEIGHT - 40) / 2 }
                ]}
                activeOpacity={0.7}
                onPress={() => router.back()}
            >
                <X size={24} color="#111827" />
            </TouchableOpacity>

            {/* Dots Floating Above Footer */}
            <View style={styles.dotsContainer}>
                <View style={styles.dotsWrapper}>
                    <Dots activeIndex={activeIndex} count={STEPS_COUNT} dotSize={10} />
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.footer}>
                <StepButtons
                    activeIndex={activeIndex}
                    rightLabel={rightLabel}
                    backButtonLabel="Back"
                    onBack={decreaseActiveIndex}
                    onContinue={increaseActiveIndex}
                />
            </View>

            {/* Confirmation Drawer */}
            <SubmitConfirmationDrawer
                visible={showConfirmation}
                onConfirm={handleSubmit}
                onCancel={() => setShowConfirmation(false)}
            />
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
        fontSize: 28,
        fontWeight: '700',
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
    closeButton: {
        position: 'absolute',
        right: 20,
        zIndex: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    content: {
        width: '100%',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 130, // Positioned above the footer (approx height 122)
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 5,
        pointerEvents: 'none',
    },
    dotsWrapper: {
        backgroundColor: 'rgba(230, 230, 230, 0.8)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    footer: {
        marginBottom: 0,
        paddingBottom: 18,
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        paddingTop: 24, // Increased spacing for better UI/UX
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
});

