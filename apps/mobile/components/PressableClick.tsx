/**
 * PressableClick - A simple, clean press animation component.
 * 
 * Uses pure Reanimated for a subtle "click" effect:
 * - No ripple
 * - No bounce  
 * - Just a simple opacity dim when pressed (like pressing a real button)
 * 
 * Use this site-wide for consistent button interactions.
 */

import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableClickProps = Omit<PressableProps, 'style'> & {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Target opacity when pressed (0-1). Default: 0.7 */
    activeOpacity?: number;
    /** Animation duration in ms. Default: 100 */
    duration?: number;
};

/**
 * PressableClick - Simple opacity-based press animation.
 * Dims when pressed, returns to full opacity when released.
 * No bounce, no scale, no ripple - just a clean click.
 */
export const PressableClick: React.FC<PressableClickProps> = ({
    children,
    style,
    activeOpacity = 0.7,
    duration = 100,
    disabled,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const pressed = useSharedValue(0);

    const handlePressIn = (e: any) => {
        pressed.value = withTiming(1, { duration: duration / 2 });
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        pressed.value = withTiming(0, { duration });
        onPressOut?.(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pressed.value, [0, 1], [1, activeOpacity]),
    }));

    return (
        <AnimatedPressable
            {...props}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={null}
            style={[animatedStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

/**
 * PressableClickSubtle - Even more subtle version.
 * Dims to 85% opacity - barely noticeable but provides feedback.
 */
export const PressableClickSubtle: React.FC<PressableClickProps> = (props) => (
    <PressableClick {...props} activeOpacity={0.85} />
);

/**
 * PressableClickScale - Slight scale + opacity for more tactile feel.
 */
type PressableClickScaleProps = PressableClickProps & {
    /** Target scale when pressed. Default: 0.98 */
    activeScale?: number;
};

export const PressableClickScale: React.FC<PressableClickScaleProps> = ({
    children,
    style,
    activeOpacity = 0.9,
    activeScale = 0.98,
    duration = 100,
    disabled,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const pressed = useSharedValue(0);

    const handlePressIn = (e: any) => {
        pressed.value = withTiming(1, { duration: duration / 2 });
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        pressed.value = withTiming(0, { duration });
        onPressOut?.(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pressed.value, [0, 1], [1, activeOpacity]),
        transform: [
            { scale: interpolate(pressed.value, [0, 1], [1, activeScale]) },
        ],
    }));

    return (
        <AnimatedPressable
            {...props}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={null}
            style={[animatedStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

export default PressableClick;
