import { describe, it, expect } from 'vitest';
import { calculateRentalPrice, RISK_TIERS } from './pricing';

describe('calculateRentalPrice', () => {
  it('calculates standard rental price correctly for Tier 1', () => {
    const dailyPrice = 20;
    const days = 3;
    const riskTier = 1;

    const result = calculateRentalPrice(dailyPrice, days, riskTier);

    // Subtotal: 20 * 3 = 60
    // Peace Fund (Tier 1): 1 * 3 = 3
    // Final Total: 60 + 3 = 63
    expect(result.subtotal).toBe(60);
    expect(result.peaceFundTotal).toBe(3);
    expect(result.finalTotal).toBe(63);
  });

  it('calculates standard rental price correctly for Tier 2', () => {
    const dailyPrice = 50;
    const days = 2;
    const riskTier = 2;

    const result = calculateRentalPrice(dailyPrice, days, riskTier);

    // Subtotal: 50 * 2 = 100
    // Peace Fund (Tier 2): 3 * 2 = 6
    // Final Total: 100 + 6 = 106
    expect(result.subtotal).toBe(100);
    expect(result.peaceFundTotal).toBe(6);
    expect(result.finalTotal).toBe(106);
  });

  it('calculates standard rental price correctly for Tier 3', () => {
    const dailyPrice = 150;
    const days = 1;
    const riskTier = 3;

    const result = calculateRentalPrice(dailyPrice, days, riskTier);

    // Subtotal: 150 * 1 = 150
    // Peace Fund (Tier 3): 10 * 1 = 10
    // Final Total: 150 + 10 = 160
    expect(result.subtotal).toBe(150);
    expect(result.peaceFundTotal).toBe(10);
    expect(result.finalTotal).toBe(160);
  });

  it('handles "Free/Borrow" rentals where dailyPrice is 0', () => {
    const dailyPrice = 0;
    const days = 5;
    const riskTier = 2;

    const result = calculateRentalPrice(dailyPrice, days, riskTier);

    // Subtotal: 0 * 5 = 0
    // Peace Fund (Tier 2): 3 * 5 = 15
    // Final Total: 0 + 15 = 15
    expect(result.subtotal).toBe(0);
    expect(result.peaceFundTotal).toBe(15);
    expect(result.finalTotal).toBe(15);
  });

  it('calculates platform fee (10% sample)', () => {
    const dailyPrice = 100;
    const days = 1;
    const riskTier = 1;

    const result = calculateRentalPrice(dailyPrice, days, riskTier);

    // 10% of 100 = 10
    expect(result.platformFee).toBe(10);
  });
});
