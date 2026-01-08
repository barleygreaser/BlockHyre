import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    RotateCcw,
    MapPin,
    Info,
    ShieldCheck,
    CheckCircle,
    ExternalLink
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
    withSpring,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import { RentalCalendar } from '@/components/RentalCalendar';
import { useToast, ToastProvider } from '@/components/toast';
import * as Haptics from 'expo-haptics';
import { AlertCircle } from 'lucide-react-native';

type Step = 'summary' | 'confirmation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock pricing - in production, fetch based on listing
const DAILY_RATE = 45;
const DISCOUNT_PERCENT = 10;

// Mock blocked dates from owner - in production, fetch from Supabase
// Format: YYYY-MM-DD (same as Glow Calendar disabledDates)
const getMockBlockedDates = (): string[] => {
    const today = new Date();
    const blockedDates: string[] = [];

    // Block a few dates in the next 2 weeks for demo
    [3, 4, 10, 11, 12].forEach(offset => {
        const blockedDate = new Date(today);
        blockedDate.setDate(today.getDate() + offset);
        blockedDates.push(blockedDate.toISOString().split('T')[0]);
    });

    return blockedDates;
};

type ActiveField = 'pickup' | 'return';

export default function RequestRentalScreen() {
    return (
        <ToastProvider>
            <RequestRentalContent />
        </ToastProvider>
    );
}

function RequestRentalContent() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const params = useLocalSearchParams<{
        id?: string;
        title?: string;
        price?: string;
        image?: string;
        startDate?: string;
        endDate?: string;
        step?: Step;
    }>();
    const { showToast } = useToast();

    // Flow State - Start directly at summary since dates are selected on listing page
    const [step, setStep] = useState<Step>('summary');

    // Date selection state
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [pickupDate, setPickupDate] = useState<Date>(() => {
        if (params.startDate) {
            const [y, m, d] = params.startDate.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return today;
    });
    const [returnDate, setReturnDate] = useState<Date>(() => {
        if (params.endDate) {
            const [y, m, d] = params.endDate.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return tomorrow;
    });
    const [activeField, setActiveField] = useState<ActiveField>('pickup');

    // Track if we're selecting the start or end of range
    const [rangeSelectionState, setRangeSelectionState] = useState<'start' | 'end'>('start');

    // Get blocked dates (in production, fetch from listing data)
    const blockedDates = useMemo(() => getMockBlockedDates(), []);

    // Handle blocked date press
    const handleBlockedDatePress = useCallback((date: Date) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        showToast({
            title: 'Date Unavailable',
            subtitle: `${formattedDate} is blocked by the owner.`,
            leading: () => <AlertCircle size={20} color="#FF6700" />,
            autodismiss: true,
        });
    }, [showToast]);

    // Calculate rental duration and pricing
    const daysDiff = useMemo(() => {
        const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days === 0 ? 1 : days;
    }, [pickupDate, returnDate]);

    const dailyRate = params.price ? parseInt(params.price, 10) : DAILY_RATE;
    const originalTotal = daysDiff * dailyRate;
    const discountedTotal = originalTotal * (1 - DISCOUNT_PERCENT / 100);
    const totalWithFees = discountedTotal + 4; // Adding $4 service fee

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatDateFull = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Handle date selection
    const handleDateSelect = useCallback((date: Date, _isPickup: boolean) => {
        const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

        if (rangeSelectionState === 'start') {
            setPickupDate(date);
            if (isSameDay(date, pickupDate)) {
                setReturnDate(date);
                setRangeSelectionState('start');
            } else {
                setReturnDate(date);
                setRangeSelectionState('end');
            }
            setActiveField('return');
        } else {
            let newStart = pickupDate;
            let newEnd = date;

            if (date < pickupDate) {
                newStart = date;
                newEnd = pickupDate;
            }

            const hasCollision = blockedDates.some(blockedStr => {
                const blocked = new Date(blockedStr);
                blocked.setHours(0, 0, 0, 0);
                const start = new Date(newStart);
                start.setHours(0, 0, 0, 0);
                const end = new Date(newEnd);
                end.setHours(0, 0, 0, 0);
                return blocked > start && blocked < end;
            });

            if (hasCollision) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                showToast({
                    title: 'Selection Unavailable',
                    subtitle: 'Selected range includes blocked dates.',
                    leading: () => <AlertCircle size={20} color="#FF6700" />,
                    autodismiss: true,
                });
                setPickupDate(date);
                setReturnDate(date);
                setRangeSelectionState('end');
                setActiveField('return');
                return;
            }

            setPickupDate(newStart);
            setReturnDate(newEnd);
            setRangeSelectionState('start');
            setActiveField('pickup');
        }
    }, [rangeSelectionState, pickupDate, blockedDates]);

    const handleReset = () => {
        const newToday = new Date();
        newToday.setHours(0, 0, 0, 0);
        const newTomorrow = new Date(newToday);
        newTomorrow.setDate(newToday.getDate() + 1);
        setPickupDate(newToday);
        setReturnDate(newTomorrow);
        setRangeSelectionState('start');
    };

    const handleContinue = () => {
        if (step === 'summary') {
            setStep('confirmation');
        }
    };

    // --- Render Methods ---

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <BlurView
                intensity={isDark ? 60 : 90}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    StyleSheet.absoluteFill,
                    styles.headerBlur,
                    isDark ? styles.headerBlurDark : styles.headerBlurLight,
                ]}
            />
            <View style={styles.headerContent}>
                <TouchableOpacity
                    style={[styles.headerButton, isDark && styles.headerButtonDark]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color={isDark ? '#FFFFFF' : '#0F172A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                    Rental Summary
                </Text>
                <View style={{ width: 40 }} />
            </View>
        </View>
    );

    const renderSelection = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 90, paddingBottom: 180 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Date Inputs */}
                <View style={styles.dateInputsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.dateInput,
                            isDark && styles.dateInputDark,
                            activeField === 'pickup' && styles.dateInputActive,
                        ]}
                        onPress={() => setActiveField('pickup')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.dateLabel, isDark && styles.dateLabelDark]}>Pickup</Text>
                        <View style={styles.dateInputContent}>
                            <View style={styles.dateInputRow}>
                                <Text style={[styles.dateValueLarge, isDark && styles.dateValueLargeDark]}>
                                    {formatDate(pickupDate)}
                                </Text>
                                {activeField === 'pickup' && <CalendarIcon size={18} color="#FF6700" />}
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.dateInput,
                            isDark && styles.dateInputDark,
                            activeField === 'return' && styles.dateInputActive,
                        ]}
                        onPress={() => setActiveField('return')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.dateLabel, isDark && styles.dateLabelDark]}>Return</Text>
                        <View style={styles.dateInputContent}>
                            <View style={styles.dateInputRow}>
                                <Text style={[styles.dateValueLarge, isDark && styles.dateValueLargeDark]}>
                                    {formatDate(returnDate)}
                                </Text>
                                {activeField === 'return' && <CalendarIcon size={18} color="#FF6700" />}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Calendar */}
                <View style={[styles.calendarWrapper, isDark && styles.calendarWrapperDark]}>
                    <RentalCalendar
                        pickupDate={pickupDate}
                        returnDate={returnDate}
                        onDateSelect={handleDateSelect}
                        activeField={activeField}
                        minDate={new Date()}
                        disabledDates={blockedDates}
                        onBlockedDatePress={handleBlockedDatePress}
                        theme={isDark ? 'dark' : 'light'}
                    />
                </View>
            </ScrollView>
        </Animated.View>
    );

    const renderSummary = () => (
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 90, paddingBottom: 180 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Tool Card */}
                <View style={[styles.summaryCard, isDark && styles.summaryCardDark, { flexDirection: 'row', justifyContent: 'space-between', gap: 16 }]}>
                    <View style={{ flex: 1, gap: 8 }}>
                        <Text style={[styles.summaryToolTitle, isDark && styles.summaryToolTitleDark]}>
                            {params.title || 'Makita 18V Cordless Drill'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.ownerAvatar} />
                            <Text style={[styles.ownerName, isDark && styles.ownerNameDark]}>Owner: John D.</Text>
                        </View>
                    </View>
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8VCo74H0rvzzgurg35m0COJrkpK3QgT8PLtXZqbj7dpHLr7m1MJqyBkOIL0HzAAC2xdCTr8bC4OF1dnG2N7FRmd9nGNWlqlOxGv9Rbx81daFRePLypZ7jLo8kwOaP-APd2JrHKw8Q_pi6g3sIu2WpyUc9DOOB2EUvuiBsj21kFP08VcfeCiLw-WWg25HUYH9_rjOHUh-hnNA0MBnKwXH17vAJ8oq2LOTIy5IthdtG9IKZisDCkAC0mmSXONIo5g25NmpRzdolfQ' }}
                        style={styles.summaryToolImage}
                    />
                </View>

                {/* Schedule */}
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Schedule</Text>
                <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLeft}>
                            <View style={styles.timelineDot}><CalendarIcon size={14} color="#FF6700" /></View>
                            <View style={[styles.timelineLine, isDark && styles.timelineLineDark]} />
                            <View style={styles.timelineDot}><RotateCcw size={14} color="#FF6700" /></View>
                        </View>
                        <View style={styles.timelineRight}>
                            <View style={styles.timelineItem}>
                                <Text style={[styles.timelineLabel, isDark && styles.timelineLabelDark]}>PICKUP</Text>
                                <Text style={[styles.timelineValue, isDark && styles.timelineValueDark]}>{formatDateFull(pickupDate)}</Text>
                            </View>
                            <View style={{ height: 20 }} />
                            <View style={styles.timelineItem}>
                                <Text style={[styles.timelineLabel, isDark && styles.timelineLabelDark]}>RETURN</Text>
                                <Text style={[styles.timelineValue, isDark && styles.timelineValueDark]}>{formatDateFull(returnDate)}</Text>
                                <Text style={[styles.timelineDuration, isDark && styles.timelineDurationDark]}>Duration: {daysDiff} Day{daysDiff > 1 ? 's' : ''}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pickup Location */}
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Pickup & Return</Text>
                <View style={[styles.summaryCard, isDark && styles.summaryCardDark, { gap: 10 }]}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <MapPin size={24} color="#FF6700" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.summaryToolTitle, isDark && styles.summaryToolTitleDark, { fontSize: 16 }]}>Neighborhood View</Text>
                            <Text style={[styles.ownerName, isDark && styles.ownerNameDark, { marginTop: 2, fontSize: 13 }]}>Specific address sent upon confirmation.</Text>
                        </View>
                    </View>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapOverlay}>
                            <Text style={styles.mapOverlayText}>Neighborhood View</Text>
                        </View>
                    </View>
                </View>

                {/* Price Details */}
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Price Details</Text>
                <View style={[styles.summaryCard, isDark && styles.summaryCardDark, { paddingBottom: 20 }]}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, isDark && styles.priceLabelDark]}>${dailyRate.toFixed(2)} x {daysDiff} days</Text>
                        <Text style={[styles.priceValue, isDark && styles.priceValueDark]}>${originalTotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[styles.priceLabel, isDark && styles.priceLabelDark]}>Service Fee</Text>
                            <Info size={14} color="#94A3B8" />
                        </View>
                        <Text style={[styles.priceValue, isDark && styles.priceValueDark]}>$4.00</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, isDark && styles.priceLabelDark]}>Insurance (Basic)</Text>
                        <Text style={{ color: '#10B981', fontWeight: '600' }}>Free</Text>
                    </View>
                    <View style={[styles.divider, isDark && styles.dividerDark]} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.summaryTotalLabel, isDark && styles.summaryTotalLabelDark]}>Total</Text>
                        <Text style={styles.summaryTotalValue}>${totalWithFees.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.secureBadge, isDark && styles.secureBadgeDark]}>
                        <ShieldCheck size={14} color="#10B981" />
                        <Text style={[styles.secureText, isDark && styles.secureTextDark]}>Secure payment & insurance covered</Text>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );

    const renderConfirmation = () => (
        <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
            <LinearGradient
                colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFF7ED', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmationGradient}
            >
                <View style={styles.confirmationContent}>
                    <View style={styles.confirmationHero}>
                        <View style={styles.successIconWrapper}>
                            <SuccessAnimation isDark={isDark} />
                        </View>
                        <Animated.Text
                            entering={FadeIn.delay(300).duration(500)}
                            style={[styles.confirmationTitle, isDark && styles.confirmationTitleDark]}
                        >
                            Request Sent!
                        </Animated.Text>
                        <Animated.Text
                            entering={FadeIn.delay(400).duration(500)}
                            style={[styles.confirmationSubtitle, isDark && styles.confirmationSubtitleDark]}
                        >
                            We've sent your request to owner. You'll hear back within 24 hours.
                        </Animated.Text>
                    </View>

                    <Animated.View entering={FadeIn.delay(500).duration(500)} style={{ width: '100%' }}>
                        <View style={[styles.receiptCard, isDark && styles.receiptCardDark]}>
                            <View style={styles.receiptHeader}>
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsj53pOBI8BagjEoZ1pNytyeFngNwgUdwP0eVpQ5qcG1QeySVUGrCS07jSIfnp-I1PfjNmvFtb2s4gz_lZdYm4m1tAMtJNoj8h3W85gdX0Tg_22cnpWuYaJUG2e3Hd7mY9UZ0PKw7eSedoG5OwMXvq8ivD-b_nOa8Rufd99ppzB42ckbo1xzBZbmZhwPZVuG4Cqck8mUKPJPpfn_aP8CUrr6Yh_yKVp11yMQAHUtkSjAwM68b1_lt5FUOiniQ_UyzuuwnuMo2YxA' }}
                                    style={styles.receiptImage}
                                />
                                <View style={{ flex: 1, height: 60, justifyContent: 'space-between' }}>
                                    <Text numberOfLines={2} style={[styles.receiptToolTitle, isDark && styles.receiptToolTitleDark]}>
                                        {params.title || 'Makita Impact Driver'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={[styles.ownerAvatar, { width: 20, height: 20 }]} />
                                        <Text style={[styles.ownerName, isDark && styles.ownerNameDark]}>David M.</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.receiptBody}>
                                <View style={styles.receiptRow}>
                                    <View style={styles.receiptIconBox}>
                                        <CalendarIcon size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.timelineLabel, isDark && styles.timelineLabelDark]}>PICKUP</Text>
                                        <Text style={[styles.receiptValue, isDark && styles.receiptValueDark]}>{formatDateFull(pickupDate)}</Text>
                                    </View>
                                </View>
                                <View style={styles.receiptRow}>
                                    <View style={styles.receiptIconBox}>
                                        <RotateCcw size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.timelineLabel, isDark && styles.timelineLabelDark]}>RETURN</Text>
                                        <Text style={[styles.receiptValue, isDark && styles.receiptValueDark]}>{formatDateFull(returnDate)}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.divider, isDark && styles.dividerDark, { borderStyle: 'dashed', borderWidth: 1 }]} />

                            <View style={styles.receiptTotal}>
                                <Text style={[styles.receiptTotalLabel, isDark && styles.receiptTotalLabelDark]}>Total Estimated</Text>
                                <Text style={styles.receiptTotalValue}>${totalWithFees.toFixed(2)}</Text>
                            </View>
                        </View>

                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.confirmationActions}>
                        <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/(tabs)/rentals')}>
                            <Text style={styles.continueButtonText}>View My Rentals</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>Explore More Tools</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {step !== 'confirmation' && renderHeader()}

            {step === 'summary' && renderSummary()}
            {step === 'confirmation' && renderConfirmation()}

            {step !== 'confirmation' && (
                <View
                    style={[
                        styles.footer,
                        isDark && styles.footerDark,
                        { paddingBottom: Math.max(insets.bottom, 16) + 8 },
                    ]}
                >
                    <View style={styles.footerContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pricingLabel, isDark && styles.pricingLabelDark]}>
                                Total to Pay
                            </Text>
                            <Text style={styles.finalPrice}>${totalWithFees.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.continueButton, { flex: 2 }]}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>
                                Confirm Request
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

function SuccessAnimation({ isDark }: { isDark: boolean }) {
    const scale = useSharedValue(0);
    const rippleScale = useSharedValue(0.5);
    const rippleOpacity = useSharedValue(1);

    React.useEffect(() => {
        scale.value = withSpring(1, { damping: 15 });
        rippleScale.value = withRepeat(withTiming(1.15, { duration: 3000, easing: Easing.out(Easing.ease) }), -1);
        rippleOpacity.value = withRepeat(withTiming(0, { duration: 3000, easing: Easing.out(Easing.ease) }), -1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rippleScale.value }],
        opacity: rippleOpacity.value,
    }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', width: 90, height: 90 }}>
            <Animated.View style={[styles.successRipple, rippleStyle]} />
            <Animated.View style={[styles.successCircle, isDark ? styles.successCircleDark : styles.successCircleLight, animatedStyle]}>
                <CheckCircle size={34} color="#FFFFFF" strokeWidth={3} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    confirmationGradient: {
        flex: 1,
    },
    successRipple: {
        position: 'absolute',
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(255, 103, 0, 0.15)',
    },
    successCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    successCircleLight: {
        backgroundColor: '#FF6700',
    },
    successCircleDark: {
        backgroundColor: '#FF6700',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    containerDark: {
        backgroundColor: '#0F172A',
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerBlur: {
        borderBottomWidth: 0.5,
    },
    headerBlurLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerBlurDark: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButtonDark: {
        backgroundColor: '#1E293B',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    headerTitleDark: {
        color: '#FFFFFF',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    resetText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6700',
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 16,
    },

    // Date Inputs
    dateInputsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 14,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    dateInputDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    dateInputActive: {
        borderColor: '#FF6700',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    dateLabelDark: {
        color: '#94A3B8',
    },
    dateInputContent: {
        gap: 4,
    },
    dateValueLarge: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    dateValueLargeDark: {
        color: '#FFFFFF',
    },
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Calendar
    calendarWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    calendarWrapperDark: {
        borderColor: '#334155',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingHorizontal: 20,
        paddingTop: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    footerDark: {
        backgroundColor: '#0F172A',
        borderTopColor: '#334155',
    },
    footerContent: {
        gap: 16,
    },
    pricingSection: {
        gap: 4,
    },
    pricingLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    pricingLabelDark: {
        color: '#94A3B8',
    },
    pricingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        fontSize: 13,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    originalPriceDark: {
        color: '#64748B',
    },
    discountBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10B981',
    },
    finalPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF6700',
    },
    continueButton: {
        backgroundColor: '#FF6700',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6700',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // New Styles
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 4,
        marginBottom: 8,
    },
    sectionTitleDark: {
        color: '#FFFFFF',
    },
    summaryCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryCardDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    summaryToolTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    summaryToolTitleDark: {
        color: '#FFFFFF',
    },
    summaryToolImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
    ownerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#CBD5E1',
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    ownerNameDark: {
        color: '#94A3B8',
    },
    timelineContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timelineLeft: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    timelineDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 103, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    timelineLineDark: {
        backgroundColor: '#334155',
    },
    timelineRight: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    timelineItem: {
        minHeight: 48,
        justifyContent: 'center',
    },
    timelineLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    timelineLabelDark: {
        color: '#64748B',
    },
    timelineValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    timelineValueDark: {
        color: '#FFFFFF',
    },
    timelineDuration: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    timelineDurationDark: {
        color: '#94A3B8',
    },
    mapPlaceholder: {
        height: 120,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    mapOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    mapOverlayText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    priceLabelDark: {
        color: '#94A3B8',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    priceValueDark: {
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    dividerDark: {
        backgroundColor: '#334155',
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    summaryTotalLabelDark: {
        color: '#FFFFFF',
    },
    summaryTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF6700',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        padding: 8,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
    },
    secureBadgeDark: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    secureText: {
        fontSize: 12,
        color: '#64748B',
    },
    secureTextDark: {
        color: '#94A3B8',
    },
    // Confirmation Styles
    confirmationContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    confirmationHero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successIconWrapper: {
        marginBottom: 24,
    },
    confirmationTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmationTitleDark: {
        color: '#FFFFFF',
    },
    confirmationSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
    },
    confirmationSubtitleDark: {
        color: '#94A3B8',
    },
    receiptCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    receiptCardDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    receiptHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    receiptImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
    receiptToolTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    receiptToolTitleDark: {
        color: '#FFFFFF',
    },
    receiptBody: {
        gap: 12,
        marginBottom: 16,
    },
    receiptRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    receiptIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    receiptValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    receiptValueDark: {
        color: '#FFFFFF',
    },
    receiptTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
    },
    receiptTotalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
    },
    receiptTotalLabelDark: {
        color: '#94A3B8',
    },
    receiptTotalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF6700',
    },
    confirmationActions: {
        width: '100%',
        gap: 16,
        marginTop: 'auto',
        marginBottom: 40,
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    secondaryButtonDark: {
        borderColor: '#334155',
        backgroundColor: '#1E293B',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    secondaryButtonTextDark: {
        color: '#FFFFFF',
    },
});
