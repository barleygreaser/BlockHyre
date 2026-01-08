import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface UpcomingBookingsWidgetProps {
    count: number;
}

export default function UpcomingBookingsWidget({ count }: UpcomingBookingsWidgetProps) {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Calendar size={24} color="#3B82F6" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Upcoming Bookings</Text>
                <Text style={styles.subtitle}>
                    {count === 0 ? 'No upcoming bookings' : `${count} confirmed`}
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
        // Shadow matching Active Rentals & others
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
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
});
