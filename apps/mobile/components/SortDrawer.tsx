import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpDown, Check } from 'lucide-react-native';
import { useSheet } from './SheetProvider';

type SortOption = 'price-asc' | 'price-desc' | null;

interface SortDrawerProps {
    sortOption: SortOption;
    setSortOption: (val: SortOption) => void;
}

export type SortDrawerRef = {
    show: () => void;
    hide: () => void;
};

export const SortDrawer = forwardRef<SortDrawerRef, SortDrawerProps>(({ sortOption, setSortOption }, ref) => {
    const { showSheet, hideSheet } = useSheet();

    const handleSort = useCallback((option: SortOption) => {
        setSortOption(option);
        hideSheet();
    }, [setSortOption, hideSheet]);

    const sortOptions = [
        { label: 'Best Match', value: null },
        { label: 'Price: Lowest First', value: 'price-asc' as const },
        { label: 'Price: Highest First', value: 'price-desc' as const },
    ];

    const renderContent = () => (
        <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <ArrowUpDown size={20} color="#0F172A" />
                    <Text style={styles.headerTitle}>Sort Results</Text>
                </View>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {sortOptions.map((opt) => {
                    const isSelected = sortOption === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.label}
                            style={[
                                styles.optionButton,
                                isSelected && styles.optionButtonActive,
                            ]}
                            onPress={() => handleSort(opt.value)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextActive,
                                ]}
                            >
                                {opt.label}
                            </Text>
                            {isSelected && <Check size={20} color="#FF6700" />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={hideSheet}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    useImperativeHandle(ref, () => ({
        show: () => showSheet(renderContent(), ['45%']),
        hide: () => hideSheet(),
    }));

    // This component no longer renders the sheet itself - it uses the context
    return null;
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingTop: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    optionsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    optionButtonActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#334155',
    },
    optionTextActive: {
        color: '#FFFFFF',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
});
