export const RISK_TIERS = {
    1: 1,  // Hand Tools: $1/day
    2: 3,  // Small Power Tools: $3/day
    3: 10  // Heavy/Precision: $10/day
};

export type PricingResult = {
    subtotal: number;
    peaceFundTotal: number;
    platformFee: number;
    finalTotal: number;
};

/**
 * Calculates the total rental price including Peace Fund and Platform Fees.
 * 
 * @param dailyPrice - The daily rental rate set by the owner.
 * @param days - Number of days for the rental.
 * @param riskTier - The risk tier of the tool (1, 2, or 3).
 * @returns PricingResult object with breakdown.
 */
export function calculateRentalPrice(
    dailyPrice: number,
    days: number,
    riskTier: 1 | 2 | 3
): PricingResult {
    const riskFee = RISK_TIERS[riskTier];

    // Calculate Peace Fund (Risk Fee * Days)
    const peaceFundTotal = riskFee * days;

    // Calculate Subtotal (Owner's Share)
    const subtotal = dailyPrice * days;

    // Calculate Platform Fee (10% of subtotal, min $0)
    // Note: The prompt didn't explicitly ask for this in the "Logic" list 
    // but included it in the "Output" object. 
    // "Platform Fees: You (the platform) calculate your commission based on the original booking price"
    // Let's assume 10% for now as per the output example.
    const platformFee = Math.round(subtotal * 0.10);

    // Final Total
    // If dailyPrice > 0: Subtotal + Peace Fund + Platform Fee? 
    // The prompt said: "total is (dailyPrice * days) + (riskFee * days)".
    // It didn't explicitly add platformFee in the "Logic" text, but usually platform fee is part of the total or deducted from owner.
    // "Platform Fees: You (the platform) calculate your commission based on the original booking price" implies it might be deducted.
    // BUT, usually marketplaces charge the user.
    // Let's look at the "Free/Borrow" logic: "total is riskFee * days".
    // If I follow the prompt's "Logic" strictly:
    // Standard: (dailyPrice * days) + (riskFee * days)
    // Free: riskFee * days
    // The `platformFee` in the output object might be for display/internal accounting.
    // Let's assume the User Pays: Subtotal + Peace Fund.
    // Wait, the prompt output has `finalTotal`.
    // Let's stick to: Final Total = Subtotal + Peace Fund. 
    // And `platformFee` is just calculated for reference (deducted from owner later) OR added on top?
    // "Platform Fees: You (the platform) calculate your commission based on the original booking price" - this was under "Barter".
    // Let's assume for the User's "Total Due Now":
    // It is Rental Fee + Peace Fund.
    // I will return platformFee but maybe not add it to the user's total if the prompt implies it's the owner's cost.
    // Actually, usually "Peace Fund" IS the platform fee/insurance.
    // Let's just sum Subtotal + Peace Fund for the Final Total for now, as that matches the "Free" logic perfectly ($0 + $30 = $30).

    const finalTotal = subtotal + peaceFundTotal;

    return {
        subtotal,
        peaceFundTotal,
        platformFee,
        finalTotal
    };
}
