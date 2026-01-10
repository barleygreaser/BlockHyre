import React, { useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Platform,
    View,
    type ViewStyle,
    type StyleProp
} from 'react-native';

import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    interpolate,
    cancelAnimation,
} from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { PressableClick } from './PressableClick';

export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

// --- Activity Indicator Component ---
type ActivityIndicatorProps = {
    size?: number;
    status: ButtonStatus;
    color: string;
};

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
    size = 20,
    status = 'loading',
    color,
}) => {
    const rotation = useSharedValue(0);
    const strokeWidth = Math.max(2, size / 8);
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        if (status !== 'loading') {
            cancelAnimation(rotation);
            rotation.value = withTiming(0, { duration: 200 });
            return;
        }

        rotation.value = withRepeat(
            withTiming(360, {
                duration: 800,
                easing: Easing.linear,
            }),
            -1,
            false,
        );
    }, [status, rotation]);

    const progress = useDerivedValue(() => {
        return withTiming(status === 'idle' ? 0 : 1, { duration: 200 });
    });

    const loadingOpacity = useDerivedValue(() =>
        withTiming(status === 'loading' ? 1 : 0, { duration: 200 }),
    );

    const iconOpacity = useDerivedValue(() =>
        withTiming(status === 'success' || status === 'error' ? 1 : 0, { duration: 200 }),
    );

    const containerStyle = useAnimatedStyle(() => ({
        height: interpolate(progress.value, [0, 1], [0, size]),
        width: interpolate(progress.value, [0, 1], [0, size]),
        marginRight: interpolate(progress.value, [0, 1], [0, 8]),
        overflow: 'hidden' as const,
    }));

    const spinnerRotationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const loadingStyle = useAnimatedStyle(() => ({
        opacity: loadingOpacity.value,
        position: 'absolute' as const,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: iconOpacity.value,
        position: 'absolute' as const,
    }));

    return (
        <Animated.View style={containerStyle}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                {/* Loading spinner */}
                <Animated.View style={[{ width: size, height: size }, loadingStyle]}>
                    <Animated.View style={[{ width: size, height: size }, spinnerRotationStyle]}>
                        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                            <SvgCircle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                fill="none"
                                opacity={0.15}
                            />
                            <SvgCircle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
                            />
                        </Svg>
                    </Animated.View>
                </Animated.View>

                {/* Success/Error icon */}
                <Animated.View
                    style={[
                        {
                            width: size,
                            height: size,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        iconStyle
                    ]}
                >
                    <View style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {status === 'success' && (
                            <Check size={size * 0.5} color="#FFFFFF" strokeWidth={3} />
                        )}
                        {status === 'error' && (
                            <X size={size * 0.5} color="#FFFFFF" strokeWidth={3} />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

// --- ConfirmRequestButton Component ---
type ConfirmRequestButtonProps = {
    onPress?: () => Promise<void> | void;
    style?: StyleProp<ViewStyle>;
    status: ButtonStatus;
    titleMap?: Record<ButtonStatus, string>;
    flex?: number;
    disabled?: boolean;
};

/**
 * ConfirmRequestButton - Uses PressableClick for a clean, simple click animation.
 * No ripple, no bounce - just a subtle opacity dim on press.
 */
export const ConfirmRequestButton: React.FC<ConfirmRequestButtonProps> = ({
    onPress,
    style,
    status,
    titleMap = {
        idle: 'Confirm Request',
        loading: 'Sending...',
        success: 'Request Sent!',
        error: 'Try Again',
    },
    flex,
    disabled = false,
}) => {
    const colorFromStatusMap: Record<ButtonStatus, string> = {
        idle: '#FF6700',
        loading: '#FF6700',
        success: '#10B981',
        error: '#EF4444',
    };

    const activeColor = useMemo(() => {
        return colorFromStatusMap[status] || colorFromStatusMap.idle;
    }, [status]);

    const shadowColor = activeColor;
    const wrapperStyle: ViewStyle | undefined = flex !== undefined ? { flex } : undefined;

    return (
        <View style={wrapperStyle}>
            <PressableClick
                onPress={onPress}
                disabled={disabled || status === 'loading'}
                activeOpacity={0.85}
            >
                <Animated.View
                    style={[
                        styles.button,
                        {
                            backgroundColor: activeColor,
                            ...Platform.select({
                                ios: {
                                    shadowColor: shadowColor,
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 12,
                                },
                                android: {
                                    elevation: 6,
                                },
                            }),
                        },
                        style,
                    ]}
                    layout={LinearTransition.springify()}
                >
                    <ActivityIndicator status={status} color="#FFFFFF" size={22} />
                    <Animated.Text
                        key={`text-${status}`}
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={styles.buttonText}
                    >
                        {titleMap[status]}
                    </Animated.Text>
                </Animated.View>
            </PressableClick>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        minHeight: 54,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ConfirmRequestButton;
