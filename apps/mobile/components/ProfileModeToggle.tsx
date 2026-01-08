import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { Search, Wrench } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const AnimatedIconSearch = Animated.createAnimatedComponent(Search);
const AnimatedIconWrench = Animated.createAnimatedComponent(Wrench);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const Palette = {
    baseGray05: '#E5E7EB',
    baseGray80: '#4B5563',
    background: '#FFFFFF',
    highlightLabel: '#000000',
    baseLabel: '#9CA3AF',
};

const TimingConfig = {
    duration: 400,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

const SPRING_CONFIG = {
    mass: 1,
    damping: 30,
    stiffness: 350,
};

export const PressableScale = ({ children, style, onPress, ...props }: any) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[style, animatedStyle]} // Apply animated style here. Ensure Pressable is Animated.
            {...props}
        >
            {/* Note: In a real app, you'd verify if Pressable takes styles properly or wrap in Animated.View */}
            {/* For safety with Reanimated, passing animated style to a standard component works if it's an Animated component, 
                but here we use Animated.View wrapper logic implicitly or convert Pressable. 
                Actually, simpler to wrap children. */}
            <Animated.View style={animatedStyle}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
// Correction for PressableScale to be correct:
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScaleButton({ children, style, onPress, ...props }: any) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => (scale.value = withSpring(0.95))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedPressable>
    );
}


type Option = {
    name: string;
    icon: string;
    label: string;
};

const OPTIONS: Option[] = [
    { name: 'Owner', icon: 'wrench', label: 'Owner' },
    { name: 'Renter', icon: 'search', label: 'Renter' },
];

interface ProfileModeToggleProps {
    isOwner: boolean;
    onToggle: (isOwner: boolean) => void;
}

export default function ProfileModeToggle({ isOwner, onToggle }: ProfileModeToggleProps) {
    const { width: windowWidth } = useWindowDimensions();
    const width = windowWidth - 32; // margin 16 * 2
    const height = 56;
    const internalPadding = 4;

    const selected = isOwner ? OPTIONS[0] : OPTIONS[1];

    const cellBackgroundWidth = width / OPTIONS.length;
    const activeIndexes = useSharedValue<number[]>([]);

    const selectedCellIndex = useMemo(
        () => OPTIONS.findIndex(item => item.name === selected.name),
        [selected],
    );

    const blurProgress = useSharedValue(0);

    const animatedBlurProps = useAnimatedProps(() => {
        return {
            intensity: interpolate(blurProgress.value, [0, 0.5, 1], [0, 15, 0]),
        };
    }, [blurProgress]);

    const rCellMessageStyle = useAnimatedStyle(() => {
        // Adjust padding based on index
        // 0 -> +padding
        // 1 -> -padding
        const padding = selectedCellIndex === 0 ? internalPadding : -internalPadding;

        return {
            left: withSpring(
                cellBackgroundWidth * selectedCellIndex + padding,
                SPRING_CONFIG,
            ),
        };
    }, [selectedCellIndex]);

    const rCellBlurMessageStyle = useAnimatedStyle(() => {
        return {
            left: withSpring(cellBackgroundWidth * selectedCellIndex, SPRING_CONFIG),
        };
    }, [selectedCellIndex]);

    const handlePress = (item: Option) => {
        const index = OPTIONS.indexOf(item);
        const prevIndex = selectedCellIndex;

        if (prevIndex === index) return;

        Haptics.selectionAsync();
        onToggle(item.name === 'Owner');

        activeIndexes.value = [prevIndex, index];
        cancelAnimation(blurProgress);
        blurProgress.value = withTiming(1, TimingConfig, () => {
            blurProgress.value = 0;
            activeIndexes.value = [];
        });
    };

    return (
        <View
            style={[
                styles.backgroundContainer,
                {
                    backgroundColor: Palette.baseGray05,
                    width,
                    height,
                    padding: internalPadding,
                },
            ]}
        >
            {OPTIONS.map((item, index) => {
                const internalBlurProps = useAnimatedProps(() => {
                    return {
                        intensity: interpolate(
                            activeIndexes.value.includes(index) ? blurProgress.value : 0,
                            [0, 0.5, 1],
                            [0, 10, 0],
                        ),
                    };
                }, [blurProgress]);

                const rLabelStyle = useAnimatedStyle(() => {
                    const isActive = selectedCellIndex === index;
                    return {
                        color: withTiming(
                            isActive ? Palette.highlightLabel : Palette.baseLabel,
                            TimingConfig
                        ),
                    };
                }, [selectedCellIndex, index]);

                const IconComponent = item.name === 'Owner' ? AnimatedIconWrench : AnimatedIconSearch;
                const isActive = selectedCellIndex === index;
                const iconColor = isActive ? Palette.highlightLabel : Palette.baseLabel;

                return (
                    <ScaleButton
                        key={item.name}
                        style={styles.labelContainer}
                        onPress={() => handlePress(item)}
                    >
                        <IconComponent
                            size={18}
                            color={iconColor}
                            style={{ marginRight: 8 }}
                        />
                        <Animated.Text style={[styles.label, rLabelStyle]}>
                            {item.label}
                        </Animated.Text>
                        <AnimatedBlurView
                            animatedProps={internalBlurProps}
                            tint="light"
                            style={styles.blurView}
                        />
                    </ScaleButton>
                );
            })}

            <Animated.View
                style={[
                    {
                        width: cellBackgroundWidth - internalPadding * 1.5, // Slightly adjust for padding
                        height: height - internalPadding * 2,
                    },
                    styles.highlightedCellContent,
                    rCellMessageStyle,
                ]}
            />

            <Animated.View
                style={[
                    {
                        width: cellBackgroundWidth,
                        height: height,
                        zIndex: 10,
                    },
                    styles.highlightedCellBlurContent,
                    rCellBlurMessageStyle,
                ]}
            >
                <AnimatedBlurView
                    animatedProps={animatedBlurProps}
                    tint="light"
                    style={styles.fill}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: {
        borderRadius: 30, // continuous curve approximation
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden', // Contain the blur views
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    label: {
        fontFamily: 'System', // Use system font or your app's font
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    fill: {
        flex: 1,
    },
    highlightedCellBlurContent: {
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 1,
    },
    highlightedCellContent: {
        alignSelf: 'center',
        backgroundColor: Palette.background,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        position: 'absolute',
        zIndex: 1,
    },
    labelContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 2,
    },
});
