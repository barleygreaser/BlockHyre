"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { calculateRentalPrice } from '@/lib/pricing';

export type CartItem = {
    id: string;
    title: string;
    image: string;
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
    addToCart: (item: CartItem) => void;
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
        const savedCart = localStorage.getItem('blockshare_cart');
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
        localStorage.setItem('blockshare_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? item : i));
            }
            return [...prev, item];
        });
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
