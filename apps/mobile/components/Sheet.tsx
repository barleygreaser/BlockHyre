import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";

export type SheetRef = {
    show: () => void;
    hide: () => void;
};

type SheetProps = {
    children: React.ReactNode;
    snapPoint: number; // Percentage of screen height
};

const Sheet = forwardRef<SheetRef, SheetProps>(({ children, snapPoint }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
        show: () => sheetRef.current?.present(),
        hide: () => sheetRef.current?.dismiss(),
    }));

    // If snapPoint is provided, use it. Otherwise rely on dynamic sizing.
    const snapPoints = useMemo(() => (snapPoint ? [`${snapPoint}%`] : []), [snapPoint]);

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
            snapPoints={snapPoints.length > 0 ? snapPoints : undefined}
            enableDynamicSizing={snapPoints.length === 0}
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
