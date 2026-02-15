import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";


export type SheetRef = {
    show: () => void;
    hide: () => void;
    snapTo: (index: number) => void;
};

type SheetProps = {
    children: React.ReactNode;
    snapPoint?: number; // Legacy singular
    snapPoints?: Array<string | number>; // New array support
};

const Sheet = forwardRef<SheetRef, SheetProps>(({ children, snapPoint, snapPoints: propSnapPoints }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
        show: () => sheetRef.current?.present(),
        hide: () => sheetRef.current?.dismiss(),
        snapTo: (index: number) => sheetRef.current?.snapToIndex(index),
    }));

    // Logic: 
    // 1. If propSnapPoints exists, use it.
    // 2. Else if snapPoint exists, use [`${snapPoint}%`].
    // 3. Else allow dynamic sizing (undefined snapPoints).
    const resolvedSnapPoints = useMemo(() => {
        if (propSnapPoints) return propSnapPoints;
        if (snapPoint) return [`${snapPoint}%`];
        return [];
    }, [propSnapPoints, snapPoint]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={resolvedSnapPoints.length > 0 ? resolvedSnapPoints : undefined}
            enableDynamicSizing={resolvedSnapPoints.length === 0}
            backdropComponent={renderBackdrop}
            handleStyle={styles.handle}
            handleIndicatorStyle={styles.handleIndicator}
            style={styles.sheet}
            // Standard Keyboard Handling
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
        >
            <BottomSheetView style={styles.content}>{children}</BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    handle: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    handleIndicator: {
        backgroundColor: "#E2E8F0",
        width: 40,
    },
    sheet: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        flex: 1,
        paddingBottom: 20, // Safety padding
    },
});

export default Sheet;
