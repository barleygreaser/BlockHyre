import React, { useState, useCallback, useEffect, useLayoutEffect, Suspense, lazy } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

// Lazy load GiftedChat to avoid gesture handler conflicts on initial bundle
const GiftedChatComponent = lazy(() => import('react-native-gifted-chat').then(mod => ({ default: mod.GiftedChat })));

// Import supabase
let supabase: any;
try {
    supabase = require('../../lib/supabase').supabase;
} catch (e) {
    console.warn('Supabase not available');
}

interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: {
        _id: string | number;
        name?: string;
        avatar?: string;
    };
}

function GiftedChatWrapper({ messages, onSend, user }: any) {
    const { GiftedChat } = require('react-native-gifted-chat');
    return (
        <GiftedChat
            messages={messages}
            onSend={onSend}
            user={user}
        />
    );
}

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const conversationId = Array.isArray(id) ? id[0] : id;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        // Get current user
        const fetchUser = async () => {
            if (!supabase) {
                setIsLoading(false);
                return;
            }
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);
            } catch (e) {
                console.error('Error fetching user:', e);
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Chat',
            headerBackTitleVisible: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (!conversationId || !supabase) return;

        // Load initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            setMessages(
                data.map((msg: any) => ({
                    _id: msg.id,
                    text: msg.content,
                    createdAt: new Date(msg.created_at),
                    user: {
                        _id: msg.sender_id,
                        name: 'User',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                }))
            );
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload: any) => {
                    const newMessage = payload.new;
                    const { GiftedChat } = require('react-native-gifted-chat');
                    setMessages((previousMessages) =>
                        GiftedChat.append(previousMessages, [
                            {
                                _id: newMessage.id,
                                text: newMessage.content,
                                createdAt: new Date(newMessage.created_at),
                                user: {
                                    _id: newMessage.sender_id,
                                    name: 'User',
                                    avatar: 'https://placeimg.com/140/140/any',
                                },
                            },
                        ])
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const { GiftedChat } = require('react-native-gifted-chat');
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
        );

        if (!currentUser || !supabase) {
            console.warn("Demo Mode: Message not sent to DB");
            return;
        }

        const { text, createdAt } = newMessages[0];

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUser.id,
            content: text,
            created_at: createdAt,
        });

        if (error) {
            console.error('Error sending message:', error);
        }
    }, [currentUser, conversationId]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6700" />
            </View>
        );
    }

    const demoMessages: IMessage[] = messages.length > 0 ? messages : [
        {
            _id: 1,
            text: 'This is a demo message (Supabase Auth missing)',
            createdAt: new Date(),
            user: {
                _id: 2,
                name: 'System',
                avatar: 'https://placeimg.com/140/140/any',
            },
        }
    ];

    const userId = currentUser?.id || 'demo-user-id';

    return (
        <View style={styles.container}>
            <GiftedChatWrapper
                messages={currentUser ? messages : demoMessages}
                onSend={(msgs: IMessage[]) => onSend(msgs)}
                user={{ _id: userId }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
