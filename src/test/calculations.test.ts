import { describe, it, expect } from 'vitest';
import { getTotalRate, calculateCost } from '../hooks/useEmployees';
import type { EmployeeRate } from '../db/schema';

const makeRate = (base: number, benefits: number): EmployeeRate => ({
  id: 'rate-1',
  employeeId: 'emp-1',
  fiscalYearId: 'fy-1',
  quarterId: 'q-1',
  baseHourlyRate: base,
  benefitsRate: benefits,
  effectiveDate: '2025-04-01',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
});

describe('getTotalRate', () => {
  it('returns sum of base and benefits rates', () => {
    expect(getTotalRate(makeRate(75.51, 19.23))).toBeCloseTo(94.74);
  });

  it('returns base rate when benefits is 0', () => {
    expect(getTotalRate(makeRate(50, 0))).toBe(50);
  });

  it('returns benefits rate when base is 0', () => {
    expect(getTotalRate(makeRate(0, 10))).toBe(10);
  });

  it('handles zero rates', () => {
    expect(getTotalRate(makeRate(0, 0))).toBe(0);
  });
});

describe('calculateCost', () => {
  const rate = makeRate(75.51, 19.23);

  it('with 100% benefits cap — funder covers all benefits', () => {
    const result = calculateCost(100, rate, 1.0);
    expect(result.totalCost).toBeCloseTo(100 * (75.51 + 19.23));
    expect(result.fundedCost).toBeCloseTo(100 * (75.51 + 19.23));
    expect(result.hospitalCovers).toBeCloseTo(0);
  });

  it('with 0% benefits cap — hospital covers all benefits', () => {
    const result = calculateCost(100, rate, 0);
    expect(result.totalCost).toBeCloseTo(100 * (75.51 + 19.23));
    expect(result.fundedCost).toBeCloseTo(100 * 75.51);
    expect(result.hospitalCovers).toBeCloseTo(100 * 19.23);
  });

  it('with 20% benefits cap — partial split', () => {
    const result = calculateCost(100, rate, 0.2);
    const baseCost = 100 * 75.51;
    const benefitsCost = 100 * 19.23;

    expect(result.totalCost).toBeCloseTo(baseCost + benefitsCost);
    expect(result.fundedCost).toBeCloseTo(baseCost + benefitsCost * 0.2);
    expect(result.hospitalCovers).toBeCloseTo(benefitsCost * 0.8);
  });

  it('with 0 hours — all values are zero', () => {
    const result = calculateCost(0, rate, 0.5);
    expect(result.totalCost).toBe(0);
    expect(result.fundedCost).toBe(0);
    expect(result.hospitalCovers).toBe(0);
  });

  it('funded + hospital always equals total', () => {
    const result = calculateCost(487.5, rate, 0.2);
    expect(result.fundedCost + result.hospitalCovers).toBeCloseTo(result.totalCost);
  });
});

describe('calculateCost with percentage-of-wages cap type', () => {
  const rate = makeRate(75.51, 19.23);

  it('20% wage cap — cap < benefits, funder capped', () => {
    // baseComponent = 100 * 75.51 = 7551, maxFunded = 7551 * 0.2 = 1510.20
    // benefitsComponent = 100 * 19.23 = 1923
    // Since 1510.20 < 1923, fundedBenefits = 1510.20
    const result = calculateCost(100, rate, 0.2, 'percentage-of-wages');
    const baseCost = 100 * 75.51;
    const maxFunded = baseCost * 0.2;
    expect(result.fundedCost).toBeCloseTo(baseCost + maxFunded);
    expect(result.hospitalCovers).toBeCloseTo(100 * 19.23 - maxFunded);
    expect(result.totalCost).toBeCloseTo(100 * (75.51 + 19.23));
  });

  it('high wage cap where benefits < cap — funder covers all benefits', () => {
    const lowBenefitsRate = makeRate(50, 5);
    // maxFunded = 100 * 50 * 0.5 = 2500, benefits = 100 * 5 = 500
    // 500 < 2500 → funder covers all
    const result = calculateCost(100, lowBenefitsRate, 0.5, 'percentage-of-wages');
    expect(result.fundedCost).toBeCloseTo(100 * (50 + 5));
    expect(result.hospitalCovers).toBeCloseTo(0);
  });

  it('100% wage cap — funder covers all benefits', () => {
    const result = calculateCost(100, rate, 1.0, 'percentage-of-wages');
    expect(result.fundedCost).toBeCloseTo(100 * (75.51 + 19.23));
    expect(result.hospitalCovers).toBeCloseTo(0);
  });

  it('0% wage cap — hospital covers all benefits', () => {
    const result = calculateCost(100, rate, 0, 'percentage-of-wages');
    expect(result.fundedCost).toBeCloseTo(100 * 75.51);
    expect(result.hospitalCovers).toBeCloseTo(100 * 19.23);
  });

  it('funded + hospital always equals total', () => {
    const result = calculateCost(487.5, rate, 0.2, 'percentage-of-wages');
    expect(result.fundedCost + result.hospitalCovers).toBeCloseTo(result.totalCost);
  });
});

describe('calculateCost backward compatibility', () => {
  const rate = makeRate(75.51, 19.23);

  it('defaults to percentage-of-benefits when capType omitted', () => {
    const withDefault = calculateCost(100, rate, 0.2);
    const withExplicit = calculateCost(100, rate, 0.2, 'percentage-of-benefits');
    expect(withDefault.fundedCost).toBeCloseTo(withExplicit.fundedCost);
    expect(withDefault.hospitalCovers).toBeCloseTo(withExplicit.hospitalCovers);
  });
});
