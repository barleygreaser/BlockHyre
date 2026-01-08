import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../useColorScheme';

export interface Specification {
    label: string;
    value: string;
}

interface SpecsGridProps {
    specs: Specification[];
}

export const SpecsGrid: React.FC<SpecsGridProps> = ({ specs }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Specifications</Text>
            <View style={styles.grid}>
                {specs.map((spec, index) => (
                    <View
                        key={index}
                        style={[
                            styles.specItem,
                            isDark && styles.specItemDark,
                        ]}
                    >
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            {spec.label}
                        </Text>
                        <Text style={[styles.value, isDark && styles.valueDark]}>
                            {spec.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 16,
    },
    titleDark: {
        color: '#FFFFFF',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    specItem: {
        width: '47%',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    specItemDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    label: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    labelDark: {
        color: '#94A3B8',
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
    },
    valueDark: {
        color: '#FFFFFF',
    },
});
