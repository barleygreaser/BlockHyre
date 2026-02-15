import React, { useState, useRef } from 'react';
import { Image } from 'expo-image';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent,
    FlatList,
    ViewToken,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedRef,
    interpolate,
    interpolateColor,
    Extrapolation,
    runOnJS,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Share2,
    Heart,
    MapPin,
    Star,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Calendar as CalendarIcon,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { SpecsGrid, StickyFooter, type Specification } from '@/components/listings';
import { ListingDetailSkeleton } from '@/components/ListingDetailSkeleton';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DateRange } from '@/components/calendar/Calendar.props';
import { lightTheme, darkTheme } from '@/components/calendar/constants';
import moment from 'moment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = 340;
const HEADER_TRANSITION_POINT = 280;

// Mock data removed - fetching from DB

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [isLiked, setIsLiked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [calendarY, setCalendarY] = useState(0);
    const [isCalendarInView, setIsCalendarInView] = useState(false);
    const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const carouselRef = useRef<FlatList>(null);

    const scrollY = useSharedValue(0);

    // Viewability config for FlatList carousel
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    }).current;

    // Optimized scroll handler running on UI thread
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;

            // Handle header transition state
            const isScrolledDown = event.contentOffset.y > HEADER_TRANSITION_POINT;
            if (isScrolledDown !== isScrolled) {
                runOnJS(setIsScrolled)(isScrolledDown);
            }

            // Handle calendar visibility check
            if (calendarY > 0) {
                // Adjust for hero height and overlap
                const verticalOffset = HERO_HEIGHT - 24;
                const isInView = (event.contentOffset.y + SCREEN_HEIGHT) > (calendarY + verticalOffset + 100);
                if (isInView !== isCalendarInView) {
                    runOnJS(setIsCalendarInView)(isInView);
                }
            }
        },
    }, [calendarY, isScrolled, isCalendarInView]);

    const toggleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleShare = () => {
        // Implement share functionality
    };

    const handleRent = () => {
        // Navigate to rental request flow
        if (!dateRange.start || !dateRange.end) {
            // If no date selected, maybe show toast or just go to selection flow (optional)
            // For now, let's just go to request-rental and let it handle defaults or emptiness
            // But ideally we want to pass the selection if made.
        }

        router.push({
            pathname: '/request-rental',
            params: {
                id: listing.id,
                title: listing.title,
                price: String(listing.price),
                image: listing.images[0],
                // Pass selected dates if available
                startDate: dateRange.start,
                endDate: dateRange.end,
                step: (dateRange.start && dateRange.end) ? 'summary' : 'selection',
            },
        });
    };

    // Animated header background style
    const headerBgStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 50, HEADER_TRANSITION_POINT],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Animated title visibility
    const headerTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 30, HEADER_TRANSITION_POINT + 20],
            [0, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 30, HEADER_TRANSITION_POINT + 20],
            [10, 0],
            Extrapolation.CLAMP
        );
        return { opacity, transform: [{ translateY }] };
    });

    // Animated carousel indicator opacity
    const carouselIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_TRANSITION_POINT],
            [1, 0],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Animated button background style
    const buttonBgStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 50, HEADER_TRANSITION_POINT],
            ['rgba(0, 0, 0, 0.3)', isDark ? '#1E293B' : '#F1F5F9']
        );
        return { backgroundColor };
    });

    // Animated opacity for icon crossfade (light icons fade out, dark icons fade in)
    const lightIconStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 50, HEADER_TRANSITION_POINT],
            [1, 0],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    const darkIconStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [HEADER_TRANSITION_POINT - 50, HEADER_TRANSITION_POINT],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Stretchy Header Effect (Zoom on pull down)
    const heroAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            [-HERO_HEIGHT, 0, HERO_HEIGHT],
            [2, 1, 1],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [-HERO_HEIGHT, 0, HERO_HEIGHT],
            [-HERO_HEIGHT / 2, 0, HERO_HEIGHT],
            Extrapolation.EXTEND
        );

        return {
            transform: [
                { translateY },
                { scale },
            ],
        };
    });

    // Scrolled icon color (depends on dark mode)
    const scrolledIconColor = isDark ? '#FFFFFF' : '#0F172A';

    const scrollToCalendar = (input: 'start' | 'end') => {
        setActiveInput(input);
        const targetY = HERO_HEIGHT - 24 + calendarY - 100;
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
    };

    // Auto-clear active input when selection is complete
    React.useEffect(() => {
        if (dateRange.start && dateRange.end) {
            setActiveInput(null);
        }
    }, [dateRange]);

    // State for fetching
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchListing = async () => {
            const listingId = Array.isArray(id) ? id[0] : id;

            if (!listingId) {
                setLoading(false);
                return;
            }

            // Handle mock IDs from development data to prevent crashes
            if (listingId.length < 20) {
                setListing({
                    id: listingId,
                    title: 'Mock Tool (Dev Placeholder)',
                    price: 45,
                    description: 'This is a placeholder for development mock data. Real listings will load their actual details.',
                    images: ['https://placehold.co/600x400'],
                    specs: [{ label: 'Status', value: 'Mock Data' }],
                    distance: 'N/A',
                    rating: 5.0,
                    isVerified: false,
                    owner: { name: 'System', avatarUrl: 'https://placehold.co/100', responseTime: 'N/A' }
                });
                setLoading(false);
                return;
            }

            try {
                // Fetch listing
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .single();

                if (listingError) throw listingError;

                // Fetch owner manually if join fails/simple
                let ownerProfile = { full_name: 'Unknown User', profile_photo_url: null };
                if (listingData.owner_id) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('full_name, profile_photo_url')
                        .eq('id', listingData.owner_id)
                        .single();
                    if (userData) ownerProfile = userData;
                }

                // Format specs from JSONB
                const specifications = listingData.specifications || {};
                const specs = Object.entries(specifications).map(([key, value]) => ({
                    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: String(value)
                }));

                const formattedListing = {
                    ...listingData,
                    title: listingData.title,
                    price: listingData.daily_price,
                    description: listingData.description || 'No description provided.',
                    images: listingData.images && listingData.images.length > 0 ? listingData.images : ['https://placehold.co/600x400'],
                    specs: specs.length > 0 ? specs : [{ label: 'Condition', value: 'Used' }],
                    distance: '2.5 mi away', // Mock
                    rating: 5.0, // Mock
                    isVerified: true, // Mock
                    owner: {
                        name: ownerProfile.full_name || 'User',
                        avatarUrl: ownerProfile.profile_photo_url || 'https://placehold.co/100',
                        responseTime: '< 1hr', // Mock
                    }
                };

                // Prefetch critical images (Hero + Avatar) to ensure instant rendering after skeleton
                const imagesToPrefetch = [
                    formattedListing.images[0],
                    formattedListing.owner.avatarUrl
                ].filter(Boolean);

                try {
                    await Promise.all(imagesToPrefetch.map(url => Image.prefetch(url)));
                } catch (err) {
                    console.warn('Failed to prefetch images:', err);
                }

                setListing(formattedListing);
            } catch (err) {
                console.error('Error fetching listing details:', err);
                setListing(null);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    if (loading) {
        return <ListingDetailSkeleton />;
    }

    if (!listing) {
        return (
            <View style={[styles.container, isDark && styles.containerDark, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Text style={[styles.title, isDark && styles.titleDark, { textAlign: 'center' }]}>Listing Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: '#FF6700', fontSize: 16 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar barStyle={isScrolled && !isDark ? 'dark-content' : 'light-content'} />

            {/* Sticky Header */}
            <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
                {/* Background Blur (appears on scroll) */}
                <Animated.View style={[StyleSheet.absoluteFill, headerBgStyle]}>
                    <BlurView
                        intensity={isDark ? 60 : 90}
                        tint={isDark ? 'dark' : 'light'}
                        style={[
                            StyleSheet.absoluteFill,
                            styles.headerBlur,
                            isDark ? styles.headerBlurDark : styles.headerBlurLight,
                        ]}
                    />
                </Animated.View>

                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[styles.headerButton, buttonBgStyle]}>
                                {/* Light icon (visible before scroll) */}
                                <Animated.View style={[styles.iconContainer, lightIconStyle]}>
                                    <ArrowLeft size={22} color="#FFFFFF" />
                                </Animated.View>
                                {/* Dark icon (visible after scroll) */}
                                <Animated.View style={[styles.iconContainer, styles.iconOverlay, darkIconStyle]}>
                                    <ArrowLeft size={22} color={scrolledIconColor} />
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                        <Animated.Text
                            style={[
                                styles.headerTitle,
                                isDark && styles.headerTitleDark,
                                headerTitleStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {listing.title}
                        </Animated.Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={handleShare}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[styles.headerButton, buttonBgStyle]}>
                                {/* Light icon (visible before scroll) */}
                                <Animated.View style={[styles.iconContainer, lightIconStyle]}>
                                    <Share2 size={20} color="#FFFFFF" />
                                </Animated.View>
                                {/* Dark icon (visible after scroll) */}
                                <Animated.View style={[styles.iconContainer, styles.iconOverlay, darkIconStyle]}>
                                    <Share2 size={20} color={scrolledIconColor} />
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleLike}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[styles.headerButton, buttonBgStyle]}>
                                {isLiked ? (
                                    <Heart size={20} color="#EF4444" fill="#EF4444" />
                                ) : (
                                    <>
                                        {/* Light icon (visible before scroll) */}
                                        <Animated.View style={[styles.iconContainer, lightIconStyle]}>
                                            <Heart size={20} color="#FFFFFF" fill="transparent" />
                                        </Animated.View>
                                        {/* Dark icon (visible after scroll) */}
                                        <Animated.View style={[styles.iconContainer, styles.iconOverlay, darkIconStyle]}>
                                            <Heart size={20} color={scrolledIconColor} fill="transparent" />
                                        </Animated.View>
                                    </>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>



            <Animated.ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {/* Fixed Hero Image Section - Now inside scrollview for touch handling */}
                <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
                    <FlatList
                        ref={carouselRef}
                        data={listing.images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToAlignment="center"
                        decelerationRate="fast"
                        viewabilityConfig={viewabilityConfig}
                        onViewableItemsChanged={onViewableItemsChanged}
                        keyExtractor={(item, index) => `image-${index}`}
                        renderItem={({ item }) => (
                            <View style={styles.imageSlide}>
                                <Image
                                    source={item}
                                    style={styles.heroImage}
                                    contentFit="cover"
                                    transition={200}
                                />
                            </View>
                        )}
                    />
                    {/* Gradient overlay for better button visibility */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent']}
                        style={styles.heroGradient}
                        pointerEvents="none"
                    />

                    {/* Carousel Indicators */}
                    {listing.images.length > 1 && (
                        <Animated.View style={[styles.carouselIndicators, carouselIndicatorStyle]}>
                            {listing.images.map((_: any, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.carouselDot,
                                        currentImageIndex === index
                                            ? styles.carouselDotActive
                                            : styles.carouselDotInactive,
                                    ]}
                                />
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Content Body - Scrolls over the static image */}
                <View style={[styles.contentBody, isDark && styles.contentBodyDark]}>
                    {/* Title & Stats */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, isDark && styles.titleDark]}>
                                {listing.title}
                            </Text>
                            {listing.isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <ShieldCheck size={18} color="#10B981" />
                                </View>
                            )}
                        </View>
                        <View style={styles.metaRow}>
                            <View style={styles.ratingBadge}>
                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                <Text style={styles.ratingText}>{listing.rating}</Text>
                            </View>
                            <View style={styles.distanceBadge}>
                                <MapPin size={14} color="#64748B" />
                                <Text style={[styles.distanceText, isDark && styles.distanceTextDark]}>
                                    {listing.distance}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Owner Profile */}
                    <View style={styles.ownerSection}>
                        <View style={styles.ownerLeft}>
                            <Image
                                source={listing.owner.avatarUrl}
                                style={styles.ownerAvatar}
                                contentFit="cover"
                                transition={200}
                            />
                            <View>
                                <Text style={[styles.ownerTitle, isDark && styles.ownerTitleDark]}>
                                    Rented by {listing.owner.name}
                                </Text>
                                <Text style={[styles.ownerMeta, isDark && styles.ownerMetaDark]}>
                                    Response time: {listing.owner.responseTime}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={styles.viewProfileLink}>View Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Description
                        </Text>
                        <Text
                            style={[styles.descriptionText, isDark && styles.descriptionTextDark]}
                            numberOfLines={isExpanded ? undefined : 3}
                        >
                            {listing.description}
                        </Text>
                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={() => setIsExpanded(!isExpanded)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.expandButtonText}>
                                {isExpanded ? 'Read less' : 'Read more'}
                            </Text>
                            {isExpanded ? (
                                <ChevronUp size={16} color="#FF6700" />
                            ) : (
                                <ChevronDown size={16} color="#FF6700" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Specifications Grid */}
                    <SpecsGrid specs={listing.specs} />

                    {/* Divider */}
                    <View style={[styles.sectionDivider, isDark && styles.sectionDividerDark]} />

                    {/* Inline Calendar - Now below specs */}
                    <View
                        style={styles.calendarSection}
                        onLayout={(event) => {
                            setCalendarY(event.nativeEvent.layout.y);
                        }}
                    >
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginBottom: 16, paddingHorizontal: 0 }]}>
                            Select Dates
                        </Text>

                        {/* Date Display Cards */}
                        <View style={styles.dateInputsContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.dateInput,
                                    isDark && styles.dateInputDark,
                                    dateRange.start && styles.dateInputActive,
                                    activeInput === 'start' && styles.dateInputFocused
                                ]}
                                activeOpacity={0.7}
                                onPress={() => scrollToCalendar('start')}
                            >
                                <Text style={[styles.dateLabel, isDark && styles.dateLabelDark]}>Pickup</Text>
                                <View style={styles.dateInputRow}>
                                    <Text style={[styles.dateValueLarge, isDark && styles.dateValueLargeDark]}>
                                        {dateRange.start ? moment(dateRange.start).format('MMM D') : 'Select'}
                                    </Text>
                                    <CalendarIcon size={18} color="#FF6700" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.dateInput,
                                    isDark && styles.dateInputDark,
                                    dateRange.end && styles.dateInputActive,
                                    activeInput === 'end' && styles.dateInputFocused
                                ]}
                                activeOpacity={0.7}
                                onPress={() => scrollToCalendar('end')}
                            >
                                <Text style={[styles.dateLabel, isDark && styles.dateLabelDark]}>Return</Text>
                                <View style={styles.dateInputRow}>
                                    <Text style={[styles.dateValueLarge, isDark && styles.dateValueLargeDark]}>
                                        {dateRange.end ? moment(dateRange.end).format('MMM D') : 'Select'}
                                    </Text>
                                    <CalendarIcon size={18} color="#FF6700" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.calendarWrapper, isDark && styles.calendarWrapperDark]}>
                            <CalendarView
                                inline
                                showRangeToggle={false}
                                showModeSelector={false}
                                enableRangeMode={true}
                                onRangeSelect={setDateRange}
                                theme={isDark ? darkTheme : lightTheme}
                                minDate={moment().format('YYYY-MM-DD')}
                                maxDate={moment().add(90, 'days').format('YYYY-MM-DD')}
                                bookedDates={[
                                    moment().add(7, 'days').format('YYYY-MM-DD'),
                                    moment().add(8, 'days').format('YYYY-MM-DD'),
                                    moment().add(9, 'days').format('YYYY-MM-DD'),
                                ]}
                                blockedDates={[
                                    moment().add(14, 'days').format('YYYY-MM-DD'),
                                    moment().add(15, 'days').format('YYYY-MM-DD'),
                                ]}
                            />
                        </View>
                    </View>


                </View>
            </Animated.ScrollView>

            {/* Sticky Bottom Footer */}
            <StickyFooter
                price={listing.price}
                onRent={() => {
                    const hasDates = dateRange.start && dateRange.end;
                    if (hasDates) {
                        handleRent();
                    } else if (isCalendarInView) {
                        // If visible but no dates, maybe could scroll to top of calendar to center it?
                        // Or just do nothing as per flow intent (user sees it disabled/light)
                        // But light button is clickable? 
                        // "They can either press the button to automatically scroll down... or manually scroll"
                        // If manually scrolled (isInView), "The button will change to Request to Rent (Light)".
                        // If pressed now? Probably should just ensure smooth experience.
                        // Let's scroll to it to be helpful or show alert.
                        const targetY = HERO_HEIGHT - 24 + calendarY - 100;
                        scrollRef.current?.scrollTo({ y: targetY, animated: true });
                    } else {
                        // Not in view, scroll to it
                        const targetY = HERO_HEIGHT - 24 + calendarY - 100;
                        scrollRef.current?.scrollTo({ y: targetY, animated: true });
                    }
                }}
                buttonText={
                    (dateRange.start && dateRange.end)
                        ? "Request to Rent"
                        : (isCalendarInView ? "Request to Rent" : "Scroll to View Dates")
                }
                buttonColor={
                    (dateRange.start && dateRange.end)
                        ? "#FF6700"
                        : "#FFB380"
                }
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    containerDark: {
        backgroundColor: '#0F172A',
    },
    scrollView: {
        flex: 1,
    },

    // Sticky Header
    stickyHeader: {
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
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerBlurDark: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconOverlay: {
        position: 'absolute',
    },
    headerButtonTransparent: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    headerButtonScrolled: {
        backgroundColor: '#F1F5F9',
    },
    headerButtonScrolledDark: {
        backgroundColor: '#1E293B',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A',
    },
    headerTitleDark: {
        color: '#FFFFFF',
    },

    // Hero Image - Fixed at top behind content
    heroContainer: {
        height: HERO_HEIGHT,
        zIndex: 0,
        marginBottom: -24, // Allow content to overlap by 24px
    },
    imageSlide: {
        width: SCREEN_WIDTH,
        height: HERO_HEIGHT,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#CBD5E1',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    carouselIndicators: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    carouselDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    carouselDotActive: {
        backgroundColor: '#FFFFFF',
        transform: [{ scale: 1.1 }],
    },
    carouselDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },

    // Spacer to push content below hero


    // Content Body - Scrolls over the static image
    contentBody: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 120,
        minHeight: Dimensions.get('window').height,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    contentBodyDark: {
        backgroundColor: '#0F172A',
    },

    // Title Section
    titleSection: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 12,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 30,
    },
    titleDark: {
        color: '#FFFFFF',
    },
    verifiedBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 14,
        color: '#64748B',
    },
    distanceTextDark: {
        color: '#94A3B8',
    },

    // Owner Section
    ownerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        backgroundColor: '#CBD5E1',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    ownerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    ownerTitleDark: {
        color: '#FFFFFF',
    },
    ownerMeta: {
        fontSize: 12,
        color: '#64748B',
    },
    ownerMetaDark: {
        color: '#94A3B8',
    },
    viewProfileLink: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FF6700',
    },

    // Description Section
    descriptionSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#FFFFFF',
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#64748B',
    },
    descriptionTextDark: {
        color: '#94A3B8',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    expandButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FF6700',
    },
    calendarSection: {
        marginBottom: 24,
    },
    calendarWrapper: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 380,
    },
    calendarWrapperDark: {
        borderColor: '#334155',
    },
    // Date Input Styles
    dateInputsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
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
    dateInputFocused: {
        borderColor: '#FF6700',
        borderWidth: 2,
        backgroundColor: '#FFF7ED',
        transform: [{ scale: 1.02 }],
        zIndex: 10,
        ...Platform.select({
            ios: {
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 6,
    },
    dateLabelDark: {
        color: '#94A3B8',
    },
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateValueLarge: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    dateValueLargeDark: {
        color: '#FFFFFF',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 24,
    },
    sectionDividerDark: {
        backgroundColor: '#334155',
    },
});
