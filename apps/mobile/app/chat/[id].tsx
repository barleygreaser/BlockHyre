import React, { useState, useCallback, useEffect, useLayoutEffect, Suspense, lazy } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useMessages, Message as DBMessage, Chat } from '../../hooks/use-messages';
import { supabase } from '../../lib/supabase';

// Lazy load GiftedChat to avoid gesture handler conflicts on initial bundle
const GiftedChatComponent = lazy(() => import('react-native-gifted-chat').then(mod => ({ default: mod.GiftedChat })));

interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: {
        _id: string | number;
        name?: string;
        avatar?: string;
    };
    system?: boolean;
}

// Convert DB message to GiftedChat layout
const convertMessage = (msg: DBMessage): IMessage => {
    return {
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.created_at),
        system: msg.message_type === 'system',
        user: {
            _id: msg.sender_id,
            name: msg.sender?.full_name || 'User',
            avatar: msg.sender?.profile_photo_url || 'https://via.placeholder.com/150',
        }
    };
};

function GiftedChatWrapper({ messages, onSend, user }: any) {
    const { GiftedChat, Bubble, SystemMessage } = require('react-native-gifted-chat');

    // Custom bubble to brand with BlockHyre colors
    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#FF6700', // BlockHyre Orange
                    },
                    left: {
                        backgroundColor: '#F3F4F6',
                    }
                }}
                textStyle={{
                    right: {
                        color: '#fff',
                    },
                    left: {
                        color: '#111827',
                    }
                }}
            />
        );
    };

    const renderSystemMessage = (props: any) => {
        return (
            <SystemMessage
                {...props}
                textStyle={{
                    color: '#6B7280',
                    fontSize: 13,
                    fontWeight: '500',
                    textAlign: 'center',
                    paddingHorizontal: 20,
                    marginVertical: 10,
                }}
            />
        );
    }

    return (
        <GiftedChat
            messages={messages}
            onSend={onSend}
            user={user}
            renderBubble={renderBubble}
            renderSystemMessage={renderSystemMessage}
            alwaysShowSend
            bottomOffset={0} // adjusts for safe area inside gifted chat
        />
    );
}

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const chatId = Array.isArray(id) ? id[0] : id;

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const { fetchMessages, sendMessage, markMessagesAsRead, subscribeToChat } = useMessages();

    useEffect(() => {
        // Get current user quickly for GiftedChat prop
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Loading Chat...', // Updated below
            headerBackTitleVisible: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (!chatId || !currentUser) return;

        const loadData = async () => {
            setIsLoading(true);

            // Mark as read immediately when opening
            markMessagesAsRead(chatId);

            const dbMessages = await fetchMessages(chatId);

            // GiftedChat standard is descending (newest first)
            const giftedMessages = dbMessages
                .map(convertMessage)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            setMessages(giftedMessages);
            setIsLoading(false);
        };

        loadData();

        // Subscribe to real-time additions
        const unsubscribe = subscribeToChat(chatId, (newDbMessage) => {
            const { GiftedChat } = require('react-native-gifted-chat');
            const newMessage = convertMessage(newDbMessage);

            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [newMessage])
            );

            // If the message wasn't from us, mark it read since we're currently in the chat
            if (newDbMessage.sender_id !== currentUser?.id) {
                markMessagesAsRead(chatId);
            }
        });

        // Set title context (Optional: if we had the other user's name passed in params. For now static)
        navigation.setOptions({ title: 'Chat' });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [chatId, currentUser, fetchMessages, markMessagesAsRead, subscribeToChat, navigation]);

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const { GiftedChat } = require('react-native-gifted-chat');

        // Optimistically append to UI
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
        );

        if (!currentUser) return;

        const { text } = newMessages[0];

        // Send to DB
        await sendMessage(chatId, text);

    }, [currentUser, chatId, sendMessage]);

    if (isLoading && !currentUser) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6700" />
            </View>
        );
    }

    const userId = currentUser?.id || 'demo-user-id';

    return (
        <View style={styles.container}>
            <Suspense fallback={
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6700" />
                </View>
            }>
                <GiftedChatWrapper
                    messages={messages}
                    onSend={(msgs: IMessage[]) => onSend(msgs)}
                    user={{ _id: userId }}
                />
            </Suspense>
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
