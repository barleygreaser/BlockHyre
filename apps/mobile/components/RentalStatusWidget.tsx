import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react-native';

interface RentalStatusWidgetProps {
    overdueCount: number;
    dueTodayCount: number;
}

export default function RentalStatusWidget({ overdueCount, dueTodayCount }: RentalStatusWidgetProps) {
    if (overdueCount === 0 && dueTodayCount === 0) return null;

    return (
        <View style={styles.container}>
            {/* Overdue Section - High Priority */}
            {overdueCount > 0 && (
                <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                    <View style={[styles.iconContainer, styles.overdueIconBg]}>
                        <AlertCircle size={22} color="#EF4444" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, styles.overdueTitle]}>Overdue</Text>
                        <Text style={styles.subtitle}>
                            {overdueCount} {overdueCount === 1 ? 'item' : 'items'} overdue
                        </Text>
                    </View>
                    <View style={[styles.actionBadge, styles.overdueBadge]}>
                        <Text style={[styles.actionText, styles.overdueText]}>Action Required</Text>
                    </View>
                </TouchableOpacity>
            )}

            {overdueCount > 0 && dueTodayCount > 0 && (
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                </View>
            )}

            {/* Due Today Section - Medium Priority */}
            {dueTodayCount > 0 && (
                <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                    <View style={[styles.iconContainer, styles.dueTodayIconBg]}>
                        <Clock size={22} color="#F59E0B" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, styles.dueTodayTitle]}>Due Today</Text>
                        <Text style={styles.subtitle}>
                            {dueTodayCount} {dueTodayCount === 1 ? 'item' : 'items'} due by 6:00 PM
                        </Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        paddingVertical: 4,
        // Shadow matching other cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    // Overdue Styles
    overdueIconBg: {
        backgroundColor: '#FEE2E2', // Red-100
    },
    overdueTitle: {
        color: '#DC2626', // Red-600
    },
    overdueBadge: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    overdueText: {
        color: '#DC2626',
    },
    // Due Today Styles
    dueTodayIconBg: {
        backgroundColor: '#FEF3C7', // Amber-100
    },
    dueTodayTitle: {
        color: '#D97706', // Amber-600
    },
    // Components
    dividerContainer: {
        paddingLeft: 68, // Align with text start (16 padding + 40 icon + 12 margin)
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    actionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
