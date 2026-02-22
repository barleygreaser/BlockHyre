import React, { useState, useRef, useMemo } from 'react';
import { Image } from 'expo-image';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Search, SlidersHorizontal, Star, MapPin } from 'lucide-react-native';
import { SortDrawer, SortDrawerRef } from '@/components/SortDrawer';
import { supabase } from '@/lib/supabase';
import { ExploreCardSkeletonGrid } from '@/components/ExploreCardSkeleton';
import { MOCK_TOOLS, Tool } from '@/constants/MockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Power Tools',
  'Gardening',
  'Ladders',
  'Heavy Machinery',
  'Hand Tools',
];

type SortOption = 'price-asc' | 'price-desc' | null;

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const sortDrawerRef = useRef<SortDrawerRef>(null);
  const [sortOption, setSortOption] = useState<SortOption>(null);

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTools = async () => {
    try {
      if (!refreshing) setLoading(true);

      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, 
          title, 
          daily_price, 
          images, 
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedTools: Tool[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          pricePerDay: item.daily_price,
          image: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/600x400',
          category: item.category?.name || 'Uncategorized',
          distance: '2.3 mi away', // Placeholder until Geo location implemented
          rating: 5.0, // Placeholder
        }));
        setTools(formattedTools);
      } else {
        // Fallback to MOCK_TOOLS if DB is empty (Development convenience)
        setTools(MOCK_TOOLS);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      // Fallback on error
      setTools(MOCK_TOOLS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchTools();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTools();
  };

  // Scroll animation
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

  // Sticky Header Title Opacity
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [35, 55],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Large Title Opacity & Transform
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
      transform: [{ translateY }],
    };
  });

  // --- Filtering & Sorting ---
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' ? true : tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortOption === 'price-desc') return b.pricePerDay - a.pricePerDay;
      return 0;
    });
  }, [tools, searchQuery, activeCategory, sortOption]);

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/listings/[id]',
      params: { id }
    });
  };

  // --- Render Components ---
  const renderCategoryItem = (item: string) => {
    const isSelected = activeCategory === item;
    return (
      <TouchableOpacity
        key={item}
        onPress={() => setActiveCategory(item)}
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipActive
        ]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextActive
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderToolCard = (item: Tool) => (
    <TouchableOpacity
      key={item.id}
      style={styles.cardContainer}
      onPress={() => handleCardPress(item.id)}
      activeOpacity={0.95}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.cardImage}
          contentFit="cover"
          transition={1000}
        />
        {/* Rating Badge */}
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Star size={12} color="#FACC15" fill="#FACC15" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color="#9CA3AF" />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.cardPrice}>${item.pricePerDay}</Text>
          <Text style={styles.cardPriceSuffix}>/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Create rows of 2 cards each for the grid layout
  const toolRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredTools.length; i += 2) {
      rows.push(filteredTools.slice(i, i + 2));
    }
    return rows;
  }, [filteredTools]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_HEIGHT + 20,
          paddingBottom: 100,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6700"
            progressViewOffset={insets.top + HEADER_HEIGHT + 20}
          />
        }
      >
        {/* Large Header Title */}
        <Animated.View style={[styles.largeHeaderContainer, largeTitleStyle]}>
          <Text style={styles.largeHeaderTitle}>Explore</Text>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search for tools (e.g. Drill, Saw)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
          style={styles.categoryScrollView}
        >
          {CATEGORIES.map(renderCategoryItem)}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Tools</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Tool Cards Grid */}
        <View style={styles.gridContainer}>
          {loading && !refreshing ? (
            <ExploreCardSkeletonGrid />
          ) : (
            toolRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map(renderToolCard)}
                {/* If odd number of items, add empty spacer */}
                {row.length === 1 && <View style={styles.cardSpacer} />}
              </View>
            ))
          )}
        </View>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tools found.</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters.</Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Sticky Header (Absolute) */}
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
            Explore
          </Animated.Text>
          <View style={styles.headerBorder} />
        </View>
      </Animated.View>

      {/* Filter Button - Always Visible */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          { top: insets.top + (HEADER_HEIGHT - 40) / 2 }
        ]}
        activeOpacity={0.7}
        onPress={() => {
          console.log('Filter button pressed!');
          sortDrawerRef.current?.show();
        }}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <SlidersHorizontal size={24} color="#111827" />
      </TouchableOpacity>

      {/* Sort Drawer */}
      <SortDrawer
        ref={sortDrawerRef}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
    </View>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // padding 24*2, gap 16

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
    marginBottom: 12,
  },
  largeHeaderTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  // --- Sticky Header ---
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

  // --- Filter Button ---
  filterButton: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },

  // --- Categories ---
  categoryScrollView: {
    marginBottom: 24,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#FF6700',
    borderColor: '#FF6700',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // --- Section Header ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6700',
  },

  // --- Grid ---
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardSpacer: {
    width: CARD_WIDTH,
  },

  // --- Tool Card ---
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
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 'auto',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6700',
  },
  cardPriceSuffix: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
