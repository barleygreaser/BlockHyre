import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = (SCREEN_WIDTH - 80) / 7;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DateRange {
    start: Date | null;
    end: Date | null;
}

// Export types for external use
export interface RentalCalendarProps {
    pickupDate: Date;
    returnDate: Date;
    onDateSelect: (date: Date, isPickup: boolean) => void;
    activeField: 'pickup' | 'return';
    /** Minimum selectable date (defaults to today) */
    minDate?: Date;
    /** Maximum selectable date */
    maxDate?: Date;
    /** Array of blocked/unavailable date strings in YYYY-MM-DD format */
    disabledDates?: string[];
    /** Callback when a blocked date is pressed (e.g., to show why it's blocked) */
    onBlockedDatePress?: (date: Date) => void;
    theme?: 'light' | 'dark';
}

const CalendarDay = memo<{
    day: Date | null;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPickup: boolean;
    isReturn: boolean;
    isInRange: boolean;
    isSameDayRental: boolean;
    isBlocked: boolean; // Owner-blocked date
    onPress: (date: Date) => void;
    onBlockedPress?: (date: Date) => void;
    isDark: boolean;
    disabled: boolean;
}>(({ day, isCurrentMonth, isToday, isPickup, isReturn, isInRange, isSameDayRental, isBlocked, onPress, onBlockedPress, isDark, disabled }) => {
    if (!day) {
        return <View style={styles.dayCell} />;
    }

    const handlePress = useCallback(() => {
        if (!day) return;

        if (isBlocked && onBlockedPress) {
            // Allow pressing blocked dates to show info
            onBlockedPress(day);
            return;
        }

        if (!disabled && isCurrentMonth && !isBlocked) {
            onPress(day);
        }
    }, [disabled, isCurrentMonth, isBlocked, onPress, onBlockedPress, day]);

    const isEdge = isPickup || isReturn;
    // For same-day rental, don't show range backgrounds (just the selected circle)
    const showPickupRangeBackground = isPickup && !isSameDayRental;
    const showReturnRangeBackground = isReturn && !isSameDayRental;

    return (
        <View style={styles.dayCellContainer}>
            {/* Range background */}
            {isInRange && !isEdge && (
                <View style={[styles.rangeBackground, isDark && styles.rangeBackgroundDark]} />
            )}
            {showPickupRangeBackground && (
                <View style={[styles.rangeBackgroundRight, isDark && styles.rangeBackgroundRightDark]} />
            )}
            {showReturnRangeBackground && (
                <View style={[styles.rangeBackgroundLeft, isDark && styles.rangeBackgroundLeftDark]} />
            )}

            <Pressable
                style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.dayCellDisabled,
                    isToday && !isEdge && !isBlocked && (isDark ? styles.dayCellTodayDark : styles.dayCellToday),
                    isEdge && !isBlocked && styles.dayCellSelected,
                    isBlocked && styles.dayCellBlocked,
                    isBlocked && isDark && styles.dayCellBlockedDark,
                    disabled && !isBlocked && styles.dayCellDisabled,
                ]}
                onPress={handlePress}
                disabled={!isCurrentMonth}
            >
                <Text
                    style={[
                        styles.dayText,
                        isDark && styles.dayTextDark,
                        !isCurrentMonth && styles.dayTextDisabled,
                        isToday && !isEdge && !isBlocked && styles.dayTextToday,
                        isEdge && !isBlocked && styles.dayTextSelected,
                        isInRange && !isEdge && !isBlocked && styles.dayTextInRange,
                        isBlocked && styles.dayTextBlocked,
                        disabled && !isBlocked && styles.dayTextDisabled,
                    ]}
                >
                    {day.getDate()}
                </Text>
                {isBlocked && (
                    <View style={styles.blockedIndicator} />
                )}
            </Pressable>
        </View>
    );
});

export const RentalCalendar: React.FC<RentalCalendarProps> = ({
    pickupDate,
    returnDate,
    onDateSelect,
    activeField,
    minDate = new Date(),
    maxDate,
    disabledDates = [],
    onBlockedDatePress,
    theme = 'light',
}) => {
    const isDark = theme === 'dark';
    const [viewDate, setViewDate] = useState(new Date(pickupDate));

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days: (Date | null)[] = [];
        // Leading empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Days of the month
        for (let i = 1; i <= lastDate; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [viewDate]);

    const handlePrevMonth = useCallback(() => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    }, [viewDate]);

    const handleNextMonth = useCallback(() => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    }, [viewDate]);

    const handleDayPress = useCallback((date: Date) => {
        onDateSelect(date, activeField === 'pickup');
    }, [onDateSelect, activeField]);

    const isSameDay = (d1: Date, d2: Date): boolean => {
        return d1.toDateString() === d2.toDateString();
    };

    const isInRange = (d: Date): boolean => {
        const start = new Date(pickupDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(returnDate);
        end.setHours(0, 0, 0, 0);
        const current = new Date(d);
        current.setHours(0, 0, 0, 0);
        return current > start && current < end;
    };

    const isBeforeMinDate = (d: Date): boolean => {
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        const current = new Date(d);
        current.setHours(0, 0, 0, 0);
        return current < min;
    };

    const isAfterMaxDate = (d: Date): boolean => {
        if (!maxDate) return false;
        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);
        const current = new Date(d);
        current.setHours(0, 0, 0, 0);
        return current > max;
    };

    // Check if date is blocked by owner (uses YYYY-MM-DD format like Glow Calendar)
    const isDateBlocked = useCallback((d: Date): boolean => {
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD format
        return disabledDates.includes(dateStr);
    }, [disabledDates]);

    const canGoPrev = useMemo(() => {
        const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0);
        return prevMonth >= minDate;
    }, [viewDate, minDate]);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {/* Month Navigation */}
            <View style={styles.header}>
                <Pressable
                    style={[
                        styles.navButton,
                        isDark && styles.navButtonDark,
                        !canGoPrev && styles.navButtonDisabled,
                    ]}
                    onPress={handlePrevMonth}
                    disabled={!canGoPrev}
                >
                    <ChevronLeft size={20} color={canGoPrev ? (isDark ? '#FFFFFF' : '#0F172A') : '#94A3B8'} />
                </Pressable>

                <View style={[styles.monthYearButton, isDark && styles.monthYearButtonDark]}>
                    <Text style={[styles.monthYearText, isDark && styles.monthYearTextDark]}>
                        {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </Text>
                </View>

                <Pressable
                    style={[styles.navButton, isDark && styles.navButtonDark]}
                    onPress={handleNextMonth}
                >
                    <ChevronRight size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
                </Pressable>
            </View>

            {/* Days Header */}
            <View style={styles.daysHeader}>
                {DAYS_SHORT.map((day, idx) => (
                    <Text
                        key={idx}
                        style={[styles.dayHeaderText, isDark && styles.dayHeaderTextDark]}
                    >
                        {day}
                    </Text>
                ))}
            </View>

            {/* Dates Grid */}
            <View style={styles.datesGrid}>
                {daysInMonth.map((day, idx) => {
                    const isCurrentMonth = true;
                    const isToday = day ? isSameDay(day, new Date()) : false;
                    const isPickupDay = day ? isSameDay(day, pickupDate) : false;
                    const isReturnDay = day ? isSameDay(day, returnDate) : false;
                    const inRange = day ? isInRange(day) : false;
                    const disabled = day ? (isBeforeMinDate(day) || isAfterMaxDate(day)) : true;
                    const isSameDayRental = isSameDay(pickupDate, returnDate);
                    const blocked = day ? isDateBlocked(day) : false;

                    return (
                        <CalendarDay
                            key={day ? day.toISOString() : `empty-${idx}`}
                            day={day}
                            isCurrentMonth={isCurrentMonth}
                            isToday={isToday}
                            isPickup={isPickupDay}
                            isReturn={isReturnDay}
                            isInRange={inRange}
                            isSameDayRental={isSameDayRental}
                            isBlocked={blocked}
                            onPress={handleDayPress}
                            onBlockedPress={onBlockedDatePress}
                            isDark={isDark}
                            disabled={disabled}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
    },
    containerDark: {
        backgroundColor: '#1E293B',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    navButtonDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    navButtonDisabled: {
        opacity: 0.4,
    },
    monthYearButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    monthYearButtonDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    monthYearTextDark: {
        color: '#FFFFFF',
    },

    // Days Header
    daysHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dayHeaderText: {
        width: DAY_SIZE,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    dayHeaderTextDark: {
        color: '#64748B',
    },

    // Dates Grid
    datesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCellContainer: {
        width: DAY_SIZE,
        height: 44,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCell: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    dayCellDisabled: {
        opacity: 0.3,
    },
    dayCellToday: {
        borderWidth: 2,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    dayCellTodayDark: {
        borderWidth: 2,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    dayCellSelected: {
        backgroundColor: '#FF6700',
        shadowColor: '#FF6700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    // Range backgrounds
    rangeBackground: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 103, 0, 0.12)',
    },
    rangeBackgroundDark: {
        backgroundColor: 'rgba(255, 103, 0, 0.2)',
    },
    rangeBackgroundRight: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        right: 0,
        width: DAY_SIZE / 2,
        backgroundColor: 'rgba(255, 103, 0, 0.12)',
    },
    rangeBackgroundRightDark: {
        backgroundColor: 'rgba(255, 103, 0, 0.2)',
    },
    rangeBackgroundLeft: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 0,
        width: DAY_SIZE / 2,
        backgroundColor: 'rgba(255, 103, 0, 0.12)',
    },
    rangeBackgroundLeftDark: {
        backgroundColor: 'rgba(255, 103, 0, 0.2)',
    },

    // Day text
    dayText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
    },
    dayTextDark: {
        color: '#FFFFFF',
    },
    dayTextDisabled: {
        color: '#CBD5E1',
    },
    dayTextToday: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dayTextInRange: {
        color: '#FF6700',
        fontWeight: '600',
    },

    // Blocked date styles (owner-blocked dates)
    dayCellBlocked: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)', // Light red background
    },
    dayCellBlockedDark: {
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
    },
    dayTextBlocked: {
        color: '#EF4444', // Red text
        textDecorationLine: 'line-through',
    },
    blockedIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#EF4444',
    },
});
