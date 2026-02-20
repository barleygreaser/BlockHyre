import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Settings } from 'lucide-react-native';

// Simple custom relative time formatter
import { useMessages, Chat } from '../../hooks/use-messages';
import { formatDistanceToNowStrict } from 'date-fns';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';

const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
};

export default function MessagesScreen() {
    const { fetchConversations, loading, error } = useMessages();
    const [conversations, setConversations] = useState<Chat[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const router = useRouter();
    const insets = useSafeAreaInsets();

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
        return {
            opacity,
        };
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

    const loadConversations = useCallback(async () => {
        try {
            await fetchConversations();
        } catch (e) {
            console.error(e);
        }
    }, [fetchConversations]);

    // Fetch on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [loadConversations])
    );

    const renderItem = ({ item }: { item: Chat }) => {
        const hasUnread = (item.unread_count || 0) > 0;

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => router.push(`/chat/${item.id}`)}
                activeOpacity={0.7}
            >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {item.other_user_photo ? (
                        <Image
                            source={item.other_user_photo}
                            style={styles.avatarImage}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>
                                {item.other_user_name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.userName, hasUnread && styles.userNameUnread]} numberOfLines={1}>
                            {item.other_user_name}
                        </Text>
                        <Text style={[styles.timeText, hasUnread && styles.timeTextUnread]}>
                            {formatTime(item.last_message_time || item.updated_at)}
                        </Text>
                    </View>

                    {/* Listing Context (optional but good for context) */}
                    {item.listing_title && (
                        <Text style={styles.listingContext} numberOfLines={1}>
                            Re: {item.listing_title}
                        </Text>
                    )}

                    <View style={styles.messageRow}>
                        <Text
                            style={[
                                styles.lastMessage,
                                hasUnread && styles.lastMessageUnread,
                                item.listing_title ? { marginTop: 2 } : {} // spacing if listing title exists
                            ]}
                            numberOfLines={1}
                        >
                            {item.last_message_content || 'Started a conversation'}
                        </Text>

                        {/* Unread Badge */}
                        {hasUnread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>
                                    {item.unread_count && item.unread_count > 99 ? '99+' : item.unread_count}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Scrollable Content */}
            <Animated.FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    paddingTop: insets.top + HEADER_HEIGHT + 20,
                    paddingBottom: 40,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Animated.View style={[styles.largeHeaderContainer, largeTitleStyle]}>
                        <Text style={styles.largeHeaderTitle}>Inbox</Text>
                    </Animated.View>
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No messages yet</Text>}
            />

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
                        Inbox
                    </Animated.Text>
                    <View style={styles.headerBorder} />
                </View>
            </Animated.View>

            {/* Settings Button - Always Visible */}
            <TouchableOpacity
                style={[
                    styles.settingsButton,
                    { top: insets.top + (HEADER_HEIGHT - 40) / 2 }
                ]}
                activeOpacity={0.7}
            >
                <Settings size={24} color="#111827" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
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
    settingsButton: {
        position: 'absolute',
        right: 20,
        zIndex: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    avatarContainer: {
        marginRight: 16,
        justifyContent: 'center',
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6', // optional placeholder color
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#6B7280',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 17,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    userNameUnread: {
        fontWeight: '700',
    },
    timeText: {
        fontSize: 13,
        color: '#6B7280',
    },
    timeTextUnread: {
        color: '#FF6700',
        fontWeight: '600',
    },
    listingContext: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 15,
        color: '#6B7280',
        flex: 1,
        marginRight: 12,
        lineHeight: 20,
    },
    lastMessageUnread: {
        color: '#111827',
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: '#FF6700',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    unreadBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        paddingHorizontal: 20,
    },
});
