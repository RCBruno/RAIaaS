import { RatioCalculator } from '../src/metrics/ratio-calculator.js';
import { SinbadFuzzyEngine } from '../src/fuzzy/fuzzy-engine.js';
import { SettlementEvaluator } from '../src/settlement/settlement-evaluator.js';

describe('Off-Chain Fuzzy Fairness Engine', () => {
  const fuzzyEngine = new SinbadFuzzyEngine();

  test('RatioCalculator correctly calculates Exposure/Merit ratios', () => {
    const single = RatioCalculator.calculateSingleRatio({
      providerID: 'p1',
      exposureCount: 100,
      meritScore: 100
    });
    expect(single).toBe(1.0);

    const aggregated = RatioCalculator.calculateAggregatedRatio([
      { providerID: 'p1', exposureCount: 100, meritScore: 100 },
      { providerID: 'p2', exposureCount: 90, meritScore: 100 }
    ]);
    expect(aggregated).toBe(0.95);
  });

  test('SinbadFuzzyEngine maps ratio 1.0 to EXCELLENT with high compliance degree', () => {
    const result = fuzzyEngine.evaluateRatio(1.0);
    expect(result.primaryLabel).toBe('EXCELLENT');
    expect(result.complianceDegree).toBeGreaterThanOrEqual(0.85);
  });

  test('SinbadFuzzyEngine maps biased low ratio (0.40) to POOR', () => {
    const result = fuzzyEngine.evaluateRatio(0.40);
    expect(result.primaryLabel).toBe('POOR');
    expect(result.complianceDegree).toBeLessThan(0.50);
  });

  test('SettlementEvaluator releases full payout for EXCELLENT compliance', () => {
    const result = fuzzyEngine.evaluateRatio(1.0);
    const action = SettlementEvaluator.evaluateSettlement(result, 1000, 5000);
    expect(action.payoutPercentage).toBe(100);
    expect(action.bonusEligible).toBe(true);
    expect(action.slashingTriggered).toBe(false);
  });

  test('SettlementEvaluator triggers automatic penalty and bond slashing for POOR compliance', () => {
    const result = fuzzyEngine.evaluateRatio(0.30);
    const action = SettlementEvaluator.evaluateSettlement(result, 1000, 5000);
    expect(action.payoutPercentage).toBe(0);
    expect(action.slashingTriggered).toBe(true);
    expect(action.penaltyAmount).toBeGreaterThan(0);
  });
});
