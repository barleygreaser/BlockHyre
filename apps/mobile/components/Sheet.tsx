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
        hide: () => sheetRef.current?.forceClose(),
    }));

    const snapPoints = useMemo(() => [`${snapPoint}%`], [snapPoint]);
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            handleStyle={styles.handle}
            handleIndicatorStyle={styles.handleIndicator}
            style={styles.sheet}
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
    },
    content: {
        flex: 1,
    },
});

export default Sheet;
