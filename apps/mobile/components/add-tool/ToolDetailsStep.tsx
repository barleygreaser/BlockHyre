import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Check, Info, ChevronDown } from 'lucide-react-native';

const SAFETY_ORANGE = '#FF6700';
const NAVY_BLUE = '#111827';
const SUCCESS_GREEN = '#10B981';

export default function ToolDetailsStep() {
    const [brand, setBrand] = useState('');
    const [toolName, setToolName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Power Tools'); // default/mock
    const [selectedTier, setSelectedTier] = useState(2); // Default Tier 2

    const fullTitle = `${brand} ${toolName}`.trim();
    const earnings = price ? (parseFloat(price) * 0.93).toFixed(2) : '0.00';
    const platformFee = price ? (parseFloat(price) * 0.07).toFixed(2) : '0.00';

    const renderTierCard = (tier: number, coverage: string, label: string) => {
        const isSelected = selectedTier === tier;
        return (
            <TouchableOpacity
                key={tier}
                style={[
                    styles.tierCard,
                    isSelected && styles.tierCardSelected
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedTier(tier)}
            >
                <View style={styles.tierHeader}>
                    <Text style={[styles.tierTitle, isSelected && styles.tierTitleSelected]}>{label}</Text>
                    {isSelected && <Check size={16} color={SAFETY_ORANGE} />}
                </View>
                <Text style={[styles.tierCoverage, isSelected && styles.tierTextSelected]}>{coverage}</Text>
                <Text style={[styles.tierLabel, isSelected && styles.tierTextSelected]}>coverage</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                {/* Brand & Name Inputs */}
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Brand</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. DeWalt"
                            value={brand}
                            onChangeText={setBrand}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Tool Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Drill"
                            value={toolName}
                            onChangeText={setToolName}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Auto-generated Title */}
                <View style={styles.readOnlyContainer}>
                    <Text style={styles.readOnlyLabel}>Full Title</Text>
                    <Text style={styles.readOnlyValue}>
                        {fullTitle || 'Start typing details...'}
                    </Text>
                    <Text style={styles.subLabel}>Auto-generated from Brand + Tool Name.</Text>
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerText}>{category}</Text>
                        <ChevronDown size={20} color="#6B7280" />
                    </View>
                    <Text style={styles.successText}>Auto-selected based on your title.</Text>
                </View>

                {/* Pricing */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Daily Price ($)</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.priceInput]}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                            placeholderTextColor="#9CA3AF"
                        />
                        <View style={styles.calculationCard}>
                            <View style={styles.calcRow}>
                                <Text style={styles.calcLabel}>Platform Fee (7%)</Text>
                                <Text style={styles.calcValue}>-${platformFee}</Text>
                            </View>
                            <View style={styles.calcDivider} />
                            <View style={styles.calcRow}>
                                <Text style={styles.calcTotalLabel}>You'll Earn</Text>
                                <Text style={styles.calcTotalValue}>${earnings}<Text style={styles.perDay}>/day</Text></Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Asset Protection */}
            <View style={styles.protectionSection}>
                <View style={styles.protectionHeader}>
                    <Text style={styles.protectionTitle}>Asset Protection Level</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Tier {selectedTier} Active</Text>
                    </View>
                </View>

                <View style={styles.infoBanner}>
                    <Info size={16} color="#3B82F6" />
                    <Text style={styles.infoBannerText}>High-value tool? Upgrade protection for free!</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiersContainer}>
                    {renderTierCard(1, '$300', 'Tier 1')}
                    {renderTierCard(2, '$1,000', 'Tier 2')}
                    {renderTierCard(3, '$3,000', 'Tier 3')}
                </ScrollView>

                <View style={styles.feeBreakdown}>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Renter Deductible</Text>
                        <Text style={styles.feeValue}>$500</Text>
                    </View>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Peace Fund Fee</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.feeValue}>$0.00</Text>
                            <Info size={14} color="#9CA3AF" />
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ height: 100 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },

    section: {
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    readOnlyContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    readOnlyLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    readOnlyValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    inputGroup: {
        marginBottom: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#111827',
    },
    successText: {
        fontSize: 12,
        color: SUCCESS_GREEN,
        marginTop: 6,
        fontWeight: '500',
    },
    priceInput: {
        flex: 1,
        height: 50,
    },
    calculationCard: {
        flex: 1.5,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    calcLabel: {
        fontSize: 11,
        color: '#6B7280',
    },
    calcValue: {
        fontSize: 11,
        color: '#EF4444',
    },
    calcDivider: {
        height: 1,
        backgroundColor: '#BBF7D0',
        marginVertical: 4,
    },
    calcTotalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#15803D',
    },
    calcTotalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#15803D',
    },
    perDay: {
        fontSize: 11,
        fontWeight: '400',
        color: '#15803D',
    },
    protectionSection: {
        marginTop: 10,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 20,
    },
    protectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    protectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    badge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2563EB',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#EFF6FF',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoBannerText: {
        fontSize: 13,
        color: '#1E40AF',
        flex: 1,
    },
    tiersContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        // Hack to allow overflow visible on scrollview if needed, but horizontal scroll handles it
    },
    tierCard: {
        width: 100,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        alignItems: 'flex-start',
    },
    tierCardSelected: {
        borderColor: SAFETY_ORANGE,
        backgroundColor: '#FFF7ED',
        borderWidth: 2,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    tierTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    tierTitleSelected: {
        color: '#C2410C',
        fontWeight: '700',
    },
    tierCoverage: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    tierLabel: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    tierTextSelected: {
        color: '#C2410C',
    },
    feeBreakdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    feeLabel: {
        fontSize: 13,
        color: '#4B5563',
    },
    feeValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
});
