import { RawProviderMetric } from '@raiaas/shared';

export class RatioCalculator {
  /**
   * Calculate Exposure/Merit ratio for a single provider.
   * R_i = Exposure_i / Merit_i
   * Prevents division by zero by clamping merit to a small epsilon if 0.
   */
  public static calculateSingleRatio(metric: RawProviderMetric): number {
    const merit = metric.meritScore <= 0 ? 0.0001 : metric.meritScore;
    return metric.exposureCount / merit;
  }

  /**
   * Calculate aggregated Exposure/Merit ratio across a array of provider metrics.
   * Computes mean of individual ratios.
   */
  public static calculateAggregatedRatio(metrics: RawProviderMetric[]): number {
    if (!metrics || metrics.length === 0) {
      return 1.0;
    }
    const totalRatio = metrics.reduce((sum, m) => sum + this.calculateSingleRatio(m), 0);
    return totalRatio / metrics.length;
  }
}
