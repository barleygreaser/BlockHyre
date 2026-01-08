import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Tag } from 'lucide-react-native';

interface ToolStatsProps {
    totalBookings: number;
    toolsListed: number;
}

export default function ListingStatsBoxes({ totalBookings, toolsListed }: ToolStatsProps) {
    return (
        <View style={styles.container}>
            {/* Tool Bookings Box */}
            <View style={styles.box}>
                <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Calendar size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statNumber}>{totalBookings}</Text>
                <Text style={styles.statLabel}>Tool Bookings</Text>
            </View>

            {/* Tools Listed Box */}
            <View style={styles.box}>
                <View style={[styles.iconContainer, { backgroundColor: '#F0F9FF' }]}>
                    <Tag size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.statNumber}>{toolsListed}</Text>
                <Text style={styles.statLabel}>Tools Listed</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    box: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow matching ProfileFlipCard
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
