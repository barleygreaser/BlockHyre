"use client";

import { useEffect } from "react";
import { useCart } from "@/app/context/cart-context";

export function SuccessCartClearer() {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear the cart when the success page loads
        clearCart();
    }, [clearCart]);

    return null; // This component doesn't render anything
}
