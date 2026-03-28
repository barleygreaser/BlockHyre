"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { calculateRentalPrice } from '@/lib/pricing';

export type CartItem = {
    id: string;
    title: string;
    image: string;
    owner_id: string;
    price: {
        daily: number;
        deposit: number;
        riskTier: 1 | 2 | 3;
    };
    dates: {
        from: Date;
        to: Date;
    };
    days: number;
};

type CartContextType = {
    cart: CartItem[];
    /** Returns an error message string if the item cannot be added, otherwise undefined. */
    addToCart: (item: CartItem) => string | undefined;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // ... (useEffect hooks remain the same)

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('blockhyre_cart');
        if (savedCart) {
            try {
                // Parse dates back to Date objects
                const parsed = JSON.parse(savedCart, (key, value) => {
                    if (key === 'from' || key === 'to') return new Date(value);
                    return value;
                });
                setCart(parsed);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('blockhyre_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem): string | undefined => {
        // Enforce single-owner cart: Stripe destination charges only support one connected account per session.
        const existingOwnerId = cart.find((i) => i.owner_id !== item.owner_id)?.owner_id;
        if (existingOwnerId) {
            return "Your cart already contains an item from a different owner. Please checkout or clear your cart before adding items from another owner.";
        }

        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? item : i));
            }
            return [...prev, item];
        });

        return undefined;
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => {
        const { finalTotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
        return total + finalTotal + item.price.deposit;
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
