import React from 'react';
import { StyleSheet, useWindowDimensions, View, TouchableOpacity, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const BUTTON_HEIGHT = 60;
const PADDING_HORIZONTAL = 20;
const GAP = 10;
const BACK_BUTTON_WIDTH_RATIO = 0.25;
const ICON_WIDTH = 22;
const ICON_MARGIN_RIGHT = 6;

const SPRING_CONFIG = {
    duration: 250,
    dampingRatio: 1.5,
};

// Simple ScaleButton implementation
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function ScaleButton({ children, style, onPress, ...props }: any) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouchableOpacity
            onPressIn={() => (scale.value = withSpring(0.95))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            activeOpacity={1}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedTouchableOpacity>
    );
}

type StepButtonsProps = {
    activeIndex: SharedValue<number>;
    rightLabel: string;
    backButtonLabel: string;
    onBack: () => void;
    onContinue: () => void;
};

export const StepButtons: React.FC<StepButtonsProps> = ({
    activeIndex,
    rightLabel,
    backButtonLabel,
    onBack,
    onContinue,
}) => {
    const { width: windowWidth } = useWindowDimensions();

    const backButtonWidth =
        (windowWidth - PADDING_HORIZONTAL * 2 - GAP) * BACK_BUTTON_WIDTH_RATIO;

    const backButtonProgress = useDerivedValue(() => {
        return withSpring(activeIndex.value > 0 ? 1 : 0, SPRING_CONFIG);
    });

    const iconProgress = useDerivedValue(() => {
        // Show check icon logic, maybe if it's the last step. Use logic from caller or assume here similar to demo.
        // Demo used activeIndex === 2.
        // We should probably just pass a prop "isLastStep" instead of hardcoding, but complying with request to "incorporate steps from demos".
        // I'll assume activeIndex >= 2 implies done/check.
        return withSpring(activeIndex.value === 2 ? 1 : 0, SPRING_CONFIG);
    });

    const rBackButtonStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(
                backButtonProgress.value,
                [0, 1],
                [0, backButtonWidth],
            ),
            marginRight: interpolate(backButtonProgress.value, [0, 1], [0, GAP]),
            overflow: 'hidden',
        };
    }, [backButtonWidth]);

    const rBackButtonInnerStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(backButtonProgress.value, [0, 1], [0, 1]),
        };
    });

    const rIconStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(iconProgress.value, [0, 1], [0, ICON_WIDTH]),
            opacity: interpolate(iconProgress.value, [0, 1], [0, 1]),
            marginRight: interpolate(
                iconProgress.value,
                [0, 1],
                [0, ICON_MARGIN_RIGHT],
            ),
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={rBackButtonStyle}>
                <Animated.View style={rBackButtonInnerStyle}>
                    <ScaleButton
                        onPress={onBack}
                        style={[
                            styles.button,
                            styles.backButton,
                            { width: backButtonWidth },
                        ]}>
                        <Text style={styles.backButtonLabel}>
                            {backButtonLabel}
                        </Text>
                    </ScaleButton>
                </Animated.View>
            </Animated.View>
            <Animated.View style={styles.fill}>
                <ScaleButton
                    onPress={onContinue}
                    style={[styles.button, styles.continueButton]}>
                    <View style={styles.labelContainer}>
                        <Animated.View style={[styles.iconContainer, rIconStyle]}>
                            <Check size={16} color="white" />
                        </Animated.View>
                        <Text style={styles.continueButtonLabel}>
                            {rightLabel}
                        </Text>
                    </View>
                </ScaleButton>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    backButtonLabel: {
        color: 'black',
        fontWeight: '700',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    button: {
        alignItems: 'center',
        borderRadius: 30,
        flexDirection: 'row',
        height: BUTTON_HEIGHT,
        justifyContent: 'center',
    },
    container: {
        flexDirection: 'row',
        height: BUTTON_HEIGHT,
        paddingHorizontal: PADDING_HORIZONTAL,
        width: '100%',
        marginBottom: 20,
    },
    continueButton: {
        backgroundColor: '#FF6700', // Safety Orange
        flex: 1,
    },
    continueButtonLabel: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    fill: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    labelContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
