import React, { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';
import { PremiumSheet, PremiumSheetRef } from './PremiumSheet';

type SheetContent = ReactNode | null;

interface SheetContextType {
    showSheet: (content: ReactNode, snapPoints?: Array<number | string>) => void;
    hideSheet: () => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

export function useSheet() {
    const context = useContext(SheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a SheetProvider');
    }
    return context;
}

interface SheetProviderProps {
    children: ReactNode;
}

export function SheetProvider({ children }: SheetProviderProps) {
    const sheetRef = useRef<PremiumSheetRef>(null);
    const [content, setContent] = useState<SheetContent>(null);
    const [snapPoints, setSnapPoints] = useState<Array<number | string>>(['45%']);

    const showSheet = useCallback((newContent: ReactNode, newSnapPoints?: Array<number | string>) => {
        setContent(newContent);
        if (newSnapPoints) {
            setSnapPoints(newSnapPoints);
        }
        // Small delay to ensure content is set before showing
        setTimeout(() => {
            sheetRef.current?.show();
        }, 10);
    }, []);

    const hideSheet = useCallback(() => {
        sheetRef.current?.hide();
    }, []);

    return (
        <SheetContext.Provider value={{ showSheet, hideSheet }}>
            {children}
            <PremiumSheet ref={sheetRef} snapPoints={snapPoints}>
                {content}
            </PremiumSheet>
        </SheetContext.Provider>
    );
}
