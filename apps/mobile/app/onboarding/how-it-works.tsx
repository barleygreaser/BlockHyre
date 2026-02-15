import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Radar, CheckCircle2, ShieldCheck, Handshake, Home, Store } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { Dots } from '../../components/onboarding/steps/dots';
import { StepButtons } from '../../components/onboarding/steps/step-buttons';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    primary: '#2563EB',
    surfaceBorder: '#E2E8F0',
};

const STEPS = [
    {
        id: 'intro',
        title: 'Your neighborhood tool shed, reimagined.',
        description: 'Borrow what you need within a 2-mile radius, ensuring safety and building community trust right from your phone.',
        visual: 'house-connection',
    },
    {
        id: 'step1',
        stepNum: '01',
        title: 'Hyperlocal Inventory',
        description: 'Browse tools exclusively available within a 2-mile radius of your home to keep rentals quick and local.',
        icon: <Radar size={48} color={COLORS.primary} strokeWidth={1.5} />,
    },
    {
        id: 'step2',
        stepNum: '02',
        title: 'The Safety Gate',
        description: 'Before every rental, sign a liability waiver and review the tool\'s safety manual. Safety first, always.',
        icon: <CheckCircle2 size={48} color={COLORS.primary} strokeWidth={1.5} />,
    },
    {
        id: 'step3',
        stepNum: '03',
        title: 'Optional Peace Fund',
        description: 'Opt-in for damage protection. Small micro-fees cover minor damages so neighbors stay friends.',
        icon: <ShieldCheck size={48} color={COLORS.primary} strokeWidth={1.5} />,
    },
];

export default function HowItWorksScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const activeIndex = useSharedValue(0);
    const [isLastStep, setIsLastStep] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const rightLabel = isLastStep ? 'Find Tools' : 'Continue';

    // 4 Steps total (0, 1, 2, 3)
    const TOTAL_STEPS = STEPS.length;

    const handleNext = useCallback(() => {
        if (currentIndex < TOTAL_STEPS - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            // Complete onboarding and go to signup
            router.push('/onboarding/signup');
        }
    }, [currentIndex, router]);

    const handleBack = useCallback(() => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
        }
    }, [currentIndex]);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index;
            setCurrentIndex(index);
            activeIndex.value = index;
        }
    }).current;

    useAnimatedReaction(
        () => activeIndex.value,
        (val) => {
            runOnJS(setIsLastStep)(val === TOTAL_STEPS - 1);
        },
        [TOTAL_STEPS]
    );

    const renderItem = ({ item }: { item: typeof STEPS[0] }) => {
        return (
            <View style={[styles.stepContainer, { width }]}>
                <View style={styles.stepContent}>
                    {item.visual === 'house-connection' ? (
                        <View style={styles.visualContainer}>
                            <View style={styles.visualCard}>
                                <LinearGradient
                                    colors={['#F8FAFC', '#F1F5F9']}
                                    style={styles.visualCardGradient}
                                >
                                    <View style={styles.visualAccent} />
                                    <View style={styles.connectionGraphic}>
                                        <View style={styles.nodeContainer}>
                                            <View style={styles.iconCircle}>
                                                <Home size={24} color={COLORS.textPrimary} />
                                            </View>
                                            <Text style={styles.nodeLabel}>You</Text>
                                        </View>
                                        <View style={styles.lineConnector}>
                                            <LinearGradient
                                                colors={[COLORS.textSecondary, COLORS.primary, COLORS.textSecondary]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{ height: 2, flex: 1, opacity: 0.5 }}
                                            />
                                            <View style={styles.activeDot} />
                                        </View>
                                        <View style={styles.nodeContainer}>
                                            <View style={styles.iconCircle}>
                                                <Store size={24} color={COLORS.textPrimary} />
                                            </View>
                                            <Text style={styles.nodeLabel}>Neighbor</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.radiusLabel}>2-MILE RADIUS LINK</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.iconContainer}>
                            <View style={styles.iconBackground}>
                                {item.icon}
                            </View>
                            <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeText}>{item.stepNum}</Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea}>

                {/* Header Spacer (removed header) */}
                <View style={{ height: 20 }} />

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={STEPS}
                        renderItem={renderItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                        scrollEventThrottle={16}
                        bounces={false}
                    />
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <Dots activeIndex={activeIndex} count={TOTAL_STEPS} dotSize={10} />
                    <StepButtons
                        activeIndex={activeIndex}
                        rightLabel={rightLabel}
                        backButtonLabel="Back"
                        onBack={handleBack}
                        onContinue={handleNext}
                    />
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    stepContent: {
        alignItems: 'center',
        width: '100%',
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
    // Visual Card Styles
    visualContainer: {
        width: '100%',
        marginBottom: 40,
    },
    visualCard: {
        height: 200,
        width: '100%',
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        backgroundColor: '#FFF',
    },
    visualCardGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        height: 200,
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderRadius: 100,
        transform: [{ translateX: 60 }, { translateY: -60 }],
    },
    connectionGraphic: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },
    nodeContainer: {
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    nodeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    lineConnector: {
        width: 60,
        height: 2,
        position: 'relative',
        top: -12,
    },
    activeDot: {
        position: 'absolute',
        top: -5,
        left: '50%',
        marginLeft: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    radiusLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 8,
    },
    // Icon Styles
    iconContainer: {
        width: 120,
        height: 120,
        marginBottom: 32,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EFF6FF', // Blue 50
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE', // Blue 100
    },
    stepBadge: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: COLORS.textPrimary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stepBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    // Controls
    controlsContainer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
});
