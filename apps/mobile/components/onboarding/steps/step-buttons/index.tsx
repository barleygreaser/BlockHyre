import { StyleSheet, useWindowDimensions, View, Pressable, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    SharedValue,
} from 'react-native-reanimated';

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

type StepButtonsProps = {
    activeIndex: SharedValue<number>;
    rightLabel: string;
    backButtonLabel: string;
    onBack: () => void;
    onContinue: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
        return withSpring(activeIndex.value === 3 ? 1 : 0, SPRING_CONFIG); // Changed to 3 because we have 4 steps (0,1,2,3)
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
                    <Pressable
                        onPress={onBack}
                        style={({ pressed }) => [
                            styles.button,
                            styles.backButton,
                            { width: backButtonWidth, opacity: pressed ? 0.8 : 1 },
                        ]}>
                        <Text style={styles.backButtonLabel}>
                            {backButtonLabel}
                        </Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
            <Animated.View style={styles.fill}>
                <Pressable
                    onPress={onContinue}
                    style={({ pressed }) => [
                        styles.button,
                        styles.continueButton,
                        { opacity: pressed ? 0.9 : 1 }
                    ]}>
                    <View style={styles.labelContainer}>
                        <Animated.View style={[styles.iconContainer, rIconStyle]}>
                            <CheckCircle size={16} color="white" />
                        </Animated.View>
                        <Animated.Text style={styles.continueButtonLabel}>
                            {rightLabel}
                        </Animated.Text>
                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    backButtonLabel: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: 16,
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
        marginTop: 20,
        paddingHorizontal: PADDING_HORIZONTAL,
        width: '100%',
    },
    continueButton: {
        backgroundColor: '#2563EB', // Blue 600
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
