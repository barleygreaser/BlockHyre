import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '../useColorScheme';

interface StickyFooterProps {
    price: number;
    onRent: () => void;
    buttonText?: string;
    buttonColor?: string;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
    price,
    onRent,
    buttonText = "Request to Rent",
    buttonColor = "#FF6700"
}) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            style={[
                styles.container,
                isDark && styles.containerDark,
                { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, isDark && styles.priceLabelDark]}>
                        DAILY RATE
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceAmount}>${price}</Text>
                        <Text style={[styles.priceSuffix, isDark && styles.priceSuffixDark]}>
                            /day
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: buttonColor }]}
                    onPress={onRent}
                    activeOpacity={0.8}
                >
                    <Calendar size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingHorizontal: 20,
        paddingTop: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    containerDark: {
        backgroundColor: '#0F172A',
        borderTopColor: '#334155',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    priceContainer: {
        flexShrink: 0,
    },
    priceLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    priceLabelDark: {
        color: '#94A3B8',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FF6700',
    },
    priceSuffix: {
        fontSize: 15,
        color: '#64748B',
        marginLeft: 4,
    },
    priceSuffixDark: {
        color: '#94A3B8',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FF6700',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#FF6700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
