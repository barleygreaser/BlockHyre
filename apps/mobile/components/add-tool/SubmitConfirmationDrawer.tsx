import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    interpolateColor,
    useDerivedValue,
} from 'react-native-reanimated';
import { AlertCircle, X } from 'lucide-react-native';

const SAFETY_ORANGE = '#FF6700';
const BUTTON_WIDTH = 280;
const BUTTON_HEIGHT = 56;
const EXPANDED_CARD_WIDTH = 320;
const EXPANDED_CARD_HEIGHT = 460;
const MIN_BUTTON_WIDTH = 120;

interface SubmitConfirmationDrawerProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

type ButtonStatus = 'idle' | 'loading' | 'success';

export default function SubmitConfirmationDrawer({
    visible,
    onConfirm,
    onCancel,
}: SubmitConfirmationDrawerProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>('idle');
    const isExpanded = useSharedValue(false);

    React.useEffect(() => {
        if (visible) {
            isExpanded.value = true;
            setAgreedToTerms(false);
            setButtonStatus('idle');
        } else {
            isExpanded.value = false;
        }
    }, [visible]);

    const handleConfirm = async () => {
        setButtonStatus('loading');

        // Simulate API submission (1.5 seconds)
        setTimeout(() => {
            setButtonStatus('success');

            // Show success briefly (1 second), then close and callback
            setTimeout(() => {
                setButtonStatus('idle');
                onConfirm(); // This will close modal and navigate
            }, 1000);
        }, 1500);
    };

    const getButtonText = () => {
        switch (buttonStatus) {
            case 'loading':
                return 'Submitting...';
            case 'success':
                return 'Success!';
            default:
                return 'Submit Listing';
        }
    };

    const getButtonColor = () => {
        switch (buttonStatus) {
            case 'success':
                return '#10B981';
            case 'loading':
                return SAFETY_ORANGE;
            default:
                return agreedToTerms ? SAFETY_ORANGE : '#D1D5DB';
        }
    };

    const progress = useDerivedValue(() =>
        withSpring(isExpanded.value ? 1 : 0, { dampingRatio: 1, duration: 400 })
    );

    const padding = useDerivedValue(() =>
        interpolate(
            progress.value,
            [0, 1],
            [0, (EXPANDED_CARD_WIDTH - BUTTON_WIDTH) / 2]
        )
    );

    const rCardContainerStyle = useAnimatedStyle(() => ({
        width: interpolate(
            progress.value,
            [0, 1],
            [BUTTON_WIDTH, EXPANDED_CARD_WIDTH]
        ),
        height: interpolate(
            progress.value,
            [0, 1],
            [BUTTON_HEIGHT, EXPANDED_CARD_HEIGHT]
        ),
        borderRadius: interpolate(progress.value, [0, 1], [50, 20]),
        padding: padding.value,
        paddingTop: padding.value + progress.value * 10,
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['#FFFFFF00', '#FFFFFF']
        ),
    }));

    const rCardContentStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <Animated.View style={styles.container}>
                            <Animated.View style={[styles.card, rCardContainerStyle]}>
                                <Animated.View style={[styles.cardContentWrapper, rCardContentStyle]}>
                                    <View style={styles.cardContent}>
                                        <View style={styles.iconContainer}>
                                            <AlertCircle size={48} color={SAFETY_ORANGE} />
                                            <View style={{ flex: 1 }} />
                                            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                                                <X size={18} color="#A1A0A2" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.title}>Review & Submit</Text>
                                            <Text style={styles.description}>
                                                By submitting this listing, you agree to BlockHyre's Terms of Service and Community Guidelines. Please ensure all information is accurate.
                                            </Text>
                                        </View>

                                        <View style={styles.termsContainer}>
                                            <Switch
                                                trackColor={{ false: '#E5E7EB', true: SAFETY_ORANGE }}
                                                thumbColor={'#FFFFFF'}
                                                onValueChange={setAgreedToTerms}
                                                value={agreedToTerms}
                                            />
                                            <Text style={styles.termsText}>I agree to the Terms of Service</Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={onCancel}
                                            style={[styles.button, styles.cancelButton]}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.buttonLabel, styles.cancelButtonLabel]}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={agreedToTerms && buttonStatus === 'idle' ? handleConfirm : undefined}
                                            style={[
                                                styles.button,
                                                styles.confirmButton,
                                                { backgroundColor: getButtonColor() }
                                            ]}
                                            activeOpacity={agreedToTerms && buttonStatus === 'idle' ? 0.7 : 1}
                                            disabled={!agreedToTerms || buttonStatus !== 'idle'}
                                        >
                                            {buttonStatus === 'loading' && (
                                                <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                                            )}
                                            {buttonStatus === 'success' && (
                                                <Text style={styles.successIcon}>✓</Text>
                                            )}
                                            <Text style={styles.buttonLabel}>{getButtonText()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: EXPANDED_CARD_WIDTH,
        height: EXPANDED_CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden', // Clip content as it expands
    },
    cardContentWrapper: {
        width: '100%',
        height: EXPANDED_CARD_HEIGHT, // Force full height so layout doesn't shift
    },
    cardContent: {
        flex: 1,
        // Ensure content is positioned correctly relative to the full height
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    closeButton: {
        padding: 4,
    },
    textContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    termsText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    button: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    confirmButton: {
        backgroundColor: SAFETY_ORANGE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cancelButtonLabel: {
        color: '#6B7280',
    },
    successIcon: {
        fontSize: 20,
        color: '#FFFFFF',
        marginRight: 6,
    },
});
