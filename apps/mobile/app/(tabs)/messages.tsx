import React, { useEffect, useState } from 'react';
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
const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
};

type Conversation = {
    id: string;
    last_message: string;
    updated_at: string;
};

export default function MessagesScreen() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setConversations([
                { id: '1', last_message: 'Hey, is the drill available?', updated_at: new Date().toISOString() },
                { id: '2', last_message: 'Thanks for the rental!', updated_at: new Date(Date.now() - 86400000).toISOString() },
            ]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('conversations')
            .select('id, last_message, updated_at')
            .order('updated_at', { ascending: false });

        if (error || !data || data.length === 0) {
            setConversations([
                { id: '1', last_message: 'Hey, is the drill available? (Demo)', updated_at: new Date().toISOString() },
                { id: '2', last_message: 'Thanks for the rental! (Demo)', updated_at: new Date(Date.now() - 86400000).toISOString() },
            ]);
        } else {
            setConversations(data);
        }

        setLoading(false);
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
            </View>
            <View style={styles.textContainer}>
                <View style={styles.header}>
                    <Text style={styles.name}>User {item.id}</Text>
                    <Text style={styles.time}>{formatTime(item.updated_at)}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>
            </View>
        </TouchableOpacity>
    );

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
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#555',
    },
    textContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        paddingHorizontal: 20,
    },
});
