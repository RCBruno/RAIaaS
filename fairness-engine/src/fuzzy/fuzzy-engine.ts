import { FuzzyEvaluationResult, FuzzyScaleConfig, LinguisticLabel } from '@raiaas/shared';
import { MembershipEvaluator } from './membership.js';

export class SinbadFuzzyEngine {
  private scaleConfig: FuzzyScaleConfig;

  constructor(customConfig?: FuzzyScaleConfig) {
    this.scaleConfig = customConfig || MembershipEvaluator.getDefaultScaleConfig();
  }

  /**
   * Fuzzifies a continuous Exposure/Merit ratio into membership degrees for each linguistic label
   * and calculates the aggregated compliance degree alpha in [0, 1].
   */
  public evaluateRatio(ratio: number): FuzzyEvaluationResult {
    const memberships: Record<LinguisticLabel, number> = {
      POOR: 0,
      ACCEPTABLE: 0,
      GOOD: 0,
      EXCELLENT: 0
    };

    for (const mf of this.scaleConfig.membershipFunctions) {
      memberships[mf.label] = MembershipEvaluator.evaluateMembership(ratio, mf);
    }

    // Handled POOR edge case when ratio deviates significantly from ideal 1.0 (e.g. ratio < 0.6 or > 1.4)
    if (ratio < 0.60 || ratio > 1.40) {
      const distance = Math.abs(ratio - 1.0);
      memberships.POOR = Math.min(1.0, distance / 0.5);
    }

    // Determine primary linguistic label (label with maximum membership)
    let maxLabel: LinguisticLabel = 'POOR';
    let maxVal = -1;

    for (const label of this.scaleConfig.labels) {
      if (memberships[label] > maxVal) {
        maxVal = memberships[label];
        maxLabel = label;
      }
    }

    // Calculate aggregated compliance degree alpha in [0, 1]
    // Weights assigned to labels: EXCELLENT = 1.0, GOOD = 0.85, ACCEPTABLE = 0.60, POOR = 0.10
    const labelWeights: Record<LinguisticLabel, number> = {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      ACCEPTABLE: 0.60,
      POOR: 0.10
    };

    let weightedSum = 0;
    let sumDegrees = 0;

    for (const label of this.scaleConfig.labels) {
      const deg = memberships[label];
      weightedSum += deg * labelWeights[label];
      sumDegrees += deg;
    }

    const complianceDegree = sumDegrees > 0 
      ? Math.min(1.0, Math.max(0.0, weightedSum / sumDegrees))
      : (maxLabel === 'EXCELLENT' ? 1.0 : maxLabel === 'GOOD' ? 0.85 : maxLabel === 'ACCEPTABLE' ? 0.60 : 0.10);

    return {
      exposureMeritRatio: ratio,
      memberships,
      primaryLabel: maxLabel,
      complianceDegree: Number(complianceDegree.toFixed(4))
    };
  }
}
