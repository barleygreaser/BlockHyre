import React, { FC, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    SharedValue,
} from 'react-native-reanimated';
import { Dot } from './Dot';

type DotsProps = {
    count: number;
    activeIndex: SharedValue<number>;
    dotSize: number;
};

export const Dots: FC<DotsProps> = memo(({ count, activeIndex, dotSize }) => {
    const dotSpacing = 20;
    const externalSpacing = dotSpacing;
    const height = dotSize + 20;

    const rBarStyle = useAnimatedStyle(() => {
        const activeWidth =
            (activeIndex.value + 1) * dotSize +
            activeIndex.value * dotSpacing +
            externalSpacing;

        return {
            width: withSpring(activeWidth),
        };
    }, []);

    return (
        <View
            style={[
                {
                    paddingHorizontal: externalSpacing / 2,
                    gap: dotSpacing,
                },
                styles.container,
            ]}>
            <Animated.View
                style={[
                    {
                        height,
                    },
                    styles.bar,
                    rBarStyle,
                ]}
            />
            {new Array(count).fill(null).map((_, index) => {
                return (
                    <Dot
                        key={index}
                        index={index}
                        activeIndex={activeIndex}
                        dotSize={dotSize}
                    />
                );
            })}
        </View>
    );
});

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#FF6700', // Safety Orange
        borderRadius: 100,
        position: 'absolute',
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});
