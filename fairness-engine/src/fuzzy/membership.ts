import { FuzzyScaleConfig, LinguisticLabel, MembershipFunction } from '@raiaas/shared';

export class MembershipEvaluator {
  /**
   * Default Sinbad² 4-term linguistic scale configuration for Exposure/Merit ratio:
   * Target ideal ratio is 1.0 (Exposure matches Merit).
   * - POOR: ratio < 0.60 or ratio > 1.60
   * - ACCEPTABLE: ratio around 0.75 or 1.35
   * - GOOD: ratio around 0.90 to 1.15
   * - EXCELLENT: ratio centered at 1.00 [0.95, 1.05]
   */
  public static getDefaultScaleConfig(): FuzzyScaleConfig {
    return {
      name: 'Sinbad2-Standard-Exposure-Merit-Scale',
      labels: ['POOR', 'ACCEPTABLE', 'GOOD', 'EXCELLENT'],
      membershipFunctions: [
        {
          label: 'POOR',
          points: [0, 0, 0.50, 0.70]
        },
        {
          label: 'ACCEPTABLE',
          // Triangular centered at 0.75
          points: [0.60, 0.75, 0.75, 0.90]
        },
        {
          label: 'GOOD',
          // Triangular centered at 0.90
          points: [0.85, 0.90, 0.90, 0.96]
        },
        {
          label: 'EXCELLENT',
          // Triangular centered at 1.00
          points: [0.95, 1.00, 1.00, 1.05]
        }
      ]
    };
  }

  /**
   * Evaluates membership degree mu_L(x) in [0, 1] for a given trapezoidal/triangular function defined by points [a, b, c, d].
   */
  public static evaluateMembership(x: number, mf: MembershipFunction): number {
    const [a, b, c, d] = mf.points;

    if (x <= a || x >= d) {
      return 0;
    }
    if (x >= b && x <= c) {
      return 1;
    }
    if (x > a && x < b) {
      return (x - a) / (b - a);
    }
    if (x > c && x < d) {
      return (d - x) / (d - c);
    }

    return 0;
  }
}
