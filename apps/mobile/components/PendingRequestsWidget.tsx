import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Hourglass } from 'lucide-react-native';

export default function PendingRequestsWidget() {
    // Dummy countdown starting from 23h 59m 59s
    const [timeLeft, setTimeLeft] = useState(23 * 60 * 60 + 59 * 60 + 59);

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
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Hourglass size={24} color="#D97706" />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Pending Requests</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>1</Text>
                    </View>
                </View>
                <Text style={styles.subtitle}>
                    Expires in <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        // Consistent shadow style
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
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
        color: '#D97706',
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    badge: {
        backgroundColor: '#EF4444',
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
