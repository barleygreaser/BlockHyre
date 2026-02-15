import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image,
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { MapPin, Star, Heart } from 'lucide-react-native';
import { FavoritesSkeletonGrid } from '../components/FavoritesSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // (Screen - 24*2 padding - 16 gap) / 2

interface FavoriteItem {
    id: string; // favorite_id
    listing: {
        id: string;
        title: string;
        daily_price: number;
        images: string[];
        category_id?: string;
        distance?: string;
        rating?: number;
    };
}

export default function FavoritesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        try {
            if (!refreshing) setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    id,
                    listing:listings (
                        id,
                        title,
                        daily_price,
                        images
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching favorites:', error);
                Alert.alert('Error', 'Could not load favorites');
            } else if (data) {
                // Filter out any null listings (e.g. if listing was deleted but favorite remains)
                const safeData = data.filter(item => item.listing !== null);
                setFavorites(safeData as any);
            }
        } catch (e) {
            console.error('Fetch exception:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (favoriteId: string, listingId: string) => {
        // Optimistic update
        const previousFavorites = [...favorites];
        setFavorites(prev => prev.filter(item => item.id !== favoriteId));

        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', favoriteId);

            if (error) throw error;
        } catch (e) {
            console.error('Error removing favorite:', e);
            Alert.alert('Error', 'Failed to remove favorite');
            setFavorites(previousFavorites); // Revert
        }
    };

    const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
        const listing = item.listing;
        const imageUrl = listing.images && listing.images.length > 0
            ? listing.images[0]
            : 'https://placehold.co/600x400';

        return (
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => router.push({ pathname: '/listings/[id]', params: { id: listing.id } })}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                    <TouchableOpacity
                        style={styles.heartButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(item.id, listing.id);
                        }}
                    >
                        <Heart size={20} color="#FF6700" fill="#FF6700" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>

                    <View style={styles.locationRow}>
                        <MapPin size={12} color="#9CA3AF" />
                        <Text style={styles.distanceText}>2.3 mi away</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.cardPrice}>${listing.daily_price}</Text>
                        <Text style={styles.cardPriceSuffix}>/day</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Heart size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>Items you heart will appear here.</Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)')}
            >
                <Text style={styles.exploreButtonText}>Explore Tools</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: 'My Favorites',
                headerLargeTitle: true,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F9F9F9' },
            }} />

            {loading && !refreshing ? (
                <View style={{ paddingTop: 16 }}>
                    <FavoritesSkeletonGrid />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={[
                        styles.listContent,
                        favorites.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#FF6700"
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    listContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
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
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        marginBottom: 12,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: '#FF6700',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 100,
    },
    exploreButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
