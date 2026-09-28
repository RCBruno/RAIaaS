import { FuzzyScaleConfig, MembershipFunction } from '@raiaas/shared';
export declare class MembershipEvaluator {
    /**
     * Default Sinbad² 4-term linguistic scale configuration for Exposure/Merit ratio:
     * Target ideal ratio is 1.0 (Exposure matches Merit).
     * - POOR: ratio < 0.60 or ratio > 1.60
     * - ACCEPTABLE: ratio around 0.75 or 1.35
     * - GOOD: ratio around 0.90 to 1.15
     * - EXCELLENT: ratio centered at 1.00 [0.95, 1.05]
     */
    static getDefaultScaleConfig(): FuzzyScaleConfig;
    /**
     * Evaluates membership degree mu_L(x) in [0, 1] for a given trapezoidal/triangular function defined by points [a, b, c, d].
     */
    static evaluateMembership(x: number, mf: MembershipFunction): number;
}
//# sourceMappingURL=membership.d.ts.map