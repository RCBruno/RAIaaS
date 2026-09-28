import { RawProviderMetric } from '@raiaas/shared';
export declare class RatioCalculator {
    /**
     * Calculate Exposure/Merit ratio for a single provider.
     * R_i = Exposure_i / Merit_i
     * Prevents division by zero by clamping merit to a small epsilon if 0.
     */
    static calculateSingleRatio(metric: RawProviderMetric): number;
    /**
     * Calculate aggregated Exposure/Merit ratio across a array of provider metrics.
     * Computes mean of individual ratios.
     */
    static calculateAggregatedRatio(metrics: RawProviderMetric[]): number;
}
//# sourceMappingURL=ratio-calculator.d.ts.map