import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Switch,
    TouchableOpacity
} from 'react-native';
import { Camera, Info, MapPin, Clock, Upload } from 'lucide-react-native';

const SAFETY_ORANGE = '#FF6700';
const NAVY_BLUE = '#111827';

export default function ToolImagesStep() {
    const [description, setDescription] = useState('');
    const [acceptBarter, setAcceptBarter] = useState(false);
    const [instantBook, setInstantBook] = useState(true);
    const [minRentalPeriod, setMinRentalPeriod] = useState('1');
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupWindow, setPickupWindow] = useState('');
    const [photoCount, setPhotoCount] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your tool, its condition, and any specific usage instructions..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Toggles */}
                <View style={[styles.section, styles.togglesContainer]}>
                    <View style={styles.toggleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.toggleLabel}>Accept Barter?</Text>
                            <Text style={styles.toggleSubLabel}>Open to trading/services instead of cash.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E5E7EB', true: SAFETY_ORANGE }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={setAcceptBarter}
                            value={acceptBarter}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.toggleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.toggleLabel}>Instant Book</Text>
                            <Text style={styles.toggleSubLabel}>Allow renters to book without manual approval.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E5E7EB', true: SAFETY_ORANGE }}
                            thumbColor={'#FFFFFF'}
                            onValueChange={setInstantBook}
                            value={instantBook}
                        />
                    </View>
                </View>

                {/* Logistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Logistics</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Minimum Rental Period (Days)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1"
                            keyboardType="numeric"
                            value={minRentalPeriod}
                            onChangeText={setMinRentalPeriod}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Exact Pickup Address</Text>
                        <View style={styles.iconInputContainer}>
                            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.iconInput}
                                placeholder="Street address, City, Zip"
                                value={pickupAddress}
                                onChangeText={setPickupAddress}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Preferred Pickup Window</Text>
                        <View style={styles.iconInputContainer}>
                            <Clock size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.iconInput}
                                placeholder="e.g. Mon-Fri 6pm-9pm"
                                value={pickupWindow}
                                onChangeText={setPickupWindow}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                </View>

                {/* Photo Upload */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>

                    <View style={styles.infoBanner}>
                        <Info size={20} color="#3B82F6" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoBannerTitle}>Photo Guidelines</Text>
                            <Text style={styles.infoBannerText}>
                                Clear, well-lit photos increase rentals by 40%. Include accessories and any damage.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        activeOpacity={0.7}
                        onPress={() => setPhotoCount(prev => prev + 1)} // Mock upload
                    >
                        <Upload size={24} color={NAVY_BLUE} />
                        <Text style={styles.uploadButtonText}>Upload Photos</Text>
                    </TouchableOpacity>

                    {photoCount < 2 && (
                        <View style={styles.validationContainer}>
                            <Text style={styles.validationText}>
                                At least 2 photos required to continue ({photoCount}/2)
                            </Text>
                        </View>
                    )}
                    {photoCount >= 2 && (
                        <View style={styles.validationContainer}>
                            <Text style={[styles.validationText, { color: '#10B981' }]}>
                                {photoCount} photos uploaded!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Spacer for bottom scrolling */}
                <View style={{ height: 40 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: NAVY_BLUE,
        marginBottom: 16,
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
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 120,
        paddingTop: 12, // Ensure text starts at top
    },
    togglesContainer: {
        backgroundColor: '#F9FAFB', // Slight background for toggles section? Or just plain.
        // Let's stick to clean white but maybe bordered or just spaced.
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    toggleSubLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    iconInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    inputIcon: {
        marginLeft: 12,
        marginRight: 8,
    },
    iconInput: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 12,
        fontSize: 16,
        color: '#111827',
    },
    infoBanner: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    infoBannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 4,
    },
    infoBannerText: {
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 18,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        flexDirection: 'column',
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: NAVY_BLUE,
    },
    validationContainer: {
        marginTop: 8,
        alignItems: 'center',
    },
    validationText: {
        fontSize: 13,
        color: SAFETY_ORANGE,
        fontWeight: '500',
    },
});
