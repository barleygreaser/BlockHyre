import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MailQuestion } from 'lucide-react-native';

interface IncomingRequestsWidgetProps {
    requestCount: number;
}

export default function IncomingRequestsWidget({ requestCount }: IncomingRequestsWidgetProps) {
    if (requestCount === 0) return null;

    // Dummy countdown starting from 23 hours
    const [timeLeft, setTimeLeft] = useState(23 * 60 * 60 + 45 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
                <MailQuestion size={24} color="#4F46E5" />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Rental Requests</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{requestCount}</Text>
                    </View>
                </View>
                <Text style={styles.subtitle}>
                    Action needed in <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        paddingRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        // Consistent shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20, // More margin since it sits above the grid
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    countdown: {
        color: '#DC2626', // Red for urgency
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    badge: {
        backgroundColor: '#4F46E5', // Indigo to match icon
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    }
});
